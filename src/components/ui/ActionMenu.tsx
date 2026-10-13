import { useCallback, useRef, useState, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useDismiss } from '../../hooks/useDismiss';

export interface ActionMenuItem {
  label: string;
  description?: string;
  icon?: ReactNode;
  onSelect?: () => void;
  /** Render as a download link instead of a button. */
  href?: string;
  download?: string;
  disabled?: boolean;
}

export function ActionMenu({ items, label = 'More actions' }: { items: ActionMenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const itemClass =
    'flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';
  const content = (item: ActionMenuItem) => (
    <>
      {item.icon && <span className="mt-0.5 text-ink-faint [&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>}
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-ink">{item.label}</span>
        {item.description && <span className="block text-xs leading-4 text-ink-muted">{item.description}</span>}
      </span>
    </>
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-secondary shadow-card hover:border-line-strong hover:text-ink"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div role="menu" className="animate-fade-in absolute right-0 top-full z-40 mt-1.5 w-72 rounded-xl border border-line bg-surface p-1 shadow-popover">
          {items.map((item) =>
            item.href ? (
              <a key={item.label} role="menuitem" href={item.href} download={item.download} onClick={close} className={itemClass}>
                {content(item)}
              </a>
            ) : (
              <button
                key={item.label}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  item.onSelect?.();
                  close();
                }}
                className={itemClass}
              >
                {content(item)}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
