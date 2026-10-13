import { useState } from 'react';
import { RotateCcw, Save, CheckCircle2, Scale, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { TableWrap, THead, Th, TBody, Td } from '../components/ui/Table';
import { BUILD_VS_BUY_MATRIX, GOVERNANCE_STANDARDS } from '../data/mockData';
import { DEFAULT_CONFIG, useAutomationEngine } from '../services/automationEngine';
import { useApp } from '../app/appContext';
import { BRAND } from '../config/brand';

export function SettingsPage() {
  const engine = useAutomationEngine();
  const { notify } = useApp();
  const config = engine.getConfig();
  const [inactivity, setInactivity] = useState(config.inactivityThresholdDays);
  const [review, setReview] = useState(config.reviewConfidenceThreshold);

  const dirty = inactivity !== config.inactivityThresholdDays || review !== config.reviewConfidenceThreshold;
  const isDefault = inactivity === DEFAULT_CONFIG.inactivityThresholdDays && review === DEFAULT_CONFIG.reviewConfidenceThreshold;
  const affectedUsers = engine.getUsers().filter((u) => u.lastActiveDays >= inactivity).length;

  const save = () => {
    engine.updateConfig({ inactivityThresholdDays: inactivity, reviewConfidenceThreshold: review });
    notify('Automation rules updated for this demo session. New runs in the simulator use them.', 'success');
  };

  const reset = () => {
    setInactivity(DEFAULT_CONFIG.inactivityThresholdDays);
    setReview(DEFAULT_CONFIG.reviewConfidenceThreshold);
    engine.resetConfig();
    notify('Automation rules reset to defaults.', 'info');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Workspace rules used by the run simulator, and the governance standards every workflow follows." sample={false} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Automation rules"
            description="Applied by the in-browser simulator. Changes last for this session."
            actions={dirty ? <Badge tone="warning">Unsaved changes</Badge> : <Badge tone="success">Saved</Badge>}
          />
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="text-[13px] font-medium text-ink">Inactivity threshold</span>
              <span className="mt-0.5 block text-xs text-ink-muted">Deterministic rule: last_active_days ≥ value</span>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="range"
                  min={3}
                  max={30}
                  value={inactivity}
                  onChange={(e) => setInactivity(Number(e.target.value))}
                  className="flex-1 accent-brand-600"
                  aria-label="Inactivity threshold in days"
                />
                <span className="w-16 rounded-md border border-line bg-surface-muted py-1 text-center text-[13px] font-medium tabular-nums text-ink">{inactivity} d</span>
              </div>
              <span className="mt-2 block text-xs text-ink-muted">
                {affectedUsers} of {engine.getUsers().length} sample users would be eligible.
              </span>
            </label>
            <label className="block">
              <span className="text-[13px] font-medium text-ink">Human review threshold</span>
              <span className="mt-0.5 block text-xs text-ink-muted">AI recommendations below this confidence pause for review</span>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="range"
                  min={0.5}
                  max={0.95}
                  step={0.01}
                  value={review}
                  onChange={(e) => setReview(Number(e.target.value))}
                  className="flex-1 accent-brand-600"
                  aria-label="Human review confidence threshold"
                />
                <span className="w-16 rounded-md border border-line bg-surface-muted py-1 text-center text-[13px] font-medium tabular-nums text-ink">{review.toFixed(2)}</span>
              </div>
              <span className="mt-2 block text-xs text-ink-muted">Higher values send more decisions to people; lower values automate more.</span>
            </label>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-line pt-4">
            <Button icon={<RotateCcw />} onClick={reset} disabled={isDefault && !dirty}>
              Reset to defaults
            </Button>
            <Button variant="primary" icon={<Save />} onClick={save} disabled={!dirty}>
              Save rules
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Workspace" description="Demo identity" />
          <dl className="space-y-3 text-[13px]">
            {[
              ['Product', BRAND.productName],
              ['Workspace', BRAND.workspaceName],
              ['Viewer', `${BRAND.viewerName} (read-only)`],
              ['Data', 'Synthetic sample data'],
              ['AI mode', 'Sample recommender (no live inference)'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-ink-muted">{k}</dt>
                <dd className="text-right font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <Card>
        <CardHeader icon={<ShieldCheck />} title="Governance standards" description="Production standards applied to every workflow" />
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {GOVERNANCE_STANDARDS.map((s) => (
            <li key={s.category} className="rounded-xl border border-line bg-surface-muted p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-brand-700">{s.category}</span>
                <CheckCircle2 className="h-4 w-4 text-teal-600" />
              </div>
              <div className="mt-1.5 text-[13px] font-semibold text-ink">{s.principle}</div>
              <p className="mt-1 text-xs leading-5 text-ink-muted">{s.implementation}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card padded={false}>
        <div className="p-5 pb-4">
          <CardHeader
            className="mb-0"
            icon={<Scale />}
            title="Build vs buy decisions"
            description="Use existing platforms where they solve the problem reliably; build only where it adds meaningful value."
          />
        </div>
        <TableWrap>
          <THead>
            <tr>
              <Th>Requirement</Th>
              <Th>Existing option</Th>
              <Th>Custom option</Th>
              <Th>Decision</Th>
              <Th>Rationale</Th>
            </tr>
          </THead>
          <TBody>
            {BUILD_VS_BUY_MATRIX.map((row) => (
              <tr key={row.requirement}>
                <Td className="font-medium text-ink">{row.requirement}</Td>
                <Td>{row.existingTool}</Td>
                <Td>{row.customBuild}</Td>
                <Td>
                  <Badge tone="brand">{row.decision}</Badge>
                </Td>
                <Td className="min-w-[280px] text-xs leading-5">{row.rationale}</Td>
              </tr>
            ))}
          </TBody>
        </TableWrap>
      </Card>
    </div>
  );
}
