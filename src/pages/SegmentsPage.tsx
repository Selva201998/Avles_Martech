import { Layers, ArrowUpRight } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SEGMENTS, CAMPAIGNS } from '../data/catalog';
import { useAutomationEngine } from '../services/automationEngine';
import { useApp } from '../app/appContext';
import { ChannelIcon } from '../components/ui/ChannelIcon';
import { cn } from '../lib/cn';

export function SegmentsPage({ selectedId }: { selectedId?: string }) {
  const engine = useAutomationEngine();
  const { navigate } = useApp();
  const users = engine.getUsers();
  const targetedTotal = SEGMENTS.filter((s) => s.conversionRate !== null).reduce((sum, s) => sum + s.audienceSize, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Segments"
        description="Deterministic lifecycle segments. Rules are evaluated in order after the inactivity check; AI never decides segment membership."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {SEGMENTS.map((segment, index) => {
          const members = users.filter((u) => u.segmentId === segment.id);
          const campaigns = CAMPAIGNS.filter((c) => c.segmentId === segment.id);
          const isTargeted = segment.conversionRate !== null;
          return (
            <Card
              as="article"
              key={segment.id}
              id={`segment-${segment.id}`}
              className={cn('flex flex-col', selectedId === segment.id && 'ring-2 ring-brand-300', !isTargeted && 'bg-surface-muted')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold', isTargeted ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-ink-muted')}>
                    {isTargeted ? index + 1 : <Layers className="h-4 w-4" />}
                  </span>
                  <h2 className="text-[15px] font-semibold text-ink">{segment.name}</h2>
                </div>
                {isTargeted ? <Badge tone="brand">Targeted</Badge> : <Badge>Suppressed</Badge>}
              </div>
              <p className="mt-2 text-[13px] leading-5 text-ink-muted">{segment.description}</p>
              <code className="mt-3 block rounded-lg border border-line bg-surface-muted px-3 py-2 font-mono text-[11.5px] leading-5 text-ink">{segment.rule}</code>

              <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-surface-muted px-2 py-2 ring-1 ring-inset ring-line">
                  <dt className="text-[11px] text-ink-muted">Audience</dt>
                  <dd className="text-[15px] font-semibold tabular-nums text-ink">{segment.audienceSize.toLocaleString('en-US')}</dd>
                </div>
                <div className="rounded-lg bg-surface-muted px-2 py-2 ring-1 ring-inset ring-line">
                  <dt className="text-[11px] text-ink-muted">Share</dt>
                  <dd className="text-[15px] font-semibold tabular-nums text-ink">{isTargeted ? `${((segment.audienceSize / targetedTotal) * 100).toFixed(0)}%` : '—'}</dd>
                </div>
                <div className="rounded-lg bg-surface-muted px-2 py-2 ring-1 ring-inset ring-line">
                  <dt className="text-[11px] text-ink-muted">48h conv.</dt>
                  <dd className="text-[15px] font-semibold tabular-nums text-ink">{isTargeted ? `${segment.conversionRate}%` : '—'}</dd>
                </div>
              </dl>

              <div className="mb-4 mt-4 flex items-center justify-between gap-2 text-xs">
                <span className="text-ink-muted">Default play</span>
                <span className="flex items-center gap-1.5 text-right font-medium text-ink-secondary">
                  {isTargeted && <ChannelIcon channel={segment.defaultChannel} />}
                  {segment.defaultPlay}
                </span>
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
                <span className="mr-1 text-[11px] text-ink-faint">Sample users:</span>
                {members.length === 0 && <span className="text-[11px] text-ink-faint">none</span>}
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => navigate('users', m.id)}
                    className="rounded-full border border-line bg-surface px-2 py-0.5 text-[11px] text-ink-secondary hover:border-brand-300 hover:text-brand-700"
                  >
                    {m.name.split(' ')[0]}
                  </button>
                ))}
                {campaigns.length > 0 && (
                  <button
                    onClick={() => navigate('campaigns', campaigns[0].id)}
                    className="ml-auto inline-flex items-center gap-0.5 text-[11px] font-medium text-brand-700 hover:underline"
                  >
                    {campaigns.length} campaign{campaigns.length > 1 ? 's' : ''} <ArrowUpRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
