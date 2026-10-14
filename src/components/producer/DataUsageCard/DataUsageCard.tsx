import { Alert, Card, Stack } from '@/components/ui';
import { CheckList } from '../CheckList/CheckList';

const stages = [
  'Сбор фактов: отзывы за 12 месяцев, история выступлений, доклады и открытые CFP.',
  'Поиск повторяющихся ответов. Единичные мнения не считаются устойчивым паттерном.',
  'Рекомендации с источниками и сроками; проверка ссылок на реальные записи.',
  'Новая версия плана сохраняется отдельно от предыдущей.',
];

/** How the producer turns the data into a plan. */
export function DataUsageCard() {
  return (
    <Card as="section" title="Как используются данные" titleAs="h2">
      <Stack gap={3}>
        <CheckList items={stages.map((text, index) => ({ status: String(index + 1), text }))} />
        <Alert tone="info">
          Демонстрационные 30/60 дней показывают возможный формат. Конкретные правила сроков и модельные настройки
          подлежат согласованию.
        </Alert>
      </Stack>
    </Card>
  );
}
