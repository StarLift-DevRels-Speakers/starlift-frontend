import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { EmptyState } from '@/components/ui';

export interface PlaceholderPageProps {
  title: string;
}

/** Stub for sections that haven't been ported from the mockups yet. */
export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState
        icon="◌"
        title="Раздел в разработке"
        description="Экран будет перенесён из макета StarLift на следующих шагах."
      />
    </>
  );
}
