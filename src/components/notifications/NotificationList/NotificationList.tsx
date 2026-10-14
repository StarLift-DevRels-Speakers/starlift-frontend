import type { ReactNode } from 'react';
import type { AppNotification } from '@/types/domain';
import { formatLongDate } from '@/utils/date';
import styles from './NotificationList.module.scss';

export interface NotificationListProps {
  notifications: AppNotification[];
  /** Per-item control, e.g. a "Прочитано" button. */
  renderAction?: (notification: AppNotification) => ReactNode;
}

/** Notifications with read state; unread ones are announced as new to screen readers. */
export function NotificationList({ notifications, renderAction }: NotificationListProps) {
  return (
    <ul className={styles.list}>
      {notifications.map((notification) => (
        <li key={notification.id} className={styles.item}>
          <span className={styles.icon} aria-hidden="true">{notification.read ? '✓' : '🔔'}</span>
          <div className={styles.text}>
            <strong>
              {!notification.read && <span className={styles.srOnly}>Новое: </span>}
              {notification.text}
            </strong>
            <time dateTime={notification.at} className={styles.date}>{formatLongDate(notification.at)}</time>
          </div>
          {renderAction && <div className={styles.action}>{renderAction(notification)}</div>}
        </li>
      ))}
    </ul>
  );
}
