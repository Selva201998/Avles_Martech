import { Fragment } from 'react';
import { RefreshCw, UserX, Layers, Send, HeartHandshake, ChevronRight, type LucideIcon } from 'lucide-react';
import type { FunnelStage } from '../../data/dashboardData';
import { cn } from '../../lib/cn';

const STAGE_ICONS: Record<string, LucideIcon> = {
  synced: RefreshCw,
  eligible: UserX,
  segmented: Layers,
  triggered: Send,
  reengaged: HeartHandshake,
};

const pct = (num: number, den: number) => `${((num / den) * 100).toFixed(1)}%`;

/** Horizontal funnel; scrolls horizontally below the lg breakpoint so stages never squash. */
export function LifecycleFunnel({ stages }: { stages: FunnelStage[] }) {
  const top = stages[0].value;
  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-1">
      <ol className="flex min-w-[880px] items-stretch">
        {stages.map((stage, i) => {
          const Icon = STAGE_ICONS[stage.id] ?? Layers;
          const isFinal = i === stages.length - 1;
          const share = (stage.value / top) * 100;
          return (
            <Fragment key={stage.id}>
              {i > 0 && (
                <li aria-hidden className="flex w-12 shrink-0 flex-col items-center justify-center gap-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line bg-surface text-ink-faint shadow-card">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[11px] font-medium tabular-nums text-ink-muted">{pct(stage.value, stages[i - 1].value)}</span>
                </li>
              )}
              <li
                className={cn(
                  'flex min-w-0 flex-1 flex-col rounded-xl border p-3.5',
                  isFinal ? 'border-teal-200 bg-teal-50/60' : 'border-line bg-surface-muted',
                )}
                aria-label={`Step ${i + 1}, ${stage.label}: ${stage.value.toLocaleString('en-US')}${i > 0 ? `, ${pct(stage.value, stages[i - 1].value)} of previous step` : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-lg ring-1 ring-inset',
                      isFinal ? 'bg-teal-600 text-white ring-teal-600' : 'bg-surface text-brand-600 ring-line',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className={cn('text-xs font-medium', isFinal ? 'text-teal-800' : 'text-ink-muted')}>Step {i + 1}</span>
                </div>
                <div className={cn('mt-2.5 text-[13px] font-semibold', isFinal ? 'text-teal-900' : 'text-ink')}>{stage.label}</div>
                <div className={cn('mt-0.5 text-2xl font-semibold tabular-nums tracking-tight', isFinal ? 'text-teal-700' : 'text-ink')}>
                  {stage.value.toLocaleString('en-US')}
                </div>
                <p className="mt-1 text-xs leading-4 text-ink-muted">{stage.description}</p>
                <div className="mt-auto pt-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-line" title={`${share.toFixed(1)}% of synced users`}>
                    <div className={cn('h-full rounded-full', isFinal ? 'bg-teal-600' : 'bg-brand-500')} style={{ width: `${Math.max(share, 1.5)}%` }} />
                  </div>
                  <div className="mt-1 text-[11px] tabular-nums text-ink-faint">{share.toFixed(1)}% of synced</div>
                </div>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
}
