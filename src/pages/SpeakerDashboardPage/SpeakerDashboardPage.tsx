import { rolePath } from '@/app/navigation';
import { CompetitionCard } from '@/components/competition/CompetitionCard/CompetitionCard';
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
import { useAppState } from '@/store/useAppStore';
import { pluralize } from '@/utils/plural';

const to = (slug: string) => rolePath('speaker', slug);

function invitationsTitle(count: number): string {
  if (count === 0) return 'Приглашения';
  const noun = pluralize(count, ['приглашение', 'приглашения', 'приглашений']);
  const verb = pluralize(count, ['ожидает', 'ожидают', 'ожидают']);
  return `${count} ${noun} ${verb} ответа`;
}

export function SpeakerDashboardPage() {
  const demo = useAppState();
  const firstName = demo.profile.name.split(' ')[0];
  const billing = demo.billing.speaker;
  const hasSubscription = isSubscriptionActive(billing);
  const calendarEntries = calendarEntriesFor('speaker', demo);
  const pendingInvitations = demo.invitations.filter((invitation) => invitation.status === 'sent').length;
  const pendingApplications = demo.applications.filter((application) => application.status === 'sent').length;
  const feedbackCount = demo.feedback.length;

  return (
    <>
      <PageHeader
        eyebrow="StarLift / Главная"
        title={`Здравствуйте, ${firstName}!`}
        description="Ваши выступления, отзывы, заявки и ближайшие события."
        actions={<LinkButton to={`${to('talks')}?new=1`}>+ Добавить доклад</LinkButton>}
      />

      <Stack>
        <Grid columns={3} responsive={false}>
          <StatCard label="Мои доклады" value={demo.talks.length} hint="Перейти к докладам" to={to('talks')} />
          <StatCard label="Мои заявки" value={demo.applications.length} hint="Все состояния" to={to('applications')} />
          <StatCard label="Отзывы слушателей" value={feedbackCount} hint="Публичная форма" to={to('reviews')} />
        </Grid>

        <DashboardColumns
          main={
            <>
              <TaskListCard>
                <TaskItem
                  title={invitationsTitle(pendingInvitations)}
                  description={pendingInvitations > 0 ? 'Ответьте DevRel по предложению' : 'Новых приглашений без ответа нет'}
                  action={<LinkButton to={to('invitations')} variant="secondary" size="sm">Открыть</LinkButton>}
                />
                <TaskItem
                  title="Мои заявки"
                  description={`${pendingApplications} на рассмотрении`}
                  action={<LinkButton to={to('applications')} variant="secondary" size="sm">Перейти</LinkButton>}
                />
                <TaskItem
                  title="Отзывы слушателей"
                  description={`${feedbackCount} ${pluralize(feedbackCount, ['отзыв', 'отзыва', 'отзывов'])} · ссылка на форму для каждого выступления`}
                  action={<LinkButton to={to('reviews')} variant="secondary" size="sm">Ссылка</LinkButton>}
                />
              </TaskListCard>
              <UpcomingCard role="speaker" entries={upcomingEntries(calendarEntries, 4)} />
              <NotificationsCard role="speaker" notifications={demo.notifications.slice(0, 3)} />
            </>
          }
          aside={
            <>
              <CompetitionCard />
              <CalendarCard role="speaker" entries={calendarEntries} />
              <Grid columns={2}>
                <FeatureCard
                  highlighted
                  icon="✦"
                  title="AI-подбор мероприятий"
                  description="Подберите релевантные CFP по вашему профилю и предпочтениям."
                  status={aiAccessLabel(billing)}
                  action={<LinkButton to={to('ai/events')}>Открыть AI-подбор</LinkButton>}
                />
                <FeatureCard
                  icon="✺"
                  iconTone="ai"
                  title="ИИ-продюсер"
                  description="Персональный план развития, обоснованные сильные стороны и направления роста."
                  status={hasSubscription ? 'Доступно' : 'По подписке'}
                  action={<LinkButton to={to('ai/producer')} variant="secondary">Перейти к плану</LinkButton>}
                />
              </Grid>
              <AccessCard role="speaker" hasSubscription={hasSubscription} />
            </>
          }
        />

      </Stack>
    </>
  );
}
