import { DemoPurchaseNotice } from '@/components/billing/DemoPurchaseNotice/DemoPurchaseNotice';
import { Badge, Button, Card, Stack } from '@/components/ui';
import { formatRub, subscriptions } from '@/features/billing/pricing';
import styles from './ProducerPaywallCard.module.scss';

/** Without the subscription: what it unlocks and a test purchase. */
export function ProducerPaywallCard({ onSubscribe }: { onSubscribe: () => void }) {
  return (
    <Card
      as="section"
      variant="ai"
      title="Персональные рекомендации и план развития"
      titleAs="h2"
      actions={<Badge tone="ai">Доступно по подписке</Badge>}
      description="Сводка исходных данных видна в собственном кабинете. Подтвержденные выводы, пошаговый план, история версий и разбор рекомендаций открываются при подписке Спикера."
    >
      <Stack gap={3}>
        <div className={styles.offer}>
          <p>
            <strong className={styles.price}>{formatRub(subscriptions.speaker.price)}</strong>
            <span className={styles.period}> / месяц · тестовая подписка</span>
          </p>
          <Button onClick={onSubscribe}>Тестово оформить подписку</Button>
        </div>
        <DemoPurchaseNotice />
      </Stack>
    </Card>
  );
}
