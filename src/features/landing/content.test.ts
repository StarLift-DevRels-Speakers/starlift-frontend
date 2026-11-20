import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  cardCta,
  devrel,
  events,
  finalCta,
  footer,
  hero,
  landingBlocks,
  landingNav,
  pricing,
  sectionSteps,
  speakers,
} from './content.ts';

/** Anchors that the header navigation and the footer may point at. */
const sectionAnchors = landingBlocks.filter((block) => block !== 'hero' && block !== 'cta');

describe('лендинг: контент', () => {
  it('делит страницу на блоки для спикеров, мероприятий и DevRel', () => {
    assert.deepEqual([...landingBlocks], ['hero', 'speakers', 'events', 'devrel', 'pricing', 'cta']);
  });

  it('навигация ссылается только на объявленные блоки', () => {
    assert.deepEqual(
      landingNav.map((item) => item.block),
      ['speakers', 'events', 'devrel', 'pricing'],
    );
  });

  it('отзывов и лиги на лендинге нет', () => {
    const text = JSON.stringify({ hero, speakers, events, devrel, pricing, finalCta, footer });
    for (const removed of ['Отзыв', 'отзыв', 'Лиг', 'лиг', 'соревнован']) {
      assert.ok(!text.includes(removed), removed);
    }
    assert.ok(!landingBlocks.some((block) => block === ('feedback' as string) || block === ('league' as string)));
  });

  it('блок спикеров держит ровно три карточки', () => {
    assert.equal(speakers.kicker, 'Спикерам');
    assert.ok(speakers.title.length > 0 && speakers.description.length > 0);
    assert.deepEqual(
      speakers.cards.map((card) => card.title),
      ['AI-продюсер: траектория развития', 'AI-подбор мероприятий', 'Анализ речи'],
    );
    assert.deepEqual(
      speakers.cards.map((card) => card.icon),
      ['tag', 'star', 'waveform'],
    );
  });

  it('блок мероприятий показывает ближайшие CFP', () => {
    assert.equal(events.title, 'Ближайшие события и CFP');
    assert.ok(events.description.length > 0);
    assert.equal(events.cta, 'Подать заявку');
    assert.equal(events.catalogueCta, 'Все мероприятия');
    assert.equal(events.items.length, 4);
    for (const item of events.items) {
      assert.ok(item.name.length > 0);
      assert.ok(item.city.length > 0 && item.format.length > 0 && item.level.length > 0);
      assert.ok(item.description.length > 0);
      assert.ok(item.tags.length >= 2);
      assert.ok(item.daysLeft > 0);
    }
  });

  it('блок DevRel показывает каталог, AI-подбор и аналитику', () => {
    assert.equal(devrel.kicker, 'DevRel');
    assert.deepEqual(
      devrel.cards.map((card) => card.title),
      ['Каталог спикеров', 'AI-подбор спикеров', 'Аналитика программы'],
    );
  });

  it('каждая карточка заполнена и держит по 1–3 пункта', () => {
    for (const section of [speakers, devrel]) {
      for (const card of section.cards) {
        assert.ok(card.title.length > 0);
        assert.ok(card.description.length > 0);
        assert.ok(card.bullets.length >= 1 && card.bullets.length <= 3, card.title);
      }
    }
  });

  it('AI-возможности помечены акцентом AI', () => {
    const aiCards = [...speakers.cards, ...devrel.cards].filter((card) => card.ai);
    assert.deepEqual(
      aiCards.map((card) => card.title),
      ['AI-продюсер: траектория развития', 'AI-подбор мероприятий', 'AI-подбор спикеров'],
    );
  });

  it('hero содержит новые формулировки и призывы', () => {
    assert.equal(hero.title, 'Превращайте знания в приглашения на сцену');
    assert.equal(`${hero.titleLead} ${hero.titleAccent}`, hero.title);
    assert.equal(hero.titleLead, 'Превращайте знания');
    assert.equal(hero.titleAccent, 'в приглашения на сцену');
    assert.deepEqual([...hero.titleAccentLines], ['в приглашения', 'на сцену']);
    assert.equal(hero.titleAccentLines.join(' '), hero.titleAccent);
    assert.equal(hero.highlights[0], 'AI-продюсер');
    assert.equal(hero.primaryCta, 'Создать аккаунт');
    assert.equal(hero.secondaryCta, 'Войти');
    assert.deepEqual([...hero.highlights], ['AI-продюсер', 'AI-подбор по вашим темам', 'Каталог спикеров и мероприятий']);
  });

  it('у секций есть номера, у карточек — общий призыв', () => {
    assert.deepEqual(Object.values(sectionSteps), ['/ 01', '/ 02', '/ 03', '/ 04']);
    assert.equal(cardCta, 'Попробовать');
  });

  it('ведущая карточка блока спикеров выделена', () => {
    assert.equal(speakers.cards.filter((card) => card.featured).length, 1);
    assert.equal(speakers.cards[0].featured, true);
  });

  it('тарифы и финальный призыв заполнены', () => {
    assert.ok(pricing.title.length > 0 && pricing.note.length > 0);
    assert.ok(finalCta.title.length > 0 && finalCta.description.length > 0);
  });

  it('подвал ведёт на существующие якоря и страницы', () => {
    const links = footer.columns.flatMap((column) => column.links);
    assert.ok(links.length >= 5);
    for (const link of links) {
      if (link.href.startsWith('#')) {
        assert.ok(sectionAnchors.includes(link.href.slice(1) as (typeof sectionAnchors)[number]), link.href);
      } else {
        assert.ok(link.href.startsWith('/'), link.href);
      }
    }
  });
});
