import { Badge, LinkButton } from '@/components/ui';
import { calendarKinds, type CalendarEntry } from '@/features/calendar/calendarEntries';
import { formatShortMonth, parseDay, todayKey } from '@/utils/date';
import styles from './AgendaEntry.module.scss';

export interface AgendaEntryProps {
  entry: CalendarEntry;
  /** Where "Открыть" leads: the section the entry belongs to. */
  to: string;
  actionLabel?: string;
}

/** One row of an agenda list: date tile, kind, title and a link to the source section. */
export function AgendaEntry({ entry, to, actionLabel = 'Открыть' }: AgendaEntryProps) {
  const date = parseDay(entry.date);

  return (
    <li className={styles.entry}>
      <time dateTime={entry.date} className={styles.date}>
        <strong>{date?.getDate()}</strong>
        <span>{date && formatShortMonth(date)}</span>
      </time>
      <div className={styles.copy}>
        <div className={styles.badges}>
          <Badge tone="muted">{calendarKinds[entry.kind].label}</Badge>
          {entry.date === todayKey() && <Badge>Сегодня</Badge>}
        </div>
        <strong className={styles.title}>{entry.title}</strong>
        <span className={styles.detail}>{entry.detail}</span>
      </div>
      <LinkButton to={to} variant="secondary" size="sm" className={styles.action} aria-label={`${actionLabel}: ${entry.title}`}>
        {actionLabel}
      </LinkButton>
    </li>
  );
}
