import type { ReactNode } from 'react';
import styles from './PageHeader.module.scss';

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Small uppercase label above the title. */
  eyebrow?: ReactNode;
  /** Page-level actions, e.g. "+ Создать доклад". */
  actions?: ReactNode;
}

export function PageHeader({ title, description, eyebrow = 'StarLift / MVP 1.0', actions }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
