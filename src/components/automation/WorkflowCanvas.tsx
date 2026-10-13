import { AlertTriangle, ChevronRight, Info } from 'lucide-react';
import type { WorkflowNode } from '../../types';
import type { WorkflowRunResult } from '../../services/automationEngine';
import { Badge } from '../ui/Badge';
import { Card, CardHeader } from '../ui/Card';
import { cn } from '../../lib/cn';
import { NodeIcon } from './nodeIcons';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  selectedNodeId: string;
  onSelectNode: (id: string) => void;
  runResult: WorkflowRunResult | null;
}

function nodeState(node: WorkflowNode, run: WorkflowRunResult | null) {
  if (!run) return 'idle' as const;
  if (run.stoppedAtNode === node.id) return run.status === 'ERROR_429_QUEUED' ? ('error' as const) : ('stopped' as const);
  if (run.nodesExecuted.includes(node.id)) return 'done' as const;
  return 'skipped' as const;
}

const STATE_STYLES = {
  idle: 'border-line bg-surface hover:border-line-strong',
  done: 'border-teal-200 bg-teal-50/40 hover:border-teal-300',
  stopped: 'border-amber-300 bg-amber-50/60',
  error: 'border-rose-300 bg-rose-50/60',
  skipped: 'border-dashed border-line bg-surface-muted opacity-60',
};

export function WorkflowCanvas({ nodes, selectedNodeId, onSelectNode, runResult }: WorkflowCanvasProps) {
  const selected = nodes.find((n) => n.id === selectedNodeId) ?? nodes[0];

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-5">
      <Card className="xl:col-span-3">
        <CardHeader
          title="Re-engagement workflow"
          description="Eight steps. Select a step to inspect its contract, logic and failure handling."
          actions={<Badge tone="neutral">{nodes.filter((n) => !n.isAi).length} deterministic · {nodes.filter((n) => n.isAi).length} AI</Badge>}
        />
        <ol className="space-y-0">
          {nodes.map((node, index) => {
            const state = nodeState(node, runResult);
            const isSelected = node.id === selected.id;
            return (
              <li key={node.id}>
                <button
                  type="button"
                  onClick={() => onSelectNode(node.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors',
                    STATE_STYLES[state],
                    isSelected && 'ring-2 ring-brand-300',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset',
                      node.isAi ? 'bg-brand-50 text-brand-600 ring-brand-100' : 'bg-surface text-ink-secondary ring-line',
                    )}
                  >
                    <NodeIcon node={node} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-[11px] font-medium text-ink-faint">Step {index + 1}</span>
                      <span className="text-[13.5px] font-semibold text-ink">{node.title}</span>
                      {node.isAi ? <Badge tone="brand">AI</Badge> : <Badge tone="neutral">Deterministic</Badge>}
                      {state === 'done' && <Badge tone="teal">Executed</Badge>}
                      {state === 'stopped' && <Badge tone="warning">Stopped here</Badge>}
                      {state === 'error' && <Badge tone="danger">Failed → queue</Badge>}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-muted">{node.purpose}</span>
                  </span>
                  <span className="hidden max-w-48 shrink-0 text-right text-[11px] leading-4 text-ink-faint 2xl:block">{node.technology}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
                </button>
                {index < nodes.length - 1 && <div className="ml-[34px] h-3 w-px bg-line-strong" aria-hidden />}
              </li>
            );
          })}
        </ol>
      </Card>

      <Card className="h-fit xl:sticky xl:top-20 xl:col-span-2" aria-live="polite">
        <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <NodeIcon node={selected} />
            </span>
            <div>
              <h3 className="text-[15px] font-semibold text-ink">{selected.title}</h3>
              <p className="text-xs text-ink-muted">{selected.typeDescription}</p>
            </div>
          </div>
          {selected.isAi ? <Badge tone="brand">AI layer</Badge> : <Badge>Deterministic</Badge>}
        </div>

        <dl className="mt-4 space-y-4 text-[13px]">
          <div>
            <dt className="text-xs font-medium text-ink-muted">Purpose</dt>
            <dd className="mt-1 leading-5 text-ink-secondary">{selected.purpose}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-ink-muted">Logic</dt>
            <dd className="mt-1 rounded-lg border border-line bg-surface-muted px-3 py-2 font-mono text-xs leading-5 text-ink">{selected.logic}</dd>
          </div>
          <div className="rounded-lg border border-brand-100 bg-brand-50/60 p-3">
            <dt className="flex items-center gap-1.5 text-xs font-semibold text-brand-800">
              <Info className="h-3.5 w-3.5" />
              Why {selected.isAi ? 'AI' : 'a deterministic step'} here?
            </dt>
            <dd className="mt-1 text-xs leading-5 text-ink-secondary">{selected.reasoning}</dd>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-ink-muted">Input example</dt>
              <dd>
                <pre className="mt-1 max-h-44 overflow-auto rounded-lg border border-line bg-surface-muted p-2.5 font-mono text-[11px] leading-4 text-ink">
                  {JSON.stringify(selected.inputExample, null, 2)}
                </pre>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-ink-muted">Output example</dt>
              <dd>
                <pre className="mt-1 max-h-44 overflow-auto rounded-lg border border-line bg-surface-muted p-2.5 font-mono text-[11px] leading-4 text-ink">
                  {JSON.stringify(selected.outputExample, null, 2)}
                </pre>
              </dd>
            </div>
          </div>
          <div>
            <dt className="text-xs font-medium text-ink-muted">Technology</dt>
            <dd className="mt-1 text-ink-secondary">{selected.technology}</dd>
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3">
            <dt className="flex items-center gap-1.5 text-xs font-semibold text-rose-800">
              <AlertTriangle className="h-3.5 w-3.5" />
              Failure handling
            </dt>
            <dd className="mt-1 text-xs leading-5 text-ink-secondary">{selected.failureHandling}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
