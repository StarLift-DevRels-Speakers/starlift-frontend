import type { ReminderStage, ScheduledTalk } from '@/types/domain';

// Reminder banner: from a week before a speaker's confirmed speech (or a DevRel's own event) to its day.
// The stage comes from the backend; this module decides what to show and what the user hid.

export interface ReminderCopy {
  /** Countdown label next to the big number, e.g. «дней до выступления». */
  kicker: string;
  title: (eventName: string) => string;
  hint: string;
}

/** Speaker: their confirmed speech. */
export const reminderCopy: Record<ReminderStage, ReminderCopy> = {
  week: {
    kicker: 'Осталась неделя',
    title: (eventName) => `Через неделю выступление на «${eventName}»`,
    hint: 'Самое время прогнать доклад целиком и отправить слайды организатору.',
  },
  three_days: {
    kicker: 'Осталось 3 дня',
    title: (eventName) => `Через 3 дня выступление на «${eventName}»`,
    hint: 'Проверьте слайды, демо и тайминг. Уточните у DevRel время и площадку.',
  },
  one_day: {
    kicker: 'Завтра',
    title: (eventName) => `Завтра выступление на «${eventName}»`,
    hint: 'Зарядите ноутбук, возьмите переходники и сохраните презентацию офлайн.',
  },
  today: {
    kicker: 'Сегодня',
    title: (eventName) => `Сегодня ваше выступление на «${eventName}»`,
    hint: 'Удачи на сцене! Не забудьте поделиться ссылкой на форму отзывов со слушателями.',
  },
};

/** DevRel: their own published event. */
export const hostingReminderCopy: Record<ReminderStage, ReminderCopy> = {
  week: {
    kicker: 'Осталась неделя',
    title: (eventName) => `Через неделю ваше мероприятие «${eventName}»`,
    hint: 'Закройте решения по заявкам, соберите слайды спикеров и разошлите программу.',
  },
  three_days: {
    kicker: 'Осталось 3 дня',
    title: (eventName) => `Через 3 дня ваше мероприятие «${eventName}»`,
    hint: 'Подтвердите спикеров и тайминг, проверьте площадку или трансляцию.',
  },
  one_day: {
    kicker: 'Завтра',
    title: (eventName) => `Завтра ваше мероприятие «${eventName}»`,
    hint: 'Напомните спикерам время и место, подготовьте ссылки на формы отзывов.',
  },
  today: {
    kicker: 'Сегодня',
    title: (eventName) => `Сегодня ваше мероприятие «${eventName}»`,
    hint: 'Удачного мероприятия! После выступлений поделитесь со слушателями формой отзывов.',
  },
};

export function copyFor(talk: ScheduledTalk & { reminder: ReminderStage }): ReminderCopy {
  return (talk.kind === 'hosting' ? hostingReminderCopy : reminderCopy)[talk.reminder];
}

/** Countdown number shown in the banner: days left, or «!» on the event day. */
export function countdownLabel(talk: ScheduledTalk): string {
  return talk.daysLeft > 0 ? String(talk.daysLeft) : '!';
}

/** Hiding is per speech and stage: the banner returns at the next stage. */
export function dismissKey(talk: ScheduledTalk): string {
  return `${talk.eventId}:${talk.reminder ?? ''}`;
}

/** Speeches to remind about, nearest first, without the ones the speaker hid at their current stage. */
export function activeReminders(schedule: readonly ScheduledTalk[], dismissed: ReadonlySet<string>): ScheduledTalk[] {
  return schedule
    .filter((talk) => talk.reminder && !dismissed.has(dismissKey(talk)))
    .sort((a, b) => a.daysLeft - b.daysLeft);
}

const storageKey = (userId: string) => `starlift-reminders-hidden:${userId}`;

export function loadDismissed(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []);
  } catch {
    // Storage unavailable or corrupted: show every reminder.
    return new Set();
  }
}

/** Keeps only keys of speeches still in the schedule, so storage does not grow forever. */
export function saveDismissed(userId: string, dismissed: ReadonlySet<string>, schedule: readonly ScheduledTalk[]): void {
  const current = new Set(schedule.map(dismissKey));
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify([...dismissed].filter((key) => current.has(key))));
  } catch {
    // Not critical: the hidden banner comes back after a reload.
  }
}
