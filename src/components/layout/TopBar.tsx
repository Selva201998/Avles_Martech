import { useCallback, useRef, useState } from 'react';
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  Info,
  Menu,
  Search,
  Settings,
  X,
  CircleAlert,
  CircleCheck,
  TriangleAlert,
  CircleDot,
} from 'lucide-react';
import { BRAND } from '../../config/brand';
import { DATE_RANGES } from '../../data/dashboardData';
import { useAutomationEngine, type ActivityEvent } from '../../services/automationEngine';
import { useApp } from '../../app/appContext';
import { useDismiss } from '../../hooks/useDismiss';
import { cn } from '../../lib/cn';
import { Logo } from './Logo';
import { GlobalSearch } from './GlobalSearch';

function DateRangeSelect() {
  const { dateRange, setDateRange } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);
  const current = DATE_RANGES.find((r) => r.key === dateRange) ?? DATE_RANGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Date range: ${current.label}`}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 whitespace-nowrap rounded-lg border border-line bg-surface px-2.5 text-[13px] font-medium text-ink-secondary shadow-card hover:border-line-strong hover:text-ink"
      >
        <CalendarDays className="h-4 w-4 text-ink-faint" />
        <span className="hidden sm:inline">{current.label}</span>
        <span className="sm:hidden">{current.key}</span>
        <ChevronDown className="h-3.5 w-3.5 text-ink-faint" />
      </button>
      {open && (
        <ul role="listbox" aria-label="Date range" className="animate-fade-in absolute right-0 top-full z-40 mt-1.5 w-48 rounded-xl border border-line bg-surface p-1 shadow-popover">
          {DATE_RANGES.map((range) => (
            <li key={range.key}>
              <button
                role="option"
                aria-selected={range.key === dateRange}
                onClick={() => {
                  setDateRange(range.key);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] text-ink-secondary hover:bg-slate-50 hover:text-ink"
              >
                {range.label}
                {range.key === dateRange && <Check className="h-4 w-4 text-brand-600" />}
              </button>
            </li>
          ))}
          <li className="mt-1 border-t border-line px-2.5 pb-1 pt-2 text-[11px] leading-4 text-ink-faint">Applies to trend charts and sparklines.</li>
        </ul>
      )}
    </div>
  );
}

const TONE_ICON: Record<ActivityEvent['tone'], React.ReactNode> = {
  success: <CircleCheck className="h-4 w-4 text-emerald-600" />,
  warning: <TriangleAlert className="h-4 w-4 text-amber-600" />,
  error: <CircleAlert className="h-4 w-4 text-rose-600" />,
  info: <CircleDot className="h-4 w-4 text-brand-500" />,
};

function NotificationsMenu() {
  const engine = useAutomationEngine();
  const { navigate } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);
  const unread = engine.getUnreadCount();
  const items = engine.getActivity().slice(0, 8);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-slate-100 hover:text-ink"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-orange px-1 text-[10px] font-semibold text-white ring-2 ring-surface">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div role="dialog" aria-label="Notifications" className="animate-fade-in absolute right-0 top-full z-40 mt-1.5 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface shadow-popover">
          <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
            <div>
              <div className="text-[13px] font-semibold text-ink">Workspace activity</div>
              <div className="text-[11px] text-ink-faint">Sample events from this demo session</div>
            </div>
            <button
              disabled={unread === 0}
              onClick={() => engine.markAllActivityRead()}
              className="rounded-md px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:text-ink-faint disabled:hover:bg-transparent"
            >
              Mark all read
            </button>
          </div>
          <ul className="max-h-96 overflow-y-auto p-1">
            {items.length === 0 && <li className="px-3 py-6 text-center text-[13px] text-ink-muted">No activity yet.</li>}
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    if (item.link) navigate(item.link.view, item.link.sub);
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50"
                >
                  <span className="mt-0.5">{TONE_ICON[item.tone]}</span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block truncate text-[13px] text-ink', !engine.isRead(item.id) && 'font-semibold')}>{item.title}</span>
                    <span className="block truncate text-xs text-ink-muted">{item.detail}</span>
                    <span className="block text-[11px] text-ink-faint">{item.timestamp}</span>
                  </span>
                  {!engine.isRead(item.id) && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-label="Unread" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AccountMenu() {
  const { navigate, openGuidedTour, openAbout } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(ref, open, close);

  const items = [
    { label: 'Guided tour', icon: <Compass className="h-4 w-4" />, onClick: openGuidedTour },
    { label: 'Workspace settings', icon: <Settings className="h-4 w-4" />, onClick: () => navigate('settings') },
    { label: 'About this demo', icon: <Info className="h-4 w-4" />, onClick: openAbout },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-lg pl-1 pr-1.5 hover:bg-slate-100"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-[11px] font-semibold text-white">GV</span>
        <ChevronDown className="hidden h-3.5 w-3.5 text-ink-faint sm:block" />
      </button>
      {open && (
        <div role="menu" className="animate-fade-in absolute right-0 top-full z-40 mt-1.5 w-60 rounded-xl border border-line bg-surface p-1 shadow-popover">
          <div className="border-b border-line px-2.5 pb-2.5 pt-1.5">
            <div className="text-[13px] font-semibold text-ink">{BRAND.viewerName}</div>
            <div className="text-xs text-ink-muted">{BRAND.viewerRole}</div>
          </div>
          {items.map((item) => (
            <button
              key={item.label}
              role="menuitem"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className="mt-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-ink-secondary hover:bg-slate-50 hover:text-ink"
            >
              <span className="text-ink-faint">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TopBar({ onOpenNav }: { onOpenNav: () => void }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="flex h-14 items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <button onClick={onOpenNav} className="-ml-1 rounded-md p-1.5 text-ink-muted hover:bg-slate-100 lg:hidden" aria-label="Open navigation">
          <Menu className="h-5 w-5" />
        </button>
        <div className="lg:hidden">
          <Logo compact />
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11.5px] font-medium text-brand-700 sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden />
          {BRAND.demoBadge}
        </span>

        <GlobalSearch className="ml-auto hidden w-full max-w-sm md:block" />

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5 md:ml-0">
          <button
            onClick={() => setMobileSearchOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-slate-100 md:hidden"
            aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
          >
            {mobileSearchOpen ? <X className="h-[18px] w-[18px]" /> : <Search className="h-[18px] w-[18px]" />}
          </button>
          <DateRangeSelect />
          <NotificationsMenu />
          <AccountMenu />
        </div>
      </div>
      {mobileSearchOpen && (
        <div className="border-t border-line px-4 py-2 md:hidden">
          <GlobalSearch autoFocus onSelected={() => setMobileSearchOpen(false)} />
        </div>
      )}
    </header>
  );
}
