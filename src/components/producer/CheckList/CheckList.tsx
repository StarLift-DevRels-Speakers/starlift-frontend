import type { ReactNode } from 'react';
import { Badge } from '@/components/ui';
import styles from './CheckList.module.scss';

export interface CheckItem {
  /** Short status in the pill, e.g. «Есть», «Ограничение», «1». */
  status: string;
  /** `pending` — a limitation or missing data. */
  pending?: boolean;
  text: ReactNode;
  /** Right-aligned value, e.g. «3 из 3». */
  value?: ReactNode;
}

/** Rows with a status pill: data checks, limitations, numbered steps. */
export function CheckList({ items }: { items: CheckItem[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item, index) => (
        <li key={index} className={styles.row}>
          <Badge tone={item.pending ? 'warning' : 'brand'} className={styles.status}>{item.status}</Badge>
          <span className={styles.text}>{item.text}</span>
          {item.value && <strong className={styles.value}>{item.value}</strong>}
        </li>
      ))}
    </ul>
  );
}
