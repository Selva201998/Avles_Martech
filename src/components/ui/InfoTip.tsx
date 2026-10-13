import { useId, useState } from 'react';
import { Info } from 'lucide-react';

/** Hover/focus tooltip for metric definitions. Keyboard accessible. */
export function InfoTip({ text, label = 'More information' }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="rounded text-ink-faint transition-colors hover:text-ink-secondary"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <span
          role="tooltip"
          id={id}
          className="animate-fade-in absolute left-1/2 top-full z-30 mt-2 w-64 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-xs font-normal leading-5 text-white shadow-popover"
        >
          {text}
        </span>
      )}
    </span>
  );
}
