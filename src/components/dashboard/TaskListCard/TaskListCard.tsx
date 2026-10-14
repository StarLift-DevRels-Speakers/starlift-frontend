import type { ReactNode } from 'react';
import { Card } from '@/components/ui';
import styles from './TaskListCard.module.scss';

export interface TaskListCardProps {
  title?: string;
  /** `TaskItem` rows. */
  children: ReactNode;
}

/** "Требуют внимания" block: a short list of next actions. */
export function TaskListCard({ title = 'Требуют внимания', children }: TaskListCardProps) {
  return (
    <Card as="section" title={title} titleAs="h2">
      <ul className={styles.list}>{children}</ul>
    </Card>
  );
}
