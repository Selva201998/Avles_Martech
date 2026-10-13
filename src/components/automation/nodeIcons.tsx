import { Zap, CheckCircle2, Clock, Database, Filter, Sparkles, Send, BarChart3 } from 'lucide-react';
import type { WorkflowNode } from '../../types';

const ICONS = { Zap, CheckCircle2, Clock, Database, Filter, Sparkles, Send, BarChart3 } as const;

export function NodeIcon({ node, className = 'h-4 w-4' }: { node: WorkflowNode; className?: string }) {
  const Icon = ICONS[node.iconName];
  return <Icon className={className} />;
}
