import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader } from '../components/ui/Card';
import { InfoTip } from '../components/ui/InfoTip';
import { ChartTooltip } from '../components/charts/ChartTooltip';
import { AXIS_TICK, GRID_STROKE, SERIES } from '../components/charts/theme';
import { FUNNEL_STAGES } from '../data/dashboardData';
import { EFFORT_PER_ACTION, ROI_ASSUMPTIONS } from '../data/roiModel';

const totalBefore = EFFORT_PER_ACTION.reduce((s, r) => s + r.manual, 0);
const totalAfter = EFFORT_PER_ACTION.reduce((s, r) => s + r.automated, 0);
const savedPerAction = totalBefore - totalAfter;
const triggered = FUNNEL_STAGES.find((s) => s.id === 'triggered')?.value ?? 0;
const reengaged = FUNNEL_STAGES.find((s) => s.id === 'reengaged')?.value ?? 0;

const fmtMoney = (v: number) => `€${Math.round(v).toLocaleString('en-US')}`;

export function AnalyticsPage() {
  const [dailyActions, setDailyActions] = useState<number>(triggered);
  const [hourlyCost, setHourlyCost] = useState<number>(ROI_ASSUMPTIONS.defaultHourlyCost);

  const dailyHours = (dailyActions * savedPerAction) / 60;
  const monthlyHours = dailyHours * ROI_ASSUMPTIONS.workingDaysPerMonth;
  const annualHours = dailyHours * ROI_ASSUMPTIONS.workingDaysPerYear;

  const tiles = [
    { label: 'Manual effort per action', value: `${totalBefore.toFixed(1)} min`, hint: 'Identify, look up, personalise, send and log one re-engagement by hand.' },
    { label: 'Effort with automation', value: `${totalAfter.toFixed(1)} min`, hint: 'Remaining human time: copy review and exception handling.' },
    { label: 'Effort reduction', value: `${((savedPerAction / totalBefore) * 100).toFixed(0)}%`, hint: `${savedPerAction.toFixed(1)} minutes saved per triggered action.` },
    { label: '48h re-engagement', value: `${((reengaged / triggered) * 100).toFixed(1)}%`, hint: `${reengaged} of ${triggered} actioned users returned within 48 hours in the latest run.` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="ROI model behind the “Manual Effort Saved” KPI. Every assumption is visible and adjustable." />

      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="py-4">
            <div className="flex items-center gap-1.5 text-[13px] text-ink-muted">
              {t.label}
              <InfoTip text={t.hint} label={`About ${t.label}`} />
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-ink">{t.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader icon={<Calculator />} title="ROI calculator" description="Project time and cost savings for your own volume." />
          <div className="space-y-5">
            <label className="block">
              <span className="flex justify-between text-[13px]">
                <span className="text-ink-secondary">Triggered actions per day</span>
                <span className="font-medium tabular-nums text-ink">{dailyActions}</span>
              </span>
              <input
                type="range"
                min={25}
                max={1000}
                step={5}
                value={dailyActions}
                onChange={(e) => setDailyActions(Number(e.target.value))}
                className="mt-2 w-full accent-brand-600"
              />
            </label>
            <label className="block">
              <span className="flex justify-between text-[13px]">
                <span className="text-ink-secondary">Blended hourly cost</span>
                <span className="font-medium tabular-nums text-ink">€{hourlyCost}/h</span>
              </span>
              <input
                type="range"
                min={25}
                max={120}
                step={5}
                value={hourlyCost}
                onChange={(e) => setHourlyCost(Number(e.target.value))}
                className="mt-2 w-full accent-brand-600"
              />
            </label>
            <dl className="divide-y divide-line rounded-xl border border-line bg-surface-muted text-[13px]">
              {[
                ['Hours saved per day', `${dailyHours.toFixed(1)} h`],
                ['Hours saved per month', `${Math.round(monthlyHours).toLocaleString('en-US')} h`],
                ['Cost saved per month', fmtMoney(monthlyHours * hourlyCost)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between px-3.5 py-2.5">
                  <dt className="text-ink-muted">{k}</dt>
                  <dd className="font-medium tabular-nums text-ink">{v}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between px-3.5 py-3">
                <dt className="font-medium text-ink">Projected annual savings</dt>
                <dd className="text-lg font-semibold tabular-nums text-teal-700">{fmtMoney(annualHours * hourlyCost)}</dd>
              </div>
            </dl>
            <p className="text-[11px] leading-4 text-ink-faint">
              Assumes {ROI_ASSUMPTIONS.workingDaysPerMonth} working days/month and {ROI_ASSUMPTIONS.workingDaysPerYear}/year. Excludes tooling and
              maintenance cost. Illustrative only.
            </p>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Effort per action by process stage" description="Minutes of team time per triggered re-engagement, manual vs automated" />
          <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-secondary" aria-label="Legend">
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: SERIES.tertiary }} aria-hidden /> Manual baseline
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: SERIES.primary }} aria-hidden /> Automated workflow
            </li>
          </ul>
          <div className="h-72" role="img" aria-label="Grouped bar chart of minutes per action by stage, manual versus automated">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={EFFORT_PER_ACTION} margin={{ top: 8, right: 8, bottom: 4, left: 4 }} barGap={3} barCategoryGap="24%">
                <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                <XAxis dataKey="stage" tick={{ ...AXIS_TICK, fill: '#4a4e69' }} tickLine={false} axisLine={{ stroke: GRID_STROKE }} interval={0} tickMargin={8} />
                <YAxis
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  domain={[0, 3]}
                  ticks={[0, 1, 2, 3]}
                  tickFormatter={(v: number) => `${v} min`}
                  label={{ value: 'Minutes / action', angle: -90, position: 'insideLeft', offset: 8, fill: '#9a9eb6', fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: '#f7f7fb' }}
                  content={({ active, label, payload }) => <ChartTooltip active={active} label={label} payload={payload} formatValue={(v) => `${v.toFixed(2)} min`} />}
                />
                <Bar dataKey="manual" name="Manual baseline" fill={SERIES.tertiary} radius={[4, 4, 0, 0]} maxBarSize={34} />
                <Bar dataKey="automated" name="Automated workflow" fill={SERIES.primary} radius={[4, 4, 0, 0]} maxBarSize={34} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 rounded-xl border border-line bg-surface-muted p-3.5 text-xs leading-5 text-ink-secondary">
            <span className="font-semibold text-ink">Reading this:</span> automation removes most mechanical work (lookup, segmentation, dispatch). Copy review
            remains the largest human task by design — that is where judgement adds value.
          </p>
        </Card>
      </div>
    </div>
  );
}
