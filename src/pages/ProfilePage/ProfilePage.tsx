import { rolePath } from '@/app/navigation';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { Avatar, Badge, Card, Grid, LinkButton, Stack } from '@/components/ui';
import { useAppState } from '@/store/useAppStore';
import { roleLabels, type Role } from '@/types/role';
import styles from './ProfilePage.module.scss';

export function ProfilePage({ role }: { role: Role }) {
  const { profile, talks, speeches, feedback, events, applications } = useAppState();
  const to = (slug: string) => rolePath(role, slug);
  const isSpeaker = role === 'speaker';
  const topics = [...new Set(profile.skills.split(',').map((topic) => topic.trim()).filter(Boolean))];
  const workDetails = [
    { label: 'Должность', value: profile.position },
    { label: 'Компания', value: profile.company },
    { label: 'Город', value: profile.city },
  ];
  const ownEvents = events.filter((event) => event.owner === 'devrel');
  const ownEventIds = new Set(ownEvents.map((event) => event.id));
  const incomingCount = applications.filter((application) => ownEventIds.has(application.eventId)).length;

  return (
    <Stack gap={6}>
      <Card as="section" className={styles.hero} aria-labelledby="profile-name">
        <div className={styles.identity}>
          <Avatar name={profile.name} size="lg" decorative className={styles.avatar} />
          <div className={styles.identityText}>
            <p className={styles.eyebrow}>Мой профиль</p>
            <h1 id="profile-name" className={styles.name}>{profile.name}</h1>
            <Badge>{roleLabels[role]}</Badge>
          </div>
        </div>
        <LinkButton to={to('profile/edit')}>Редактировать профиль</LinkButton>
      </Card>

      <Grid columns={2} className={styles.details}>
        <Stack>
          <Card as="section" title="О себе" titleAs="h2">
            <p className={profile.about.trim() ? styles.profileText : styles.muted}>
              {profile.about.trim() || 'Добавьте несколько слов о своём опыте и интересах.'}
            </p>
          </Card>
          {isSpeaker && (
            <Card as="section" title="Компетенции и темы" titleAs="h2">
              {topics.length ? (
                <ul className={styles.topics}>
                  {topics.map((topic) => (
                    <li key={topic}><Badge tone="muted" className={styles.topic}>{topic}</Badge></li>
                  ))}
                </ul>
              ) : <p className={styles.muted}>Добавьте темы, по которым вас смогут найти в каталоге.</p>}
            </Card>
          )}
        </Stack>

        <Stack>
          <Card as="section" title="Профессиональные данные" titleAs="h2">
            <dl className={styles.facts}>
              {workDetails.map(({ label, value }) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value.trim() || 'Не указано'}</dd>
                </div>
              ))}
            </dl>
            {!isSpeaker && <p className={styles.visibility}>Этот профиль виден только вам.</p>}
          </Card>
          {isSpeaker && (
            <Card as="section" title="Предпочтения для выступлений" titleAs="h2">
              <p className={profile.preferences.trim() ? styles.profileText : styles.muted}>
                {profile.preferences.trim() || 'Укажите интересные вам форматы, регионы и аудитории.'}
              </p>
            </Card>
          )}
        </Stack>
      </Grid>

      <section aria-labelledby="profile-activity">
        <Stack>
          <h2 id="profile-activity" className={styles.sectionTitle}>Активность</h2>
          {isSpeaker ? (
            <Grid columns={3}>
              <StatCard label="Доклады" value={talks.length} hint="К докладам" to={to('talks')} />
              <StatCard label="Выступления" value={speeches.length} hint="К выступлениям" to={to('reviews')} />
              <StatCard label="Отзывы слушателей" value={feedback.length} hint="К отзывам" to={to('reviews')} />
            </Grid>
          ) : (
            <Grid columns={3}>
              <StatCard label="Мои мероприятия" value={ownEvents.length} hint="К мероприятиям" to={to('events')} />
              <StatCard label="Входящие заявки" value={incomingCount} hint="К заявкам" to={to('applications')} />
              <Card as="section" title="Каталог спикеров" titleAs="h3">
                <LinkButton to={to('catalog')} variant="soft">Открыть каталог</LinkButton>
              </Card>
            </Grid>
          )}
        </Stack>
      </section>
    </Stack>
  );
}
