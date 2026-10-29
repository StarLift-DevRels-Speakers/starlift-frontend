import { Alert, Badge, Card, EmptyState, IconTile, ListItem, Stack } from '@/components/ui';
import type { ProducerFacts } from '@/features/producer/producer';
import type { Talk } from '@/types/domain';
import { formatLongDate } from '@/utils/date';
import { CheckList } from '../CheckList/CheckList';
import shared from '../producer.module.scss';
import styles from './ProducerSources.module.scss';

const missingMetrics = [
  'NPS: форма отзыва не содержит вопрос 0–10',
  'Текущий / следующий уровень спикера: не определены правила',
];

export interface ProducerSourcesProps {
  facts: ProducerFacts;
  talks: Talk[];
}

/** Speech history used as input and the open CFPs for the next step. Renders two cards. */
export function ProducerSources({ facts, talks }: ProducerSourcesProps) {
  const talkById = new Map(talks.map((talk) => [talk.id, talk]));

  return (
    <>
      <Card as="section" title="История выступлений" titleAs="h2" actions={<Badge tone="muted">До 12 записей</Badge>}>
        {facts.speeches.length > 0 ? (
          <ul className={styles.speeches}>
            {facts.speeches.map((speech) => {
              const talk = talkById.get(speech.talkId);
              return (
                <li key={speech.id} className={styles.speech}>
                  <span className={shared.micro}>{formatLongDate(speech.date)}</span>
                  <div>
                    <strong>{speech.event}</strong>
                    <p className={shared.micro}>
                      Доклад: {talk?.name ?? 'Не указан'} · {talk?.topic ?? 'Тема не указана'}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState variant="plain" title="Записей о выступлениях нет" />
        )}
        <p className={shared.fineprint}>Дата и наименование берутся из вашей истории выступлений.</p>
      </Card>

      <Card as="section" title="Открытые CFP" titleAs="h2" actions={<Badge tone="muted">{facts.openCfp.length} доступно</Badge>}>
        <Stack gap={3}>
          {facts.openCfp.length > 0 ? (
            <ul className={styles.list}>
              {facts.openCfp.map((event) => (
                <ListItem
                  key={event.id}
                  leading={<IconTile>▦</IconTile>}
                  title={event.name}
                  meta={
                    <>
                      <span>{event.topic} · {event.city} · дедлайн {event.cfp && formatLongDate(event.cfp)}</span>
                      <span className={shared.micro}>Подходящий срок; тематическая релевантность не рассчитана.</span>
                    </>
                  }
                />
              ))}
            </ul>
          ) : (
            <Alert tone="warning">
              В каталоге нет открытых CFP. Шаг с участием в конкретной конференции пока нельзя предложить.
            </Alert>
          )}
          <hr className={shared.divider} />
          <h3 className={shared.h3}>Отсутствующие показатели</h3>
          <CheckList items={missingMetrics.map((text) => ({ status: 'Нет', pending: true, text }))} />
        </Stack>
      </Card>
    </>
  );
}
