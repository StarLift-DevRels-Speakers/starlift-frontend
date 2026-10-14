import { Alert } from '@/components/ui';

/** Shown wherever prices appear: purchases in the MVP are test-only. */
export function DemoPurchaseNotice({ className }: { className?: string }) {
  return (
    <Alert tone="warning" title="Демонстрационная покупка." className={className}>
      Денежные средства не списываются. Цена — предварительная гипотеза.
    </Alert>
  );
}
