import { useSearchParams } from 'react-router';
import type { Role } from '@/types/role';
import { parseDay, todayKey } from '@/utils/date';
import { calendarLegendKinds, type CalendarEntryKind } from './calendarEntries';

export type CalendarFilter = CalendarEntryKind | 'all';

export interface CalendarParams {
  year: number;
  /** 0-based month. */
  month: number;
  filter: CalendarFilter;
  /** Selected day key inside the shown month, or null. */
  day: string | null;
  shiftMonth: (delta: number) => void;
  goToToday: () => void;
  setFilter: (filter: CalendarFilter) => void;
  selectDay: (day: string | null) => void;
}

const MONTH_PATTERN = /^(\d{4})-(\d{2})$/;

/**
 * Calendar view state kept in the URL (`?month=2026-10&kind=cfp&day=2026-10-30`),
 * so a specific month or day can be linked to. Invalid values fall back to defaults.
 */
export function useCalendarParams(role: Role): CalendarParams {
  const [params, setParams] = useSearchParams();
  const now = new Date();

  const monthMatch = MONTH_PATTERN.exec(params.get('month') ?? '');
  const year = monthMatch ? Number(monthMatch[1]) : now.getFullYear();
  const month = monthMatch && Number(monthMatch[2]) >= 1 && Number(monthMatch[2]) <= 12 ? Number(monthMatch[2]) - 1 : now.getMonth();

  const kindParam = params.get('kind') as CalendarEntryKind | null;
  const filter: CalendarFilter = kindParam && calendarLegendKinds[role].includes(kindParam) ? kindParam : 'all';

  const dayDate = parseDay(params.get('day') ?? '');
  const day = dayDate && dayDate.getFullYear() === year && dayDate.getMonth() === month ? params.get('day') : null;

  const update = (next: { year?: number; month?: number; filter?: CalendarFilter; day?: string | null }) => {
    const target = new Date(next.year ?? year, next.month ?? month, 1);
    const nextFilter = next.filter ?? filter;
    const nextDay = next.day === undefined ? day : next.day;

    const search = new URLSearchParams();
    search.set('month', `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`);
    if (nextFilter !== 'all') search.set('kind', nextFilter);
    if (nextDay) search.set('day', nextDay);
    setParams(search, { replace: true });
  };

  return {
    year,
    month,
    filter,
    day,
    shiftMonth: (delta) => update({ month: month + delta, day: null }),
    goToToday: () => update({ year: now.getFullYear(), month: now.getMonth(), day: todayKey() }),
    setFilter: (nextFilter) => update({ filter: nextFilter, day: null }),
    selectDay: (nextDay) => update({ day: nextDay }),
  };
}
