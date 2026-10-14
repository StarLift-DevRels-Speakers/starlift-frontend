import { useState } from 'react';
import { useParams } from 'react-router';
import { rolePath } from '@/app/navigation';
import { FeedbackList } from '@/components/feedback/FeedbackList/FeedbackList';
import { InviteSpeakerModal } from '@/components/invitations/InviteSpeakerModal/InviteSpeakerModal';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Avatar, Badge, Button, Card, EmptyState, Grid, IconTile, LinkButton, ListItem, Stack } from '@/components/ui';
import { useDemoState } from '@/store/useDemoStore';
import { formatLongDate } from '@/utils/date';
import styles from './SpeakerProfileViewPage.module.scss';

/** Speaker's public profile as a DevRel sees it: competencies, talks given and listener feedback (read-only). */
export function SpeakerProfileViewPage() {
  const { speakerId } = useParams();
  const { speeches, feedback, profiles } = useDemoState();
  const [inviteOpen, setInviteOpen] = useState(false);

  // The demo has a single speaker account.
  const speaker = speakerId === profiles.speaker.id ? profiles.speaker : undefined;

  if (!speaker) {
    return (
      <EmptyState
        title="Спикер не найден"
        description="Профиль недоступен или ссылка устарела."
        action={<LinkButton to={rolePath('devrel', 'catalog')}>К каталогу спикеров</LinkButton>}
      />
    );
  }

  const newestSpeeches = [...speeches].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader
        eyebrow="StarLift / Каталог спикеров"
        title={speaker.name}
        description="Доступный DevRel профиль Спикера и отзывы слушателей."
        actions={<Button onClick={() => setInviteOpen(true)}>Пригласить на мероприятие</Button>}
      />

      <Stack>
        <Grid columns={2}>
          <Card as="section" aria-label="Профиль">
            <div className={styles.person}>
              <Avatar name={speaker.name} size="lg" decorative />
              <div>
                <h2 className={styles.name}>{speaker.name}</h2>
                <p className={styles.muted}>{speaker.position}</p>
                <p className={styles.caption}>{speaker.city}</p>
              </div>
            </div>
            <div className={styles.section}>
              <h3 className={styles.subtitle}>Компетенции</h3>
              <p className={styles.muted}>{speaker.skills || 'Не указаны'}</p>
            </div>
            <div className={styles.section}>
              <h3 className={styles.subtitle}>О спикере</h3>
              <p className={styles.muted}>{speaker.about || 'Не заполнено'}</p>
            </div>
          </Card>

          <Card as="section" title="Выступления" titleAs="h2">
            {newestSpeeches.length > 0 ? (
              <ul className={styles.list}>
                {newestSpeeches.map((speech) => (
                  <ListItem
                    key={speech.id}
                    leading={<IconTile>🎤</IconTile>}
                    title={speech.event}
                    meta={formatLongDate(speech.date)}
                  />
                ))}
              </ul>
            ) : (
              <EmptyState variant="plain" title="Выступлений пока нет" />
            )}
          </Card>
        </Grid>

        <Card as="section" title="Отзывы слушателей" titleAs="h2" actions={<Badge>Бесплатный просмотр</Badge>}>
          <FeedbackList feedback={feedback} />
          <p className={styles.fineprint}>
            DevRel не может редактировать или удалять отзывы. Доступ к планам развития Спикера не предоставляется без
            отдельного согласования.
          </p>
        </Card>
      </Stack>

      {inviteOpen && <InviteSpeakerModal speakerName={speaker.name} onClose={() => setInviteOpen(false)} />}
    </>
  );
}
