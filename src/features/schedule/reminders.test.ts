import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ScheduledTalk } from '@/types/domain';
import { activeReminders, countdownLabel, dismissKey, loadDismissed, reminderCopy, saveDismissed } from './reminders.ts';

const talk = (eventId: string, daysLeft: number, reminder?: ScheduledTalk['reminder']): ScheduledTalk => ({
  eventId,
  eventName: `Event ${eventId}`,
  date: '2026-11-17',
  city: 'Москва',
  format: 'Офлайн',
  topic: 'Доклад',
  ownerName: 'DevRel',
  daysLeft,
  ...(reminder && { reminder }),
  googleCalendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE',
});

describe('activeReminders', () => {
  it('keeps only speeches within a week, nearest first', () => {
    const schedule = [talk('far', 12), talk('week', 6, 'week'), talk('today', 0, 'today'), talk('soon', 3, 'three_days')];

    assert.deepEqual(activeReminders(schedule, new Set()).map((item) => item.eventId), ['today', 'soon', 'week']);
  });

  it('hides a dismissed speech only at the stage it was dismissed at', () => {
    const atWeek = talk('a', 5, 'week');
    const dismissed = new Set([dismissKey(atWeek)]);

    assert.deepEqual(activeReminders([atWeek], dismissed), []);
    assert.deepEqual(activeReminders([talk('a', 3, 'three_days')], dismissed).map((item) => item.eventId), ['a']);
  });
});

describe('reminder copy', () => {
  it('shows days left and an exclamation mark on the event day', () => {
    assert.equal(countdownLabel(talk('a', 3, 'three_days')), '3');
    assert.equal(countdownLabel(talk('a', 0, 'today')), '!');
  });

  it('names the event in every stage title', () => {
    for (const copy of Object.values(reminderCopy)) {
      assert.match(copy.title('JPoint'), /«JPoint»/);
    }
  });
});

describe('dismissed reminders storage', () => {
  const memory = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => void memory.set(key, value),
    removeItem: (key: string) => void memory.delete(key),
    clear: () => memory.clear(),
    key: () => null,
    get length() { return memory.size; },
  };

  it('keeps hidden reminders per user and drops speeches no longer scheduled', () => {
    const current = talk('a', 5, 'week');
    saveDismissed('1', new Set([dismissKey(current), 'gone:week']), [current]);

    assert.deepEqual([...loadDismissed('1')], [dismissKey(current)]);
    assert.deepEqual([...loadDismissed('2')], []);
  });

  it('ignores corrupted storage', () => {
    memory.set('starlift-reminders-hidden:3', '{not json');
    assert.deepEqual([...loadDismissed('3')], []);
    memory.set('starlift-reminders-hidden:3', '{"a":1}');
    assert.deepEqual([...loadDismissed('3')], []);
  });
});
