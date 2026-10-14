import { Link } from 'react-router';
import { cx } from '@/utils/cx';
import styles from './StatCard.module.scss';

export interface StatCardProps {
  label: string;
  /** Numbers render large; text values (statuses, dates) use a smaller size. */
  value: number | string;
  /** Caption under the value; for links — where it leads, e.g. "Перейти к докладам". */
  hint?: string;
  /** Makes the whole tile a link to the section it summarises. */
  to?: string;
}

/** Counter tile; clickable when `to` is set. */
export function StatCard({ label, value, hint, to }: StatCardProps) {
  const content = (
    <>
      <span className={styles.label}>{label}</span>
      <span className={cx(styles.value, typeof value === 'string' && styles.textValue)}>{value}</span>
      {hint && (
        <span className={styles.hint}>
          {hint} {to && <span aria-hidden="true">↗</span>}
        </span>
      )}
    </>
  );

  return to ? (
    <Link to={to} className={cx(styles.stat, styles.link)}>{content}</Link>
  ) : (
    <div className={styles.stat}>{content}</div>
  );
}
