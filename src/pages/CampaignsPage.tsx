import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge, SampleDataTag, type BadgeTone } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { TableWrap, THead, Th, TBody, Td, EmptyState } from '../components/ui/Table';
import { CAMPAIGNS, getSegment } from '../data/catalog';
import { useApp } from '../app/appContext';
import type { Campaign, CampaignStatus } from '../types';
import { cn } from '../lib/cn';
import { ChannelIcon } from '../components/ui/ChannelIcon';

const STATUS_TONE: Record<CampaignStatus, BadgeTone> = { Active: 'success', Paused: 'warning', Draft: 'neutral' };
type Filter = 'all' | CampaignStatus;

const fmtPct = (v: number | null) => (v === null ? '—' : `${v.toFixed(1)}%`);

export function CampaignsPage({ selectedId }: { selectedId?: string }) {
  const { navigate, notify } = useApp();
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS);
  const [filter, setFilter] = useState<Filter>('all');

  const visible = campaigns.filter((c) => filter === 'all' || c.status === filter);
  const active = campaigns.filter((c) => c.status === 'Active');
  const sent = active.reduce((s, c) => s + c.sentLast7d, 0);

  const toggle = (campaign: Campaign) => {
    const next: CampaignStatus = campaign.status === 'Active' ? 'Paused' : 'Active';
    setCampaigns((list) => list.map((c) => (c.id === campaign.id ? { ...c, status: next } : c)));
    notify(`“${campaign.name}” set to ${next.toLowerCase()} — demo session only, nothing is scheduled.`, 'info');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Re-engagement plays mapped to segments and channels. Status changes here affect this demo session only."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          ['Active campaigns', String(active.length)],
          ['Messages sent (7d)', sent.toLocaleString('en-US')],
          ['Channels in use', String(new Set(active.map((c) => c.channel)).size)],
        ].map(([label, value]) => (
          <Card key={label} className="py-4">
            <div className="text-[13px] text-ink-muted">{label}</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-ink">{value}</div>
          </Card>
        ))}
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <SegmentedControl<Filter>
            ariaLabel="Filter by status"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: `All (${campaigns.length})` },
              { value: 'Active', label: 'Active' },
              { value: 'Paused', label: 'Paused' },
              { value: 'Draft', label: 'Draft' },
            ]}
          />
          <SampleDataTag label="Illustrative performance" />
        </div>
        {visible.length === 0 ? (
          <EmptyState title={`No ${filter.toLowerCase()} campaigns`} />
        ) : (
          <TableWrap>
            <THead>
              <tr>
                <Th>Campaign</Th>
                <Th>Segment</Th>
                <Th>Channel</Th>
                <Th className="text-right">Sent (7d)</Th>
                <Th className="text-right">Open rate</Th>
                <Th className="text-right">Re-engaged</Th>
                <Th>Status</Th>
                <Th className="text-right">Action</Th>
              </tr>
            </THead>
            <TBody>
              {visible.map((c) => (
                <tr key={c.id} className={cn('hover:bg-surface-muted', selectedId === c.id && 'bg-brand-50/60')}>
                  <Td>
                    <div className="font-medium text-ink">{c.name}</div>
                    <div className="text-[11px] text-ink-faint">
                      {c.trigger} · {c.owner}
                    </div>
                  </Td>
                  <Td>
                    <button className="whitespace-nowrap text-brand-700 hover:underline" onClick={() => navigate('segments', c.segmentId)}>
                      {getSegment(c.segmentId).shortName}
                    </button>
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      <ChannelIcon channel={c.channel} />
                      {c.channel}
                    </span>
                  </Td>
                  <Td className="text-right tabular-nums">{c.sentLast7d ? c.sentLast7d.toLocaleString('en-US') : '—'}</Td>
                  <Td className="text-right tabular-nums" title={c.openRate === null && c.channel !== 'Email' ? 'Open rate is not tracked for this channel' : undefined}>
                    {fmtPct(c.openRate)}
                  </Td>
                  <Td className="text-right font-medium tabular-nums text-ink">{fmtPct(c.reengagedRate)}</Td>
                  <Td>
                    <Badge tone={STATUS_TONE[c.status]}>{c.status}</Badge>
                  </Td>
                  <Td className="text-right">
                    {c.status === 'Draft' ? (
                      <span className="text-xs text-ink-faint">Not launched</span>
                    ) : (
                      <Button size="sm" variant="ghost" icon={c.status === 'Active' ? <Pause /> : <Play />} onClick={() => toggle(c)}>
                        {c.status === 'Active' ? 'Pause' : 'Resume'}
                      </Button>
                    )}
                  </Td>
                </tr>
              ))}
            </TBody>
          </TableWrap>
        )}
      </Card>
    </div>
  );
}
