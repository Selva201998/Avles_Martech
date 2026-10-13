import { Smartphone, Workflow, Database, Sparkles, Send, BarChart3, UserCheck, ArrowRight, ArrowDown } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { cn } from '../../lib/cn';

const BLOCKS = [
  { icon: Smartphone, title: 'Product events', text: 'App / backend session sync' },
  { icon: Workflow, title: 'Orchestrator', text: 'Webhook, validation, rules', accent: true },
  { icon: Database, title: 'CRM / CDP', text: 'Profile & history lookup' },
  { icon: Sparkles, title: 'AI layer', text: 'Angle, channel, copy draft', ai: true },
  { icon: Send, title: 'Messaging', text: 'Email · push · in-app' },
  { icon: BarChart3, title: 'Warehouse / BI', text: 'Audit trail & ROI' },
];

export function ArchitectureDiagram() {
  return (
    <Card>
      <CardHeader
        title="Reference architecture"
        description="How events move from the product through orchestration, enrichment, AI, delivery and measurement. Vendor-neutral."
      />
      <ol className="grid grid-cols-1 items-stretch gap-2 md:grid-cols-[repeat(6,minmax(0,1fr))]">
        {BLOCKS.map(({ icon: Icon, title, text, accent, ai }, i) => (
          <li key={title} className="relative flex md:block">
            <div
              className={cn(
                'flex w-full flex-col items-center rounded-xl border p-4 text-center',
                accent ? 'border-brand-200 bg-brand-50/70' : ai ? 'border-violet-200 bg-violet-50/60' : 'border-line bg-surface-muted',
              )}
            >
              <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-surface ring-1 ring-inset ring-line', accent || ai ? 'text-brand-600' : 'text-ink-secondary')}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="mt-2 text-[13px] font-semibold text-ink">{title}</div>
              <div className="mt-0.5 text-xs text-ink-muted">{text}</div>
            </div>
            {i < BLOCKS.length - 1 && (
              <>
                <ArrowRight className="absolute -right-[13px] top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-surface text-ink-faint md:block" aria-hidden />
                <ArrowDown className="absolute -bottom-[13px] left-1/2 z-10 h-4 w-4 -translate-x-1/2 bg-canvas text-ink-faint md:hidden" aria-hidden />
              </>
            )}
          </li>
        ))}
      </ol>
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs leading-5 text-ink-secondary">
        <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <span>
          <span className="font-semibold text-ink">Human review branch:</span> when AI confidence is below the workspace threshold, the run pauses after the AI
          layer and waits for approval on the AI Recommendations page before any message is sent.
        </span>
      </div>
    </Card>
  );
}
