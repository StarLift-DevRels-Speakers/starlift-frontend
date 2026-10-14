import type { HTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
import styles from './Stack.module.scss';

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** Spacing scale step: 2 = 8px, 3 = 12px, 4 = 16px (default), 6 = 24px. */
  gap?: 2 | 3 | 4 | 6;
  as?: 'div' | 'ul' | 'section';
}

/** Vertical flow with consistent spacing (`sl-stack`). */
export function Stack({ gap = 4, as: Component = 'div', className, ...rest }: StackProps) {
  return <Component className={cx(styles.stack, styles[`gap${gap}`], className)} {...rest} />;
}
