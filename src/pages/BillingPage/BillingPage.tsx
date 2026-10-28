import { useState } from 'react';
import { DemoPurchaseNotice } from '@/components/billing/DemoPurchaseNotice/DemoPurchaseNotice';
import { PlanCard } from '@/components/billing/PlanCard/PlanCard';
import { PurchaseConfirmModal } from '@/components/billing/PurchaseConfirmModal/PurchaseConfirmModal';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { Badge, Button, Card, EmptyState, Grid, Stack, Table, useToast } from '@/components/ui';
import { isSubscriptionActive } from '@/features/billing/access';
import {
  formatRub,
  planDescriptions,
  rightDescriptions,
  rightPrices,
  roleRights,
  subscriptions,
  type PurchaseType,
} from '@/features/billing/pricing';
import { useAppState } from '@/store/useAppStore';
import type { Purchase, RightType } from '@/types/domain';
import type { Role } from '@/types/role';
import { formatLongDate } from '@/utils/date';
import styles from './BillingPage.module.scss';

const rightCardTitles: Record<RightType, string> = {
  publication: 'Публикация мероприятия',
  match_devrel: 'Один AI-подбор спикеров',
  match_speaker: 'Один AI-подбор мероприятий',
};

const rightBalanceLabels: Record<RightType, string> = {
  publication: 'Публикации мероприятий',
  match_devrel: 'AI-подбор спикеров',
  match_speaker: 'AI-подбор мероприятий',
};

export interface BillingPageProps {
  role: Role;
}

/** Free features, test one-time purchases and the monthly subscription of the role. */
export function BillingPage({ role }: BillingPageProps) {
  const billing = useAppState().billing[role];
  const { toast } = useToast();
  const [purchaseType, setPurchaseType] = useState<PurchaseType | null>(null);

  const subscribed = isSubscriptionActive(billing);
  const subscription = subscriptions[role];

  return (
    <>
      <PageHeader
        title="Тарифы и подписка"
        description="Бесплатные функции, разовые тестовые приобретения и платная подписка."
        actions={<Badge tone="warning">Только демонстрационный режим</Badge>}
      />

      <Stack>
        <DemoPurchaseNotice />

        <Grid columns={3}>
          <StatCard label="Текущий доступ" value={subscribed ? 'PAID' : 'FREE'} />
          <StatCard label="Пробный AI-подбор" value={billing.trialUsed ? 'Использован' : 'Доступен'} />
          <StatCard
            label="Подписка до"
            value={subscribed && billing.expires ? formatLongDate(billing.expires) : 'Не оформлена'}
          />
        </Grid>

        <section aria-labelledby="plans-title">
          <h2 id="plans-title" className={styles.sectionTitle}>Тарифы и разовые операции</h2>
          <Grid columns={3}>
            <PlanCard
              title="Бесплатный доступ"
              price={0}
              description={planDescriptions[role].free}
              action={<Badge>Доступен всем пользователям</Badge>}
            />
            <PlanCard
              highlighted
              title={subscription.title}
              badge={<Badge tone="ai">Подписка</Badge>}
              price={subscription.price}
              period="/ мес."
              description={planDescriptions[role].subscription}
              action={
                <Button fullWidth disabled={subscribed} onClick={() => setPurchaseType('subscription')}>
                  {subscribed ? 'Подписка активна' : 'Тестово оформить подписку'}
                </Button>
              }
            />
            {roleRights[role].map((right) => (
              <PlanCard
                key={right}
                title={rightCardTitles[right]}
                badge={<Badge tone="muted">Разовая операция</Badge>}
                price={rightPrices[right]}
                period="/ раз"
                description={rightDescriptions[right]}
                action={
                  <Button fullWidth variant="secondary" onClick={() => setPurchaseType(right)}>
                    Тестово приобрести
                  </Button>
                }
              />
            ))}
            <Card as="section" title="Остаток разовых операций">
              <ul className={styles.balance}>
                {roleRights[role].map((right) => (
                  <li key={right}>
                    <span>{rightBalanceLabels[right]}</span>
                    <strong>{billing.rights[right]}</strong>
                  </li>
                ))}
              </ul>
            </Card>
          </Grid>
        </section>

        <Card as="section" title="История тестовых покупок" titleAs="h2">
          {billing.history.length > 0 ? (
            <Table<Purchase>
              caption="История тестовых покупок"
              rows={billing.history}
              getRowKey={(purchase) => purchase.id}
              columns={[
                { key: 'title', header: 'Приобретение' },
                { key: 'price', header: 'Цена в момент покупки', render: (purchase) => formatRub(purchase.price) },
                { key: 'at', header: 'Дата', render: (purchase) => formatLongDate(purchase.at) },
                { key: 'status', header: 'Статус', render: () => <Badge tone="muted">Тестовая покупка</Badge> },
              ]}
            />
          ) : (
            <EmptyState variant="plain" title="Приобретений еще нет" />
          )}
        </Card>
      </Stack>

      {purchaseType && (
        <PurchaseConfirmModal
          role={role}
          type={purchaseType}
          onCancel={() => setPurchaseType(null)}
          onPurchased={() => {
            setPurchaseType(null);
            toast('Тестовая покупка оформлена. Реальной оплаты не было.');
          }}
        />
      )}
    </>
  );
}
