import { EmptyState } from '@/components/ui';
import { feedbackRef } from '@/features/feedback/feedbackRef';
import { feedbackQuestions } from '@/features/feedback/questions';
import type { Feedback } from '@/types/domain';
import { formatLongDate } from '@/utils/date';
import styles from './FeedbackList.module.scss';

export interface FeedbackListProps {
  feedback: Feedback[];
  emptyText?: string;
  /** Gives every review a DOM id (link target) and shows its short reference, e.g. «Отзыв F1». */
  anchorId?: (feedbackId: string) => string;
  /** Speech the review is about, e.g. «Backend Meetup · 12 октября 2026 г.». */
  speechLabel?: (speechId: string) => string | undefined;
}

/** Anonymous listener feedback, newest first: chosen answers and an optional comment. */
export function FeedbackList({ feedback, emptyText = 'Отзывов пока нет', anchorId, speechLabel }: FeedbackListProps) {
  if (feedback.length === 0) return <EmptyState variant="plain" title={emptyText} />;

  const newestFirst = [...feedback].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <ul className={styles.list}>
      {newestFirst.map((item) => (
        <li key={item.id} id={anchorId?.(item.id)} tabIndex={anchorId ? -1 : undefined} className={styles.item}>
          <span className={styles.icon} aria-hidden="true">☆</span>
          <div className={styles.body}>
            <div className={styles.header}>
              <strong>{anchorId ? `Отзыв ${feedbackRef(item.id)}` : 'Отзыв слушателя'}</strong>
              <time dateTime={item.at} className={styles.date}>{formatLongDate(item.at)}</time>
            </div>
            {speechLabel?.(item.speechId) && <p className={styles.date}>{speechLabel(item.speechId)}</p>}
            {item.answers ? (
              <dl className={styles.answers}>
                {feedbackQuestions.map((question) => (
                  <div key={question.key}>
                    <dt>{question.title.replace('?', '')}</dt>
                    <dd>{question.options[item.answers![question.key]]}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              // Reviews left before the five-question form: rating 0–10 and free texts.
              <dl className={styles.answers}>
                <div><dt>Оценка</dt><dd>{item.rating} из 10</dd></div>
                {item.positive && <div><dt>Понравилось</dt><dd>{item.positive}</dd></div>}
                {item.negative && <div><dt>Не понравилось</dt><dd>{item.negative}</dd></div>}
              </dl>
            )}
            {item.comment && <p className={styles.comment}>«{item.comment}»</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
