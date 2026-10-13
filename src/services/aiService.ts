import type { Channel, UserProfile } from '../types';

export interface AIRecommendationResult {
  recommendation: string;
  suggestedChannel: Channel;
  rationale: string;
  /** Model self-reported confidence in [0, 1]. The engine decides on human review using the workspace threshold. */
  confidence: number;
  source: 'sample' | 'live-llm';
  messagePreview: {
    subject: string;
    body: string;
    cta: string;
  };
}

export interface AIRecommendationService {
  readonly mode: 'sample' | 'live-llm';
  evaluateUserContext(user: UserProfile): Promise<AIRecommendationResult>;
}

const firstName = (user: UserProfile) => user.name.split(' ')[0];

/**
 * Deterministic sample recommender. Rules mirror what a prompt would be asked to do,
 * so the demo behaves predictably and never claims live inference.
 */
export class SampleRecommendationService implements AIRecommendationService {
  readonly mode = 'sample' as const;

  async evaluateUserContext(user: UserProfile): Promise<AIRecommendationResult> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    if (user.subscription === 'paid') {
      return {
        recommendation: 'Advanced Feature Insights',
        suggestedChannel: 'Email',
        confidence: user.coreActionsLast30Days > 30 ? 0.96 : 0.86,
        source: 'sample',
        rationale: `Paid subscriber with ${user.coreActionsLast30Days} core actions in 30 days. Retention priority — surface value already earned rather than discounting.`,
        messagePreview: {
          subject: 'Your monthly progress report is ready',
          body: `Hi ${firstName(user)}, you completed ${user.coreActionsLast30Days} actions last month. Your personalised insights are waiting.`,
          cta: 'View my insights',
        },
      };
    }

    if (user.segmentId === 'at_risk') {
      return {
        recommendation: 'Routine Reset Reminder',
        suggestedChannel: 'In-App Message',
        confidence: 0.62,
        source: 'sample',
        rationale:
          'Mixed engagement signals (reminders opened, no completed actions). Optimal timing and tone are uncertain.',
        messagePreview: {
          subject: 'Ready to restart your routine?',
          body: `Hi ${firstName(user)}, your weekly plan is saved. Start again with a lighter first week.`,
          cta: 'Restart my routine',
        },
      };
    }

    if (user.subscription === 'trial') {
      return {
        recommendation: 'Trial Recap & Upgrade Preview',
        suggestedChannel: 'Push Notification',
        confidence: 0.92,
        source: 'sample',
        rationale: 'Active trial that went quiet before conversion. Recapping value delivered tends to beat a discount.',
        messagePreview: {
          subject: 'Your trial in numbers',
          body: `${user.coreActionsLast30Days} actions so far. Keep your progress and premium features with one tap.`,
          cta: 'Keep my progress',
        },
      };
    }

    if (user.coreActionsLast30Days < 5) {
      return {
        recommendation: 'Quick-Start Tips & Templates',
        suggestedChannel: 'Push Notification',
        confidence: 0.88,
        source: 'sample',
        rationale: 'Low historical activity. Reduce friction with a single low-effort first step.',
        messagePreview: {
          subject: '3 ready-made templates to get started',
          body: 'Skip the setup — pick a template and be done in under five minutes.',
          cta: 'Browse templates',
        },
      };
    }

    return {
      recommendation: 'Progress Continuity & Streak Reminder',
      suggestedChannel: 'Email',
      confidence: 0.94,
      source: 'sample',
      rationale: `Strong historical usage (${user.coreActionsLast30Days} core actions in 30 days). Frame outreach around resuming momentum.`,
      messagePreview: {
        subject: 'Pick up right where you left off',
        body: `Hi ${firstName(user)}, you completed ${user.coreActionsLast30Days} sessions last month. Two minutes today keeps your streak going.`,
        cta: 'Resume my plan',
      },
    };
  }
}

/**
 * Optional live LLM adapter for LOCAL experiments only.
 *
 * It calls a server-side proxy (VITE_LLM_PROXY_URL) that holds the provider API key.
 * The browser bundle never contains a provider key. Without a proxy URL the app
 * uses the sample recommender above. Any failure falls back to the sample result.
 */
export class ProxyLLMRecommendationService implements AIRecommendationService {
  readonly mode = 'live-llm' as const;
  private readonly fallback = new SampleRecommendationService();
  private readonly proxyUrl: string;

  constructor(proxyUrl: string) {
    this.proxyUrl = proxyUrl;
  }

  async evaluateUserContext(user: UserProfile): Promise<AIRecommendationResult> {
    try {
      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          subscription: user.subscription,
          goal: user.goal,
          last_active_days: user.lastActiveDays,
          core_actions_last_30_days: user.coreActionsLast30Days,
          segment_id: user.segmentId,
        }),
      });
      if (!response.ok) throw new Error(`Proxy HTTP ${response.status}`);
      const parsed = (await response.json()) as Partial<AIRecommendationResult & { subject: string; body: string; cta: string }>;
      const sample = await this.fallback.evaluateUserContext(user);
      return {
        recommendation: parsed.recommendation ?? sample.recommendation,
        suggestedChannel: parsed.suggestedChannel ?? sample.suggestedChannel,
        rationale: parsed.rationale ?? sample.rationale,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : sample.confidence,
        source: 'live-llm',
        messagePreview: {
          subject: parsed.subject ?? sample.messagePreview.subject,
          body: parsed.body ?? sample.messagePreview.body,
          cta: parsed.cta ?? sample.messagePreview.cta,
        },
      };
    } catch (error) {
      console.warn('LLM proxy unavailable, using sample recommender:', error);
      return this.fallback.evaluateUserContext(user);
    }
  }
}

const proxyUrl = import.meta.env.VITE_LLM_PROXY_URL as string | undefined;

export const aiService: AIRecommendationService = proxyUrl
  ? new ProxyLLMRecommendationService(proxyUrl)
  : new SampleRecommendationService();
