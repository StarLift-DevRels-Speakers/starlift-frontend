import { rolePath } from '@/app/navigation';
import { Badge, Card, LinkButton } from '@/components/ui';
import { accessSummary } from '@/features/billing/access';
import type { Role } from '@/types/role';
import styles from './AccessCard.module.scss';

export interface AccessCardProps {
  role: Role;
  hasSubscription: boolean;
}

/** Current plan and what is free for the role. */
export function AccessCard({ role, hasSubscription }: AccessCardProps) {
  return (
    <Card
      as="section"
      title="Мой доступ"
      titleAs="h2"
      actions={<Badge tone={hasSubscription ? 'brand' : 'muted'}>{hasSubscription ? 'PAID' : 'FREE'}</Badge>}
    >
      <p className={styles.text}>{accessSummary[role]}</p>
      <LinkButton to={rolePath(role, 'billing')} variant="secondary" size="sm">Тарифы и покупки</LinkButton>
    </Card>
  );
}
