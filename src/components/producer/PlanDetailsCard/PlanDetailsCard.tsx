import { Alert, Badge, Card, Grid, Stack } from '@/components/ui';
import { countLabel, PLAN_SECTION_ID } from '@/features/producer/producer';
import type { DevelopmentPlan } from '@/types/domain';
import { formatLongDate } from '@/utils/date';
import { FeedbackRefButton } from '../FeedbackRefButton/FeedbackRefButton';
import shared from '../producer.module.scss';
import styles from './PlanDetailsCard.module.scss';

/** Latest saved plan: conclusions, 30/60-day steps with evidence, and the data snapshot. */
export function PlanDetailsCard({ plan }: { plan: DevelopmentPlan }) {
  return (
    <Card
      as="section"
      id={PLAN_SECTION_ID}
      tabIndex={-1}
      title={`Персональный план · версия ${plan.version}`}
      titleAs="h2"
      description={`Сформирован ${formatLongDate(plan.at)} — демонстрационная версия, без вызова модели.`}
      actions={<Badge tone="ai">Сохраненная версия</Badge>}
    >
      <Stack>
        <Grid columns={2}>
          <Alert tone="info" title="Подтвержденные сильные стороны">{plan.strong}</Alert>
          <Alert tone="warning" title="Направление развития">{plan.improve}</Alert>
        </Grid>

        <div>
          <div className={styles.subheader}>
            <h3 className={shared.h3}>Пошаговый план на 30/60 дней</h3>
            <Badge tone="muted">{countLabel(plan.steps.length, ['действие', 'действия', 'действий'])}</Badge>
          </div>
          <ol className={styles.timeline}>
            {plan.steps.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <div>
                  <p className={styles.phase}>{step.phase}</p>
                  <p className={styles.date}>до {formatLongDate(step.due)}</p>
                </div>
                <div>
                  <h4 className={styles.stepTitle}>{index + 1}. {step.title}</h4>
                  <p className={styles.stepText}>{step.description}</p>
                  <span className={shared.micro}>Основание: </span>
                  {step.feedbackIds.length > 0
                    ? step.feedbackIds.map((id) => <FeedbackRefButton key={id} feedbackId={id} />)
                    : <span className={shared.micro}>следующая проверка по новым отзывам</span>}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <hr className={shared.divider} />

        <Grid columns={2}>
          <div>
            <h3 className={shared.h3}>Обоснование и снимок данных</h3>
            <p className={shared.muted}>{plan.source}</p>
          </div>
          <div>
            <h3 className={shared.h3}>Проверка вывода</h3>
            <p className={shared.muted}>
              Подтверждены повторяющиеся ответы; ссылки на отзывы существуют. Рекомендации не являются автоматическим
              решением о квалификации спикера.
            </p>
          </div>
        </Grid>

        <Alert tone="neutral">
          В реальном продукте модель, версия промпта и детальный отчет верификации должны приходить от сервера. В этом
          прототипе AI не вызывается; эти поля не подделываются.
        </Alert>
      </Stack>
    </Card>
  );
}
