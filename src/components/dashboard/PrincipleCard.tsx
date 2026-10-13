import { Compass, Cpu, Sparkles, UserCheck } from 'lucide-react';

const LAYERS = [
  { icon: Cpu, title: 'Deterministic rules', text: 'Structured decisions: thresholds, eligibility, routing.' },
  { icon: Sparkles, title: 'AI', text: 'Context interpretation, personalisation, recommendations.' },
  { icon: UserCheck, title: 'Human review', text: 'Uncertain or high-impact decisions.' },
];

export function PrincipleCard({ id }: { id: string }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="relative flex h-full scroll-mt-24 flex-col overflow-hidden rounded-card border border-brand-900 bg-brand-950 p-5 text-white shadow-card"
    >
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-white/10" />
      <div aria-hidden className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full border border-white/10" />
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-brand-200">
        <Compass className="h-3.5 w-3.5" />
        <span id={`${id}-title`}>Marketing Operations Principle</span>
      </div>
      <blockquote className="mt-3 text-lg font-semibold leading-snug tracking-tight">
        “The goal isn’t maximum automation. The goal is maximum useful leverage.”
      </blockquote>
      <p className="mt-3 text-[13px] leading-5 text-brand-100/85">
        Deterministic business rules handle structured decisions. AI adds value where contextual interpretation, personalization, or
        recommendations are needed. Human review remains available for uncertain or high-impact decisions.
      </p>
      <ul className="mt-auto grid gap-2 pt-5">
        {LAYERS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-2.5 rounded-lg bg-white/[0.06] px-3 py-2 ring-1 ring-inset ring-white/10">
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-300" />
            <span className="text-xs leading-4">
              <span className="font-semibold text-white">{title}</span>
              <span className="text-brand-100/75"> — {text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
