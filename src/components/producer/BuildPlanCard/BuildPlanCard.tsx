import { Alert, Button, Card } from '@/components/ui';

export interface BuildPlanCardProps {
  hasPlans: boolean;
  ready: boolean;
  onBuild: () => void;
}

/** Builds the first plan or a new version from the current reviews. */
export function BuildPlanCard({ hasPlans, ready, onBuild }: BuildPlanCardProps) {
  return (
    <Card
      as="section"
      title="Сформировать или обновить план"
      titleAs="h2"
      description="Учитываются актуальные структурированные отзывы и выбранные данные профиля."
      actions={<Button onClick={onBuild}>{hasPlans ? 'Пересобрать план' : 'Сформировать план развития'}</Button>}
    >
      {!ready && (
        <Alert tone="warning">
          Базовых данных недостаточно: для демонстрационного плана требуется не менее 3 отзывов, доклад и выступление.
        </Alert>
      )}
    </Card>
  );
}
