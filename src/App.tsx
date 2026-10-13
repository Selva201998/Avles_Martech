import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Footer } from './components/layout/Footer';
import { ToastViewport, type ToastMessage } from './components/ui/Toast';
import { GuidedTourModal } from './components/GuidedTourModal';
import { AboutDemoModal } from './components/AboutDemoModal';
import { AppContext, type AppContextValue } from './app/appContext';
import { useHashRoute } from './hooks/useHashRoute';
import { getNavItem } from './config/navigation';
import { BRAND } from './config/brand';
import type { DateRangeKey } from './types';
import { OverviewPage } from './pages/OverviewPage';
import { AutomationPage } from './pages/AutomationPage';
import { UsersPage } from './pages/UsersPage';
import { SegmentsPage } from './pages/SegmentsPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { AIRecommendationsPage } from './pages/AIRecommendationsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [route, navigate] = useHashRoute();
  const [dateRange, setDateRange] = useState<DateRangeKey>('7d');
  const [navOpen, setNavOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [pendingFocus, setPendingFocus] = useState<string | null>(null);
  const toastId = useRef(0);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const notify = useCallback<AppContextValue['notify']>(
    (text, tone = 'info') => {
      const id = ++toastId.current;
      setToasts((t) => [...t.slice(-2), { id, text, tone }]);
      window.setTimeout(() => dismissToast(id), 4500);
    },
    [dismissToast],
  );

  const focusDashboardItem = useCallback(
    (elementId: string) => {
      navigate('overview');
      setPendingFocus(elementId);
    },
    [navigate],
  );

  // After navigating to the overview, scroll the requested section into view and flash it.
  useEffect(() => {
    if (!pendingFocus || route.view !== 'overview') return;
    const timer = window.setTimeout(() => {
      const el = document.getElementById(pendingFocus);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('search-flash');
        window.setTimeout(() => el.classList.remove('search-flash'), 1600);
      }
      setPendingFocus(null);
    }, 60);
    return () => window.clearTimeout(timer);
  }, [pendingFocus, route.view]);

  // Page title per view
  useEffect(() => {
    const label = getNavItem(route.view).label;
    document.title = route.view === 'overview' ? `${BRAND.productName} — Re-engagement Control Center` : `${label} · ${BRAND.productName}`;
  }, [route.view]);

  const contextValue = useMemo<AppContextValue>(
    () => ({
      navigate,
      notify,
      dateRange,
      setDateRange,
      openGuidedTour: () => setTourOpen(true),
      openAbout: () => setAboutOpen(true),
      focusDashboardItem,
    }),
    [navigate, notify, dateRange, focusDashboardItem],
  );

  const page = (() => {
    switch (route.view) {
      case 'automation':
        return <AutomationPage sub={route.sub} />;
      case 'users':
        return <UsersPage selectedId={route.sub} />;
      case 'segments':
        return <SegmentsPage selectedId={route.sub} />;
      case 'campaigns':
        return <CampaignsPage selectedId={route.sub} />;
      case 'ai-recommendations':
        return <AIRecommendationsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'integrations':
        return <IntegrationsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  })();

  return (
    <AppContext.Provider value={contextValue}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:shadow-popover">
        Skip to content
      </a>
      <div className="flex min-h-screen bg-canvas">
        <Sidebar activeView={route.view} onNavigate={(v) => navigate(v)} mobileOpen={navOpen} onCloseMobile={() => setNavOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onOpenNav={() => setNavOpen(true)} />
          <main id="main" className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div key={`${route.view}`} className="animate-fade-in">
              {page}
            </div>
          </main>
          <Footer />
        </div>
      </div>
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
      <GuidedTourModal open={tourOpen} onClose={() => setTourOpen(false)} />
      <AboutDemoModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </AppContext.Provider>
  );
}

export default App;
