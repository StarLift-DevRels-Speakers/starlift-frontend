import type { CSSProperties } from 'react';
import { cx } from '@/utils/cx';
import styles from './Skeleton.module.scss';

export interface SkeletonProps {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  /** `text` lines are 12px high, `block` for cards/images, `circle` for avatars. */
  shape?: 'text' | 'block' | 'circle';
  className?: string;
}

/**
 * Loading placeholder. Decorative: wrap the loading region with `aria-busy="true"`
 * and a visible/visually hidden status text ("Формируем рекомендации").
 */
export function Skeleton({ width, height, shape = 'text', className }: SkeletonProps) {
  return (
    <span
      className={cx(styles.skeleton, styles[shape], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
