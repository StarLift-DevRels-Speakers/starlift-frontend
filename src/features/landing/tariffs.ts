// Tariff cards are derived from the platform's own price source: the landing never restates prices by hand.
// Relative import with an extension: the copy is also imported by a node:test file that runs without Vite aliases.
import {
  formatRub,
  planDescriptions,
  rightDescriptions,
  rightLabels,
  rightPrices,
  roleRights,
  subscriptions,
} from '../billing/pricing.ts';
import type { RightType } from '@/types/domain';
import type { Role } from '@/types/role';

export type TariffPlanId = 'free' | 'speaker' | 'devrel';

export interface TariffRight {
  readonly label: string;
  readonly price: number;
  readonly priceLabel: string;
  readonly description: string;
}

export interface TariffPlan {
  readonly id: TariffPlanId;
  /** `null` when the plan is shared by both roles. */
  readonly role: Role | null;
  readonly title: string;
  readonly price: number;
  readonly priceLabel: string;
  readonly period: string;
  readonly description: string;
  /** What the plan includes, one bullet per item. */
  readonly features: readonly string[];
  /** One-time purchases that work without a subscription. */
  readonly rights: readonly TariffRight[];
  readonly cta: string;
  /** The recommended plan: highlighted with the brand outline, without a text label. */
  readonly popular: boolean;
}

export const freeTitle = 'Бесплатно';
export const tariffNote = 'Покупки в MVP тестовые: деньги не списываются.';

/** «Публикации, AI-подбор, слабые сигналы, расширенная аналитика.» → one bullet per item. */
export function splitFeatures(text: string): string[] {
  return text
    .replace(/\.$/, '')
    .split(', ')
    .map((item) => item.trim())
    .filter(Boolean);
}

const freeFeatures = [
  'Профиль, доклады и каталог спикеров',
  'Заявки, приглашения и календарь',
  'Ручной поиск мероприятий',
];

function rightsOf(role: Role): TariffRight[] {
  return roleRights[role].map((right: RightType) => ({
    label: rightLabels[right],
    price: rightPrices[right],
    priceLabel: formatRub(rightPrices[right]),
    description: rightDescriptions[right],
  }));
}

/** Three plans: the shared free level, the speaker subscription and the DevRel subscription. */
export function tariffPlans(): TariffPlan[] {
  return [
    {
      id: 'free',
      role: null,
      title: freeTitle,
      price: 0,
      priceLabel: freeTitle,
      period: 'навсегда',
      description: 'Базовые сценарии обеих ролей: начать можно без карты и пробного периода.',
      features: freeFeatures,
      rights: [],
      cta: 'Начать бесплатно',
      popular: false,
    },
    {
      id: 'speaker',
      role: 'speaker',
      title: subscriptions.speaker.title,
      price: subscriptions.speaker.price,
      priceLabel: formatRub(subscriptions.speaker.price),
      period: 'в месяц',
      description: planDescriptions.speaker.subscription,
      features: splitFeatures(planDescriptions.speaker.subscription),
      rights: rightsOf('speaker'),
      cta: 'Подключить',
      popular: true,
    },
    {
      id: 'devrel',
      role: 'devrel',
      title: subscriptions.devrel.title,
      price: subscriptions.devrel.price,
      priceLabel: formatRub(subscriptions.devrel.price),
      period: 'в месяц',
      description: planDescriptions.devrel.subscription,
      features: splitFeatures(planDescriptions.devrel.subscription),
      rights: rightsOf('devrel'),
      cta: 'Подключить',
      popular: false,
    },
  ];
}
