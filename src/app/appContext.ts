import { createContext, useContext } from 'react';
import type { DateRangeKey } from '../types';
import type { Navigate } from '../hooks/useHashRoute';
import type { ToastMessage } from '../components/ui/Toast';

export interface AppContextValue {
  navigate: Navigate;
  notify: (text: string, tone?: ToastMessage['tone']) => void;
  dateRange: DateRangeKey;
  setDateRange: (range: DateRangeKey) => void;
  openGuidedTour: () => void;
  openAbout: () => void;
  /** Navigate to the overview and scroll to a dashboard section by element id. */
  focusDashboardItem: (elementId: string) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppContext.Provider>');
  return ctx;
}
