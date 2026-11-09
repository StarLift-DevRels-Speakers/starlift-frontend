import { useSearchParams } from 'react-router';
import { rolePath } from '@/app/navigation';
import { EventCard } from '@/components/events/EventCard/EventCard';
import { EventDetailsModal } from '@/components/events/EventDetailsModal/EventDetailsModal';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Button, EmptyState, FilterChips, Grid, Input, LinkButton, Stack } from '@/components/ui';
import { isCfpOpen, matchesEventQuery } from '@/features/events/events';
import { useUrlSearchQuery } from '@/hooks/useUrlSearchQuery';
import { useAppState } from '@/store/useAppStore';
import type { TechEvent } from '@/types/domain';
import { daysFromToday } from '@/utils/date';

const filters = [
  { value: 'all', label: 'Все' },
  { value: 'open', label: 'Приём заявок открыт' },
  { value: 'online', label: 'Онлайн' },
  { value: 'soon', label: 'Дедлайн в ближайшие 7 дней' },
] as const;

type EventFilter = typeof filters[number]['value'];

function matchesFilter(event: TechEvent, filter: EventFilter, weekEnd: string) {
  switch (filter) {
    case 'open': return isCfpOpen(event);
    case 'online': return event.format === 'Онлайн' || event.format === 'Гибрид';
    case 'soon': return Boolean(event.cfp && event.cfp <= weekEnd && isCfpOpen(event));
    case 'all': return true;
  }
}

/** Speaker's free catalog of published events with manual search and CFP applications. */
export function EventsCatalogPage() {
  const { events } = useAppState();
  const [params, setParams] = useSearchParams();
  const [query, changeQuery] = useUrlSearchQuery();
  const openEventId = params.get('event');
  const filter = filters.find(({ value }) => value === params.get('filter'))?.value ?? 'all';
  const weekEnd = daysFromToday(7);

  const published = events.filter((event) => event.state === 'published');
  const found = published.filter((event) => matchesEventQuery(event, query) && matchesFilter(event, filter, weekEnd));
  const openEvent = published.find((event) => event.id === openEventId);

  const setOpenEvent = (eventId: string | null) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (eventId) next.set('event', eventId);
      else next.delete('event');
      return next;
    }, { replace: true });
  };

  const changeFilter = (value: EventFilter) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (value === 'all') next.delete('filter');
      else next.set('filter', value);
      return next;
    }, { replace: true });
  };

  return (
    <>
      <PageHeader
        title="Мероприятия и CFP"
        description="Найдите мероприятие и проверьте, открыт ли приём заявок на выступление."
        actions={<LinkButton to={rolePath('speaker', 'ai/events')} variant="soft">Перейти к AI-подбору</LinkButton>}
      />

      <Stack>
        <Input
          type="search"
          label="Поиск по названию, тематике или городу"
          placeholder="Например, Java или Москва"
          value={query}
          onChange={(event) => changeQuery(event.target.value)}
        />
        <FilterChips label="Мероприятия" options={filters} value={filter} onChange={changeFilter} />
        <p role="status">Найдено: {found.length}</p>

        {found.length > 0 ? (
          <Grid columns={2} as="section" aria-label="Мероприятия">
            {found.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showPublicationState={false}
                actions={
                  <Button variant="secondary" size="sm" onClick={() => setOpenEvent(event.id)}>
                    Подробнее
                  </Button>
                }
              />
            ))}
          </Grid>
        ) : (
          <EmptyState
            title="По заданным условиям мероприятий нет"
            description={query || filter !== 'all' ? 'Попробуйте изменить запрос или фильтр.' : 'Опубликованные мероприятия появятся здесь.'}
            action={filter !== 'all'
              ? <Button variant="secondary" size="sm" onClick={() => changeFilter('all')}>Сбросить фильтр</Button>
              : query && <Button variant="secondary" size="sm" onClick={() => changeQuery('')}>Сбросить поиск</Button>}
          />
        )}

      </Stack>

      {openEvent && <EventDetailsModal event={openEvent} onClose={() => setOpenEvent(null)} />}
    </>
  );
}
