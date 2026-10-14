import type { RightType } from '@/types/domain';
import type { Role } from '@/types/role';

// Prices from the mockup; they are a preliminary hypothesis, purchases in the MVP are test-only.

export const rightPrices: Record<RightType, number> = {
  publication: 390,
  match_devrel: 199,
  match_speaker: 149,
};

export const rightLabels: Record<RightType, string> = {
  publication: 'Публикация мероприятия',
  match_devrel: 'AI-подбор спикеров',
  match_speaker: 'AI-подбор мероприятий',
};

export const subscriptions: Record<Role, { title: string; price: number }> = {
  speaker: { title: 'Расширение возможностей', price: 1190 },
  devrel: { title: 'Рабочая подписка', price: 1990 },
};

export type PurchaseType = RightType | 'subscription';

const rubFormat = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

/** «390 ₽» */
export function formatRub(amount: number): string {
  return rubFormat.format(amount);
}

/** What each plan includes, per role. */
export const planDescriptions: Record<Role, { free: string; subscription: string }> = {
  speaker: {
    free: 'Профиль, доклады, ручной поиск мероприятий, заявки и ответы на приглашения.',
    subscription: 'Персональный план, расширенные AI-рекомендации, подбор мероприятий.',
  },
  devrel: {
    free: 'Каталог спикеров и отзывы, создание черновиков мероприятий, обработка заявок.',
    subscription: 'Публикации, AI-подбор, слабые сигналы, расширенная аналитика.',
  },
};

/** One-time operations available to each role. */
export const roleRights: Record<Role, RightType[]> = {
  speaker: ['match_speaker'],
  devrel: ['match_devrel', 'publication'],
};

export const rightDescriptions: Record<RightType, string> = {
  publication: 'Одно право публикации черновика без подписки.',
  match_devrel: 'Одно успешное выполнение операции, если нет подписки и пробный запрос уже использован.',
  match_speaker: 'Одно успешное выполнение операции, если нет подписки и пробный запрос уже использован.',
};
