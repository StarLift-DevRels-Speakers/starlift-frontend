import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './Card.module.scss';

export type CardVariant = 'default' | 'flat' | 'ai';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  variant?: CardVariant;
  /** Semantic element: `section`/`article` when the card is a standalone block. */
  as?: 'div' | 'section' | 'article' | 'li';
  title?: ReactNode;
  description?: ReactNode;
  /** Heading level for the title; `h2` also uses the larger section title style. */
  titleAs?: 'h2' | 'h3' | 'h4';
  /** Header-level actions next to the title, e.g. a "Все →" link. */
  actions?: ReactNode;
}

export function Card({
  variant = 'default',
  as: Component = 'div',
  title,
  description,
  titleAs: Title = 'h3',
  actions,
  className,
  children,
  ...rest
}: CardProps) {
  const hasHeader = Boolean(title || description || actions);

  return (
    <Component className={cx(styles.card, styles[variant], className)} {...rest}>
      {hasHeader && (
        <header className={styles.header}>
          <div className={styles.heading}>
            {title && <Title className={cx(styles.title, Title === 'h2' && styles.sectionTitle)}>{title}</Title>}
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      {children}
    </Component>
  );
}
