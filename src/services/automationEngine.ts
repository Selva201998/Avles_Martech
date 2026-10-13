import { useSyncExternalStore } from 'react';
import type { UserProfile, AIDecisionRecord, ErrorQueueItem, IdempotencyLog, ViewId } from '../types';
import { INITIAL_USERS, INITIAL_AI_DECISIONS } from '../data/mockData';
import { isoDateTime, sampleTimestamp } from '../data/dateUtils';
import { aiService } from './aiService';

export type RunStatus =
  | 'SUCCESS'
  | 'STOPPED_DETERMINISTIC_RULE'
  | 'FLAGGED_HUMAN_REVIEW'
  | 'ERROR_429_QUEUED'
  | 'DUPLICATE_IGNORED';

export interface WorkflowRunResult {
  runId: string;
  userId: string;
  eventId: string;
  nodesExecuted: string[];
  status: RunStatus;
  stoppedAtNode?: string;
  aiDecision?: AIDecisionRecord;
  errorDetail?: string;
  logs: string[];
}

export interface AutomationConfig {
  /** Deterministic eligibility rule: last_active_days ≥ this value. */
  inactivityThresholdDays: number;
  /** AI recommendations below this confidence are routed to human review. */
  reviewConfidenceThreshold: number;
}

export const DEFAULT_CONFIG: AutomationConfig = {
  inactivityThresholdDays: 7,
  reviewConfidenceThreshold: 0.75,
};

export interface ActivityEvent {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  tone: 'success' | 'warning' | 'error' | 'info';
  link?: { view: ViewId; sub?: string };
}

const NODE_IDS = ['node-1', 'node-2', 'node-3', 'node-4', 'node-5', 'node-6', 'node-7', 'node-8'];
const nodesUpTo = (n: number) => NODE_IDS.slice(0, n);
const randomId = (prefix: string, digits = 6) =>
  `${prefix}${Math.floor(10 ** (digits - 1) + Math.random() * 9 * 10 ** (digits - 1))}`;

/**
 * In-memory automation simulator. It reproduces the decision logic of the production
 * workflow (idempotency → validation → rule → enrichment → segment → AI → dispatch → tracking)
 * against sample users. Nothing leaves the browser except the optional LLM proxy call.
 */
class AutomationEngine {
  private users: UserProfile[] = INITIAL_USERS.map((u) => ({ ...u, activityHistory: [...u.activityHistory] }));
  private aiDecisions: AIDecisionRecord[] = INITIAL_AI_DECISIONS.map((d) => ({ ...d }));
  private config: AutomationConfig = { ...DEFAULT_CONFIG };
  private errorQueue: ErrorQueueItem[] = [
    {
      id: 'err_501',
      eventId: 'evt_88712',
      userId: 'demo_1002',
      errorType: 'HTTP 429 Rate Limit',
      nodeId: 'node-7',
      retryCount: 3,
      maxRetries: 3,
      status: 'Queued Operations Alert',
      timestamp: sampleTimestamp(0, 8, 15, 13),
    },
  ];
  private idempotencyCache = new Map<string, string>([['evt_1001_seed', sampleTimestamp(0, 8, 30)]]);
  private idempotencyLogs: IdempotencyLog[] = [
    {
      eventId: 'evt_1001_seed',
      userId: 'demo_1001',
      firstReceived: sampleTimestamp(0, 8, 30),
      secondReceived: sampleTimestamp(0, 8, 30, 2),
      status: 'Second: Ignored (Duplicate Event)',
    },
  ];
  private activity: ActivityEvent[] = [
    {
      id: 'act_seed_review',
      timestamp: sampleTimestamp(0, 9, 5, 30),
      title: 'Human review requested',
      detail: 'demo_1004 · confidence 0.62 below threshold',
      tone: 'warning',
      link: { view: 'ai-recommendations' },
    },
    {
      id: 'act_seed_429',
      timestamp: sampleTimestamp(0, 8, 15, 13),
      title: 'Dispatch rate-limited (HTTP 429)',
      detail: 'demo_1002 · retries exhausted, queued for ops',
      tone: 'error',
      link: { view: 'automation', sub: 'error-queue' },
    },
    {
      id: 'act_seed_daily',
      timestamp: sampleTimestamp(0, 8, 0),
      title: 'Daily sample run completed',
      detail: '1,284 users evaluated · 165 actions triggered',
      tone: 'success',
      link: { view: 'overview' },
    },
  ];
  private readActivityIds = new Set<string>(['act_seed_daily']);

