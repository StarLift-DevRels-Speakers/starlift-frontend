import type { ReactNode } from 'react';
import { Badge, Card } from '@/components/ui';
import { isCfpClosed } from '@/features/events/events';
import type { TechEvent } from '@/types/domain';
import { formatLongDate } from '@/utils/date';
import styles from './EventCard.module.scss';

export interface EventCardProps {
  event: TechEvent;
  /** Role-specific buttons: "Подробнее" for speakers, "Изменить"/"Опубликовать" for DevRel. */
  actions: ReactNode;
}

/** Event summary: status, CFP state, date, place, topic and deadline. */
export function EventCard({ event, actions }: EventCardProps) {
  const published = event.state === 'published';
  const cfpClosed = isCfpClosed(event);

  return (
    <Card as="article" className={styles.card}>
      <div className={styles.top}>
        <div className={styles.badges}>
          <Badge tone={published ? 'brand' : 'muted'}>{published ? 'Опубликовано' : 'Черновик'}</Badge>
          {/* CFP state matters only once applications can be submitted. */}
          {published && event.cfp && <Badge tone={cfpClosed ? 'warning' : 'brand'}>{cfpClosed ? 'CFP закрыт' : 'CFP открыт'}</Badge>}
        </div>
        <time dateTime={event.date} className={styles.date}>{formatLongDate(event.date)}</time>
      </div>

      <h3 className={styles.title}>{event.name}</h3>
      <p className={styles.meta}>{event.city} · {event.format} · {event.topic}</p>
      <p className={styles.description}>{event.description}</p>

      <div className={styles.footer}>
        <p className={styles.deadline}>
          CFP до: <strong>{event.cfp ? formatLongDate(event.cfp) : '—'}</strong>
        </p>
        <div className={styles.actions}>{actions}</div>
      </div>
    </Card>
  );
}
