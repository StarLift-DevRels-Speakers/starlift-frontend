import { rolePath } from '@/app/navigation';
import { CalendarCard } from '@/components/dashboard/CalendarCard/CalendarCard';
import { DashboardColumns } from '@/components/dashboard/DashboardColumns/DashboardColumns';
import { DashboardHero } from '@/components/dashboard/DashboardHero/DashboardHero';
import { FeatureCard } from '@/components/dashboard/FeatureCard/FeatureCard';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { TaskItem } from '@/components/dashboard/TaskItem/TaskItem';
import { TaskListCard } from '@/components/dashboard/TaskListCard/TaskListCard';
import { UpcomingCard } from '@/components/dashboard/UpcomingCard/UpcomingCard';
import { Card, Grid, LinkButton, Stack } from '@/components/ui';
import { aiAccessLabel } from '@/features/billing/access';
import { calendarEntriesFor, entryLink, upcomingEntries } from '@/features/calendar/calendarEntries';
import { useAppState } from '@/store/useAppStore';
import { formatLongDate } from '@/utils/date';
import { pluralize } from '@/utils/plural';

const to = (slug: string) => rolePath('devrel', slug);

export function DevrelDashboardPage() {
  const demo = useAppState();
  const firstName = demo.profile.name.split(' ')[0];
  const billing = demo.billing.devrel;
  const calendarEntries = calendarEntriesFor('devrel', demo);
  const ownEvents = demo.events.filter((event) => event.owner === 'devrel');
  const publishedIds = new Set(ownEvents.filter((event) => event.state === 'published').map((event) => event.id));
  const eventEntries = calendarEntries.filter((entry) => entry.kind === 'event');
  const upcoming = upcomingEntries(eventEntries, 4);
  const nextEvent = upcomingEntries(eventEntries.filter((entry) => entry.eventId && publishedIds.has(entry.eventId)), 1)[0];
  const drafts = ownEvents.filter((event) => event.state === 'draft').length;
  const incoming = demo.applications.filter((application) => ownEvents.some((event) => event.id === application.eventId));
  const pending = incoming.filter((application) => application.status === 'sent').length;

  return (
    <>
      <DashboardHero
        role="devrel"
        name={firstName}
        description="Собирайте программу, приглашайте спикеров и принимайте решения по заявкам."
        action={<LinkButton to={`${to('events')}?new=1`}>+ Создать мероприятие</LinkButton>}
      />

      <Stack>
        <DashboardColumns
          main={
            <TaskListCard title="Сейчас важно">
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
              {nextEvent && <TaskItem
                title={`Ближайшее мероприятие · ${nextEvent.title}`}
                description={formatLongDate(nextEvent.date)}
                action={<LinkButton to={entryLink('devrel', nextEvent)} variant="text" size="sm">Открыть →</LinkButton>}
              />}
            </TaskListCard>
          }
          aside={<CalendarCard role="devrel" entries={calendarEntries} />}
        />

        <Grid columns={3} responsive={false}>
          <StatCard label="Мои мероприятия" value={ownEvents.length} hint="Черновики и опубликованные" to={to('events')} />
          <StatCard label="Ожидают решения" value={pending} hint="Новые заявки" to={to('applications')} />
          <StatCard label="Черновики" value={drafts} hint="К мероприятиям" to={to('events')} />
        </Grid>

        <DashboardColumns
          main={
            <>
              <UpcomingCard role="devrel" entries={upcoming} />
              <Card as="section" title="Каталог спикеров" titleAs="h2" description="Профили и отзывы слушателей.">
                <LinkButton to={to('catalog')} variant="text" size="sm">Открыть каталог →</LinkButton>
              </Card>
            </>
          }
          aside={
            <>
              <Stack>
                <FeatureCard
                  highlighted
                  icon="✦"
                  title="AI-подбор спикеров"
                  description="Укажите требования к выступлению и получите подбор кандидатов с объяснениями."
                  status={aiAccessLabel(billing)}
                  action={<LinkButton to={to('ai/speaker')}>Открыть AI-подбор</LinkButton>}
                />
                <Card
                  as="section"
                  title="Аналитика"
                  titleAs="h2"
                  description="Показатели мероприятий, заявок и приглашений."
                >
                  <LinkButton to={to('analytics')} variant="text" size="sm">Посмотреть показатели →</LinkButton>
                </Card>
              </Stack>
            </>
          }
        />

      </Stack>
    </>
  );
}
