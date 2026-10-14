import type { ReactNode } from 'react';
import { Badge } from '@/components/ui';
import styles from './AiResultCard.module.scss';

export interface AiResultCardProps {
  title: string;
  subtitle: ReactNode;
  /** Avatar for people, nothing for events. */
  leading?: ReactNode;
  /** Why it matches, based on available data only. */
  reasons: { title: string; items: string[] };
  /** Unknowns and limitations; never present guesses as facts. */
  caveats: { title: string; items: string[] };
  actions: ReactNode;
}

/** One AI match with its grounds and caveats, as the design system requires for AI output. */
export function AiResultCard({ title, subtitle, leading, reasons, caveats, actions }: AiResultCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <div className={styles.heading}>
          {leading}
          <div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
        </div>
        <Badge tone="ai">Возможное совпадение</Badge>
      </div>

      <div className={styles.columns}>
        {[reasons, caveats].map((group) => (
          <div key={group.title}>
            <strong className={styles.groupTitle}>{group.title}</strong>
            <ul className={styles.list}>
              {group.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className={styles.actions}>{actions}</div>
    </article>
  );
}
