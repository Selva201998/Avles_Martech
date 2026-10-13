import { NAV_ITEMS } from '../config/navigation';
import type { UserProfile, ViewId } from '../types';
import { CAMPAIGNS, SEGMENTS } from './catalog';
import { KPIS } from './dashboardData';
import { WORKFLOW_NODES } from './mockData';

export type SearchTarget = { kind: 'route'; view: ViewId; sub?: string } | { kind: 'dashboard'; elementId: string };

export interface SearchItem {
  id: string;
  group: 'Pages' | 'Dashboard' | 'Users' | 'Segments' | 'Campaigns' | 'Workflow steps';
  title: string;
  subtitle: string;
  keywords: string;
  target: SearchTarget;
}

const DASHBOARD_SECTIONS: { elementId: string; title: string; subtitle: string }[] = [
  { elementId: 'section-funnel', title: 'Re-engagement Lifecycle Funnel', subtitle: 'Overview · funnel' },
  { elementId: 'section-executions', title: 'Workflow Executions Over Time', subtitle: 'Overview · chart' },
  { elementId: 'section-segments', title: 'Re-engagement Conversion by User Segment', subtitle: 'Overview · chart' },
  { elementId: 'section-hours', title: 'Operational Hours: Before vs After Automation', subtitle: 'Overview · chart' },
  { elementId: 'section-principle', title: 'Marketing Operations Principle', subtitle: 'Overview · principle' },
];

export function buildSearchIndex(users: UserProfile[]): SearchItem[] {
  return [
    ...NAV_ITEMS.map<SearchItem>((n) => ({
      id: `page-${n.id}`,
      group: 'Pages',
      title: n.label,
      subtitle: n.description,
      keywords: `${n.label} ${n.description}`,
      target: { kind: 'route', view: n.id },
    })),
    ...KPIS.map<SearchItem>((k) => ({
      id: `kpi-${k.id}`,
      group: 'Dashboard',
      title: k.label,
      subtitle: `KPI · ${k.value}`,
      keywords: `${k.label} ${k.context} kpi metric`,
      target: { kind: 'dashboard', elementId: k.id },
    })),
    ...DASHBOARD_SECTIONS.map<SearchItem>((s) => ({
      id: `dash-${s.elementId}`,
      group: 'Dashboard',
      title: s.title,
      subtitle: s.subtitle,
      keywords: `${s.title} ${s.subtitle}`,
      target: { kind: 'dashboard', elementId: s.elementId },
    })),
    ...users.map<SearchItem>((u) => ({
      id: `user-${u.id}`,
      group: 'Users',
      title: u.name,
      subtitle: `${u.id} · ${u.subscription} · ${u.status}`,
      keywords: `${u.name} ${u.id} ${u.email} ${u.country} ${u.segmentId}`,
      target: { kind: 'route', view: 'users', sub: u.id },
    })),
    ...SEGMENTS.map<SearchItem>((s) => ({
      id: `segment-${s.id}`,
      group: 'Segments',
      title: s.name,
      subtitle: s.rule,
      keywords: `${s.name} ${s.rule} ${s.description}`,
      target: { kind: 'route', view: 'segments', sub: s.id },
    })),
    ...CAMPAIGNS.map<SearchItem>((c) => ({
      id: `campaign-${c.id}`,
      group: 'Campaigns',
      title: c.name,
      subtitle: `${c.channel} · ${c.status}`,
      keywords: `${c.name} ${c.channel} ${c.status} ${c.owner}`,
      target: { kind: 'route', view: 'campaigns', sub: c.id },
    })),
    ...WORKFLOW_NODES.map<SearchItem>((n, i) => ({
      id: `node-${n.id}`,
      group: 'Workflow steps',
      title: `Step ${i + 1}: ${n.title}`,
      subtitle: n.typeDescription,
      keywords: `${n.title} ${n.typeDescription} ${n.technology} ${n.logic}`,
      target: { kind: 'route', view: 'automation', sub: n.id },
    })),
  ];
}

/** Token-AND match over title + keywords, ranked by title-prefix hits. */
export function searchItems(index: SearchItem[], query: string, limit = 8): SearchItem[] {
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  return index
    .map((item) => {
      const haystack = `${item.title} ${item.keywords}`.toLowerCase();
      if (!tokens.every((t) => haystack.includes(t))) return null;
      const title = item.title.toLowerCase();
      const score = (title.startsWith(tokens[0]) ? 0 : 1) + (title.includes(tokens[0]) ? 0 : 1);
      return { item, score };
    })
    .filter((x): x is { item: SearchItem; score: number } => x !== null)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.item);
}
