// Calendar-day helpers. Day strings (`YYYY-MM-DD`) are parsed at local noon
// so time zones never shift them to a neighbouring day.

export function parseDay(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayKey(): string {
  return toDayKey(new Date());
}

/** Day key `days` from today; negative values go back. */
export function daysFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDayKey(date);
}

/** «12 октября 2026 г.» */
export function formatLongDate(value: string): string {
  const date = parseDay(value) ?? new Date(value);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** «окт.» */
export function formatShortMonth(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', { month: 'short' }).format(date);
}

/** «Октябрь 2026» */
export function formatMonth(year: number, month: number): string {
  const label = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' })
    .format(new Date(year, month, 15))
    .replace(/\s*г\.$/i, '');
  return label.charAt(0).toUpperCase() + label.slice(1);
}
