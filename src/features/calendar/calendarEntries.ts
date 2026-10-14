import type { Application, Invitation, Speech, Talk, TechEvent } from '@/types/domain';
import { rolePath } from '@/app/navigation';
import type { Role } from '@/types/role';
import { parseDay, todayKey } from '@/utils/date';

// The calendar is an alternate view of existing events, CFPs, talks and invitations:
// there are no separately created calendar records.

export type CalendarEntryKind = 'performance' | 'cfp' | 'invite' | 'event';

export interface CalendarEntry {
  id: string;
  /** Day key `YYYY-MM-DD`. */
  date: string;
  kind: CalendarEntryKind;
  title: string;
  detail: string;
  /** Menu slug of the section the entry belongs to. */
  section: string;
  /** Source event, when the entry comes from one. */
  eventId?: string;
}

export const calendarKinds: Record<CalendarEntryKind, { label: string; icon: string }> = {
  performance: { label: 'Выступление', icon: '🎤' },
  cfp: { label: 'Дедлайн CFP', icon: '◷' },
  invite: { label: 'Приглашение', icon: '✉' },
  event: { label: 'Мероприятие', icon: '▦' },
};

export const calendarLegendKinds: Record<Role, CalendarEntryKind[]> = {
  speaker: ['performance', 'cfp', 'invite'],
  devrel: ['event', 'cfp', 'invite'],
};

export interface CalendarSource {
  talks: Talk[];
  speeches: Speech[];
  events: TechEvent[];
  applications: Application[];
  invitations: Invitation[];
}

const kindOrder: CalendarEntryKind[] = ['cfp', 'invite', 'performance', 'event'];

/** Collects entries with valid dates and returns them sorted by day, then by kind. */
function collect(build: (add: (entry: Omit<CalendarEntry, 'id'>) => void) => void): CalendarEntry[] {
  const entries: CalendarEntry[] = [];
  build((entry) => {
    if (!parseDay(entry.date)) return;
    entries.push({ ...entry, id: `${entry.kind}-${entry.title}-${entry.date}-${entries.length}` });
  });
  return entries.sort(
    (a, b) => a.date.localeCompare(b.date) || kindOrder.indexOf(a.kind) - kindOrder.indexOf(b.kind),
  );
}

function speakerEntries(source: CalendarSource): CalendarEntry[] {
  const eventById = new Map(source.events.map((event) => [event.id, event]));

  return collect((add) => {
    for (const speech of source.speeches) {
      const talk = source.talks.find((item) => item.id === speech.talkId);
      add({ date: speech.date, kind: 'performance', title: speech.event, detail: talk?.name ?? 'Мое выступление', section: 'talks' });
    }

    for (const event of source.events) {
      if (event.state === 'published' && event.cfp) {
        add({ date: event.cfp, kind: 'cfp', title: event.name, detail: 'Завершение приема заявок', section: 'events', eventId: event.id });
      }
    }

    for (const invitation of source.invitations) {
      const event = eventById.get(invitation.eventId);
      if (!event || invitation.status === 'declined') continue;
      const accepted = invitation.status === 'accepted';
      add({
        date: event.date,
        kind: accepted ? 'performance' : 'invite',
        title: event.name,
        detail: accepted ? 'Подтвержденное приглашение' : 'Приглашение ожидает вашего ответа',
        section: 'invitations',
        eventId: event.id,
      });
    }

    for (const application of source.applications) {
      const event = eventById.get(application.eventId);
      if (!event || application.status !== 'accepted') continue;
      add({ date: event.date, kind: 'performance', title: event.name, detail: 'Заявка принята · планируемое участие', section: 'applications', eventId: event.id });
    }
  });
}

function devrelEntries(source: CalendarSource): CalendarEntry[] {
  const ownEvents = source.events.filter((event) => event.owner === 'devrel');
  const ownEventById = new Map(ownEvents.map((event) => [event.id, event]));

  return collect((add) => {
    for (const event of ownEvents) {
      add({
        date: event.date,
        kind: 'event',
        title: event.name,
        detail: event.state === 'draft' ? 'Черновик мероприятия' : 'Опубликованное мероприятие',
        section: 'events',
        eventId: event.id,
      });
      if (event.cfp && event.state === 'published') {
        add({ date: event.cfp, kind: 'cfp', title: event.name, detail: 'Завершение приема заявок', section: 'events', eventId: event.id });
      }
    }

    for (const invitation of source.invitations) {
      const event = ownEventById.get(invitation.eventId);
      if (!event || invitation.status !== 'sent') continue;
      add({ date: event.date, kind: 'invite', title: event.name, detail: 'Спикер еще не ответил на приглашение', section: 'applications', eventId: event.id });
    }
  });
}

export function calendarEntriesFor(role: Role, source: CalendarSource): CalendarEntry[] {
  return role === 'speaker' ? speakerEntries(source) : devrelEntries(source);
}

/** Where an entry leads: a speaker's CFP deadline opens the event card, the rest open their section. */
export function entryLink(role: Role, entry: CalendarEntry): string {
  if (role === 'speaker' && entry.kind === 'cfp' && entry.eventId) {
    return `${rolePath('speaker', 'events')}?event=${entry.eventId}`;
  }
  return rolePath(role, entry.section);
}

export function upcomingEntries(entries: CalendarEntry[], limit: number): CalendarEntry[] {
  const today = todayKey();
  return entries.filter((entry) => entry.date >= today).slice(0, limit);
}
