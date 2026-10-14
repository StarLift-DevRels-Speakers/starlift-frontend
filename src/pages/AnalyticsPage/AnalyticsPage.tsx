import { rolePath } from '@/app/navigation';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Alert, Badge, Card, Grid, LinkButton, Stack } from '@/components/ui';
import { isSubscriptionActive } from '@/features/billing/access';
import { useDemoState } from '@/store/useDemoStore';

const to = (slug: string) => rolePath('devrel', slug);

/** DevRel analytics: basic counters are free, the extended block needs the subscription. */
export function AnalyticsPage() {
  const { events, applications, invitations, billing } = useDemoState();
  const hasSubscription = isSubscriptionActive(billing.devrel);

  const ownEventIds = new Set(events.filter((event) => event.owner === 'devrel').map((event) => event.id));
  const applicationCount = applications.filter((application) => ownEventIds.has(application.eventId)).length;
  const invitationCount = invitations.filter((invitation) => ownEventIds.has(invitation.eventId)).length;

  return (
    <>
      <PageHeader
        title="Аналитика"
        description="Базовые показатели доступны бесплатно. Расширенные показатели — по подписке."
      />

      <Stack>
        <Grid columns={3}>
          <StatCard label="Мои мероприятия" value={ownEventIds.size} hint="Перейти к мероприятиям" to={to('events')} />
          <StatCard label="Заявки на мои мероприятия" value={applicationCount} hint="Перейти к заявкам" to={to('applications')} />
          <StatCard label="Направленные приглашения" value={invitationCount} hint="Перейти к приглашениям" to={to('applications')} />
        </Grid>

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
