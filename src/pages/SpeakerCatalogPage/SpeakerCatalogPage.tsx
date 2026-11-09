import { useState } from 'react';
import { rolePath } from '@/app/navigation';
import { InviteSpeakerModal } from '@/components/invitations/InviteSpeakerModal/InviteSpeakerModal';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Alert, Avatar, Badge, Button, Card, EmptyState, Grid, Input, LinkButton, Skeleton, Stack } from '@/components/ui';
import { isSubscriptionActive } from '@/features/billing/access';
import { useCatalogSpeakers } from '@/features/catalog/useCatalog';
import { useUrlSearchQuery } from '@/hooks/useUrlSearchQuery';
import { useAppState } from '@/store/useAppStore';
import styles from './SpeakerCatalogPage.module.scss';

/** DevRel's free catalog of public speaker profiles and listener feedback. */
export function SpeakerCatalogPage() {
  const { billing } = useAppState();
  const [query, changeQuery] = useUrlSearchQuery();
  const { speakers, loading, error } = useCatalogSpeakers(query);
  const [invited, setInvited] = useState<{ id: string; name: string } | null>(null);

  return (
    <>
      <PageHeader
        title="Каталог спикеров"
        description="Бесплатный просмотр доступных профилей и отзывов слушателей."
        actions={<LinkButton to={rolePath('devrel', 'ai/speaker')} variant="secondary">AI-подбор под мероприятие</LinkButton>}
      />

      {loading && <p className={styles.loadingStatus} role="status">Загрузка каталога…</p>}
      <Stack aria-busy={loading}>
        <Input
          type="search"
          label="Поиск спикеров"
          placeholder="Имя, компетенции или город"
          value={query}
          onChange={(event) => changeQuery(event.target.value)}
        />

        {error ? (
          <Alert tone="danger" title="Не удалось загрузить каталог">{error}</Alert>
        ) : loading ? (
          <Grid columns={2} aria-hidden="true">
            {[0, 1].map((index) => (
              <Card key={index} className={styles.card}>
                <div className={styles.person}>
                  <Skeleton shape="circle" width={56} height={56} />
                  <Stack gap={2}>
                    <Skeleton width={120} height={20} />
                    <Skeleton width={140} />
                  </Stack>
                </div>
                <Skeleton width="65%" />
                <div className={styles.footer}><Skeleton width="55%" height={36} /></div>
              </Card>
            ))}
          </Grid>
        ) : speakers.length > 0 ? (
          <Grid as="ul" columns={2} aria-label="Спикеры">
            {speakers.map((speaker) => {
              const topics = [...new Set(speaker.skills.split(',').map((topic) => topic.trim()).filter(Boolean))];

              return (
                <Card key={speaker.id} as="li" className={styles.card}>
                  <div className={styles.person}>
                    <Avatar name={speaker.name} size="lg" decorative />
                    <div>
                      <h2 className={styles.name}>{speaker.name}</h2>
                      <p className={styles.meta}>{[speaker.position, speaker.city].filter(Boolean).join(' · ') || 'Профиль не заполнен'}</p>
                    </div>
                  </div>
                  {topics.length > 0 && (
                    <ul className={styles.skills} aria-label="Компетенции">
                      {topics.slice(0, 4).map((topic) => (
                        <li key={topic}><Badge className={styles.skill} tone="muted">{topic}</Badge></li>
                      ))}
                      {topics.length > 4 && <li><Badge tone="muted">Ещё {topics.length - 4}</Badge></li>}
                    </ul>
                  )}
                  <div className={styles.footer}>
                    <p className={styles.meta}>
                      Выступлений: {speaker.speechCount} · Отзывов: {speaker.feedbackCount}
                    </p>
                    <div className={styles.actions}>
                      <LinkButton to={`${rolePath('devrel', 'catalog')}/${speaker.id}`} variant="secondary">Карточка и отзывы</LinkButton>
                      <Button onClick={() => setInvited({ id: speaker.id, name: speaker.name })}>Пригласить</Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </Grid>
        ) : (
          <EmptyState
            title={query ? 'Не найдено спикеров по запросу' : 'В каталоге пока нет спикеров'}
            action={query ? <Button variant="secondary" size="sm" onClick={() => changeQuery('')}>Сбросить поиск</Button> : undefined}
          />
        )}

        <Card as="section" title="Слабые сигналы" titleAs="h2">
          <p className={styles.meta}>
            Оценка потенциала спикера по косвенным признакам: активность, отзывы, цели и внешние упоминания. Шкала 1–5 с
            обоснованием — в карточке спикера.{!isSubscriptionActive(billing.devrel) && ' Входит в подписку DevRel.'}
          </p>
          {!isSubscriptionActive(billing.devrel) && (
            <LinkButton to={rolePath('devrel', 'billing')} variant="soft" className={styles.signalsAction}>
              Посмотреть подписку
            </LinkButton>
          )}
        </Card>
      </Stack>

      {invited && <InviteSpeakerModal speaker={invited} onClose={() => setInvited(null)} />}
    </>
  );
}
