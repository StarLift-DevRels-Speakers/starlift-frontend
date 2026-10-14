import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './ListItem.module.scss';

export interface ListItemProps {
  /** Avatar, icon tile or similar. */
  leading?: ReactNode;
  title: ReactNode;
  /** Secondary lines under the title. */
  meta?: ReactNode;
  /** Badges, actions and other content below the text. */
  children?: ReactNode;
  /** Right-aligned control, e.g. an "Изменить" button. */
  trailing?: ReactNode;
  className?: string;
}

/** Row of a divided list (people, requests, files); render inside a `<ul>`. */
export function ListItem({ leading, title, meta, children, trailing, className }: ListItemProps) {
  return (
    <li className={cx(styles.item, className)}>
      {leading && <div className={styles.leading}>{leading}</div>}
      <div className={styles.body}>
        <strong className={styles.title}>{title}</strong>
        {meta && <div className={styles.meta}>{meta}</div>}
        {children && <div className={styles.extra}>{children}</div>}
      </div>
      {trailing && <div className={styles.trailing}>{trailing}</div>}
    </li>
  );
}
