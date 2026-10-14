import type { CalendarEntryKind } from '@/features/calendar/calendarEntries';
import { cx } from '@/utils/cx';
import styles from './EventDot.module.scss';

export interface EventDotProps {
  kind: CalendarEntryKind;
  className?: string;
}

/** Decorative color marker of a calendar entry kind; always pair it with a text label. */
export function EventDot({ kind, className }: EventDotProps) {
  return <span className={cx(styles.dot, styles[kind], className)} aria-hidden="true" />;
}
