import { cx } from '@/utils/cx';
import styles from './Meter.module.scss';

export interface MeterProps {
  /** Current value, clamped to 0..max. */
  value: number;
  max?: number;
  /** Accessible name, e.g. "Заполненность профиля". */
  label: string;
  /** Shows the label and percentage above the bar. */
  showLabel?: boolean;
  className?: string;
}

export function Meter({ value, max = 100, label, showLabel = false, className }: MeterProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? Math.round((clamped / max) * 100) : 0;

  return (
    <div className={cx(styles.meter, className)}>
      {showLabel && (
        <div className={styles.header} aria-hidden="true">
          <span>{label}</span>
          <span className={styles.value}>{percent}%</span>
        </div>
      )}
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamped}
        aria-valuetext={`${percent}%`}
        className={styles.track}
      >
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
