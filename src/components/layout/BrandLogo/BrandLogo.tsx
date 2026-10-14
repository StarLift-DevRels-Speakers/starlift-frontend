import { Link } from 'react-router';
import { cx } from '@/utils/cx';
import styles from './BrandLogo.module.scss';

export interface BrandLogoProps {
  /** Home link target; renders plain text when omitted. */
  to?: string;
  className?: string;
}

export function BrandLogo({ to, className }: BrandLogoProps) {
  const content = (
    <>
      <span className={styles.mark} aria-hidden="true">S</span>
      StarLift
    </>
  );

  return to ? (
    <Link to={to} className={cx(styles.logo, className)} aria-label="StarLift — на главную">
      {content}
    </Link>
  ) : (
    <span className={cx(styles.logo, className)}>{content}</span>
  );
}
