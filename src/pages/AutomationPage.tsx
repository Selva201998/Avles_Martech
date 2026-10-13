import { useState } from 'react';
import { Play, AlertTriangle, ShieldCheck, Download, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { buttonClasses } from '../components/ui/buttonClasses';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { TableWrap, THead, Th, TBody, Td, EmptyState } from '../components/ui/Table';
import { WorkflowCanvas } from '../components/automation/WorkflowCanvas';
import { RunLog } from '../components/automation/RunLog';
import { ArchitectureDiagram } from '../components/automation/ArchitectureDiagram';
import { WORKFLOW_NODES, SIMULATOR_SCENARIOS } from '../data/mockData';
import { useAutomationEngine, type WorkflowRunResult } from '../services/automationEngine';
import { useApp } from '../app/appContext';
import { N8N_WORKFLOW_FILE } from '../config/assets';

type SubTab = 'canvas' | 'architecture' | 'error-queue' | 'idempotency';
const SUB_TABS: SubTab[] = ['canvas', 'architecture', 'error-queue', 'idempotency'];

const N8N_WEBHOOK_PATH = 'avles-user-activity';
const N8N_BASE = 'http://localhost:5678';

export function AutomationPage({ sub }: { sub?: string }) {
  const engine = useAutomationEngine();
  const { navigate, notify } = useApp();

  // #/automation/<tab> or #/automation/node-3 deep links
  const routeTab: SubTab = SUB_TABS.includes(sub as SubTab) ? (sub as SubTab) : 'canvas';
  const routeNode = sub?.startsWith('node-') ? sub : undefined;

  const [selectedNodeId, setSelectedNodeId] = useState<string>(routeNode ?? WORKFLOW_NODES[0].id);
  const [scenarioUserId, setScenarioUserId] = useState<string>(SIMULATOR_SCENARIOS[0].userId);
  const [runResult, setRunResult] = useState<WorkflowRunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [n8nStatus, setN8nStatus] = useState<{ tone: 'info' | 'success' | 'warning'; text: string } | null>(null);

  // Follow deep links to a step (e.g. from global search) without remounting the page.
  const [lastRouteNode, setLastRouteNode] = useState(routeNode);
  if (routeNode !== lastRouteNode) {
    setLastRouteNode(routeNode);
    if (routeNode) setSelectedNodeId(routeNode);
  }

  const errorQueue = engine.getErrorQueue();
  const openErrors = engine.getOpenErrorCount();
  const idempotencyLogs = engine.getIdempotencyLogs();
  const config = engine.getConfig();

  const setTab = (tab: SubTab) => navigate('automation', tab === 'canvas' ? undefined : tab);

  const execute = async (mode: 'normal' | 'error' | 'duplicate') => {
    setIsRunning(true);
    try {
      const result =
        mode === 'duplicate'
          ? await engine.runWorkflowForUser(scenarioUserId, 'evt_1001_seed')
          : await engine.runWorkflowForUser(scenarioUserId, undefined, mode === 'error');
      setRunResult(result);
      if (routeTab !== 'canvas') setTab('canvas');
    } finally {
      setIsRunning(false);
    }
  };

  const sendToLocalN8n = async () => {
    const user = engine.getUser(scenarioUserId);
    if (!user) return;
    setIsRunning(true);
    setN8nStatus({ tone: 'info', text: `Sending ${user.name}'s sample payload to ${N8N_BASE}…` });
    const payload = {
      user_id: user.id,
      name: user.name,
      email: user.email, // reserved example.com domain — never a real inbox
      country: user.country,
      subscription: user.subscription,
      last_active_days: user.lastActiveDays,
      core_actions_last_30_days: user.coreActionsLast30Days,
      goal: user.goal,
    };
    const post = (path: string) =>
      fetch(`${N8N_BASE}/${path}/${N8N_WEBHOOK_PATH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    try {
      let res = await post('webhook-test').catch(() => null);
      if (!res || !res.ok) res = await post('webhook');
      setN8nStatus(
        res.ok
          ? { tone: 'success', text: `n8n accepted the payload (HTTP ${res.status}). Check the execution in your n8n editor.` }
          : { tone: 'warning', text: `n8n responded with HTTP ${res.status}. Open the imported workflow and click “Test workflow” first.` },
      );
    } catch {
      setN8nStatus({
        tone: 'warning',
        text: `No n8n instance reachable at ${N8N_BASE}. This optional test only works when n8n runs on your machine.`,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Automation"
        description="Inspect the re-engagement workflow and run sample users through the same decision logic the production pipeline would use."
        actions={
          <a href={N8N_WORKFLOW_FILE} download={N8N_WORKFLOW_FILE.slice(1)} className={buttonClasses('secondary')}>
            <Download /> Export n8n JSON
          </a>
        }
      />

      {/* Run simulator */}
      <Card>
        <CardHeader
          title="Run simulator"
          description={`Runs entirely in your browser. Current rules: inactive ≥ ${config.inactivityThresholdDays} days · human review below ${config.reviewConfidenceThreshold.toFixed(2)} confidence.`}
          actions={<Badge tone="warning">Simulated — no messages sent</Badge>}
        />
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-muted">Sample scenario</span>
            <select
              value={scenarioUserId}
              onChange={(e) => setScenarioUserId(e.target.value)}
              className="h-9 w-full rounded-lg border border-line bg-surface px-2.5 text-[13px] text-ink focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {SIMULATOR_SCENARIOS.map((s) => (
                <option key={s.userId} value={s.userId}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" icon={isRunning ? <Loader2 className="animate-spin" /> : <Play />} disabled={isRunning} onClick={() => execute('normal')}>
              Run scenario
            </Button>
            <Button icon={<AlertTriangle />} disabled={isRunning} onClick={() => execute('error')} title="Force the dispatch step to receive HTTP 429">
              Simulate 429
            </Button>
            <Button icon={<ShieldCheck />} disabled={isRunning} onClick={() => execute('duplicate')} title="Replay an event_id that was already processed">
              Replay duplicate
            </Button>
            <Button variant="ghost" icon={<Send />} disabled={isRunning} onClick={sendToLocalN8n} title={`POST the sample payload to ${N8N_BASE}`}>
              Send to local n8n
            </Button>
          </div>
        </div>
        {n8nStatus && (
          <div
            role="status"
            className={`mt-3 flex items-start justify-between gap-3 rounded-lg border px-3 py-2 text-xs leading-5 ${
              n8nStatus.tone === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : n8nStatus.tone === 'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : 'border-line bg-surface-muted text-ink-secondary'
            }`}
          >
            <span>{n8nStatus.text}</span>
            <button className="font-medium text-ink-muted hover:text-ink" onClick={() => setN8nStatus(null)}>
              Dismiss
            </button>
          </div>
        )}
        {runResult && (
          <div className="mt-4">
            <RunLog result={runResult} />
          </div>
        )}
      </Card>

      <SegmentedControl<SubTab>
        ariaLabel="Automation views"
        size="md"
        value={routeTab}
        onChange={setTab}
        className="max-w-full overflow-x-auto"
        options={[
          { value: 'canvas', label: 'Workflow' },
          { value: 'architecture', label: 'Architecture' },
          { value: 'error-queue', label: `Error queue${openErrors ? ` (${openErrors})` : ''}` },
          { value: 'idempotency', label: 'Idempotency log' },
        ]}
      />

      {routeTab === 'canvas' && (
        <WorkflowCanvas nodes={WORKFLOW_NODES} selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} runResult={runResult} />
      )}

      {routeTab === 'architecture' && <ArchitectureDiagram />}

      {routeTab === 'error-queue' && (
        <Card padded={false}>
          <div className="p-5 pb-4">
            <CardHeader
              className="mb-0"
              title="Operations error queue"
              description="Events whose retries were exhausted (e.g. HTTP 429). Reprocessing here simulates a manual retry by the ops team."
            />
          </div>
          {errorQueue.length === 0 ? (
            <EmptyState title="Queue is empty" description="Use “Simulate 429” above to see how a throttled dispatch is isolated." />
          ) : (
            <TableWrap>
              <THead>
                <tr>
                  <Th>Error</Th>
                  <Th>User</Th>
                  <Th>Type</Th>
                  <Th>Retries</Th>
                  <Th>Status</Th>
                  <Th>Timestamp</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </THead>
              <TBody>
                {errorQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-muted">
                    <Td className="font-mono text-xs">{item.id}</Td>
                    <Td className="font-medium text-ink">{item.userId}</Td>
                    <Td>
                      <Badge tone="danger">{item.errorType}</Badge>
                    </Td>
                    <Td className="tabular-nums">
                      {item.retryCount}/{item.maxRetries} · backoff
                    </Td>
                    <Td>{item.status === 'Resolved' ? <Badge tone="success">Resolved</Badge> : <Badge tone="warning">{item.status}</Badge>}</Td>
                    <Td className="whitespace-nowrap font-mono text-xs">{item.timestamp}</Td>
                    <Td className="text-right">
                      {item.status !== 'Resolved' ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            engine.resolveErrorQueueItem(item.id);
                            notify(`Reprocessed ${item.id} for ${item.userId} (simulated).`, 'success');
                          }}
                        >
                          Reprocess
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Done
                        </span>
                      )}
                    </Td>
                  </tr>
                ))}
              </TBody>
            </TableWrap>
          )}
        </Card>
      )}

      {routeTab === 'idempotency' && (
        <Card>
          <CardHeader
            title="Idempotency log"
            description="Duplicate events are detected by event_id and dropped, so retries never send a second message."
          />
          {idempotencyLogs.length === 0 ? (
            <EmptyState title="No duplicates detected yet" />
          ) : (
            <ul className="space-y-2">
              {idempotencyLogs.map((log, i) => (
                <li key={`${log.eventId}-${i}`} className="flex flex-col gap-2 rounded-xl border border-line bg-surface-muted p-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-[13px]">
                      <span className="font-mono font-medium text-brand-700">{log.eventId}</span>
                      <span className="text-ink-muted">user {log.userId}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-ink-secondary">{log.status}</div>
                  </div>
                  <div className="font-mono text-[11px] leading-5 text-ink-muted sm:text-right">
                    <div>first: {log.firstReceived}</div>
                    <div>duplicate: {log.secondReceived}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
