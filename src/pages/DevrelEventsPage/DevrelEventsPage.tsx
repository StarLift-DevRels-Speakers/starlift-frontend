import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { PaywallModal } from '@/components/billing/PaywallModal/PaywallModal';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { EventCard } from '@/components/events/EventCard/EventCard';
import { EventFormModal } from '@/components/events/EventFormModal/EventFormModal';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Button, EmptyState, Grid, Stack, useToast } from '@/components/ui';
import { hasRight, isSubscriptionActive } from '@/features/billing/access';
import { formatRub, rightPrices } from '@/features/billing/pricing';
import { useDemoActions, useDemoState } from '@/store/useDemoStore';

/** DevRel's own events: free drafts, paid publication (subscription or one-time purchase). */
export function DevrelEventsPage() {
  const { events, billing } = useDemoState();
  const { publishEvent } = useDemoActions();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [paywallEventId, setPaywallEventId] = useState<string | null>(null);

  const ownEvents = events.filter((event) => event.owner === 'devrel');
  const published = ownEvents.filter((event) => event.state === 'published').length;
  const devrelBilling = billing.devrel;
  const subscribed = isSubscriptionActive(devrelBilling);
  const canPublish = hasRight(devrelBilling, 'publication');

  // `?new=1` opens the draft form (used by "+ Создать мероприятие" on the dashboard), `?edit=<id>` an existing event.
  const editId = params.get('edit');
  const editedEvent = ownEvents.find((event) => event.id === editId);
  const formOpen = params.get('new') === '1' || Boolean(editedEvent);
  const openForm = (eventId?: string) => setParams(eventId ? { edit: eventId } : { new: '1' }, { replace: true });
  const closeForm = () => setParams({}, { replace: true });

  const publish = (eventId: string) => {
    const result = publishEvent(eventId);
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
        actions={<Button onClick={() => openForm()}>+ Создать черновик</Button>}
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

        {ownEvents.length > 0 ? (
          <Grid columns={2} as="section" aria-label="Мои мероприятия">
            {ownEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                actions={
                  <>
                    <Button variant="secondary" size="sm" onClick={() => openForm(event.id)}>Изменить</Button>
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
        ) : (
          <EmptyState
            title="Мероприятий пока нет"
            description="Создайте черновик бесплатно и опубликуйте, когда будете готовы принимать заявки."
            action={<Button onClick={() => openForm()}>+ Создать черновик</Button>}
          />
        )}

      </Stack>

      {formOpen && <EventFormModal event={editedEvent} onClose={closeForm} />}

      {paywallEventId && (
        <PaywallModal
          role="devrel"
          right="publication"
          onClose={() => setPaywallEventId(null)}
          onPurchased={() => {
            setPaywallEventId(null);
            const result = publishEvent(paywallEventId);
            toast(result.ok ? 'Тестовая покупка оформлена, мероприятие опубликовано' : result.error);
          }}
        />
      )}
    </>
  );
}
