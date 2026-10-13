/** Routable views. Order and labels live in src/config/navigation.ts. */
export type ViewId =
  | 'overview'
  | 'automation'
  | 'users'
  | 'segments'
  | 'campaigns'
  | 'ai-recommendations'
  | 'analytics'
  | 'integrations'
  | 'settings';

export type DateRangeKey = '7d' | '14d' | '30d';

export type UserSubscription = 'free' | 'paid' | 'trial';
/** Generic product goal a user selected during onboarding. */
export type UserGoal = 'habit_building' | 'goal_tracking' | 'skill_progress' | 'routine_planning';
export type LifecycleStage = 'new_signup' | 'active_user' | 'at_risk' | 'inactive' | 're_engaged' | 'churned';
export type Channel = 'Email' | 'Push Notification' | 'In-App Message';

/** Canonical lifecycle segments used across charts, routing and the Segments view. */
export type SegmentId = 'engaged_inactive' | 'paid_subscriber' | 'trial_expired' | 'low_engagement' | 'at_risk' | 'active';

export type AutomationStatus = 'Pending' | 'Action Triggered' | 'Re-engaged' | 'Flagged Human Review' | 'No Action';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  country: string;
  subscription: UserSubscription;
  lifecycle: LifecycleStage;
  lastActiveDays: number;
  /** Count of the product's "core action" (e.g. a logged session, a completed task) in the last 30 days. */
  coreActionsLast30Days: number;
  goal: UserGoal;
  segmentId: SegmentId;
  aiRecommendation?: string;
  aiConfidence?: number;
  aiRationale?: string;
  lastCampaign?: string;
  campaignChannel?: Channel | 'None';
  messagePreview?: { subject: string; body: string; cta: string };
  status: AutomationStatus;
  signupDate: string;
  activityHistory: {
    date: string;
    event: string;
    detail: string;
  }[];
}

export type NodeType = 'trigger' | 'validator' | 'rule' | 'enrichment' | 'ai' | 'action' | 'tracking';

export interface WorkflowNode {
  id: string;
  title: string;
  category: NodeType;
  isAi: boolean;
  purpose: string;
  logic: string;
  typeDescription: string;
  technology: string;
  inputExample: Record<string, unknown>;
  outputExample: Record<string, unknown>;
  failureHandling: string;
  reasoning: string;
  iconName: 'Zap' | 'CheckCircle2' | 'Clock' | 'Database' | 'Filter' | 'Sparkles' | 'Send' | 'BarChart3';
}

export interface AIDecisionRecord {
  id: string;
  userId: string;
  task: 'Context Classification' | 'Re-engagement Strategy' | 'Message Angle Recommendation' | 'Churn Risk Assessment';
  userSignals: string;
  recommendation: string;
  suggestedChannel: string;
  confidence: number;
  decisionStatus: 'Approved' | 'Human Review' | 'Rejected';
  humanReviewed: boolean;
  timestamp: string;
}

export interface ErrorQueueItem {
  id: string;
  eventId: string;
  userId: string;
  errorType: 'HTTP 429 Rate Limit' | 'Validation Error' | 'Timeout' | 'CRM Endpoint 503';
  nodeId: string;
  retryCount: number;
  maxRetries: number;
  status: 'Retrying (Backoff)' | 'Queued Operations Alert' | 'Resolved';
  timestamp: string;
}

export interface IdempotencyLog {
  eventId: string;
  userId: string;
  firstReceived: string;
  secondReceived: string;
  status: 'First: Processed Successfully' | 'Second: Ignored (Duplicate Event)';
}

export interface BuildVsBuyItem {
  requirement: string;
  existingTool: string;
  customBuild: string;
  decision: string;
  rationale: string;
}

export interface GovernanceStandard {
  category: string;
  principle: string;
  implementation: string;
}

export interface SegmentDefinition {
  id: SegmentId;
  name: string;
  shortName: string;
  rule: string;
  description: string;
  defaultPlay: string;
  defaultChannel: Channel;
  /** Illustrative 48h re-engagement conversion, percent. `null` for segments that are never targeted. */
  conversionRate: number | null;
  /** Illustrative audience size for the latest daily run. */
  audienceSize: number;
}

export type CampaignStatus = 'Active' | 'Paused' | 'Draft';

export interface Campaign {
  id: string;
  name: string;
  segmentId: SegmentId;
  channel: Channel;
  status: CampaignStatus;
  trigger: string;
  sentLast7d: number;
  openRate: number | null;
  reengagedRate: number | null;
  owner: string;
}

export type IntegrationMode = 'simulated' | 'local-optional' | 'export';

export interface Integration {
  id: string;
  name: string;
  category: 'Orchestration' | 'CRM / CDP' | 'Messaging' | 'AI / LLM' | 'Data Warehouse';
  description: string;
  mode: IntegrationMode;
  usedIn: string;
  backendRequirement: string;
}
