import type { BadgeTone } from '@/components/ui';
import { isCfpOpen, isEventPast } from '@/features/events/events';
import type { Application, ApplicationStatus, Talk, TechEvent } from '@/types/domain';

// The full status list and transition rules are still pending approval (Q-03 of the functional spec).
export const applicationStatuses: Record<ApplicationStatus, { label: string; tone: BadgeTone }> = {
  sent: { label: 'На рассмотрении', tone: 'warning' },
  accepted: { label: 'Принята', tone: 'brand' },
  reserve: { label: 'Резерв', tone: 'muted' },
  rejected: { label: 'Отклонена', tone: 'danger' },
};

/**
 * A talk change (approved by the DevRel) can be requested once at a time: for a pending application
 * while the CFP is open, for an accepted one until the event is over.
 */
export function canRequestTalkChange(application: Application, event: TechEvent | undefined): boolean {
  if (!event || application.talkChange || isEventPast(event)) return false;
  if (application.status === 'sent') return isCfpOpen(event);
  return application.status === 'accepted';
}

/** Talks taken by the speaker's applications to the event, including requested changes. */
function talksInUse(eventId: string, applications: readonly Application[], exceptId?: string): Set<string> {
  const used = new Set<string>();
  for (const item of applications) {
    if (item.eventId !== eventId || item.id === exceptId) continue;
    used.add(item.talkId);
    if (item.talkChange) used.add(item.talkChange.talkId);
  }
  return used;
}

/** Talks to switch to: not the current one and not one used by another application to the same event. */
export function replacementTalks(application: Application, applications: readonly Application[], talks: readonly Talk[]): Talk[] {
  const used = talksInUse(application.eventId, applications);
  return talks.filter((talk) => !used.has(talk.id));
}

/** Another application to the same event already uses (or requests) this talk. */
export function isTalkTaken(application: Application, talkId: string, applications: readonly Application[]): boolean {
  return talksInUse(application.eventId, applications, application.id).has(talkId);
}
