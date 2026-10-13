import { Download, Workflow, Database, Send, Sparkles, Warehouse, Server, type LucideIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge, type BadgeTone } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { buttonClasses } from '../components/ui/buttonClasses';
import { INTEGRATIONS } from '../data/catalog';
import { useApp } from '../app/appContext';
import type { Integration, IntegrationMode } from '../types';
import { N8N_WORKFLOW_FILE } from '../config/assets';

const MODE: Record<IntegrationMode, { label: string; tone: BadgeTone }> = {
  simulated: { label: 'Simulated in demo', tone: 'neutral' },
  'local-optional': { label: 'Optional · local only', tone: 'info' },
  export: { label: 'Downloadable', tone: 'teal' },
};

const ICONS: Record<Integration['category'], LucideIcon> = {
  Orchestration: Workflow,
  'CRM / CDP': Database,
  Messaging: Send,
  'AI / LLM': Sparkles,
  'Data Warehouse': Warehouse,
};

export function IntegrationsPage() {
  const { navigate } = useApp();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        description="Connectors the workflow depends on. In this public demo none of them are connected to live systems — each card states what a production setup would need."
        sample={false}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {INTEGRATIONS.map((integration) => {
          const Icon = ICONS[integration.category];
          const mode = MODE[integration.mode];
          return (
            <Card as="article" key={integration.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-ink-secondary ring-1 ring-inset ring-line">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-[14px] font-semibold text-ink">{integration.name}</h2>
                    <div className="text-xs text-ink-muted">{integration.category}</div>
                  </div>
                </div>
                <Badge tone={mode.tone}>{mode.label}</Badge>
              </div>
              <p className="mt-3 text-[13px] leading-5 text-ink-secondary">{integration.description}</p>
              <dl className="mt-3 space-y-1.5 text-xs">
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-ink-faint">Used in</dt>
                  <dd className="text-ink-secondary">{integration.usedIn}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 text-ink-faint">Production</dt>
                  <dd className="text-ink-secondary">{integration.backendRequirement}</dd>
                </div>
              </dl>
              <div className="mt-auto pt-4">
                {integration.mode === 'export' && (
                  <a href={N8N_WORKFLOW_FILE} download={N8N_WORKFLOW_FILE.slice(1)} className={buttonClasses('secondary', 'sm')}>
                    <Download /> Download workflow JSON
                  </a>
                )}
                {integration.mode === 'local-optional' && (
                  <Button size="sm" onClick={() => navigate('automation')}>
                    Open run simulator
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="flex items-start gap-3 bg-surface-muted">
        <Server className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
        <div className="text-[13px] leading-5 text-ink-secondary">
          <span className="font-semibold text-ink">Running locally?</span> <code className="rounded bg-surface px-1 font-mono text-xs">npm run server</code> starts a mock
          API (CRM lookup, campaign send, audit log and an optional server-side LLM proxy) on port 3001. Credentials stay in a local{' '}
          <code className="rounded bg-surface px-1 font-mono text-xs">.env</code> read by the server — never in the browser bundle.
        </div>
      </Card>
    </div>
  );
}
