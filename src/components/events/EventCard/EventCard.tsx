import type { ReactNode } from 'react';
import { Badge, Card } from '@/components/ui';
import { isCfpClosed } from '@/features/events/events';
import type { TechEvent } from '@/types/domain';
import { formatLongDate } from '@/utils/date';
import styles from './EventCard.module.scss';

export interface EventCardProps {
  event: TechEvent;
  showPublicationState?: boolean;
  /** Role-specific buttons: "Подробнее" for speakers, "Изменить"/"Опубликовать" for DevRel. */
  actions: ReactNode;
}

/** Event summary: status, CFP state, date, place, topic and deadline. */
export function EventCard({ event, actions, showPublicationState = true }: EventCardProps) {
  const published = event.state === 'published';
  const cfpClosed = isCfpClosed(event);

  return (
    <Card as="article" className={styles.card}>
      <div className={styles.top}>
        <p className={styles.location}>{[event.format, event.city].filter(Boolean).join(' · ')}</p>
        <div className={styles.badges}>
          {showPublicationState && <Badge tone={published ? 'brand' : 'muted'}>{published ? 'Опубликовано' : 'Черновик'}</Badge>}
          {/* CFP state matters only once applications can be submitted. */}
          {published && event.cfp && <Badge tone={cfpClosed ? 'warning' : 'brand'}>{cfpClosed ? 'CFP закрыт' : 'CFP открыт'}</Badge>}
        </div>
      </div>

      <h2 className={styles.title}>{event.name}</h2>
      <time dateTime={event.date} className={styles.date}>{formatLongDate(event.date)}</time>
      <p className={styles.description}>{event.description}</p>
      {event.topic && <p className={styles.topics}><Badge tone="muted">{event.topic}</Badge></p>}

      <div className={styles.footer}>
        <p className={styles.deadline}>
          {published ? <>CFP до: <strong>{event.cfp ? formatLongDate(event.cfp) : '—'}</strong></> : 'Ещё не опубликовано'}
        </p>
        <div className={styles.actions}>{actions}</div>
      </div>
    </Card>
  );
}
