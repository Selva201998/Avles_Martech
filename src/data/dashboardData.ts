/**
 * Illustrative dashboard data for the Overview page.
 * Values are synthetic. The latest day is anchored to the headline KPI values;
 * earlier days come from a seeded generator so the series is stable across reloads.
 */
import type { DateRangeKey } from '../types';
import { daysAgo, isoDate, shortDayLabel } from './dateUtils';
import { TARGETED_SEGMENTS } from './catalog';

export interface DailyExecution {
  date: string;
  label: string;
  evaluated: number;
  candidates: number;
  triggered: number;
  reengaged: number;
  successRate: number;
  hoursSaved: number;
  aiLeverage: number;
}

export const DATE_RANGES: { key: DateRangeKey; label: string; days: number }[] = [
  { key: '7d', label: 'Last 7 days', days: 7 },
  { key: '14d', label: 'Last 14 days', days: 14 },
  { key: '30d', label: 'Last 30 days', days: 30 },
];

export const rangeDays = (key: DateRangeKey): number => DATE_RANGES.find((r) => r.key === key)?.days ?? 7;
export const rangeLabel = (key: DateRangeKey): string => DATE_RANGES.find((r) => r.key === key)?.label ?? '';

/** Mulberry32 — tiny deterministic PRNG so sample data is stable. */
const seeded = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Most recent 7 days are hand-set so the headline KPIs line up with the chart. Index 6 = today. */
const RECENT_EVALUATED = [1142, 1210, 1176, 1238, 1156, 1185, 1284];
const RECENT_TRIGGERED = [147, 158, 151, 160, 149, 153, 165];
const RECENT_SUCCESS = [97.1, 97.6, 96.9, 98.2, 97.4, 97.5, 97.8];
const RECENT_AI = [92.8, 93.5, 93.1, 94.0, 93.6, 93.9, 94.2];

const buildSeries = (): DailyExecution[] => {
  const rand = seeded(42);
  const total = 30;
  const series: DailyExecution[] = [];
  for (let i = total - 1; i >= 0; i--) {
    const date = daysAgo(i);
    const recentIndex = 6 - i;
    const isRecent = recentIndex >= 0;
    const weekday = date.getDay();
    const weekendDip = weekday === 0 || weekday === 6 ? 0.93 : 1;

    const evaluated = isRecent
      ? RECENT_EVALUATED[recentIndex]
      : Math.round((1020 + (total - i) * 4 + rand() * 90) * weekendDip);
    const triggered = isRecent ? RECENT_TRIGGERED[recentIndex] : Math.round(evaluated * (0.122 + rand() * 0.014));
    const candidates = Math.round(triggered * 1.127);
    const reengaged = Math.round(triggered * (0.25 + (isRecent ? 0.01 : rand() * 0.02)));
    const successRate = isRecent ? RECENT_SUCCESS[recentIndex] : +(96.4 + rand() * 1.6).toFixed(1);
    const aiLeverage = isRecent ? RECENT_AI[recentIndex] : +(91.5 + rand() * 2.2).toFixed(1);
    // ~6 minutes of manual work saved per triggered action (see Analytics → ROI model)
    const hoursSaved = +((triggered * 6.73) / 60).toFixed(1);

    series.push({
      date: isoDate(date),
      label: shortDayLabel(date),
      evaluated,
      candidates: isRecent && recentIndex === 6 ? 186 : candidates,
      triggered,
      reengaged: isRecent && recentIndex === 6 ? 43 : reengaged,
      successRate,
      hoursSaved,
      aiLeverage,
    });
  }
  return series;
};

export const DAILY_EXECUTIONS: DailyExecution[] = buildSeries();

export const getExecutionsForRange = (key: DateRangeKey): DailyExecution[] =>
  DAILY_EXECUTIONS.slice(-rangeDays(key));

const today = DAILY_EXECUTIONS[DAILY_EXECUTIONS.length - 1];
const yesterday = DAILY_EXECUTIONS[DAILY_EXECUTIONS.length - 2];

export type KpiTone = 'brand' | 'blue' | 'teal' | 'orange' | 'violet';

