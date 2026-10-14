import { EventDot } from '@/components/calendar/EventDot/EventDot';
import { calendarKinds, type CalendarEntry, type CalendarEntryKind } from '@/features/calendar/calendarEntries';
import { monthWeeks, WEEKDAYS } from '@/features/calendar/monthGrid';
import { cx } from '@/utils/cx';
import { formatMonth, toDayKey, todayKey } from '@/utils/date';
import styles from './MiniCalendar.module.scss';

export interface MiniCalendarProps {
  year: number;
  /** 0-based month. */
  month: number;
  entries: CalendarEntry[];
}

/** Read-only month overview: a dot per entry kind on each day. */
export function MiniCalendar({ year, month, entries }: MiniCalendarProps) {
  const today = todayKey();
  const kindsByDay = new Map<string, CalendarEntryKind[]>();
  for (const entry of entries) {
    const kinds = kindsByDay.get(entry.date) ?? [];
    if (!kinds.includes(entry.kind)) kinds.push(entry.kind);
    kindsByDay.set(entry.date, kinds);
  }

  return (
    <table className={styles.calendar}>
      <caption className={styles.month}>{formatMonth(year, month)}</caption>
      <thead>
        <tr>
          {WEEKDAYS.map((weekday) => (
            <th key={weekday} scope="col" className={styles.weekday}>{weekday}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {monthWeeks(year, month).map((week, weekIndex) => (
          <tr key={weekIndex}>
            {week.map((day, dayIndex) => {
              if (day === null) return <td key={dayIndex} />;

              const key = toDayKey(new Date(year, month, day));
              const kinds = kindsByDay.get(key) ?? [];
              const isToday = key === today;

              return (
                <td key={dayIndex}>
                  <div className={cx(styles.day, isToday && styles.today)} aria-current={isToday ? 'date' : undefined}>
                    <span className={styles.number}>{day}</span>
                    {kinds.length > 0 && (
                      <>
                        <span className={styles.dots}>
                          {kinds.slice(0, 3).map((kind) => <EventDot key={kind} kind={kind} />)}
                        </span>
                        <span className={styles.srOnly}>
                          {`: ${kinds.map((kind) => calendarKinds[kind].label).join(', ')}`}
                        </span>
                      </>
                    )}
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
