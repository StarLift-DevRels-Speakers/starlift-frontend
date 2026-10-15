import { useState } from 'react';
import { rolePath } from '@/app/navigation';
import { InviteSpeakerModal } from '@/components/invitations/InviteSpeakerModal/InviteSpeakerModal';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Avatar, Badge, Button, Card, EmptyState, Grid, Input, LinkButton, Stack } from '@/components/ui';
import { isSubscriptionActive } from '@/features/billing/access';
import { useUrlSearchQuery } from '@/hooks/useUrlSearchQuery';
import { useDemoState } from '@/store/useDemoStore';
import styles from './SpeakerCatalogPage.module.scss';

/** DevRel's free catalog of public speaker profiles and listener feedback. */
export function SpeakerCatalogPage() {
  const { feedback, billing, profiles } = useDemoState();
  const [query, changeQuery] = useUrlSearchQuery();
  const [inviteName, setInviteName] = useState<string | null>(null);

  // The demo has a single speaker account.
  const speakers = [profiles.speaker];
  const needle = query.trim().toLowerCase();
  const found = speakers.filter((speaker) =>
    `${speaker.name} ${speaker.skills ?? ''} ${speaker.city}`.toLowerCase().includes(needle),
  );

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

        {found.length > 0 ? (
          <Stack as="ul" gap={3} aria-label="Спикеры">
            {found.map((speaker) => (
              <Card key={speaker.id} as="li">
                <div className={styles.top}>
                  <div className={styles.person}>
                    <Avatar name={speaker.name} size="lg" decorative />
                    <div>
                      <h2 className={styles.name}>{speaker.name}</h2>
                      <p className={styles.meta}>{speaker.position} · {speaker.city}</p>
                      {speaker.skills && <p className={styles.skills}>{speaker.skills}</p>}
                    </div>
                  </div>
                  <Badge tone="muted">Публичные данные</Badge>
                </div>
                <div className={styles.footer}>
                  <p className={styles.meta}>Отзывов слушателей: {feedback.length}. Просмотр бесплатный.</p>
                  <div className={styles.actions}>
                    <LinkButton to={`${rolePath('devrel', 'catalog')}/${speaker.id}`} variant="secondary">Карточка и отзывы</LinkButton>
                    <Button onClick={() => setInviteName(speaker.name)}>Пригласить</Button>
                  </div>
                </div>
              </Card>
            ))}
          </Stack>
        ) : (
          <EmptyState
            title="Не найдено спикеров по запросу"
            action={<Button variant="secondary" size="sm" onClick={() => changeQuery('')}>Сбросить поиск</Button>}
          />
        )}

        {!isSubscriptionActive(billing.devrel) && (
          <Card as="section" variant="ai" title="Слабые сигналы" titleAs="h2">
            <p className={styles.meta}>
              Определение косвенных признаков потенциала спикера включено в подписку DevRel. Алгоритм и шкала пока не
              согласованы.
            </p>
            <LinkButton to={rolePath('devrel', 'billing')} variant="soft" className={styles.signalsAction}>
              Посмотреть подписку
            </LinkButton>
          </Card>
        )}
      </Stack>

      {inviteName && <InviteSpeakerModal speakerName={inviteName} onClose={() => setInviteName(null)} />}
    </>
  );
}
