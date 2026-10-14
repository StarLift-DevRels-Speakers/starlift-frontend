import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './Badge.module.scss';

export type BadgeTone = 'brand' | 'muted' | 'warning' | 'ai' | 'danger';

export interface BadgeProps extends ComponentPropsWithRef<'span'> {
  tone?: BadgeTone;
  icon?: ReactNode;
}

/** Status/label pill. Color is never the only signal: always pass meaningful text. */
export function Badge({ tone = 'brand', icon, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[tone], className)} {...rest}>
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
