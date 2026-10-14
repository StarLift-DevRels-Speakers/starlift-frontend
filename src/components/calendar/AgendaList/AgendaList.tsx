import { AgendaEntry } from '@/components/calendar/AgendaEntry/AgendaEntry';
import { entryLink, type CalendarEntry } from '@/features/calendar/calendarEntries';
import type { Role } from '@/types/role';
import styles from './AgendaList.module.scss';

export interface AgendaListProps {
  role: Role;
  entries: CalendarEntry[];
  actionLabel?: string;
}

/** Calendar entries as rows linking to the sections they come from. */
export function AgendaList({ role, entries, actionLabel }: AgendaListProps) {
  return (
    <ul className={styles.list}>
      {entries.map((entry) => (
        <AgendaEntry key={entry.id} entry={entry} to={entryLink(role, entry)} actionLabel={actionLabel} />
      ))}
    </ul>
  );
}
