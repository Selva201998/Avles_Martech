import { Database, ShieldCheck, Sparkles, Server } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { BRAND } from '../config/brand';

const POINTS = [
  {
    icon: <Database className="h-4 w-4 text-brand-600" />,
    title: 'Sample data only',
    text: 'Users, events, KPIs and charts are synthetic and generated in the browser. No customer data is used or stored.',
  },
  {
    icon: <Sparkles className="h-4 w-4 text-brand-600" />,
    title: 'No live AI inference',
    text: 'Recommendations come from a deterministic sample recommender that mirrors the prompt contract. Confidence values are illustrative.',
  },
  {
    icon: <Server className="h-4 w-4 text-brand-600" />,
    title: 'Simulated integrations',
    text: 'CRM lookups, message dispatch and warehouse writes are simulated. Nothing is sent to real recipients.',
  },
  {
    icon: <ShieldCheck className="h-4 w-4 text-brand-600" />,
    title: 'What is real',
    text: 'The workflow logic (idempotency, rules, confidence gating, retries), the run simulator, human-review actions and the importable n8n workflow.',
  },
];

export function AboutDemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`About ${BRAND.productName}`}
      description={BRAND.tagline}
      footer={
        <>
          <span className="text-xs text-ink-muted">{BRAND.sampleDataNotice}</span>
          <Button variant="primary" size="sm" onClick={onClose}>
            Got it
          </Button>
        </>
      }
    >
      <p className="text-[13px] leading-5 text-ink-secondary">{BRAND.disclaimer}</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {POINTS.map((p) => (
          <li key={p.title} className="rounded-xl border border-line bg-surface-muted p-3.5">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
              {p.icon}
              {p.title}
            </div>
            <p className="mt-1 text-xs leading-5 text-ink-muted">{p.text}</p>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
