import { useState } from 'react';
import { DemoPurchaseNotice } from '@/components/billing/DemoPurchaseNotice/DemoPurchaseNotice';
import { PurchaseConfirmModal } from '@/components/billing/PurchaseConfirmModal/PurchaseConfirmModal';
import { Alert, Button, Card, Grid, Modal, Stack } from '@/components/ui';
import { formatRub, rightLabels, rightPrices, subscriptions, type PurchaseType } from '@/features/billing/pricing';
import type { RightType } from '@/types/domain';
import type { Role } from '@/types/role';
import styles from './PaywallModal.module.scss';

export interface PaywallModalProps {
  role: Role;
  /** Operation the user tried to run. */
  right: RightType;
  onClose: () => void;
  /** Called after a successful test purchase, e.g. to retry the blocked operation. */
  onPurchased: () => void;
}

const aiReason = 'Бесплатный AI-запрос уже использован. Дальше — разовая покупка или подписка.';

const paywallReasons: Record<RightType, string> = {
  publication: 'Создание черновиков бесплатно, а публикация доступна по подписке или после разовой покупки.',
  match_devrel: aiReason,
  match_speaker: aiReason,
};

/** Paid-access flow: choose a one-time purchase or a subscription, then confirm the test purchase. */
export function PaywallModal({ role, right, onClose, onPurchased }: PaywallModalProps) {
  const [selected, setSelected] = useState<PurchaseType | null>(null);

  if (selected) {
    return (
      <PurchaseConfirmModal
        role={role}
        type={selected}
        cancelLabel="Назад"
        onCancel={() => setSelected(null)}
        onPurchased={onPurchased}
      />
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Нужен платный доступ"
      size="lg"
      footer={<Button variant="secondary" onClick={onClose}>Отмена</Button>}
    >
      <Stack gap={4}>
        <Alert tone="warning">{paywallReasons[right]}</Alert>
        <Grid columns={2}>
          <Card variant="flat" title="Разовое приобретение" titleAs="h3">
            <p className={styles.price}>{formatRub(rightPrices[right])}</p>
            <p className={styles.note}>{rightLabels[right]} · 1 использование</p>
            <Button fullWidth className={styles.action} onClick={() => setSelected(right)}>Тестово приобрести</Button>
          </Card>
          <Card variant="flat" title="Подписка" titleAs="h3">
            <p className={styles.price}>{formatRub(subscriptions[role].price)}</p>
            <p className={styles.note}>Доступ к функциям тарифа в течение месяца</p>
            <Button fullWidth variant="secondary" className={styles.action} onClick={() => setSelected('subscription')}>
              Тестово оформить
            </Button>
          </Card>
        </Grid>
        <DemoPurchaseNotice />
      </Stack>
    </Modal>
  );
}
