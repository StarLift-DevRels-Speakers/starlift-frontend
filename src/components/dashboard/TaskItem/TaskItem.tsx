import type { ReactNode } from 'react';
import styles from './TaskItem.module.scss';

export interface TaskItemProps {
  title: ReactNode;
  description: ReactNode;
  action: ReactNode;
}

/** Row of a "Требуют внимания" list; render inside a `<ul>`. */
export function TaskItem({ title, description, action }: TaskItemProps) {
  return (
    <li className={styles.task}>
      <div className={styles.text}>
        <strong className={styles.title}>{title}</strong>
        <span className={styles.description}>{description}</span>
      </div>
      <div className={styles.action}>{action}</div>
    </li>
  );
}
