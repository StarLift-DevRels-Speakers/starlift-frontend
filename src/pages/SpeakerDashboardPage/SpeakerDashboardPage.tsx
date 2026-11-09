import { rolePath } from '@/app/navigation';
import { AgendaList } from '@/components/calendar/AgendaList/AgendaList';
import { CompetitionCard } from '@/components/competition/CompetitionCard/CompetitionCard';
import { CalendarCard } from '@/components/dashboard/CalendarCard/CalendarCard';
import { DashboardColumns } from '@/components/dashboard/DashboardColumns/DashboardColumns';
import { DashboardHero } from '@/components/dashboard/DashboardHero/DashboardHero';
import { FeatureCard } from '@/components/dashboard/FeatureCard/FeatureCard';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { TaskItem } from '@/components/dashboard/TaskItem/TaskItem';
import { TaskListCard } from '@/components/dashboard/TaskListCard/TaskListCard';
import { Card, EmptyState, Grid, LinkButton, Stack } from '@/components/ui';
import { aiAccessLabel, isSubscriptionActive } from '@/features/billing/access';
import { calendarEntriesFor, entryLink, upcomingEntries } from '@/features/calendar/calendarEntries';
import { useAppState } from '@/store/useAppStore';
import { formatLongDate } from '@/utils/date';
import { pluralize } from '@/utils/plural';
import styles from './SpeakerDashboardPage.module.scss';

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
  const profileReady = Boolean(demo.profile.about.trim() && demo.profile.skills.trim());
  const nextStep = !profileReady
    ? { title: 'Заполните профиль', to: to('profile/edit') }
    : demo.talks.length === 0
      ? { title: 'Добавьте первый доклад', to: `${to('talks')}?new=1` }
      : demo.applications.length === 0
        ? { title: 'Найдите мероприятие для первой заявки', to: to('events') }
        : { title: 'Следите за статусами заявок', to: to('applications') };
  const deadline = upcomingEntries(calendarEntries.filter((entry) => entry.kind === 'cfp'), 1)[0];
  const performances = upcomingEntries(calendarEntries.filter((entry) => entry.kind === 'performance'), 4);
  const nextPerformance = performances[0];

  return (
    <>
      <DashboardHero
        role="speaker"
        name={firstName}
        description="Готовьте доклады, выбирайте площадки и отслеживайте свои выступления."
        action={<LinkButton to={`${to('talks')}?new=1`}>+ Добавить доклад</LinkButton>}
      />

      <Stack>
        <Grid columns={3} responsive={false}>
          <StatCard label="Мои доклады" value={demo.talks.length} hint="Перейти к докладам" to={to('talks')} />
          <StatCard label="Мои заявки" value={demo.applications.length} hint="Все состояния" to={to('applications')} />
          <StatCard label="Отзывы слушателей" value={feedbackCount} hint="Публичная форма" to={to('reviews')} />
        </Grid>
        <details className={styles.journey} open>
          <summary>Следующий шаг</summary>
          <LinkButton to={nextStep.to} variant="text" size="sm">{nextStep.title} →</LinkButton>
        </details>

        <DashboardColumns
          main={
            <>
              <TaskListCard title="Сейчас важно">
                <TaskItem
                  title={invitationsTitle(pendingInvitations)}
                  description={pendingInvitations > 0 ? 'Ответьте DevRel по предложению' : 'Новых приглашений без ответа нет'}
                  action={<LinkButton to={to('invitations')} variant="secondary" size="sm">Открыть</LinkButton>}
                />
                {deadline && <TaskItem
                  title={`Дедлайн CFP · ${deadline.title}`}
                  description={formatLongDate(deadline.date)}
                  action={<LinkButton to={entryLink('speaker', deadline)} variant="text" size="sm">Открыть →</LinkButton>}
                />}
                {nextPerformance && <TaskItem
                  title={`Следующее выступление · ${nextPerformance.title}`}
                  description={formatLongDate(nextPerformance.date)}
                  action={<LinkButton to={entryLink('speaker', nextPerformance)} variant="text" size="sm">Открыть →</LinkButton>}
                />}
                <TaskItem
                  title="Мои заявки"
                  description={`${pendingApplications} на рассмотрении`}
                  action={<LinkButton to={to('applications')} variant="secondary" size="sm">Перейти</LinkButton>}
                />
              </TaskListCard>
              <Card as="section" title="Моё участие" titleAs="h2" actions={<LinkButton to={to('calendar')} variant="text" size="sm">Календарь →</LinkButton>}>
                {performances.length ? <AgendaList role="speaker" entries={performances} /> : <EmptyState title="Ближайших выступлений пока нет" />}
              </Card>
              <CompetitionCard />
            </>
          }
          aside={
            <>
              <CalendarCard role="speaker" entries={calendarEntries} />
              <Stack>
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
              </Stack>
            </>
          }
        />

      </Stack>
    </>
  );
}
