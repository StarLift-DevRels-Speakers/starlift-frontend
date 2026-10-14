import { Badge, Card } from '@/components/ui';
import { feedbackQuestions } from '@/features/feedback/questions';
import { answerCounts, countLabel, reviewForms, type ProducerFacts } from '@/features/producer/producer';
import { cx } from '@/utils/cx';
import styles from './AnswerDistributionCard.module.scss';

const optionClasses = [styles.option1, styles.option2, styles.option3];
const legend = ['Первый вариант', 'Второй вариант', 'Третий вариант'];

/** Share of each chosen option per question; not an NPS or an overall rating. */
export function AnswerDistributionCard({ facts }: { facts: ProducerFacts }) {
  return (
    <Card
      as="section"
      title="Как слушатели оценили выступления"
      titleAs="h2"
      actions={<Badge tone="muted">{countLabel(facts.feedback.length, reviewForms)}</Badge>}
      description="Распределение фактически выбранных вариантов из публичной формы отзыва. Это не NPS и не общий рейтинг."
    >
      <ul className={styles.bars}>
        {feedbackQuestions.map((question) => {
          const counts = answerCounts(facts, question.key);
          const total = counts[0] + counts[1] + counts[2];
          const summary = question.options.map((option, index) => `${option} — ${counts[index]}`).join(' · ');

          return (
            <li key={question.key}>
              <div className={styles.row}>
                <span className={styles.question}>{question.title}</span>
                <div className={styles.track} role="img" aria-label={`${question.title} ${summary}`}>
                  {counts.map((count, index) => (
                    <span
                      key={index}
                      className={cx(styles.segment, optionClasses[index])}
                      style={{ width: total ? `${(100 * count) / total}%` : 0 }}
                    />
                  ))}
                </div>
                <span className={styles.micro} aria-hidden="true">{counts.join(' / ')}</span>
              </div>
              <p className={styles.micro} aria-hidden="true">{summary}</p>
            </li>
          );
        })}
      </ul>
      <div className={styles.legend} aria-hidden="true">
        {legend.map((label, index) => (
          <span key={label}>
            <i className={cx(styles.dot, optionClasses[index])} />
            {label}
          </span>
        ))}
      </div>
    </Card>
  );
}
