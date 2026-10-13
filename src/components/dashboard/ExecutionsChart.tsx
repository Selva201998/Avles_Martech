import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DailyExecution } from '../../data/dashboardData';
import { ChartTooltip } from '../charts/ChartTooltip';
import { AXIS_TICK, GRID_STROKE, SERIES } from '../charts/theme';

interface ExecutionsChartProps {
  data: DailyExecution[];
}

const LEGEND = [
  { key: 'evaluated', label: 'Users evaluated', color: SERIES.primary },
  { key: 'triggered', label: 'Re-engagement actions triggered', color: SERIES.secondary },
] as const;

export function ExecutionsChart({ data }: ExecutionsChartProps) {
  return (
    <div>
      <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-secondary" aria-label="Legend">
        {LEGEND.map((l) => (
          <li key={l.key} className="flex items-center gap-1.5">
            <span className="h-0.5 w-3.5 rounded-full" style={{ backgroundColor: l.color }} aria-hidden />
            {l.label}
          </li>
        ))}
      </ul>
      <div className="h-64" role="img" aria-label={`Area chart of users evaluated and actions triggered per day over ${data.length} days`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 18, left: 4 }}>
            <defs>
              <linearGradient id="fill-evaluated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES.primary} stopOpacity={0.16} />
                <stop offset="100%" stopColor={SERIES.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fill-triggered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={SERIES.secondary} stopOpacity={0.2} />
                <stop offset="100%" stopColor={SERIES.secondary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID_STROKE} vertical={false} />
            <XAxis
              dataKey="label"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={{ stroke: GRID_STROKE }}
              interval="preserveStartEnd"
              minTickGap={14}
              padding={{ left: 4, right: 12 }}
              tickMargin={8}
              label={{ value: 'Date', position: 'insideBottom', offset: -12, fill: '#9a9eb6', fontSize: 11 }}
            />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={52}
              domain={[0, 'auto']}
              tickFormatter={(v: number) => v.toLocaleString('en-US')}
              label={{ value: 'Users', angle: -90, position: 'insideLeft', offset: 8, fill: '#9a9eb6', fontSize: 11 }}
            />
            <Tooltip
              cursor={{ stroke: '#c7c7d6', strokeDasharray: '3 3' }}
              content={({ active, label, payload }) => (
                <ChartTooltip
                  active={active}
                  label={label}
                  payload={payload}
                  footer={(p) => {
                    const evaluated = Number(p.find((e) => e.dataKey === 'evaluated')?.value ?? 0);
                    const triggered = Number(p.find((e) => e.dataKey === 'triggered')?.value ?? 0);
                    return evaluated ? `${((triggered / evaluated) * 100).toFixed(1)}% of evaluated users actioned` : null;
                  }}
                />
              )}
            />
            <Area
              type="monotone"
              dataKey="evaluated"
              name="Users evaluated"
              stroke={SERIES.primary}
              strokeWidth={2}
              fill="url(#fill-evaluated)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="triggered"
              name="Actions triggered"
              stroke={SERIES.secondary}
              strokeWidth={2}
              fill="url(#fill-triggered)"
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