export interface KpiDefinition {
  id: string;
  label: string;
  value: string;
  delta?: { text: string; direction: 'up' | 'down' };
  context: string;
  /** Plain-language definition shown in the info tooltip. */
  definition: string;
  tone: KpiTone;
  sparklineKey: keyof Pick<DailyExecution, 'evaluated' | 'candidates' | 'successRate' | 'hoursSaved' | 'aiLeverage'>;
}

const pctChange = (current: number, previous: number) => ((current - previous) / previous) * 100;

export const KPIS: KpiDefinition[] = [
  {
    id: 'kpi-users-processed',
    label: 'Users Processed',
    value: today.evaluated.toLocaleString('en-US'),
    delta: { text: `+${pctChange(today.evaluated, yesterday.evaluated).toFixed(1)}%`, direction: 'up' },
    context: 'vs yesterday',
    definition: 'Users evaluated by the re-engagement workflow in the latest daily run.',
    tone: 'brand',
    sparklineKey: 'evaluated',
  },
  {
    id: 'kpi-candidates',
    label: 'Re-engagement Candidates',
    value: today.candidates.toLocaleString('en-US'),
    context: `${((today.candidates / today.evaluated) * 100).toFixed(1)}% of processed users`,
    definition: 'Users that passed the deterministic inactivity rule (last_active_days ≥ threshold).',
    tone: 'blue',
    sparklineKey: 'candidates',
  },
  {
    id: 'kpi-success-rate',
    label: 'Success Rate',
    value: `${today.successRate}%`,
    context: 'Illustrative pipeline success rate',
    definition: 'Share of workflow runs completing without an unrecovered error. Retries that later succeed count as success.',
    tone: 'teal',
    sparklineKey: 'successRate',
  },
  {
    id: 'kpi-effort-saved',
    label: 'Manual Effort Saved',
    value: '18.5 h',
    context: 'Estimated time saved through automation',
    definition:
      'Estimate: triggered actions × manual minutes per action (ROI model on the Analytics page). Not a measured time study.',
    tone: 'orange',
    sparklineKey: 'hoursSaved',
  },
  {
    id: 'kpi-ai-leverage',
    label: 'AI Recommendation Leverage',
    value: `${today.aiLeverage}%`,
    context: 'Avg. confidence 0.91 · 5.8% sent to human review',
    definition:
      'Share of AI recommendations that cleared the confidence gate and were used without edits. Confidence is the model’s self-reported score, not measured accuracy; uncertain cases go to human review.',
    tone: 'violet',
    sparklineKey: 'aiLeverage',
  },
];

export interface FunnelStage {
  id: string;
  label: string;
  value: number;
  description: string;
}

export const FUNNEL_STAGES: FunnelStage[] = [
  { id: 'synced', label: 'Users Synced', value: 1284, description: 'Profiles received via event sync' },
  { id: 'eligible', label: 'Inactive Eligible', value: 186, description: 'Passed inactivity rule (≥ 7 days)' },
  {
    id: 'segmented',
    label: 'Segmented',
    value: TARGETED_SEGMENTS.reduce((sum, s) => sum + s.audienceSize, 0),
    description: 'Matched a targeted lifecycle segment',
  },
  { id: 'triggered', label: 'Action Triggered', value: 165, description: 'Email, push or in-app dispatched' },
  { id: 'reengaged', label: 'Re-engaged', value: 43, description: 'Returned within 48 hours' },
];

export interface OperationalHours {
  task: string;
  /** Compact label for narrow screens. */
  short: string;
  before: number;
  after: number;
}

/** Illustrative weekly team hours, before vs after automation. */
export const OPERATIONAL_HOURS: OperationalHours[] = [
  { task: 'Segment Identification', short: 'Segments', before: 4.5, after: 0.2 },
  { task: 'Copy Personalization', short: 'Copy', before: 8.0, after: 1.1 },
  { task: 'Campaign Dispatch', short: 'Dispatch', before: 5.0, after: 0.4 },
  { task: 'Reporting & Tracking', short: 'Reporting', before: 3.0, after: 0.3 },
];
