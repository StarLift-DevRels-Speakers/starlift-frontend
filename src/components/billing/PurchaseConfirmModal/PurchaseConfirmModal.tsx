import { Alert, Button, Modal, Stack } from '@/components/ui';
import { formatRub, rightLabels, rightPrices, subscriptions, type PurchaseType } from '@/features/billing/pricing';
import { useDemoActions } from '@/store/useDemoStore';
import type { Role } from '@/types/role';
import styles from './PurchaseConfirmModal.module.scss';

export interface PurchaseConfirmModalProps {
  role: Role;
  type: PurchaseType;
  /** Secondary button: "Назад" inside a multi-step flow, "Отмена" otherwise. */
  cancelLabel?: string;
  onCancel: () => void;
  /** Called after the test purchase has been recorded. */
  onPurchased: () => void;
}

/** Last step of any purchase: shows what is bought and states that no money is charged. */
export function PurchaseConfirmModal({ role, type, cancelLabel = 'Отмена', onCancel, onPurchased }: PurchaseConfirmModalProps) {
  const { purchase } = useDemoActions();
  const isSubscription = type === 'subscription';
  const title = isSubscription ? subscriptions[role].title : rightLabels[type];
  const price = isSubscription ? subscriptions[role].price : rightPrices[type];

  return (
    <Modal
      open
      onClose={onCancel}
      title="Подтверждение тестовой покупки"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
          <Button
            onClick={() => {
              purchase(role, type);
              onPurchased();
            }}
          >
            Подтвердить тестовую покупку
          </Button>
        </>
      }
    >
      <Stack gap={3}>
        <Alert tone="warning" title="Демонстрационный режим">
          Это не настоящий платеж. Деньги не списываются; платежные данные не требуются.
        </Alert>
        <div className={styles.summary}>
          <strong>{title}</strong>
          <strong className={styles.price}>{formatRub(price)}</strong>
        </div>
        <p className={styles.note}>
          {isSubscription
            ? 'Период действия: один месяц с даты оформления.'
            : 'Предоставляется право на одно успешное выполнение операции.'}
        </p>
      </Stack>
    </Modal>
  );
}
