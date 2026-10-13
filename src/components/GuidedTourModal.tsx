import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, CheckCircle2, Zap, Clock, Filter, Send, BarChart3, ShieldCheck, Lightbulb } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Badge, SampleDataTag } from './ui/Badge';
import { useApp } from '../app/appContext';
import { cn } from '../lib/cn';

const STEPS = [
  {
    title: 'User activity event',
    badge: 'Event trigger',
    icon: <Zap />,
    detail: 'Sample user Lukas (demo_1001) completed 18 core actions in 30 days but has not opened the app for 8 days. The daily sync emits an activity event.',
    why: 'Event-driven entry avoids constant database polling and gives every run a unique event_id.',
  },
  {
    title: 'Schema validation',
    badge: 'Deterministic check',
    icon: <CheckCircle2 />,
    detail: 'The payload is checked: user_id present, country is a valid code, last_active_days is numeric.',
    why: 'Boundary validation keeps malformed data out of every downstream step.',
  },
  {
    title: 'Inactivity rule',
    badge: 'Business rule',
    icon: <Clock />,
    detail: 'last_active_days (8) ≥ 7 → eligible. The threshold is configurable in Settings.',
    why: 'A numeric comparison is exact, free and instant — no model is needed.',
  },
  {
    title: 'Profile & segment',
    badge: 'CRM + segment router',
    icon: <Filter />,
    detail: 'CRM enrichment adds history and channel preference. The router assigns “Highly Engaged / Inactive”.',
    why: 'Segments are business definitions that marketers can read and audit.',
  },
  {
    title: 'AI recommendation',
    badge: 'AI layer',
    icon: <Sparkles />,
    detail: 'The recommender returns “Progress Continuity & Streak Reminder” via Email with confidence 0.94 and a short rationale.',
    why: 'Interpreting mixed behavioural context into a message angle is where a model adds leverage.',
  },
  {
    title: 'Confidence gate',
    badge: 'Human-in-the-loop',
    icon: <ShieldCheck />,
    detail: '0.94 ≥ 0.75 → auto-approved. Below the threshold the action pauses for human review (try Elena on the Automation page).',
    why: 'Uncertain or high-impact decisions stay with people.',
  },
  {
    title: 'Dispatch',
    badge: 'Messaging API',
    icon: <Send />,
    detail: 'The email is dispatched with personalised variables. On HTTP 429 the step retries with backoff, then moves to the error queue.',
    why: 'Delivery is deterministic, idempotent and observable.',
  },
  {
    title: 'Outcome tracking',
    badge: 'Audit & ROI',
    icon: <BarChart3 />,
    detail: 'The run, AI decision and channel outcome are logged. Re-engagement within 48 hours feeds the funnel and ROI model.',
    why: 'Closing the loop makes campaign impact and AI quality measurable.',
  },
];

export function GuidedTourModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { navigate } = useApp();
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const close = () => {
    onClose();
    setStep(0);
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Guided tour: one re-engagement journey"
      description={`Step ${step + 1} of ${STEPS.length}`}
      footer={
        <>
          <Button size="sm" icon={<ChevronLeft />} onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Back
          </Button>
          <div className="hidden items-center gap-1.5 sm:flex" role="tablist" aria-label="Tour steps">
            {STEPS.map((s, i) => (
              <button
                key={s.title}
                role="tab"
                aria-selected={i === step}
                aria-label={`Step ${i + 1}: ${s.title}`}
                onClick={() => setStep(i)}
                className={cn('h-1.5 rounded-full transition-all', i === step ? 'w-5 bg-brand-600' : 'w-1.5 bg-line-strong hover:bg-ink-faint')}
              />
            ))}
          </div>
          {isLast ? (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                close();
                navigate('automation');
              }}
            >
              Try the run simulator
            </Button>
          ) : (
            <Button size="sm" variant="primary" onClick={() => setStep((s) => s + 1)}>
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100 [&>svg]:h-5 [&>svg]:w-5">
          {current.icon}
        </span>
        <div>
          <Badge tone="brand">{current.badge}</Badge>
          <h3 className="mt-1 text-base font-semibold text-ink">{current.title}</h3>
        </div>
      </div>
      <p className="mt-4 text-[13.5px] leading-6 text-ink-secondary">{current.detail}</p>
      <div className="mt-4 rounded-xl border border-line bg-surface-muted p-3.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
          <Lightbulb className="h-3.5 w-3.5 text-accent-orange" />
          Why this step
        </div>
        <p className="mt-1 text-[13px] leading-5 text-ink-muted">{current.why}</p>
      </div>
      <SampleDataTag className="mt-4" label="Sample scenario" />
    </Modal>
  );
}
