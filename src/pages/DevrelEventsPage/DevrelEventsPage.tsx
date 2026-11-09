import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { PaywallModal } from '@/components/billing/PaywallModal/PaywallModal';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { EventCard } from '@/components/events/EventCard/EventCard';
import { EventFormModal } from '@/components/events/EventFormModal/EventFormModal';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Button, EmptyState, Grid, Input, Stack, useToast } from '@/components/ui';
import { hasRight, isSubscriptionActive } from '@/features/billing/access';
import { formatRub, rightPrices } from '@/features/billing/pricing';
import { matchesEventQuery } from '@/features/events/events';
import { useUrlSearchQuery } from '@/hooks/useUrlSearchQuery';
import { useAppActions, useAppState } from '@/store/useAppStore';

/** DevRel's own events: free drafts, paid publication (subscription or one-time purchase). */
export function DevrelEventsPage() {
  const { events, billing } = useAppState();
  const { publishEvent } = useAppActions();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [query, changeQuery] = useUrlSearchQuery();
  const [paywallEventId, setPaywallEventId] = useState<string | null>(null);

  const ownEvents = events.filter((event) => event.owner === 'devrel');
  const found = ownEvents.filter((event) => matchesEventQuery(event, query));
  const published = ownEvents.filter((event) => event.state === 'published').length;
  const devrelBilling = billing.devrel;
  const subscribed = isSubscriptionActive(devrelBilling);
  const canPublish = hasRight(devrelBilling, 'publication');

  // `?new=1` opens the draft form (used by "+ Создать мероприятие" on the dashboard), `?edit=<id>` an existing event.
  const editId = params.get('edit');
  const editedEvent = ownEvents.find((event) => event.id === editId);
  const formOpen = params.get('new') === '1' || Boolean(editedEvent);
  const setForm = (form: 'new' | 'edit' | null, value = '1') => setParams((current) => {
    const next = new URLSearchParams(current);
    next.delete('new');
    next.delete('edit');
    if (form) next.set(form, value);
    return next;
  }, { replace: true });

  const publish = async (eventId: string) => {
    const result = await publishEvent(eventId);
    if (result.ok) {
      toast('Мероприятие опубликовано');
    } else if (result.reason === 'paywall') {
      setPaywallEventId(eventId);
    } else {
      toast(result.error);
    }
  };

  return (
    <>
      <PageHeader
        title="Мои мероприятия"
        description={`Черновики бесплатны. Публикация — по подписке либо одной тестовой покупке за ${formatRub(rightPrices.publication)}.`}
        actions={<Button onClick={() => setForm('new')}>+ Создать черновик</Button>}
      />

      <Stack>
        <Grid columns={3} responsive={false}>
          <StatCard label="Мои мероприятия" value={ownEvents.length} />
          <StatCard label="Опубликовано" value={published} />
          <StatCard
            label="Разовых публикаций осталось"
            value={devrelBilling.rights.publication}
            hint={subscribed ? 'Подписка: публикация без ограничений' : undefined}
          />
        </Grid>

        <Input
          type="search"
          label="Поиск по своим мероприятиям"
          placeholder="Название, тема или город"
          value={query}
          onChange={(event) => changeQuery(event.target.value)}
        />

        {found.length > 0 ? (
          <Grid columns={2} as="section" aria-label="Мои мероприятия">
            {found.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                actions={
                  <>
                    <Button variant="secondary" size="sm" onClick={() => setForm('edit', event.id)}>Изменить</Button>
                    {event.state === 'draft' && (
                      <Button size="sm" onClick={() => publish(event.id)}>
                        {canPublish ? 'Опубликовать' : `Опубликовать · ${formatRub(rightPrices.publication)}`}
                      </Button>
                    )}
                  </>
                }
              />
            ))}
          </Grid>
        ) : query ? (
          <EmptyState title="Мероприятий по запросу нет" action={<Button variant="secondary" onClick={() => changeQuery('')}>Сбросить поиск</Button>} />
        ) : (
          <EmptyState
            title="Мероприятий пока нет"
            description="Создайте черновик бесплатно и опубликуйте, когда будете готовы принимать заявки."
            action={<Button onClick={() => setForm('new')}>+ Создать черновик</Button>}
          />
        )}

      </Stack>

      {formOpen && <EventFormModal event={editedEvent} onClose={() => setForm(null)} />}

      {paywallEventId && (
        <PaywallModal
          role="devrel"
          right="publication"
          onClose={() => setPaywallEventId(null)}
          onPurchased={async () => {
            setPaywallEventId(null);
            const result = await publishEvent(paywallEventId);
            toast(result.ok ? 'Тестовая покупка оформлена, мероприятие опубликовано' : result.error);
          }}
        />
      )}
    </>
  );
}
