import type { HTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
import styles from './Grid.module.scss';

export interface GridProps extends HTMLAttributes<HTMLElement> {
  columns: 2 | 3;
  /** Collapse columns on narrow screens: 3 → 2 (≤900px) → 1 (≤650px). */
  responsive?: boolean;
  as?: 'div' | 'ul' | 'section';
}

/** Equal-width columns from the design system (`sl-grid--2/3`). */
export function Grid({ columns, responsive = true, as: Component = 'div', className, ...rest }: GridProps) {
  return (
    <Component
      className={cx(styles.grid, styles[`columns${columns}`], responsive && styles.responsive, className)}
      {...rest}
    />
  );
}
