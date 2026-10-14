import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './DetailList.module.scss';

export interface DetailItem {
  label: string;
  value: ReactNode;
}

export interface DetailListProps {
  items: ReadonlyArray<DetailItem>;
  /** Columns on wide screens; always one column on phones. */
  columns?: 1 | 2;
  className?: string;
}

/** Label/value pairs (dates, formats, statuses) as a description list. */
export function DetailList({ items, columns = 2, className }: DetailListProps) {
  return (
    <dl className={cx(styles.list, columns === 2 && styles.twoColumns, className)}>
      {items.map((item) => (
        <div key={item.label} className={styles.item}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
