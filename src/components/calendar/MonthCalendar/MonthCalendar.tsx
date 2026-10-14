import { calendarKinds, type CalendarEntry } from '@/features/calendar/calendarEntries';
import { groupByDay, monthWeeks, WEEKDAYS } from '@/features/calendar/monthGrid';
import { cx } from '@/utils/cx';
import { toDayKey, todayKey } from '@/utils/date';
import { pluralize } from '@/utils/plural';
import styles from './MonthCalendar.module.scss';

const MAX_VISIBLE_ENTRIES = 2;

export interface MonthCalendarProps {
  year: number;
  /** 0-based month. */
  month: number;
  entries: CalendarEntry[];
  /** Selected day key, if any. */
  selectedDay?: string | null;
  onSelectDay: (day: string) => void;
  /** Accessible name of the grid, e.g. the visible month heading. */
  label: string;
}

function dayLabel(date: Date, count: number): string {
  const day = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  if (count === 0) return `${day}, событий нет`;
  return `${day}, ${count} ${pluralize(count, ['событие', 'события', 'событий'])}`;
}

/** Full month grid: up to two entries per day, the rest collapsed into "+N". */
export function MonthCalendar({ year, month, entries, selectedDay, onSelectDay, label }: MonthCalendarProps) {
  const today = todayKey();
  const entriesByDay = groupByDay(entries);

  return (
    <table className={styles.calendar} aria-label={label}>
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
              if (day === null) {
                return (
                  <td key={dayIndex}>
                    <div className={cx(styles.day, styles.blank)} />
                  </td>
                );
              }

              const date = new Date(year, month, day);
              const key = toDayKey(date);
              const dayEntries = entriesByDay.get(key) ?? [];
              const hidden = dayEntries.length - MAX_VISIBLE_ENTRIES;
              const isToday = key === today;

              return (
                <td key={dayIndex}>
                  <button
                    type="button"
                    className={cx(styles.day, isToday && styles.today)}
                    aria-pressed={key === selectedDay}
                    aria-current={isToday ? 'date' : undefined}
                    aria-label={dayLabel(date, dayEntries.length)}
                    onClick={() => onSelectDay(key)}
                  >
                    <span className={styles.number} aria-hidden="true">{day}</span>
                    {dayEntries.length > 0 && (
                      <span className={styles.entries} aria-hidden="true">
                        {dayEntries.slice(0, MAX_VISIBLE_ENTRIES).map((entry) => (
                          <span key={entry.id} className={cx(styles.entry, styles[entry.kind])} title={entry.title}>
                            {calendarKinds[entry.kind].icon} {entry.title}
                          </span>
                        ))}
                        {hidden > 0 && (
                          <span className={styles.more}>
                            +{hidden} {pluralize(hidden, ['событие', 'события', 'событий'])}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
