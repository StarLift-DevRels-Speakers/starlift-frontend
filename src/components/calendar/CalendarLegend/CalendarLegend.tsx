import { EventDot } from '@/components/calendar/EventDot/EventDot';
import { calendarKinds, calendarLegendKinds } from '@/features/calendar/calendarEntries';
import type { Role } from '@/types/role';
import styles from './CalendarLegend.module.scss';

export function CalendarLegend({ role }: { role: Role }) {
  return (
    <ul className={styles.legend} aria-label="Обозначения">
      {calendarLegendKinds[role].map((kind) => (
        <li key={kind} className={styles.item}>
          <EventDot kind={kind} />
          {calendarKinds[kind].label}
        </li>
      ))}
    </ul>
  );
}
