import { useState } from 'react';
import { Check, X, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge, type BadgeTone } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { TableWrap, THead, Th, TBody, Td, EmptyState } from '../components/ui/Table';
import { useAutomationEngine } from '../services/automationEngine';
import { useApp } from '../app/appContext';
import type { AIDecisionRecord } from '../types';
import { cn } from '../lib/cn';

const STATUS_TONE: Record<AIDecisionRecord['decisionStatus'], BadgeTone> = { Approved: 'success', 'Human Review': 'warning', Rejected: 'danger' };
type Filter = 'all' | 'review';

export function AIRecommendationsPage() {
  const engine = useAutomationEngine();
  const { navigate, notify } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const decisions = engine.getAIDecisions();
  const threshold = engine.getConfig().reviewConfidenceThreshold;
  const pending = decisions.filter((d) => d.decisionStatus === 'Human Review');
  const visible = filter === 'review' ? pending : decisions;

  const buckets = [
    { label: `High (≥ 0.85)`, count: decisions.filter((d) => d.confidence >= 0.85).length, color: 'bg-brand-600' },
    { label: `Medium (${threshold.toFixed(2)}–0.85)`, count: decisions.filter((d) => d.confidence >= threshold && d.confidence < 0.85).length, color: 'bg-brand-300' },
    { label: `Below threshold (< ${threshold.toFixed(2)})`, count: decisions.filter((d) => d.confidence < threshold).length, color: 'bg-accent-orange' },
  ];
  const maxBucket = Math.max(1, ...buckets.map((b) => b.count));
  const avgConfidence = decisions.reduce((s, d) => s + d.confidence, 0) / Math.max(1, decisions.length);

  const decide = (d: AIDecisionRecord, status: 'Approved' | 'Rejected') => {
    engine.updateDecisionStatus(d.id, status);
    notify(`${status === 'Approved' ? 'Approved' : 'Rejected'} “${d.recommendation}” for ${d.userId}. Logged to the audit trail (demo).`, status === 'Approved' ? 'success' : 'info');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Recommendations"
        description="Every AI suggestion is logged with its input signals and confidence. Low-confidence suggestions wait for a human decision."
        actions={
          <Button icon={<ShieldCheck />} onClick={() => navigate('settings')}>
            Review threshold: {threshold.toFixed(2)}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2" padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Decision audit trail</h2>
              <p className="text-[13px] text-ink-muted">{decisions.length} decisions logged in this session</p>
            </div>
            <SegmentedControl<Filter>
              ariaLabel="Filter decisions"
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'all', label: 'All' },
                { value: 'review', label: `Needs review (${pending.length})` },
              ]}
            />
          </div>
          {visible.length === 0 ? (
            <EmptyState
              title="Nothing waiting for review"
              description="Run Elena’s scenario on the Automation page to generate a low-confidence recommendation."
              action={
                <Button size="sm" onClick={() => navigate('automation')}>
                  Open run simulator
                </Button>
              }
            />
          ) : (
            <TableWrap>
              <THead>
                <tr>
                  <Th>User</Th>
                  <Th>Recommendation</Th>
                  <Th className="hidden 2xl:table-cell">Signals</Th>
                  <Th className="text-right">Confidence</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Review</Th>
                </tr>
              </THead>
              <TBody>
                {visible.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-muted">
                    <Td>
                      <button className="font-mono text-xs font-medium text-brand-700 hover:underline" onClick={() => navigate('users', d.userId)}>
                        {d.userId}
                      </button>
                      <div className="text-[11px] text-ink-faint">{d.timestamp.slice(5, 16)}</div>
                    </Td>
                    <Td className="min-w-[220px]" title={d.userSignals}>
                      <div className="font-medium text-ink">{d.recommendation}</div>
                      <div className="text-[11px] text-ink-faint">
                        {d.task} · {d.suggestedChannel}
                      </div>
                    </Td>
                    <Td className="hidden max-w-[220px] truncate text-xs 2xl:table-cell" title={d.userSignals}>
                      {d.userSignals}
                    </Td>
                    <Td className={cn('text-right font-medium tabular-nums', d.confidence < threshold ? 'text-orange-700' : 'text-ink')}>{d.confidence.toFixed(2)}</Td>
                    <Td>
                      <Badge tone={STATUS_TONE[d.decisionStatus]}>{d.decisionStatus === 'Human Review' ? 'Pending review' : d.decisionStatus}</Badge>
                    </Td>
                    <Td className="text-right">
                      {d.decisionStatus === 'Human Review' ? (
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="primary" icon={<Check />} onClick={() => decide(d, 'Approved')}>
                            Approve
                          </Button>
                          <Button size="sm" icon={<X />} onClick={() => decide(d, 'Rejected')}>
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-ink-faint">{d.humanReviewed ? 'Reviewed' : 'Auto-approved'}</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </TBody>
            </TableWrap>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader icon={<Sparkles />} title="Confidence distribution" description="Model self-reported confidence. It is not a measured accuracy." />
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums text-ink">{avgConfidence.toFixed(2)}</span>
              <span className="text-[13px] text-ink-muted">average confidence</span>
            </div>
            <ul className="space-y-3">
              {buckets.map((b) => (
                <li key={b.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-ink-secondary">{b.label}</span>
                    <span className="font-medium tabular-nums text-ink">{b.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-line">
                    <div className={cn('h-full rounded-full', b.color)} style={{ width: `${(b.count / maxBucket) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="bg-brand-50/50">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
              <UserCheck className="h-4 w-4 text-brand-600" /> Where AI is (and isn’t) used
            </div>
            <p className="mt-2 text-xs leading-5 text-ink-secondary">
              Eligibility and segmentation are deterministic rules. The model only proposes the message angle, channel and copy draft. Anything below the
              review threshold is held until a person approves or rejects it.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
