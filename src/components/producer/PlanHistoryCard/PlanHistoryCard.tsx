import { Badge, Card, EmptyState } from '@/components/ui';
import { countLabel } from '@/features/producer/producer';
import type { DevelopmentPlan } from '@/types/domain';
import { formatLongDate } from '@/utils/date';
import styles from './PlanHistoryCard.module.scss';

/** All saved plan versions, newest first; the current one is expanded. */
export function PlanHistoryCard({ plans }: { plans: DevelopmentPlan[] }) {
  const newestFirst = [...plans].reverse();

  return (
    <Card
      as="section"
      title="История версий плана"
      titleAs="h2"
      actions={<Badge tone="muted">{countLabel(plans.length, ['версия', 'версии', 'версий'])}</Badge>}
    >
      {newestFirst.length > 0 ? (
        newestFirst.map((plan, index) => (
          <details key={plan.id} className={styles.version} open={index === 0}>
            <summary className={styles.summary}>
              Версия {plan.version} · {formatLongDate(plan.at)}{index === 0 && ' · текущая'}
            </summary>
            <dl className={styles.archive}>
              <div><dt>Сильная сторона:</dt> <dd>{plan.strong}</dd></div>
              <div><dt>Зона развития:</dt> <dd>{plan.improve}</dd></div>
              <div><dt>Основание:</dt> <dd>{plan.source}</dd></div>
              {plan.steps.length > 0 && <div><dt>Шагов:</dt> <dd>{plan.steps.length}</dd></div>}
            </dl>
          </details>
        ))
      ) : (
        <EmptyState variant="plain" title="Версий пока нет" />
      )}
    </Card>
  );
}