  private version = 0;
  private listeners = new Set<() => void>();

  // ---- store plumbing -------------------------------------------------------------
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  getVersion = () => this.version;
  private emit() {
    this.version += 1;
    this.listeners.forEach((listener) => listener());
  }
  private pushActivity(event: Omit<ActivityEvent, 'id' | 'timestamp'>) {
    this.activity.unshift({ ...event, id: randomId('act_'), timestamp: isoDateTime(new Date()) });
    this.activity = this.activity.slice(0, 25);
  }

  // ---- reads ----------------------------------------------------------------------
  getUsers = (): UserProfile[] => this.users;
  getUser = (id: string): UserProfile | undefined => this.users.find((u) => u.id === id);
  getAIDecisions = (): AIDecisionRecord[] => this.aiDecisions;
  getErrorQueue = (): ErrorQueueItem[] => this.errorQueue;
  getIdempotencyLogs = (): IdempotencyLog[] => this.idempotencyLogs;
  getConfig = (): AutomationConfig => this.config;
  getActivity = (): ActivityEvent[] => this.activity;
  getUnreadCount = (): number => this.activity.filter((a) => !this.readActivityIds.has(a.id)).length;
  isRead = (id: string): boolean => this.readActivityIds.has(id);
  getPendingReviewCount = (): number => this.aiDecisions.filter((d) => d.decisionStatus === 'Human Review').length;
  getOpenErrorCount = (): number => this.errorQueue.filter((e) => e.status !== 'Resolved').length;

  // ---- writes ---------------------------------------------------------------------
  markAllActivityRead() {
    this.activity.forEach((a) => this.readActivityIds.add(a.id));
    this.emit();
  }

  updateConfig(next: Partial<AutomationConfig>) {
    this.config = { ...this.config, ...next };
    this.pushActivity({
      title: 'Automation settings updated',
      detail: `Inactivity ≥ ${this.config.inactivityThresholdDays}d · review below ${this.config.reviewConfidenceThreshold.toFixed(2)}`,
      tone: 'info',
      link: { view: 'settings' },
    });
    this.emit();
  }

  resetConfig() {
    this.updateConfig({ ...DEFAULT_CONFIG });
  }

  async runWorkflowForUser(userId: string, eventIdInput?: string, forceError429 = false): Promise<WorkflowRunResult> {
    const result = await this.executeRun(userId, eventIdInput, forceError429);
    const toneByStatus: Record<RunStatus, ActivityEvent['tone']> = {
      SUCCESS: 'success',
      STOPPED_DETERMINISTIC_RULE: 'info',
      FLAGGED_HUMAN_REVIEW: 'warning',
      ERROR_429_QUEUED: 'error',
      DUPLICATE_IGNORED: 'info',
    };
    const titleByStatus: Record<RunStatus, string> = {
      SUCCESS: 'Sample run: action dispatched (simulated)',
      STOPPED_DETERMINISTIC_RULE: 'Sample run: stopped by inactivity rule',
      FLAGGED_HUMAN_REVIEW: 'Sample run: routed to human review',
      ERROR_429_QUEUED: 'Sample run: HTTP 429 → error queue',
      DUPLICATE_IGNORED: 'Sample run: duplicate event ignored',
    };
    const linkByStatus: Record<RunStatus, ActivityEvent['link']> = {
      SUCCESS: { view: 'automation' },
      STOPPED_DETERMINISTIC_RULE: { view: 'automation' },
      FLAGGED_HUMAN_REVIEW: { view: 'ai-recommendations' },
      ERROR_429_QUEUED: { view: 'automation', sub: 'error-queue' },
      DUPLICATE_IGNORED: { view: 'automation', sub: 'idempotency' },
    };
    this.pushActivity({
      title: titleByStatus[result.status],
      detail: `${result.userId} · ${result.eventId}`,
      tone: toneByStatus[result.status],
      link: linkByStatus[result.status],
    });
    this.emit();
    return result;
  }

