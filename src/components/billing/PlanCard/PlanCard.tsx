import type { ReactNode } from 'react';
import { Card } from '@/components/ui';
import { formatRub } from '@/features/billing/pricing';
import styles from './PlanCard.module.scss';

export interface PlanCardProps {
  title: string;
  /** Plan type marker, e.g. «Подписка» / «Разовая операция». */
  badge?: ReactNode;
  price: number;
  /** «/ мес.», «/ раз»; omitted for free plans. */
  period?: string;
  description: string;
  action: ReactNode;
  highlighted?: boolean;
}

/** Tariff or one-time operation with its price and purchase action. */
export function PlanCard({ title, badge, price, period, description, action, highlighted = false }: PlanCardProps) {
  return (
    <Card as="article" variant={highlighted ? 'ai' : 'default'} className={styles.card}>
      <div className={styles.top}>
        <h3 className={styles.title}>{title}</h3>
        {badge}
      </div>
      <p className={styles.price}>
        {formatRub(price)}
        {period && <span className={styles.period}> {period}</span>}
      </p>
      <p className={styles.description}>{description}</p>
      <div className={styles.action}>{action}</div>
    </Card>
  );
}
