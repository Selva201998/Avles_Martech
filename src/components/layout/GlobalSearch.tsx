import { useEffect, useRef, useState } from 'react';
import { Search, CornerDownLeft } from 'lucide-react';
import { buildSearchIndex, searchItems, type SearchItem } from '../../data/searchIndex';
import { useAutomationEngine } from '../../services/automationEngine';
import { useApp } from '../../app/appContext';
import { useDismiss } from '../../hooks/useDismiss';
import { cn } from '../../lib/cn';

interface GlobalSearchProps {
  autoFocus?: boolean;
  onSelected?: () => void;
  className?: string;
}

export function GlobalSearch({ autoFocus, onSelected, className }: GlobalSearchProps) {
  const engine = useAutomationEngine();
  const { navigate, focusDashboardItem } = useApp();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ~40 entries: rebuilding per render is cheap and keeps user statuses current.
  const results = searchItems(buildSearchIndex(engine.getUsers()), query);

  useDismiss(rootRef, open, () => setOpen(false));

  // ⌘K / Ctrl+K focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const select = (item: SearchItem) => {
    if (item.target.kind === 'dashboard') focusDashboardItem(item.target.elementId);
    else navigate(item.target.view, item.target.sub);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
    onSelected?.();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showPanel = open && query.trim().length > 0;

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
      <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="global-search-results"
        aria-label="Search pages, users, segments, campaigns"
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search users, segments, campaigns…"
        className="h-9 w-full rounded-lg border border-line bg-surface-muted pl-9 pr-14 text-[13px] text-ink placeholder:text-ink-faint transition-colors focus:border-brand-300 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-surface px-1.5 font-sans text-[10.5px] text-ink-faint sm:block">
        Ctrl K
      </kbd>

      {showPanel && (
        <div
          id="global-search-results"
          role="listbox"
          className="animate-fade-in absolute left-0 right-0 top-full z-40 mt-1.5 max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-surface p-1.5 shadow-popover"
        >
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center text-[13px] text-ink-muted">
              No matches for “{query}”. Try a user name, segment or page.
            </div>
          ) : (
            results.map((item, i) => {
              const showGroup = i === 0 || results[i - 1].group !== item.group;
              return (
                <div key={item.id}>
                  {showGroup && <div className="px-2.5 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-ink-faint">{item.group}</div>}
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => select(item)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left',
                      i === activeIndex ? 'bg-brand-50' : 'hover:bg-slate-50',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-ink">{item.title}</div>
                      <div className="truncate text-xs text-ink-muted">{item.subtitle}</div>
                    </div>
                    {i === activeIndex && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-ink-faint" />}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
