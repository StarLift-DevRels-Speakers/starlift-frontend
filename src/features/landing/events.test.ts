import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { events } from './content.ts';
import { deadlineLabel, eventCards } from './events.ts';

describe('лендинг: ближайшие мероприятия', () => {
  it('склоняет дедлайн CFP по-русски', () => {
    assert.equal(deadlineLabel(0), 'сегодня');
    assert.equal(deadlineLabel(1), 'завтра');
    assert.equal(deadlineLabel(3), 'через 3 дня');
    assert.equal(deadlineLabel(5), 'через 5 дней');
    assert.equal(deadlineLabel(11), 'через 11 дней');
    assert.equal(deadlineLabel(21), 'через 21 день');
    assert.equal(deadlineLabel(24), 'через 24 дня');
  });

  it('строит карточку на каждое мероприятие с датой и дедлайном', () => {
    const today = new Date(2026, 9, 20);
    const cards = eventCards(events.items, today);
    assert.equal(cards.length, events.items.length);
    assert.equal(cards.length, 4);

    const [first] = cards;
    assert.equal(first.day, '23');
    assert.equal(first.month, 'окт');
    assert.equal(first.iso, '2026-10-23');
    assert.equal(first.deadline, 'через 3 дня');

    for (const card of cards) {
      assert.match(card.iso, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(card.month.length > 0);
      assert.ok(card.name.length > 0);
      assert.ok(card.tags.length >= 2);
    }
    assert.equal(cards.at(-1)?.deadline, 'через 24 дня');
  });

  it('дедлайны идут от ближнего к дальнему', () => {
    const cards = eventCards(events.items);
    for (let index = 1; index < cards.length; index += 1) {
      assert.ok(cards[index].daysLeft >= cards[index - 1].daysLeft, cards[index].name);
    }
  });
});
