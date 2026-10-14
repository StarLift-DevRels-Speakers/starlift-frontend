import { rolePath } from '@/app/navigation';
import { CalendarLegend } from '@/components/calendar/CalendarLegend/CalendarLegend';
import { MiniCalendar } from '@/components/calendar/MiniCalendar/MiniCalendar';
import { Card, LinkButton } from '@/components/ui';
import type { CalendarEntry } from '@/features/calendar/calendarEntries';
import type { Role } from '@/types/role';
import { parseDay } from '@/utils/date';

export interface CalendarCardProps {
  role: Role;
  /** All entries of the role; the card shows the current month. */
  entries: CalendarEntry[];
}

/** Current month with entry markers. */
export function CalendarCard({ role, entries }: CalendarCardProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthEntries = entries.filter((entry) => {
    const date = parseDay(entry.date);
    return date?.getFullYear() === year && date.getMonth() === month;
  });

  return (
    <Card
      as="section"
      title="Календарь"
      titleAs="h2"
      actions={<LinkButton to={rolePath(role, 'calendar')} variant="text" size="sm">Все события →</LinkButton>}
    >
      <MiniCalendar year={year} month={month} entries={monthEntries} />
      <CalendarLegend role={role} />
    </Card>
  );
}
