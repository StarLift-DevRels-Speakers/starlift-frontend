import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './EmptyState.module.scss';

export interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /** Next step, e.g. "Изменить критерии" / "Повторить" / "Посмотреть тариф". */
  action?: ReactNode;
  /** `dashed` for empty lists inside a page, `plain` inside cards. */
  variant?: 'dashed' | 'plain';
  className?: string;
}

/**
 * Placeholder for empty / insufficient data / error / locked states.
 * Never fill it with made-up results: explain what's missing and offer a next step.
 */
export function EmptyState({ title, description, icon, action, variant = 'dashed', className }: EmptyStateProps) {
  return (
    <div className={cx(styles.empty, styles[variant], className)}>
      {icon && <div className={styles.icon} aria-hidden="true">{icon}</div>}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
