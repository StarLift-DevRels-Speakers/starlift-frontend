import type { Application, Invitation, TechEvent } from '@/types/domain';
import { parseDay, toDayKey } from '@/utils/date';

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

/** The event day is over: invitations and decisions on applications no longer make sense. */
export function isEventPast(event: TechEvent, now = new Date()): boolean {
  return event.date < toDayKey(now);
}

/** Case-insensitive search by name, topic and city. */
export function matchesEventQuery(event: TechEvent, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return `${event.name} ${event.topic} ${event.city}`.toLowerCase().includes(needle);
}

/** The speaker already takes part: an application was accepted or an invitation was confirmed. */
export function isSpeakerConfirmed(
  eventId: string,
  applications: readonly Application[],
  invitations: readonly Invitation[],
): boolean {
  return applications.some((item) => item.eventId === eventId && item.status === 'accepted')
    || invitations.some((item) => item.eventId === eventId && item.status === 'accepted');
}

/** An invitation to the event awaits the speaker's answer. */
export function hasPendingInvitation(eventId: string, invitations: readonly Invitation[]): boolean {
  return invitations.some((item) => item.eventId === eventId && item.status === 'sent');
}
