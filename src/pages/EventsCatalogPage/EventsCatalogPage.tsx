import { useSearchParams } from 'react-router';
import { rolePath } from '@/app/navigation';
import { EventCard } from '@/components/events/EventCard/EventCard';
import { EventDetailsModal } from '@/components/events/EventDetailsModal/EventDetailsModal';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Button, Card, EmptyState, Grid, Input, LinkButton, Stack } from '@/components/ui';
import { matchesEventQuery } from '@/features/events/events';
import { useUrlSearchQuery } from '@/hooks/useUrlSearchQuery';
import { useDemoState } from '@/store/useDemoStore';

/** Speaker's free catalog of published events with manual search and CFP applications. */
export function EventsCatalogPage() {
  const { events } = useDemoState();
  const [params, setParams] = useSearchParams();
  const [query, changeQuery] = useUrlSearchQuery();
  const openEventId = params.get('event');

  const published = events.filter((event) => event.state === 'published');
  const found = published.filter((event) => matchesEventQuery(event, query));
  const openEvent = published.find((event) => event.id === openEventId);

  const setOpenEvent = (eventId: string | null) => {
    setParams((current) => {
      const next = new URLSearchParams(current);
      if (eventId) next.set('event', eventId);
      else next.delete('event');
      return next;
    }, { replace: true });
  };

  return (
    <>
      <PageHeader
        title="Мероприятия и CFP"
        description="Бесплатный каталог и ручной поиск. AI-подбор — отдельная функция."
        actions={<LinkButton to={rolePath('speaker', 'ai')} variant="soft">Перейти к AI-подбору</LinkButton>}
      />

      <Stack>
        <Card>
          <Input
            type="search"
            label="Поиск по названию, тематике или городу"
            placeholder="Например, Java или Москва"
            value={query}
            onChange={(event) => changeQuery(event.target.value)}
          />
        </Card>

        {found.length > 0 ? (
          <Grid columns={2} as="section" aria-label="Мероприятия">
            {found.map((event) => (
              <EventCard
                key={event.id}
                event={event}
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
            description={query ? 'Попробуйте изменить запрос.' : 'Опубликованные мероприятия появятся здесь.'}
            action={query && <Button variant="secondary" size="sm" onClick={() => changeQuery('')}>Сбросить поиск</Button>}
          />
        )}

      </Stack>

      {openEvent && <EventDetailsModal event={openEvent} onClose={() => setOpenEvent(null)} />}
    </>
  );
}
