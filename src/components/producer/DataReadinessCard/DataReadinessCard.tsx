import { Badge, Card } from '@/components/ui';
import { readinessRules, type ProducerFacts } from '@/features/producer/producer';
import { CheckList } from '../CheckList/CheckList';
import styles from '../producer.module.scss';

/** Which conclusions the data supports and what stays unknown. */
export function DataReadinessCard({ facts }: { facts: ProducerFacts }) {
  const items = readinessRules(facts).map((rule) => ({
    status: rule.ok ? 'Есть' : 'Ограничение',
    pending: !rule.ok,
    text: rule.title,
    value: rule.value,
  }));

  return (
    <Card
      as="section"
      title="Полнота исходных данных"
      titleAs="h2"
      actions={<Badge tone={facts.ready ? 'brand' : 'warning'}>{facts.ready ? 'Базовых данных достаточно' : 'Данных недостаточно'}</Badge>}
      description="Проверки показывают, на чем можно строить выводы, а что остается неизвестным. Недоступные показатели не подменяются приблизительными."
    >
      <CheckList items={items} />
      <p className={styles.fineprint}>
        Для устойчивого вывода по одному признаку требуется не менее трех согласованных ответов слушателей. Интервалы
        выборки приведены по описанию ИИ-продюсера; расчет NPS остается недоступным.
      </p>
    </Card>
  );
}
