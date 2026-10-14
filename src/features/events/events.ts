import type { TechEvent } from '@/types/domain';
import { parseDay } from '@/utils/date';

/** CFP accepts applications until the end of its deadline day. */
export function isCfpOpen(event: TechEvent, now = new Date()): boolean {
  if (!event.cfp) return false;
  const deadline = parseDay(event.cfp);
  if (!deadline) return false;
  deadline.setHours(23, 59, 59, 999);
  return deadline.getTime() >= now.getTime();
}

export function isCfpClosed(event: TechEvent, now = new Date()): boolean {
  return Boolean(event.cfp) && !isCfpOpen(event, now);
}

/** Case-insensitive search by name, topic and city. */
export function matchesEventQuery(event: TechEvent, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return `${event.name} ${event.topic} ${event.city}`.toLowerCase().includes(needle);
}
