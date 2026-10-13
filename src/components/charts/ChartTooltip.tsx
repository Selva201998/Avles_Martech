/** Shared Recharts tooltip: neutral surface, series swatch + label + value in ink tokens. */

interface TooltipEntry {
  name?: string | number;
  value?: number | string | readonly (number | string)[];
  color?: string;
  dataKey?: unknown;
  /** The full data row for this point. */
  payload?: Record<string, unknown>;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: readonly TooltipEntry[];
  formatValue?: (value: number, entry: TooltipEntry) => string;
  labelFormatter?: (label: string | number | undefined) => string;
  footer?: (payload: readonly TooltipEntry[]) => string | null;
}

export function ChartTooltip({ active, label, payload, formatValue, labelFormatter, footer }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const footerText = footer?.(payload);
  return (
    <div className="min-w-40 rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-popover">
      <div className="mb-1.5 font-medium text-ink">{labelFormatter ? labelFormatter(label) : label}</div>
      <ul className="space-y-1">
        {payload.map((entry) => {
          const raw = Array.isArray(entry.value) ? entry.value[0] : entry.value;
          const numeric = typeof raw === 'number' ? raw : Number(raw);
          return (
            <li key={String(entry.dataKey ?? entry.name)} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-ink-secondary">
                <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: entry.color }} aria-hidden />
                {entry.name}
              </span>
              <span className="font-medium tabular-nums text-ink">{formatValue ? formatValue(numeric, entry) : numeric.toLocaleString('en-US')}</span>
            </li>
          );
        })}
      </ul>
      {footerText && <div className="mt-1.5 border-t border-line pt-1.5 text-ink-muted">{footerText}</div>}
    </div>
  );
}
