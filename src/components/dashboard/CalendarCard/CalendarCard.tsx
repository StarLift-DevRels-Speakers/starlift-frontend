import { useState } from 'react';
import { rolePath } from '@/app/navigation';
import { AgendaList } from '@/components/calendar/AgendaList/AgendaList';
import { Button, Card, EmptyState, LinkButton } from '@/components/ui';
import { upcomingEntries, type CalendarEntry } from '@/features/calendar/calendarEntries';
import type { Role } from '@/types/role';
import { daysFromToday, formatLongDate, parseDay } from '@/utils/date';
import styles from './CalendarCard.module.scss';

export interface CalendarCardProps {
  role: Role;
  entries: CalendarEntry[];
}

const shortDay = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
const weekday = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' });

export function CalendarCard({ role, entries }: CalendarCardProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const mondayOffset = (new Date().getDay() + 6) % 7;
  const days = Array.from({ length: 7 }, (_, index) => daysFromToday(index - mondayOffset));
  const shown = selectedDay ? entries.filter((entry) => entry.date === selectedDay) : upcomingEntries(entries, 4);

  return (
    <Card
      as="section"
      title="Повестка"
      titleAs="h2"
      actions={<LinkButton to={rolePath(role, 'calendar')} variant="text" size="sm">Календарь →</LinkButton>}
    >
      <div className={styles.week} role="group" aria-label="Дни текущей недели">
        {days.map((day) => {
          const date = parseDay(day)!;
          return (
            <button
              key={day}
              className={styles.day}
              type="button"
              aria-label={formatLongDate(day)}
              aria-pressed={day === selectedDay}
              onClick={() => setSelectedDay(day === selectedDay ? null : day)}
            >
              {weekday.format(date)}
              <strong>{shortDay.format(date)}</strong>
            </button>
          );
        })}
      </div>
      {shown.length ? <AgendaList role={role} entries={shown} /> : (
        <EmptyState title={selectedDay ? 'На этот день событий нет' : 'Ближайших событий пока нет'} />
      )}
      {selectedDay && <Button variant="text" size="sm" onClick={() => setSelectedDay(null)}>Все ближайшие события →</Button>}
    </Card>
  );
}
