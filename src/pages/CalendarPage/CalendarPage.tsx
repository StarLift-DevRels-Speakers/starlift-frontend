import { rolePath } from '@/app/navigation';
import { AgendaList } from '@/components/calendar/AgendaList/AgendaList';
import { CalendarLegend } from '@/components/calendar/CalendarLegend/CalendarLegend';
import { MonthCalendar } from '@/components/calendar/MonthCalendar/MonthCalendar';
import { MonthSwitcher } from '@/components/calendar/MonthSwitcher/MonthSwitcher';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Badge, Button, Card, EmptyState, FilterChips, LinkButton, Stack, type FilterChipOption } from '@/components/ui';
import { calendarEntriesFor } from '@/features/calendar/calendarEntries';
import { useCalendarParams, type CalendarFilter } from '@/features/calendar/useCalendarParams';
import type { Role } from '@/types/role';
import { useDemoState } from '@/store/useDemoStore';
import { formatLongDate, formatMonth, parseDay } from '@/utils/date';
import { pluralize } from '@/utils/plural';
import styles from './CalendarPage.module.scss';

const descriptions: Record<Role, string> = {
  speaker: 'Выступления, сроки CFP и приглашения в одном месте.',
  devrel: 'Даты своих мероприятий, сроки CFP и ожидающие ответа приглашения.',
};

const filterOptions: Record<Role, FilterChipOption<CalendarFilter>[]> = {
  speaker: [
    { value: 'all', label: 'Все события' },
    { value: 'performance', label: 'Выступления' },
    { value: 'cfp', label: 'CFP' },
    { value: 'invite', label: 'Приглашения' },
  ],
  devrel: [
    { value: 'all', label: 'Все события' },
    { value: 'event', label: 'Мероприятия' },
    { value: 'cfp', label: 'CFP' },
    { value: 'invite', label: 'Приглашения' },
  ],
};

export interface CalendarPageProps {
  role: Role;
}

/** Month view of events, CFP deadlines, talks and invitations; the calendar has no records of its own. */
export function CalendarPage({ role }: CalendarPageProps) {
  const demo = useDemoState();
  const { year, month, filter, day, shiftMonth, goToToday, setFilter, selectDay } = useCalendarParams(role);
  const monthLabel = formatMonth(year, month);

  const monthEntries = calendarEntriesFor(role, demo).filter((entry) => {
    const date = parseDay(entry.date);
    return date?.getFullYear() === year && date.getMonth() === month && (filter === 'all' || entry.kind === filter);
  });
  const agenda = day ? monthEntries.filter((entry) => entry.date === day) : monthEntries;

  return (
    <>
      <PageHeader
        title="Календарь"
        description={descriptions[role]}
        actions={<LinkButton to={rolePath(role)} variant="secondary">К главной</LinkButton>}
      />

      <Stack>
        <Card as="section" aria-labelledby="calendar-month">
          <div className={styles.toolbar}>
            <div>
              <p className={styles.eyebrow}>Расписание StarLift</p>
              <h2 id="calendar-month" className={styles.month} aria-live="polite">{monthLabel}</h2>
            </div>
            <MonthSwitcher onPrevious={() => shiftMonth(-1)} onToday={goToToday} onNext={() => shiftMonth(1)} />
          </div>

          <FilterChips
            label="Показать:"
            options={filterOptions[role]}
            value={filter}
            onChange={setFilter}
            className={styles.filters}
          />

          <MonthCalendar
            year={year}
            month={month}
            entries={monthEntries}
            selectedDay={day}
            onSelectDay={selectDay}
            label={`Календарь на ${monthLabel}`}
          />
          <CalendarLegend role={role} />
        </Card>

        <Card
          as="section"
          title={day ? `События на ${formatLongDate(day)}` : `События за ${monthLabel.toLowerCase()}`}
          titleAs="h2"
          description="Даты берутся из мероприятий, CFP, выступлений и приглашений."
          actions={
            day ? (
              <Button variant="secondary" size="sm" onClick={() => selectDay(null)}>Сбросить день</Button>
            ) : (
              <Badge tone="muted">{agenda.length} {pluralize(agenda.length, ['событие', 'события', 'событий'])}</Badge>
            )
          }
        >
          {agenda.length > 0 ? (
            <AgendaList role={role} entries={agenda} actionLabel="Подробнее" />
          ) : day ? (
            <EmptyState
              title="На выбранную дату событий нет"
              action={<Button variant="soft" size="sm" onClick={() => selectDay(null)}>Показать месяц</Button>}
            />
          ) : (
            <EmptyState title="В этом месяце событий нет" description="Переключите месяц или измените фильтр." />
          )}
        </Card>

      </Stack>
    </>
  );
}
