import { Alert, Button, Card } from '@/components/ui';

export interface BuildPlanCardProps {
  hasPlans: boolean;
  ready: boolean;
  /** The model is building a plan: it takes up to a minute. */
  building?: boolean;
  onBuild: () => void;
}

/** Builds the first plan or a new version from the current reviews. */
export function BuildPlanCard({ hasPlans, ready, building = false, onBuild }: BuildPlanCardProps) {
  return (
    <Card
      as="section"
      title="Сформировать или обновить план"
      titleAs="h2"
      description="Учитываются актуальные структурированные отзывы и выбранные данные профиля."
      actions={
        <Button onClick={onBuild} disabled={building}>
          {building ? 'Формируем план…' : hasPlans ? 'Пересобрать план' : 'Сформировать план развития'}
        </Button>
      }
    >
      {!ready && (
        <Alert tone="warning">
          Похоже, данных пока мало: для плана нужно не менее 3 отзывов за последний год.
        </Alert>
      )}
    </Card>
  );
}
