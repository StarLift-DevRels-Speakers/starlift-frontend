import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './Alert.module.scss';

export type AlertTone = 'info' | 'neutral' | 'warning' | 'danger';

export interface AlertProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  tone?: AlertTone;
  title?: ReactNode;
  /** Overrides the default tone glyph; pass `null` to hide it. */
  icon?: ReactNode;
}

const defaultIcons: Record<AlertTone, string> = {
  info: 'i',
  neutral: 'ℹ',
  warning: '!',
  danger: '×',
};

/**
 * Inline system message. Static by default; pass `role="status"` (or `"alert"` for errors)
 * when it appears in response to a user action so screen readers announce it.
 */
export function Alert({ tone = 'info', title, icon, className, children, ...rest }: AlertProps) {
  const glyph = icon === undefined ? defaultIcons[tone] : icon;

  return (
    <div className={cx(styles.alert, styles[tone], className)} {...rest}>
      {glyph !== null && <span className={styles.icon} aria-hidden="true">{glyph}</span>}
      <div className={styles.body}>
        {title && <strong className={styles.title}>{title}</strong>}
        {children}
      </div>
    </div>
  );
}
