import { useState } from 'react';
import { rolePath } from '@/app/navigation';
import { InviteSpeakerModal } from '@/components/invitations/InviteSpeakerModal/InviteSpeakerModal';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Alert, Avatar, Badge, Button, Card, EmptyState, Grid, Input, LinkButton, Stack } from '@/components/ui';
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
        actions={<LinkButton to={rolePath('devrel', 'ai/speaker')}>AI-подбор под мероприятие</LinkButton>}
      />

      <Stack>
        <Card>
          <Grid columns={2}>
            <Input
              type="search"
              label="Поиск спикеров"
              placeholder="Имя, тема, город"
              value={query}
              onChange={(event) => changeQuery(event.target.value)}
            />
            <Input label="Тип поиска" value="Обычный поиск — бесплатно" readOnly />
          </Grid>
        </Card>

        {error ? (
          <Alert tone="danger" title="Не удалось загрузить каталог">{error}</Alert>
        ) : loading ? (
          <p className={styles.meta} role="status">Загрузка каталога…</p>
        ) : speakers.length > 0 ? (
          <Stack as="ul" gap={3} aria-label="Спикеры">
            {speakers.map((speaker) => (
              <Card key={speaker.id} as="li">
                <div className={styles.top}>
                  <div className={styles.person}>
                    <Avatar name={speaker.name} size="lg" decorative />
                    <div>
                      <h2 className={styles.name}>{speaker.name}</h2>
                      <p className={styles.meta}>{[speaker.position, speaker.city].filter(Boolean).join(' · ') || 'Профиль не заполнен'}</p>
                      {speaker.skills && <p className={styles.skills}>{speaker.skills}</p>}
                    </div>
                  </div>
                  <Badge tone="muted">Публичные данные</Badge>
                </div>
                <div className={styles.footer}>
                  <p className={styles.meta}>
                    Выступлений: {speaker.speechCount} · отзывов слушателей: {speaker.feedbackCount}. Просмотр бесплатный.
                  </p>
                  <div className={styles.actions}>
                    <LinkButton to={`${rolePath('devrel', 'catalog')}/${speaker.id}`} variant="secondary">Карточка и отзывы</LinkButton>
                    <Button onClick={() => setInvited({ id: speaker.id, name: speaker.name })}>Пригласить</Button>
                  </div>
                </div>
              </Card>
            ))}
          </Stack>
        ) : (
          <EmptyState
            title={query ? 'Не найдено спикеров по запросу' : 'В каталоге пока нет спикеров'}
            action={query ? <Button variant="secondary" size="sm" onClick={() => changeQuery('')}>Сбросить поиск</Button> : undefined}
          />
        )}

        <Card as="section" variant="ai" title="Слабые сигналы" titleAs="h2">
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
