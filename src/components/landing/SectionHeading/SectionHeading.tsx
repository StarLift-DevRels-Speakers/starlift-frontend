import { cx } from '@/utils/cx';
import styles from './SectionHeading.module.scss';

export interface SectionHeadingProps {
  kicker: string;
  title: string;
  description?: string;
  /** Section number shown before the kicker, e.g. `/ 01`. */
  step?: string;
  /** Centered heading above a grid of cards. */
  centered?: boolean;
  className?: string;
}

/** Same four-pointed star as the logo mark; decorative, slowly spinning. */
function Star({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m12 1 3.2 7.8L23 12l-7.8 3.2L12 23l-3.2-7.8L1 12l7.8-3.2Z" />
    </svg>
  );
}

/** Kicker, title and lead of a landing section; keeps the rhythm identical across blocks. */
export function SectionHeading({ kicker, title, description, step, centered = false, className }: SectionHeadingProps) {
  return (
    <header className={cx(styles.heading, centered && styles.centered, className)}>
      <span className={cx(styles.star, styles.starOne)} aria-hidden="true"><Star /></span>
      <span className={cx(styles.star, styles.starTwo)} aria-hidden="true"><Star /></span>
      <span className={cx(styles.star, styles.starThree)} aria-hidden="true"><Star /></span>

      <p className={styles.kicker}>
        {step && <span className={styles.step}>{step}</span>}
        {kicker}
      </p>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
    </header>
  );
}
