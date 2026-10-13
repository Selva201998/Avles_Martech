import { useState } from 'react';
import { Search, Sparkles, Mail, X } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge, SampleDataTag, type BadgeTone } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { TableWrap, THead, Th, TBody, Td, EmptyState } from '../components/ui/Table';
import { useAutomationEngine } from '../services/automationEngine';
import { getSegment } from '../data/catalog';
import type { AutomationStatus, UserProfile } from '../types';
import { cn } from '../lib/cn';

const STATUS_TONE: Record<AutomationStatus, BadgeTone> = {
  'Action Triggered': 'brand',
  'Re-engaged': 'success',
  'Flagged Human Review': 'warning',
  'No Action': 'neutral',
  Pending: 'info',
};

const PLAN_TONE: Record<UserProfile['subscription'], BadgeTone> = { paid: 'teal', trial: 'info', free: 'neutral' };

const selectClass =
  'h-9 rounded-lg border border-line bg-surface px-2.5 text-[13px] text-ink-secondary focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100';

export function UsersPage({ selectedId }: { selectedId?: string }) {
  const engine = useAutomationEngine();
  const users = engine.getUsers();
  const [query, setQuery] = useState('');
  const [plan, setPlan] = useState('all');
  const [status, setStatus] = useState('all');
  const [activeId, setActiveId] = useState<string>(selectedId ?? users[0].id);

  const [lastSelectedId, setLastSelectedId] = useState(selectedId);
  if (selectedId !== lastSelectedId) {
    setLastSelectedId(selectedId);
    if (selectedId) setActiveId(selectedId);
  }

  const q = query.trim().toLowerCase();
  const filtered = users.filter((u) => {
    const segment = getSegment(u.segmentId).name.toLowerCase();
    const matchesQuery = !q || u.name.toLowerCase().includes(q) || u.id.includes(q) || segment.includes(q) || u.email.includes(q);
    return matchesQuery && (plan === 'all' || u.subscription === plan) && (status === 'all' || u.status === status);
  });
  const selected = users.find((u) => u.id === activeId);
  const hasFilters = q || plan !== 'all' || status !== 'all';

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Synthetic user profiles with lifecycle history, segment assignment and the latest AI recommendation." />

      <Card padded={false} className="flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, ID, email or segment…"
            aria-label="Filter users"
            className="h-9 w-full rounded-lg border border-line bg-surface-muted pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-brand-300 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Plan" value={plan} onChange={(e) => setPlan(e.target.value)} className={selectClass}>
            <option value="all">All plans</option>
            <option value="free">Free</option>
            <option value="trial">Trial</option>
            <option value="paid">Paid</option>
          </select>
          <select aria-label="Automation status" value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
            <option value="all">All statuses</option>
            {Object.keys(STATUS_TONE).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {hasFilters && (
            <Button
              variant="ghost"
              icon={<X />}
              onClick={() => {
                setQuery('');
                setPlan('all');
                setStatus('all');
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card padded={false} className="overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-[15px] font-semibold text-ink">
              {filtered.length} of {users.length} users
            </h2>
            <SampleDataTag label="Synthetic profiles" />
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="No users match these filters" description="Adjust the search or clear filters to see all sample users." />
          ) : (
            <TableWrap>
              <THead>
                <tr>
                  <Th>User</Th>
                  <Th>Plan</Th>
                  <Th>Inactive</Th>
                  <Th>Segment</Th>
                  <Th>Channel</Th>
                  <Th>Status</Th>
                </tr>
              </THead>
              <TBody>
                {filtered.map((u) => {
                  const isActive = u.id === activeId;
                  return (
                    <tr
                      key={u.id}
                      onClick={() => setActiveId(u.id)}
                      className={cn('cursor-pointer transition-colors', isActive ? 'bg-brand-50/60' : 'hover:bg-surface-muted')}
                    >
                      <Td className={cn('border-l-2', isActive ? 'border-brand-500' : 'border-transparent')}>
                        <button className="text-left" aria-pressed={isActive} onClick={() => setActiveId(u.id)}>
                          <div className="font-medium text-ink">{u.name}</div>
                          <div className="font-mono text-[11px] text-ink-faint">
                            {u.id} · {u.country}
                          </div>
                        </button>
                      </Td>
                      <Td>
                        <Badge tone={PLAN_TONE[u.subscription]} className="capitalize">
                          {u.subscription}
                        </Badge>
                      </Td>
                      <Td className={cn('tabular-nums', u.lastActiveDays >= engine.getConfig().inactivityThresholdDays && 'font-medium text-ink')}>
                        {u.lastActiveDays}d
                      </Td>
                      <Td className="whitespace-nowrap">{getSegment(u.segmentId).shortName}</Td>
                      <Td className="whitespace-nowrap">{u.campaignChannel ?? '—'}</Td>
                      <Td>
                        <Badge tone={STATUS_TONE[u.status]}>{u.status}</Badge>
                      </Td>
                    </tr>
                  );
                })}
              </TBody>
            </TableWrap>
          )}
        </Card>

        {selected ? (
          <Card className="h-fit space-y-5 xl:sticky xl:top-20" aria-live="polite">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-ink">{selected.name}</h2>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-ink-muted">
                  <Mail className="h-3.5 w-3.5" /> {selected.email}
                </p>
              </div>
              <Badge tone={STATUS_TONE[selected.status]}>{selected.status}</Badge>
            </div>

            <dl className="grid grid-cols-2 gap-2.5 text-[13px]">
              {[
                ['Segment', getSegment(selected.segmentId).name],
                ['Goal', selected.goal.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())],
                ['Core actions (30d)', String(selected.coreActionsLast30Days)],
                ['Last active', `${selected.lastActiveDays} days ago`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-line bg-surface-muted px-3 py-2">
                  <dt className="text-[11px] text-ink-muted">{k}</dt>
                  <dd className="mt-0.5 font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            {selected.aiRecommendation && (
              <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-800">
                    <Sparkles className="h-3.5 w-3.5" /> AI recommendation
                  </span>
                  {selected.aiConfidence !== undefined && (
                    <span className="text-xs tabular-nums text-ink-muted" title="Model self-reported confidence (sample)">
                      confidence {selected.aiConfidence.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 text-[13px] font-medium text-ink">{selected.aiRecommendation}</div>
                {selected.aiRationale && <p className="mt-1 text-xs leading-5 text-ink-secondary">{selected.aiRationale}</p>}
              </div>
            )}

            {selected.messagePreview && (
              <div className="rounded-xl border border-line p-3.5">
                <div className="flex items-center justify-between text-[11px] text-ink-muted">
                  <span>{selected.campaignChannel} preview</span>
                  <SampleDataTag label="Generated sample copy" />
                </div>
                <div className="mt-2 text-[13px] font-semibold text-ink">{selected.messagePreview.subject}</div>
                <p className="mt-1 text-xs leading-5 text-ink-secondary">{selected.messagePreview.body}</p>
                <span className="mt-2.5 inline-block rounded-md bg-brand-600 px-2.5 py-1 text-[11px] font-medium text-white">{selected.messagePreview.cta}</span>
              </div>
            )}

            <div>
              <h3 className="text-xs font-semibold text-ink">Lifecycle timeline</h3>
              <ol className="relative mt-3 space-y-3 border-l border-line pl-4">
                {selected.activityHistory.map((a, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-surface bg-brand-500" aria-hidden />
                    <div className="text-[13px] font-medium text-ink">{a.event}</div>
                    <div className="text-xs text-ink-muted">{a.detail}</div>
                    <div className="font-mono text-[11px] text-ink-faint">{a.date}</div>
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        ) : (
          <Card>
            <EmptyState title="Select a user" description="Choose a row to see lifecycle history and the AI recommendation." />
          </Card>
        )}
      </div>
    </div>
  );
}