  private async executeRun(userId: string, eventIdInput: string | undefined, forceError429: boolean): Promise<WorkflowRunResult> {
    const user = this.users.find((u) => u.id === userId) ?? this.users[0];
    const eventId = eventIdInput ?? randomId('evt_');
    const runId = `run_${Date.now()}`;
    const ts = isoDateTime(new Date());
    const { inactivityThresholdDays, reviewConfidenceThreshold } = this.config;
    const logs: string[] = [`[${ts}] Step 1: Activity event received for ${user.name} (${user.id}), event_id=${eventId}`];

    // Step 1 — idempotency guard
    const firstSeen = this.idempotencyCache.get(eventId);
    if (firstSeen) {
      logs.push(`[${ts}] Step 1 IDEMPOTENCY: duplicate event_id (first seen ${firstSeen}). Skipped to prevent a duplicate message.`);
      this.idempotencyLogs.unshift({
        eventId,
        userId: user.id,
        firstReceived: firstSeen,
        secondReceived: ts,
        status: 'Second: Ignored (Duplicate Event)',
      });
      return { runId, userId: user.id, eventId, nodesExecuted: nodesUpTo(1), status: 'DUPLICATE_IGNORED', stoppedAtNode: 'node-1', logs };
    }
    this.idempotencyCache.set(eventId, ts);

    // Step 2 — schema validation
    logs.push(`[${ts}] Step 2: Payload valid (user_id, country=${user.country}, plan=${user.subscription}).`);

    // Step 3 — deterministic rule
    logs.push(`[${ts}] Step 3: Rule last_active_days (${user.lastActiveDays}) ≥ ${inactivityThresholdDays}`);
    if (user.lastActiveDays < inactivityThresholdDays) {
      logs.push(`[${ts}] Step 3 RULE STOP: user is active. No action required.`);
      user.status = 'No Action';
      return { runId, userId: user.id, eventId, nodesExecuted: nodesUpTo(3), status: 'STOPPED_DETERMINISTIC_RULE', stoppedAtNode: 'node-3', logs };
    }

    // Steps 4–5 — enrichment and segmentation
    logs.push(`[${ts}] Step 4: Profile loaded. Core actions (30d): ${user.coreActionsLast30Days}`);
    logs.push(`[${ts}] Step 5: Segment assigned: ${user.segmentId}`);

    // Step 6 — AI recommendation
    logs.push(`[${ts}] Step 6: Requesting recommendation (${aiService.mode === 'sample' ? 'sample recommender' : 'LLM proxy'})…`);
    const ai = await aiService.evaluateUserContext(user);
    const needsReview = ai.confidence < reviewConfidenceThreshold;
    logs.push(`[${ts}] Step 6 AI Output: "${ai.recommendation}" via ${ai.suggestedChannel}, confidence ${ai.confidence.toFixed(2)}`);

    const decision: AIDecisionRecord = {
      id: randomId('dec_', 4),
      userId: user.id,
      task: 'Re-engagement Strategy',
      userSignals: `${user.coreActionsLast30Days} core actions in 30d, inactive ${user.lastActiveDays}d, ${user.subscription} plan`,
      recommendation: ai.recommendation,
      suggestedChannel: ai.suggestedChannel,
      confidence: ai.confidence,
      decisionStatus: needsReview ? 'Human Review' : 'Approved',
      humanReviewed: false,
      timestamp: ts,
    };
    this.aiDecisions.unshift(decision);
    Object.assign(user, {
      aiRecommendation: ai.recommendation,
      aiConfidence: ai.confidence,
      aiRationale: ai.rationale,
      campaignChannel: ai.suggestedChannel,
      messagePreview: ai.messagePreview,
    });

    if (needsReview) {
      logs.push(`[${ts}] Step 6 GOVERNANCE: confidence ${ai.confidence.toFixed(2)} < ${reviewConfidenceThreshold.toFixed(2)}. Routed to human review.`);
      user.status = 'Flagged Human Review';
      return { runId, userId: user.id, eventId, nodesExecuted: nodesUpTo(6), status: 'FLAGGED_HUMAN_REVIEW', stoppedAtNode: 'node-6', aiDecision: decision, logs };
    }

    // Step 7 — dispatch (optionally simulate throttling)
    if (forceError429) {
      logs.push(`[${ts}] Step 7 ERROR: messaging API returned HTTP 429 (rate limit).`);
      logs.push(`[${ts}] Step 7 RETRY: 3 attempts with backoff (1s, 5s, 25s) — all throttled.`);
      logs.push(`[${ts}] Step 7 FAILOVER: event moved to the operations error queue.`);
      this.errorQueue.unshift({
        id: randomId('err_', 3),
        eventId,
        userId: user.id,
        errorType: 'HTTP 429 Rate Limit',
        nodeId: 'node-7',
        retryCount: 3,
        maxRetries: 3,
        status: 'Queued Operations Alert',
        timestamp: ts,
      });
      return {
        runId,
        userId: user.id,
        eventId,
        nodesExecuted: nodesUpTo(7),
        status: 'ERROR_429_QUEUED',
        stoppedAtNode: 'node-7',
        errorDetail: 'HTTP 429 — moved to error queue',
        logs,
      };
    }

    logs.push(`[${ts}] Step 7: Dispatched (simulated) via ${ai.suggestedChannel}: "${ai.messagePreview.subject}"`);
    logs.push(`[${ts}] Step 8: Outcome logged to audit trail. Status → Action Triggered.`);
    user.status = 'Action Triggered';
    user.lastCampaign = ai.recommendation;

    return { runId, userId: user.id, eventId, nodesExecuted: nodesUpTo(8), status: 'SUCCESS', aiDecision: decision, logs };
  }

