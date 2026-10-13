import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SegmentDefinition } from '../../types';
import { ChartTooltip } from '../charts/ChartTooltip';
import { AXIS_TICK, GRID_STROKE, SERIES } from '../charts/theme';
import { useMediaQuery } from '../../hooks/useMediaQuery';

/** Horizontal bars, zero-based 0–40% scale so bar length is proportional to conversion. */
export function SegmentConversionChart({ segments }: { segments: SegmentDefinition[] }) {
  const compact = useMediaQuery('(max-width: 640px)');
  const data = segments
    .filter((s) => s.conversionRate !== null)
    .map((s) => ({ name: compact ? s.shortName : s.name, conversion: s.conversionRate as number, audience: s.audienceSize }));

  return (
    <div className="h-64" role="img" aria-label="Horizontal bar chart of 48-hour re-engagement conversion rate by segment">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 44, bottom: 18, left: 0 }} barCategoryGap={10}>
          <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 40]}
            ticks={[0, 10, 20, 30, 40]}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: GRID_STROKE }}
            tickFormatter={(v: number) => `${v}%`}
            label={{ value: 'Re-engaged within 48h (%)', position: 'insideBottom', offset: -12, fill: '#9a9eb6', fontSize: 11 }}
          />
          <YAxis type="category" dataKey="name" width={compact ? 112 : 196} tick={{ ...AXIS_TICK, fill: '#4a4e69' }} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: '#f4f2ff' }}
            content={({ active, label, payload }) => (
              <ChartTooltip
                active={active}
                label={label}
                payload={payload}
                formatValue={(v) => `${v.toFixed(1)}%`}
                footer={(p) => {
                  const audience = p[0]?.payload?.audience;
                  return typeof audience === 'number' ? `Audience in latest run: ${audience}` : null;
                }}
              />
            )}
          />
          <Bar dataKey="conversion" name="Conversion rate" fill={SERIES.primary} radius={[0, 4, 4, 0]} maxBarSize={22}>
            <LabelList
              dataKey="conversion"
              position="right"
              formatter={(v: unknown) => `${Number(v).toFixed(1)}%`}
              style={{ fill: '#11132a', fontSize: 12, fontWeight: 500 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
