import { rolePath } from '@/app/navigation';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Alert, Badge, Card, EmptyState, Grid, LinkButton, Meter, Stack, Table } from '@/components/ui';
import { applicationStatuses } from '@/features/applications/applicationStatus';
import { isSubscriptionActive } from '@/features/billing/access';
import { useAppState } from '@/store/useAppStore';

const to = (slug: string) => rolePath('devrel', slug);

/** DevRel analytics: basic counters are free, the extended block needs the subscription. */
export function AnalyticsPage() {
  const { events, applications, invitations, billing } = useAppState();
  const hasSubscription = isSubscriptionActive(billing.devrel);

  const ownEvents = events.filter((event) => event.owner === 'devrel');
  const ownEventIds = new Set(ownEvents.map((event) => event.id));
  const incoming = applications.filter((application) => ownEventIds.has(application.eventId));
  const sent = invitations.filter((invitation) => ownEventIds.has(invitation.eventId));
  const eventRows = ownEvents.map((event) => {
    const eventApplications = incoming.filter((item) => item.eventId === event.id);
    const eventInvitations = sent.filter((item) => item.eventId === event.id);
    const confirmed = new Set(
      [...eventApplications, ...eventInvitations].filter((item) => item.status === 'accepted').map((item) => item.speakerId),
    );
    return { event, applications: eventApplications.length, invitations: eventInvitations.length, confirmed: confirmed.size };
  });

  return (
    <>
      <PageHeader
        title="Аналитика"
        description="Базовые показатели доступны бесплатно. Расширенные показатели — по подписке."
      />

      <Stack>
        <Grid columns={3}>
          <StatCard label="Мои мероприятия" value={ownEventIds.size} hint="Перейти к мероприятиям" to={to('events')} />
          <StatCard label="Заявки на мои мероприятия" value={incoming.length} hint="Перейти к заявкам" to={to('applications')} />
          <StatCard label="Направленные приглашения" value={sent.length} hint="Перейти к приглашениям" to={`${to('applications')}?tab=outgoing`} />
        </Grid>

        <Grid columns={2}>
          <Card as="section" title="Статусы заявок" titleAs="h2">
            {incoming.length ? (
              <Stack gap={3}>
                {Object.entries(applicationStatuses).map(([status, { label }]) => {
                  const count = incoming.filter((item) => item.status === status).length;
                  return <Meter key={status} label={`${label} · ${count}`} value={count} max={incoming.length} showLabel />;
                })}
              </Stack>
            ) : <EmptyState variant="plain" title="Пока нет заявок" />}
          </Card>
          <Card as="section" title="Публикации" titleAs="h2">
            <Grid columns={2}>
              <StatCard label="Опубликовано" value={ownEvents.filter((event) => event.state === 'published').length} />
              <StatCard label="Черновики" value={ownEvents.filter((event) => event.state === 'draft').length} />
            </Grid>
          </Card>
        </Grid>

        <Card as="section" title="По мероприятиям" titleAs="h2">
          {eventRows.length ? (
            <Table
              caption="Заявки и приглашения по мероприятиям"
              rows={eventRows}
              getRowKey={({ event }) => event.id}
              columns={[
                { key: 'name', header: 'Мероприятие', render: ({ event }) => event.name },
                { key: 'applications', header: 'Заявки', render: (row) => row.applications },
                { key: 'invitations', header: 'Приглашения', render: (row) => row.invitations },
                { key: 'confirmed', header: 'Подтверждено', render: (row) => row.confirmed },
              ]}
            />
          ) : <EmptyState variant="plain" title="Мероприятий пока нет" />}
        </Card>

        <Card
          as="section"
          variant={hasSubscription ? 'default' : 'ai'}
          title="Расширенная аналитика и динамика"
          titleAs="h2"
          actions={<Badge tone="ai">{hasSubscription ? 'По подписке' : 'Подписка DevRel'}</Badge>}
          description={
            hasSubscription
              ? 'Доступ открыт. Здесь будут находиться графики и показатели после утверждения формул расчета.'
              : 'Доступна по Рабочей подписке DevRel. Состав конкретных графиков и методики расчета подлежат согласованию.'
          }
        >
          {hasSubscription ? (
            <Alert tone="neutral">
              Значения и методики расширенной аналитики не определены в СФТ (Q-10). Макет не показывает
              неподтвержденные метрики.
            </Alert>
          ) : (
            <LinkButton to={to('billing')}>Посмотреть тариф</LinkButton>
          )}
        </Card>
      </Stack>
    </>
  );
}
