import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { OperationalHours } from '../../data/dashboardData';
import { ChartTooltip } from '../charts/ChartTooltip';
import { AXIS_TICK, GRID_STROKE, SERIES } from '../charts/theme';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const BEFORE_COLOR = SERIES.tertiary;
const AFTER_COLOR = SERIES.primary;

export function OperationalHoursChart({ data }: { data: OperationalHours[] }) {
  const compact = useMediaQuery('(max-width: 640px)');
  const totalBefore = data.reduce((s, d) => s + d.before, 0);
  const totalAfter = data.reduce((s, d) => s + d.after, 0);
  const reduction = ((totalBefore - totalAfter) / totalBefore) * 100;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-secondary" aria-label="Legend">
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: BEFORE_COLOR }} aria-hidden />
            Before automation (manual)
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: AFTER_COLOR }} aria-hidden />
            After automation
          </li>
        </ul>
        <div className="text-xs text-ink-muted">
          <span className="font-semibold tabular-nums text-ink">{totalBefore.toFixed(1)} h → {totalAfter.toFixed(1)} h</span> per week ·{' '}
          <span className="font-semibold text-teal-700">−{reduction.toFixed(0)}%</span>
        </div>
      </div>
      <div className="h-72" role="img" aria-label="Grouped bar chart of weekly hours per task before and after automation">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 18, right: 8, bottom: 4, left: 4 }} barGap={3} barCategoryGap="26%">
            <CartesianGrid stroke={GRID_STROKE} vertical={false} />
            <XAxis dataKey={compact ? 'short' : 'task'} tick={{ ...AXIS_TICK, fill: '#4a4e69' }} tickLine={false} axisLine={{ stroke: GRID_STROKE }} interval={0} tickMargin={8} />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={52}
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tickFormatter={(v: number) => `${v}h`}
              label={{ value: 'Hours / week', angle: -90, position: 'insideLeft', offset: 8, fill: '#9a9eb6', fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: '#f7f7fb' }}
              content={({ active, label, payload }) => (
                <ChartTooltip
                  active={active}
                  label={label}
                  payload={payload}
                  formatValue={(v) => `${v.toFixed(1)} h`}
                  footer={(p) => {
                    const before = Number(p.find((e) => e.dataKey === 'before')?.value ?? 0);
                    const after = Number(p.find((e) => e.dataKey === 'after')?.value ?? 0);
                    return before ? `${(before - after).toFixed(1)} h saved (−${(((before - after) / before) * 100).toFixed(0)}%)` : null;
                  }}
                />
              )}
            />
            <Bar dataKey="before" name="Before automation" fill={BEFORE_COLOR} radius={[4, 4, 0, 0]} maxBarSize={36}>
              <LabelList dataKey="before" position="top" formatter={(v: unknown) => `${Number(v).toFixed(1)}h`} style={{ fill: '#4a4e69', fontSize: 11.5 }} />
            </Bar>
            <Bar dataKey="after" name="After automation" fill={AFTER_COLOR} radius={[4, 4, 0, 0]} maxBarSize={36}>
              <LabelList dataKey="after" position="top" formatter={(v: unknown) => `${Number(v).toFixed(1)}h`} style={{ fill: '#11132a', fontSize: 11.5, fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
