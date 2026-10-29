import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ApiError, errorMessage } from '@/api/client';
import { api } from '@/api/endpoints';
import { toCatalogProfile, toFeedback, toTalk } from '@/api/mappers';
import type { TalentScoreDto } from '@/api/types';
import { rolePath } from '@/app/navigation';
import { FeedbackList } from '@/components/feedback/FeedbackList/FeedbackList';
import { InviteSpeakerModal } from '@/components/invitations/InviteSpeakerModal/InviteSpeakerModal';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Alert, Avatar, Badge, Button, Card, EmptyState, Grid, IconTile, LinkButton, ListItem, Stack } from '@/components/ui';
import { isSubscriptionActive } from '@/features/billing/access';
import { useAppState } from '@/store/useAppStore';
import type { Feedback, Talk, UserProfile } from '@/types/domain';
import { formatLongDate } from '@/utils/date';
import styles from './SpeakerProfileViewPage.module.scss';

interface SpeakerDetails {
  profile: UserProfile;
  speeches: { id: string; event: string; date: string; topic: string }[];
  talks: Talk[];
  feedback: Feedback[];
}

type Loaded = { status: 'loading' } | { status: 'missing' } | { status: 'error'; error: string } | { status: 'ready'; details: SpeakerDetails };

const confidenceLabels: Record<TalentScoreDto['confidence'], string> = {
  low: 'низкая уверенность',
  medium: 'средняя уверенность',
  high: 'высокая уверенность',
};

/** Speaker's public profile as a DevRel sees it: competencies, talks given, listener feedback and weak signals. */
export function SpeakerProfileViewPage() {
  const { speakerId = '' } = useParams();
  const { billing } = useAppState();
  const [loaded, setLoaded] = useState<Loaded>({ status: 'loading' });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [score, setScore] = useState<TalentScoreDto>();
  const [scoreError, setScoreError] = useState<string>();
  const [scoring, setScoring] = useState(false);
  const hasSubscription = isSubscriptionActive(billing.devrel);

  useEffect(() => {
    let cancelled = false;
    api.catalogSpeaker(speakerId)
      .then((data) => {
        if (cancelled) return;
        setLoaded({
          status: 'ready',
          details: {
            profile: toCatalogProfile(data.profile),
            speeches: data.speeches.map((speech) => ({ id: speech.id, event: speech.event, date: speech.date ?? '', topic: speech.topic })),
            talks: data.talks.map(toTalk),
            feedback: data.feedback.map(toFeedback),
          },
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoaded(error instanceof ApiError && error.status === 404 ? { status: 'missing' } : { status: 'error', error: errorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [speakerId]);

  const evaluate = async () => {
    setScoring(true);
    setScoreError(undefined);
    try {
      setScore(await api.talentScore(speakerId));
    } catch (error) {
      setScoreError(errorMessage(error));
    } finally {
      setScoring(false);
    }
  };

  if (loaded.status === 'loading') return <p className={styles.muted} role="status">Загрузка профиля…</p>;
  if (loaded.status === 'error') return <Alert tone="danger" title="Не удалось загрузить профиль">{loaded.error}</Alert>;
  if (loaded.status === 'missing') {
    return (
      <EmptyState
        title="Спикер не найден"
        description="Профиль недоступен или ссылка устарела."
        action={<LinkButton to={rolePath('devrel', 'catalog')}>К каталогу спикеров</LinkButton>}
      />
    );
  }

  const { profile: speaker, speeches, talks, feedback } = loaded.details;
  const newestSpeeches = [...speeches].sort((a, b) => b.date.localeCompare(a.date));
  const speechById = new Map(speeches.map((speech) => [speech.id, speech]));

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
                <p className={styles.muted}>{speaker.position || 'Должность не указана'}</p>
                <p className={styles.caption}>{[speaker.company, speaker.city].filter(Boolean).join(' · ')}</p>
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
            {talks.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.subtitle}>Доклады</h3>
                <p className={styles.muted}>{talks.map((talk) => talk.name).join(' · ')}</p>
              </div>
            )}
          </Card>

          <Card as="section" title="Выступления" titleAs="h2">
            {newestSpeeches.length > 0 ? (
              <ul className={styles.list}>
                {newestSpeeches.map((speech) => (
                  <ListItem
                    key={speech.id}
                    leading={<IconTile>🎤</IconTile>}
                    title={speech.event}
                    meta={`${speech.date ? formatLongDate(speech.date) : 'Дата не указана'} · ${speech.topic}`}
                  />
                ))}
              </ul>
            ) : (
              <EmptyState variant="plain" title="Выступлений пока нет" />
            )}
          </Card>
        </Grid>

        <Card
          as="section"
          variant="ai"
          title="Слабые сигналы"
          titleAs="h2"
          actions={<Badge tone="ai">{hasSubscription ? 'По подписке' : 'Подписка DevRel'}</Badge>}
          description="Оценка потенциала 1–5 по активности, отзывам, целям и внешним упоминаниям. Считает модель по данным спикера."
        >
          {!hasSubscription ? (
            <LinkButton to={rolePath('devrel', 'billing')} variant="soft">Посмотреть подписку</LinkButton>
          ) : (
            <Stack gap={3}>
              {score && (
                <div className={styles.section}>
                  <p className={styles.name}>{score.score} из 5 · {confidenceLabels[score.confidence]}</p>
                  <p className={styles.muted}>{score.reason}</p>
                </div>
              )}
              {scoreError && <Alert tone="danger" role="alert">{scoreError}</Alert>}
              <div>
                <Button onClick={evaluate} disabled={scoring}>
                  {scoring ? 'Оцениваем…' : score ? 'Оценить заново' : 'Оценить потенциал'}
                </Button>
              </div>
            </Stack>
          )}
        </Card>

        <Card as="section" title="Отзывы слушателей" titleAs="h2" actions={<Badge>Бесплатный просмотр</Badge>}>
          <FeedbackList
            feedback={feedback}
            speechLabel={(speechId) => {
              const speech = speechById.get(speechId);
              return speech && `${speech.event}${speech.date ? ` · ${formatLongDate(speech.date)}` : ''}`;
            }}
          />
          <p className={styles.fineprint}>
            DevRel не может редактировать или удалять отзывы. Доступ к планам развития Спикера не предоставляется без
            отдельного согласования.
          </p>
        </Card>
      </Stack>

      {inviteOpen && (
        <InviteSpeakerModal
          speaker={{ id: speaker.id, name: speaker.name }}
          defaultTopic={talks[0]?.name}
          onClose={() => setInviteOpen(false)}
        />
      )}
    </>
  );
}
