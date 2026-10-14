import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './IconTile.module.scss';

export interface IconTileProps {
  /** Decorative emoji or icon. */
  children: ReactNode;
  className?: string;
}

/** Square tinted tile with a decorative icon, e.g. at the start of a list item. */
export function IconTile({ children, className }: IconTileProps) {
  return (
    <span className={cx(styles.tile, className)} aria-hidden="true">
      {children}
    </span>
  );
}
