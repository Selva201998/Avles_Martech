import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_VIEW, isViewId } from '../config/navigation';
import type { ViewId } from '../types';

export interface Route {
  view: ViewId;
  /** Optional second path segment, e.g. #/automation/error-queue → "error-queue". */
  sub?: string;
}

/**
 * Minimal hash router (#/overview, #/automation/error-queue, ...).
 * Hash routing keeps deep links working on any static host without server rewrites,
 * and avoids adding a router dependency for nine flat views.
 */
const parseHash = (): Route => {
  const [rawView, sub] = window.location.hash.replace(/^#\/?/, '').split('/');
  return isViewId(rawView) ? { view: rawView, sub: sub || undefined } : { view: DEFAULT_VIEW };
};

export type Navigate = (view: ViewId, sub?: string) => void;

export function useHashRoute(): [Route, Navigate] {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback<Navigate>((view, sub) => {
    const target = `#/${view}${sub ? `/${sub}` : ''}`;
    if (window.location.hash === target) {
      window.scrollTo({ top: 0 });
      return;
    }
    window.location.hash = target.slice(1); // triggers hashchange → state update
  }, []);

  return [route, navigate];
}
