/** Date helpers so sample data stays relative to "today" and never looks stale. */

const pad = (n: number) => String(n).padStart(2, '0');

export const daysAgo = (days: number, base: Date = new Date()): Date => {
  const d = new Date(base);
  d.setDate(d.getDate() - days);
  return d;
};

/** YYYY-MM-DD */
export const isoDate = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** YYYY-MM-DD HH:mm:ss (local time) */
export const isoDateTime = (d: Date): string =>
  `${isoDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

/** Sample timestamp N days ago at a fixed clock time. */
export const sampleTimestamp = (days: number, hh: number, mm: number, ss = 0): string => {
  const d = daysAgo(days);
  d.setHours(hh, mm, ss, 0);
  return isoDateTime(d);
};

export const sampleDate = (days: number): string => isoDate(daysAgo(days));

export const shortDayLabel = (d: Date): string => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
