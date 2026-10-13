import { X } from 'lucide-react';
import { NAV_ITEMS } from '../../config/navigation';
import { BRAND } from '../../config/brand';
import type { ViewId } from '../../types';
import { cn } from '../../lib/cn';
import { useAutomationEngine } from '../../services/automationEngine';
import { Logo } from './Logo';

interface SidebarProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function NavList({ activeView, onNavigate }: Pick<SidebarProps, 'activeView' | 'onNavigate'>) {
  const engine = useAutomationEngine();
  const counters: Partial<Record<ViewId, number>> = {
    'ai-recommendations': engine.getPendingReviewCount(),
    automation: engine.getOpenErrorCount(),
  };

  return (
    <nav aria-label="Primary" className="flex flex-col gap-0.5">
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const active = id === activeView;
        const count = counters[id];
        return (
          <a
            key={id}
            href={`#/${id}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(id);
            }}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex h-9 items-center gap-3 rounded-lg px-2.5 text-[13px] font-medium transition-colors',
              active ? 'bg-brand-50 text-brand-700' : 'text-ink-secondary hover:bg-slate-100 hover:text-ink',
            )}
          >
            <Icon className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-brand-600' : 'text-ink-faint group-hover:text-ink-muted')} />
            <span className="flex-1 truncate">{label}</span>
            {!!count && (
              <span
                className={cn(
                  'min-w-5 rounded-full px-1.5 text-center text-[11px] font-semibold leading-5',
                  active ? 'bg-brand-600 text-white' : 'bg-slate-200/80 text-ink-secondary',
                )}
                title={id === 'automation' ? 'Open error queue items' : 'Pending human reviews'}
              >
                {count}
              </span>
            )}
          </a>
        );
      })}
    </nav>
  );
}

function WorkspaceCard() {
  return (
    <div className="rounded-xl border border-line bg-surface-muted p-3">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50 text-[11px] font-semibold text-teal-700 ring-1 ring-teal-200">
          DW
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-ink">{BRAND.workspaceName}</div>
          <div className="truncate text-[11px] text-ink-muted">{BRAND.workspaceDescriptor}</div>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ activeView, onNavigate, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Desktop: persistent */}
      <div className="hidden w-60 shrink-0 border-r border-line bg-surface lg:block">
      <aside className="sticky top-0 flex h-screen flex-col px-3 py-4">
        <div className="px-1.5 pb-5">
          <Logo />
        </div>
        <NavList activeView={activeView} onNavigate={onNavigate} />
        <div className="mt-auto pt-4">
          <WorkspaceCard />
        </div>
      </aside>
      </div>

      {/* Tablet & mobile: drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button className="absolute inset-0 bg-ink/30" aria-label="Close navigation" onClick={onCloseMobile} />
          <aside className="animate-fade-in absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-surface px-3 py-4 shadow-popover">
            <div className="flex items-center justify-between px-1.5 pb-5">
              <Logo />
              <button onClick={onCloseMobile} className="rounded-md p-1.5 text-ink-muted hover:bg-slate-100" aria-label="Close navigation">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavList
              activeView={activeView}
              onNavigate={(view) => {
                onNavigate(view);
                onCloseMobile();
              }}
            />
            <div className="mt-auto pt-4">
              <WorkspaceCard />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