  updateDecisionStatus(decisionId: string, newStatus: 'Approved' | 'Rejected') {
    const decision = this.aiDecisions.find((d) => d.id === decisionId);
    if (!decision) return;
    decision.decisionStatus = newStatus;
    decision.humanReviewed = true;
    const user = this.users.find((u) => u.id === decision.userId);
    if (user) user.status = newStatus === 'Approved' ? 'Action Triggered' : 'No Action';
    this.pushActivity({
      title: `Recommendation ${newStatus.toLowerCase()} by reviewer`,
      detail: `${decision.userId} · ${decision.recommendation}`,
      tone: newStatus === 'Approved' ? 'success' : 'info',
      link: { view: 'ai-recommendations' },
    });
    this.emit();
  }

  resolveErrorQueueItem(errorId: string) {
    const item = this.errorQueue.find((e) => e.id === errorId);
    if (!item) return;
    item.status = 'Resolved';
    this.pushActivity({
      title: 'Error queue item reprocessed',
      detail: `${item.userId} · ${item.id}`,
      tone: 'success',
      link: { view: 'automation', sub: 'error-queue' },
    });
    this.emit();
  }
}

export const automationEngine = new AutomationEngine();

/** Re-renders the calling component whenever the engine state changes. */
export function useAutomationEngine() {
  useSyncExternalStore(automationEngine.subscribe, automationEngine.getVersion);
  return automationEngine;
}
