import { rolePath } from '@/app/navigation';
import { AccessCard } from '@/components/dashboard/AccessCard/AccessCard';
import { CalendarCard } from '@/components/dashboard/CalendarCard/CalendarCard';
import { DashboardColumns } from '@/components/dashboard/DashboardColumns/DashboardColumns';
import { FeatureCard } from '@/components/dashboard/FeatureCard/FeatureCard';
import { NotificationsCard } from '@/components/dashboard/NotificationsCard/NotificationsCard';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { TaskItem } from '@/components/dashboard/TaskItem/TaskItem';
import { TaskListCard } from '@/components/dashboard/TaskListCard/TaskListCard';
import { UpcomingCard } from '@/components/dashboard/UpcomingCard/UpcomingCard';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Grid, LinkButton, Stack } from '@/components/ui';
import { aiAccessLabel, isSubscriptionActive } from '@/features/billing/access';
import { calendarEntriesFor, upcomingEntries } from '@/features/calendar/calendarEntries';
import { useDemoState } from '@/store/useDemoStore';
import { pluralize } from '@/utils/plural';

const to = (slug: string) => rolePath('devrel', slug);

export function DevrelDashboardPage() {
  const demo = useDemoState();
  const firstName = demo.profiles.devrel.name.split(' ')[0];
  const billing = demo.billing.devrel;
  const hasSubscription = isSubscriptionActive(billing);
  const calendarEntries = calendarEntriesFor('devrel', demo);

  const ownEvents = demo.events.filter((event) => event.owner === 'devrel');
  const drafts = ownEvents.filter((event) => event.state === 'draft').length;
  const incoming = demo.applications.filter((application) => ownEvents.some((event) => event.id === application.eventId));
  const pending = incoming.filter((application) => application.status === 'sent').length;

  return (
    <>
      <PageHeader
        eyebrow="StarLift / Главная"
        title={`Здравствуйте, ${firstName}!`}
        description="Ваши мероприятия, заявки и ближайшие задачи — в одном месте."
        actions={<LinkButton to={`${to('events')}?new=1`}>+ Создать мероприятие</LinkButton>}
      />

      <Stack>
        <Grid columns={3} responsive={false}>
          <StatCard label="Мои мероприятия" value={ownEvents.length} hint="Черновики и опубликованные" to={to('events')} />
          <StatCard label="Входящие заявки" value={incoming.length} hint="На свои мероприятия" to={to('applications')} />
          <StatCard label="Ожидают решения" value={pending} hint="Новые заявки" to={to('applications')} />
        </Grid>

        <DashboardColumns
          main={
            <>
              <TaskListCard>
                <TaskItem
                  title="Новые заявки"
                  description={`${pending} ${pluralize(pending, ['заявка', 'заявки', 'заявок'])} ${pluralize(pending, ['ожидает', 'ожидают', 'ожидают'])} рассмотрения на ваших мероприятиях`}
                  action={<LinkButton to={to('applications')} variant="secondary" size="sm">Рассмотреть</LinkButton>}
                />
                <TaskItem
                  title="Черновики мероприятий"
                  description={`${drafts} ${pluralize(drafts, ['черновик', 'черновика', 'черновиков'])} · публикация по покупке или подписке`}
                  action={<LinkButton to={to('events')} variant="secondary" size="sm">Перейти</LinkButton>}
                />
                <TaskItem
                  title="Каталог и отзывы Спикеров"
                  description="Бесплатный просмотр без подписки"
                  action={<LinkButton to={to('catalog')} variant="secondary" size="sm">Открыть</LinkButton>}
                />
              </TaskListCard>
              <UpcomingCard role="devrel" entries={upcomingEntries(calendarEntries, 4)} />
              <NotificationsCard role="devrel" notifications={demo.notifications.devrel.slice(0, 3)} />
            </>
          }
          aside={
            <>
              <CalendarCard role="devrel" entries={calendarEntries} />
              <Grid columns={2}>
                <FeatureCard
                  highlighted
                  icon="✦"
                  title="AI-подбор спикеров"
                  description="Укажите требования к выступлению и получите подбор кандидатов с объяснениями."
                  status={aiAccessLabel(billing)}
                  action={<LinkButton to={to('ai')}>Открыть AI-подбор</LinkButton>}
                />
                <FeatureCard
                  icon="☆"
                  title="Отзывы слушателей"
                  description="Просматривайте отзывы о Спикерах через каталог, даже без подписки."
                  status="Бесплатно"
                  statusTone="brand"
                  action={<LinkButton to={to('catalog')} variant="secondary">Открыть каталог</LinkButton>}
                />
              </Grid>
              <AccessCard role="devrel" hasSubscription={hasSubscription} />
            </>
          }
        />

      </Stack>
    </>
  );
}
