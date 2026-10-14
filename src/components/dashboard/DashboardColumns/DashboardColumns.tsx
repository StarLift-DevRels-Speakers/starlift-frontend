import type { ReactNode } from 'react';
import { Stack } from '@/components/ui';
import styles from './DashboardColumns.module.scss';

export interface DashboardColumnsProps {
  /** Wider left column: tasks and lists. */
  main: ReactNode;
  /** Right column: calendar, features, access. */
  aside: ReactNode;
}

/** Two dashboard columns that stack into one below 1150px. */
export function DashboardColumns({ main, aside }: DashboardColumnsProps) {
  return (
    <div className={styles.columns}>
      <Stack>{main}</Stack>
      <Stack>{aside}</Stack>
    </div>
  );
}
