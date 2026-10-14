import { rolePath } from '@/app/navigation';
import { AgendaList } from '@/components/calendar/AgendaList/AgendaList';
import { Card, EmptyState, LinkButton } from '@/components/ui';
import type { CalendarEntry } from '@/features/calendar/calendarEntries';
import type { Role } from '@/types/role';

export interface UpcomingCardProps {
  role: Role;
  entries: CalendarEntry[];
}

/** Nearest calendar entries with links to their sections. */
export function UpcomingCard({ role, entries }: UpcomingCardProps) {
  return (
    <Card
      as="section"
      title="Ближайшие события"
      titleAs="h2"
      actions={<LinkButton to={rolePath(role, 'calendar')} variant="text" size="sm">Календарь →</LinkButton>}
    >
      {entries.length > 0 ? (
        <AgendaList role={role} entries={entries} />
      ) : (
        <EmptyState title="На ближайшее время событий пока нет" />
      )}
    </Card>
  );
}
