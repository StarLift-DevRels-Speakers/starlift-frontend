// Relative imports with extensions: the copy is also imported by a node:test file that runs without Vite aliases.
import { pluralize } from '../../utils/plural.ts';
import type { EventTeaser } from './content.ts';

export interface EventCard extends EventTeaser {
  /** Day of the month of the CFP deadline, e.g. `25`. */
  readonly day: string;
  /** Short month name, e.g. `окт`. */
  readonly month: string;
  /** Machine-readable deadline day. */
  readonly iso: string;
  /** Human deadline, e.g. «через 3 дня». */
  readonly deadline: string;
}

const monthName = new Intl.DateTimeFormat('ru-RU', { month: 'short' });

/** Deadline phrase: «сегодня», «завтра», «через 3 дня». */
export function deadlineLabel(daysLeft: number): string {
  if (daysLeft <= 0) return 'сегодня';
  if (daysLeft === 1) return 'завтра';
  return `через ${daysLeft} ${pluralize(daysLeft, ['день', 'дня', 'дней'])}`;
}

/** Teaser → card with a date tile and a human deadline, counted from `today`. */
export function eventCards(items: readonly EventTeaser[], today = new Date()): EventCard[] {
  return items.map((item) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + item.daysLeft);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return {
      ...item,
      day: String(date.getDate()).padStart(2, '0'),
      month: monthName.format(date).replace('.', ''),
      iso,
      deadline: deadlineLabel(item.daysLeft),
    };
  });
}
