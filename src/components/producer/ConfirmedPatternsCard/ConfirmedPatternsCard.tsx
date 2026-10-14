import { Badge, Card } from '@/components/ui';
import {
  answersWith,
  CONFIRMATION_THRESHOLD,
  countLabel,
  producerSignals,
  type ProducerFacts,
} from '@/features/producer/producer';
import { cx } from '@/utils/cx';
import { FeedbackRefButton } from '../FeedbackRefButton/FeedbackRefButton';
import shared from '../producer.module.scss';
import styles from './ConfirmedPatternsCard.module.scss';

/** Strengths and growth areas confirmed by at least three matching answers. */
export function ConfirmedPatternsCard({ facts }: { facts: ProducerFacts }) {
  const total = facts.feedback.length;

  return (
    <Card as="section" title="Подтвержденные паттерны" titleAs="h2" actions={<Badge tone="muted">Порог: 3 отзыва</Badge>}>
      {producerSignals.map((signal) => {
        const reviews = answersWith(facts, signal.key, signal.choice);
        const confirmed = reviews.length >= CONFIRMATION_THRESHOLD;

        return (
          <div key={`${signal.key}-${signal.choice}`} className={cx(styles.insight, signal.problem && styles.issue)}>
            <p className={styles.heading}>
              <strong>{signal.title}</strong>
              {confirmed ? (
                <Badge tone={signal.problem ? 'warning' : 'brand'}>
                  {countLabel(reviews.length, ['подтверждение', 'подтверждения', 'подтверждений'])}
                </Badge>
              ) : (
                <Badge tone="warning">Пока не подтверждено</Badge>
              )}
            </p>
            {confirmed ? (
              <p className={styles.evidence}>
                Ответ выбрали {reviews.length} из {total} слушателей. Основания:{' '}
                {reviews.slice(0, 6).map((review) => (
                  <FeedbackRefButton key={review.id} feedbackId={review.id} prefix="Отзыв" />
                ))}
              </p>
            ) : (
              <p className={styles.evidence}>
                Выбрано {reviews.length} из {total} раз. Для устойчивого вывода нужно не менее трех ответов.
              </p>
            )}
          </div>
        );
      })}
      <p className={shared.fineprint}>
        Повторяемость отмечается по структурированным ответам. Это демонстрационный подсчет, не вывод языковой модели.
        Комментарии представлены ниже без автоматического приписывания темы конкретному выступлению.
      </p>
    </Card>
  );
}
