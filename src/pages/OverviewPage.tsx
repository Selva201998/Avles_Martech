import { useState } from 'react';
import { Users, UserSearch, CircleCheck, Clock, Sparkles, Workflow, Play, Compass, Download, BarChart3, TrendingUp, Timer } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { ActionMenu } from '../components/ui/ActionMenu';
import { Card, CardHeader } from '../components/ui/Card';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { KpiCard } from '../components/dashboard/KpiCard';
import { LifecycleFunnel } from '../components/dashboard/LifecycleFunnel';
import { ExecutionsChart } from '../components/dashboard/ExecutionsChart';
import { SegmentConversionChart } from '../components/dashboard/SegmentConversionChart';
import { OperationalHoursChart } from '../components/dashboard/OperationalHoursChart';
import { PrincipleCard } from '../components/dashboard/PrincipleCard';
import { DATE_RANGES, FUNNEL_STAGES, KPIS, OPERATIONAL_HOURS, getExecutionsForRange, rangeLabel } from '../data/dashboardData';
import { SEGMENTS } from '../data/catalog';
import { useApp } from '../app/appContext';
import { automationEngine } from '../services/automationEngine';
import type { DateRangeKey } from '../types';
import { N8N_WORKFLOW_FILE } from '../config/assets';

const KPI_ICONS: Record<string, React.ReactNode> = {
  'kpi-users-processed': <Users />,
  'kpi-candidates': <UserSearch />,
  'kpi-success-rate': <CircleCheck />,
  'kpi-effort-saved': <Clock />,
  'kpi-ai-leverage': <Sparkles />,
};

export function OverviewPage() {
  const { navigate, notify, dateRange, setDateRange, openGuidedTour } = useApp();
  const [isRunning, setIsRunning] = useState(false);
  const executions = getExecutionsForRange(dateRange);
  const totals = executions.reduce((acc, d) => ({ evaluated: acc.evaluated + d.evaluated, triggered: acc.triggered + d.triggered }), {
    evaluated: 0,
    triggered: 0,
  });

  const runSampleEvent = async () => {
    setIsRunning(true);
    const result = await automationEngine.runWorkflowForUser('demo_1001');
    setIsRunning(false);
    notify(`Sample event processed for Lukas Weber — ${result.status.replaceAll('_', ' ').toLowerCase()}. See notifications for details.`, 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Re-engagement Control Center"
        description="Monitor user lifecycle, automate re-engagement, and optimize campaign performance with AI."
        actions={
          <>
            <Button variant="primary" icon={<Workflow />} onClick={() => navigate('automation')}>
              View Automation Workflow
            </Button>
            <ActionMenu
              label="Dashboard actions"
              items={[
                {
                  label: isRunning ? 'Running sample event…' : 'Run a sample event',
                  description: 'Simulate one activity event through the workflow',
                  icon: <Play />,
                  onSelect: runSampleEvent,
                  disabled: isRunning,
                },
                { label: 'Start guided tour', description: '8-step walkthrough of one user journey', icon: <Compass />, onSelect: openGuidedTour },
                {
                  label: 'Download n8n workflow',
                  description: 'Importable JSON of the 8-step pipeline',
                  icon: <Download />,
                  href: N8N_WORKFLOW_FILE,
                  download: N8N_WORKFLOW_FILE.slice(1),
                },
                { label: 'Open ROI model', description: 'Adjust assumptions behind effort saved', icon: <BarChart3 />, onSelect: () => navigate('analytics') },
              ]}
            />
          </>
        }
      />

      {/* KPI row */}
      <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {KPIS.map((kpi) => (
          <KpiCard
            key={kpi.id}
            kpi={kpi}
            icon={KPI_ICONS[kpi.id]}
            trend={executions.map((d) => d[kpi.sparklineKey])}
            trendLabel={`${kpi.label} trend, ${rangeLabel(dateRange).toLowerCase()}`}
          />
        ))}
      </section>

      {/* Funnel */}
      <Card id="section-funnel" aria-labelledby="funnel-title" className="scroll-mt-24">
        <CardHeader
          id="funnel-title"
          icon={<TrendingUp />}
          title="Re-engagement Lifecycle Funnel"
          description="Latest daily run · stage-to-stage conversion shown between steps"
          actions={
            <span className="text-xs text-ink-muted">
              Overall: <span className="font-semibold tabular-nums text-teal-700">{((FUNNEL_STAGES[FUNNEL_STAGES.length - 1].value / FUNNEL_STAGES[0].value) * 100).toFixed(1)}%</span> of synced users re-engaged
            </span>
          }
        />
        <LifecycleFunnel stages={FUNNEL_STAGES} />
      </Card>

      {/* Analytics row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card id="section-executions" aria-labelledby="executions-title" className="scroll-mt-24">
          <CardHeader
            id="executions-title"
            icon={<Timer />}
            title="Workflow Executions Over Time"
            description={`${totals.evaluated.toLocaleString('en-US')} users evaluated · ${totals.triggered.toLocaleString('en-US')} actions triggered · ${rangeLabel(dateRange).toLowerCase()}`}
            actions={
              <SegmentedControl<DateRangeKey>
                ariaLabel="Chart time range"
                value={dateRange}
                onChange={setDateRange}
                options={DATE_RANGES.map((r) => ({ value: r.key, label: r.key.toUpperCase() }))}
              />
            }
          />
          <ExecutionsChart data={executions} />
        </Card>

        <Card id="section-segments" aria-labelledby="segments-title" className="scroll-mt-24">
          <CardHeader
            id="segments-title"
            icon={<BarChart3 />}
            title="Re-engagement Conversion by User Segment"
            description="Share of targeted users active again within 48 hours · latest 7-day cohort"
            actions={
              <Button size="sm" variant="ghost" onClick={() => navigate('segments')}>
                Segment rules
              </Button>
            }
          />
          <SegmentConversionChart segments={SEGMENTS} />
        </Card>
      </div>

      {/* Operational hours + principle */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card id="section-hours" aria-labelledby="hours-title" className="scroll-mt-24 xl:col-span-2">
          <CardHeader
            id="hours-title"
            icon={<Clock />}
            title="Operational Hours: Before vs After Automation"
            description="Illustrative weekly hours spent by the marketing operations team per task"
          />
          <OperationalHoursChart data={OPERATIONAL_HOURS} />
        </Card>
        <PrincipleCard id="section-principle" />
      </div>
    </div>
  );
}
