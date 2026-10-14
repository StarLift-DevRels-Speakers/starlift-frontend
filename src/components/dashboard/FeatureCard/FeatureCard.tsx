import type { ReactNode } from 'react';
import { Badge, Card, type BadgeTone } from '@/components/ui';
import { cx } from '@/utils/cx';
import styles from './FeatureCard.module.scss';

export interface FeatureCardProps {
  icon: string;
  iconTone?: 'brand' | 'ai';
  title: string;
  description: string;
  /** Access status, e.g. "1 бесплатный AI-запрос" / "По подписке". */
  status: string;
  statusTone?: BadgeTone;
  action: ReactNode;
  highlighted?: boolean;
}

/** Entry point to a product feature with its access status. */
export function FeatureCard({
  icon,
  iconTone = 'brand',
  title,
  description,
  status,
  statusTone = 'ai',
  action,
  highlighted = false,
}: FeatureCardProps) {
  return (
    <Card as="section" variant={highlighted ? 'ai' : 'default'} className={styles.card}>
      <div className={styles.top}>
        <span className={cx(styles.icon, styles[iconTone])} aria-hidden="true">{icon}</span>
        <Badge tone={statusTone}>{status}</Badge>
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      <div className={styles.action}>{action}</div>
    </Card>
  );
}
