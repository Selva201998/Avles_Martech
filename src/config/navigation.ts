import {
  LayoutDashboard,
  Workflow,
  Users,
  Layers,
  Megaphone,
  Sparkles,
  BarChart3,
  Plug,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { ViewId } from '../types';

export interface NavItem {
  id: ViewId;
  label: string;
  icon: LucideIcon;
  /** Short description used by global search and page headers. */
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, description: 'Re-engagement control center and KPIs' },
  { id: 'automation', label: 'Automation', icon: Workflow, description: 'Workflow canvas, run simulator, error queue' },
  { id: 'users', label: 'Users', icon: Users, description: 'Sample user profiles and lifecycle history' },
  { id: 'segments', label: 'Segments', icon: Layers, description: 'Deterministic lifecycle segment definitions' },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone, description: 'Re-engagement plays per segment and channel' },
  { id: 'ai-recommendations', label: 'AI Recommendations', icon: Sparkles, description: 'AI decision audit trail and human review' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'ROI model and effort breakdown' },
  { id: 'integrations', label: 'Integrations', icon: Plug, description: 'Connectors used by the workflow (simulated)' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Automation thresholds and governance policies' },
];

export const DEFAULT_VIEW: ViewId = 'overview';

export const isViewId = (value: string): value is ViewId => NAV_ITEMS.some((item) => item.id === value);

export const getNavItem = (id: ViewId): NavItem => NAV_ITEMS.find((item) => item.id === id) ?? NAV_ITEMS[0];
