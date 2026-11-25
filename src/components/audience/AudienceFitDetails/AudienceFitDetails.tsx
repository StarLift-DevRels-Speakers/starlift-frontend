import type { AudienceFitCheckDto } from '@/api/types';
import { Alert, Badge, Meter } from '@/components/ui';
import { checkLabel, checkTone, confidenceLabels, primaryAudience } from '@/features/audience/audienceFit';
import styles from './AudienceFitDetails.module.scss';

export interface AudienceFitDetailsProps {
  check: AudienceFitCheckDto;
}

/** Full result of an audience fit check: verdict, criteria, issues tied to slides and strengths. */
export function AudienceFitDetails({ check }: AudienceFitDetailsProps) {
  const result = check.result;

  if (check.status === 'pending') {
    return <Alert tone="info" role="status">{check.message ?? 'Проверяем материал…'} Обычно это занимает до минуты.</Alert>;
  }
  if (!result) {
    return <Alert tone={check.status === 'insufficient_data' ? 'warning' : 'danger'}>{check.message ?? 'Не удалось проверить материал.'}</Alert>;
  }

  return (
    <div className={styles.details}>
      <div className={styles.head}>
        <Badge tone={checkTone(check)} icon="✦">{checkLabel(check)}</Badge>
        <span className={styles.source}>
          {[check.talkName && `Доклад «${check.talkName}»`, check.fileName && `файл «${check.fileName}»`].filter(Boolean).join(', ')}
        </span>
      </div>

      {primaryAudience(result) && <p className={styles.source}>Оценено для аудитории: {primaryAudience(result)}</p>}
      {result.summary && <p className={styles.summary}>{result.summary}</p>}

      {result.profileConfidence === 'low' && (
        <Alert tone="warning">
          Об аудитории мероприятия известно мало (уверенность {confidenceLabels.low}), поэтому оценка приблизительная.
        </Alert>
      )}
      {result.truncated && <Alert tone="neutral">Материал длинный: проверена только его первая часть.</Alert>}

      <section aria-label="Оценка по критериям" className={styles.criteria}>
        {result.criteria.map((criterion) => (
          <div key={criterion.key} className={styles.criterion}>
            <div className={styles.criterionHead}>
              <span>{criterion.label}</span>
              <span className={styles.score}>{criterion.score}/10</span>
            </div>
            <Meter value={criterion.score} max={10} label={criterion.label} />
            {criterion.comment && <p className={styles.comment}>{criterion.comment}</p>}
          </div>
        ))}
      </section>

      {result.visual && (
        <section aria-label="Наглядность презентации" className={styles.visual}>
          <span>Слайдов: <strong>{result.visual.slides}</strong></span>
          <span>с картинками или схемами: <strong>{result.visual.slidesWithImages}</strong></span>
          <span>в среднем слов на слайде: <strong>{result.visual.averageWords}</strong></span>
          {result.visual.wallOfTextSlides.length > 0 && (
            <span>перегружены текстом: <strong>{result.visual.wallOfTextSlides.length}</strong></span>
          )}
        </section>
      )}

      {result.issues.length > 0 && (
        <section>
          <h4 className={styles.heading}>Что поправить для этой аудитории</h4>
          <ul className={styles.list}>
            {result.issues.map((issue) => (
              <li key={`${issue.fragmentId}-${issue.problem}`} className={styles.item}>
                <span className={styles.fragment}>{issue.label}</span>
                {issue.quote && <blockquote className={styles.quote}>{issue.quote}</blockquote>}
                <p>{issue.problem}</p>
                {issue.fix && <p className={styles.fix}>→ {issue.fix}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.strengths.length > 0 && (
        <section>
          <h4 className={styles.heading}>Что зайдёт аудитории</h4>
          <ul className={styles.list}>
            {result.strengths.map((strength) => (
              <li key={strength.fragmentId} className={styles.item}>
                <span className={styles.fragment}>{strength.label}</span>
                <p>{strength.why}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
