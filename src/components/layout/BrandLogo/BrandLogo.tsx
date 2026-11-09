import { Link } from 'react-router';
import { WorkspaceIcon } from '@/components/layout/WorkspaceIcon/WorkspaceIcon';
import { cx } from '@/utils/cx';
import styles from './BrandLogo.module.scss';

export interface BrandLogoProps {
  /** Home link target; renders plain text when omitted. */
  to?: string;
  className?: string;
  onClick?: () => void;
}

export function BrandLogo({ to, className, onClick }: BrandLogoProps) {
  const content = (
    <>
      <span className={styles.mark}><WorkspaceIcon name="star" /></span>
      StarLift
    </>
  );

  return to ? (
    <Link to={to} className={cx(styles.logo, className)} aria-label="StarLift — на главную" onClick={onClick}>
      {content}
    </Link>
  ) : (
    <span className={cx(styles.logo, className)}>{content}</span>
  );
}
