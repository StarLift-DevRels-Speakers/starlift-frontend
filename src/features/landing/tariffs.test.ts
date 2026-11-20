import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatRub, planDescriptions, rightPrices, roleRights, subscriptions } from '../billing/pricing.ts';
import { freeTitle, splitFeatures, tariffNote, tariffPlans } from './tariffs.ts';

describe('лендинг: тарифы', () => {
  it('показывает три плана: бесплатный и две подписки', () => {
    const plans = tariffPlans();
    assert.deepEqual(
      plans.map((plan) => plan.id),
      ['free', 'speaker', 'devrel'],
    );
    assert.equal(plans[0].title, freeTitle);
    assert.equal(plans[0].price, 0);
    assert.equal(plans[0].rights.length, 0);
    assert.equal(plans[0].role, null);
  });

  it('цены и названия подписок совпадают с источником', () => {
    const [, speaker, devrel] = tariffPlans();
    assert.equal(speaker.price, subscriptions.speaker.price);
    assert.equal(speaker.priceLabel, formatRub(subscriptions.speaker.price));
    assert.equal(speaker.title, subscriptions.speaker.title);
    assert.equal(devrel.price, subscriptions.devrel.price);
    assert.equal(devrel.priceLabel, formatRub(subscriptions.devrel.price));
    assert.equal(devrel.title, subscriptions.devrel.title);
  });

  it('состав подписок берётся из описаний платформы', () => {
    const [, speaker, devrel] = tariffPlans();
    assert.equal(speaker.description, planDescriptions.speaker.subscription);
    assert.equal(devrel.description, planDescriptions.devrel.subscription);
    assert.deepEqual(speaker.features, splitFeatures(planDescriptions.speaker.subscription));
    assert.deepEqual(devrel.features, splitFeatures(planDescriptions.devrel.subscription));
    assert.ok(speaker.features.length >= 2 && devrel.features.length >= 2);
  });

  it('ровно один план выделен как рекомендуемый', () => {
    const popular = tariffPlans().filter((plan) => plan.popular);
    assert.equal(popular.length, 1);
    assert.equal(popular[0].id, 'speaker');
  });

  it('разовые права совпадают по составу и цене', () => {
    const [, speaker, devrel] = tariffPlans();
    assert.deepEqual(
      speaker.rights.map((right) => right.price),
      roleRights.speaker.map((right) => rightPrices[right]),
    );
    assert.deepEqual(
      devrel.rights.map((right) => right.price),
      roleRights.devrel.map((right) => rightPrices[right]),
    );
    for (const plan of [speaker, devrel]) {
      for (const right of plan.rights) {
        assert.equal(right.priceLabel, formatRub(right.price), right.label);
        assert.ok(right.description.length > 0);
      }
      assert.equal(plan.cta, 'Подключить');
    }
    assert.equal(tariffNote, 'Покупки в MVP тестовые: деньги не списываются.');
  });

  it('режет описание на пункты и убирает точку', () => {
    assert.deepEqual(splitFeatures('Публикации, AI-подбор, слабые сигналы.'), ['Публикации', 'AI-подбор', 'слабые сигналы']);
    assert.deepEqual(splitFeatures('Один пункт'), ['Один пункт']);
  });
});
