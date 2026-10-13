import { Terminal } from 'lucide-react';
import type { WorkflowRunResult, RunStatus } from '../../services/automationEngine';
import { Badge, type BadgeTone } from '../ui/Badge';
import { cn } from '../../lib/cn';

const STATUS: Record<RunStatus, { label: string; tone: BadgeTone }> = {
  SUCCESS: { label: 'Dispatched (simulated)', tone: 'success' },
  STOPPED_DETERMINISTIC_RULE: { label: 'Stopped by rule', tone: 'neutral' },
  FLAGGED_HUMAN_REVIEW: { label: 'Human review', tone: 'warning' },
  ERROR_429_QUEUED: { label: 'HTTP 429 → queue', tone: 'danger' },
  DUPLICATE_IGNORED: { label: 'Duplicate ignored', tone: 'info' },
};

const lineClass = (line: string) =>
  line.includes('ERROR') || line.includes('FAILOVER')
    ? 'text-rose-300'
    : line.includes('GOVERNANCE') || line.includes('IDEMPOTENCY') || line.includes('RULE STOP')
      ? 'text-amber-200'
      : line.includes('AI Output')
        ? 'text-violet-200'
        : 'text-slate-300';

export function RunLog({ result }: { result: WorkflowRunResult }) {
  const status = STATUS[result.status];
  return (
    <section aria-label="Run log" className="rounded-card border border-slate-800 bg-[#12142a] p-4 shadow-card">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[13px] font-medium text-white">
          <Terminal className="h-4 w-4 text-brand-300" />
          Run log <span className="font-mono text-xs text-slate-400">{result.runId}</span>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>
      <ol className="max-h-60 space-y-1 overflow-y-auto rounded-lg bg-black/25 p-3 font-mono text-[11.5px] leading-5">
        {result.logs.map((line, i) => (
          <li key={i} className={cn('break-words', lineClass(line))}>
            {line}
          </li>
        ))}
      </ol>
    </section>
  );
}
