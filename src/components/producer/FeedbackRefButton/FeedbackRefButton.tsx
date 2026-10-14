import { feedbackRef } from '@/features/feedback/feedbackRef';
import { reviewAnchorId } from '@/features/producer/producer';
import styles from './FeedbackRefButton.module.scss';

export interface FeedbackRefButtonProps {
  feedbackId: string;
  /** Text before the reference, e.g. «Отзыв». */
  prefix?: string;
}

/** Evidence link: scrolls to the review in the producer's review list and focuses it. */
export function FeedbackRefButton({ feedbackId, prefix }: FeedbackRefButtonProps) {
  const label = prefix ? `${prefix} ${feedbackRef(feedbackId)}` : feedbackRef(feedbackId);

  const showReview = () => {
    const target = document.getElementById(reviewAnchorId(feedbackId));
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.focus({ preventScroll: true });
  };

  return (
    <button type="button" className={styles.ref} onClick={showReview} aria-label={`Перейти к отзыву ${feedbackRef(feedbackId)}`}>
      {label}
    </button>
  );
}
