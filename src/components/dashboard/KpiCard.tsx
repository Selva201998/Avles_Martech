import type { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { KpiDefinition, KpiTone } from '../../data/dashboardData';
import { InfoTip } from '../ui/InfoTip';
import { Sparkline } from './Sparkline';
import { cn } from '../../lib/cn';

const TONE_STYLES: Record<KpiTone, { icon: string; spark: string }> = {
  brand: { icon: 'bg-brand-50 text-brand-600 ring-brand-100', spark: '#6e56f0' },
  blue: { icon: 'bg-blue-50 text-blue-600 ring-blue-100', spark: '#3b82f6' },
  teal: { icon: 'bg-teal-50 text-teal-600 ring-teal-100', spark: '#0d9488' },
  orange: { icon: 'bg-orange-50 text-orange-600 ring-orange-100', spark: '#e8833a' },
  violet: { icon: 'bg-violet-50 text-violet-600 ring-violet-100', spark: '#7c3aed' },
};

interface KpiCardProps {
  kpi: KpiDefinition;
  icon: ReactNode;
  trend: number[];
  trendLabel: string;
}

export function KpiCard({ kpi, icon, trend, trendLabel }: KpiCardProps) {
  const tone = TONE_STYLES[kpi.tone];
  return (
    <article
      id={kpi.id}
      aria-labelledby={`${kpi.id}-label`}
      className="flex h-full min-h-[148px] scroll-mt-24 flex-col rounded-card border border-line bg-surface p-4 shadow-card transition-shadow duration-150 hover:shadow-card-hover"
    >
      <div className="flex min-h-9 items-start gap-2">
        <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ring-inset [&>svg]:h-3.5 [&>svg]:w-3.5', tone.icon)}>{icon}</span>
        <h3 id={`${kpi.id}-label`} className="line-clamp-2 min-w-0 flex-1 text-[13px] font-medium leading-[18px] text-ink-secondary">
          {kpi.label}
        </h3>
        <span className="mt-0.5 shrink-0">
          <InfoTip text={kpi.definition} label={`About ${kpi.label}`} />
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="text-[28px] font-semibold leading-none tracking-tight text-ink tabular-nums">{kpi.value}</div>
        <Sparkline values={trend} color={tone.spark} label={trendLabel} width={64} height={30} />
      </div>

      <div className="mt-auto flex items-start gap-1.5 pt-3 text-xs leading-4">
        {kpi.delta && (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-px font-medium',
              kpi.delta.direction === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
            )}
          >
            {kpi.delta.direction === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {kpi.delta.text}
          </span>
        )}
        <span className="line-clamp-2 py-px text-ink-muted" title={kpi.context}>
          {kpi.context}
        </span>
      </div>
    </article>
  );
}
