import type { Billing, RightType } from '@/types/domain';
import type { Role } from '@/types/role';

export function isSubscriptionActive(billing: Billing, now = Date.now()): boolean {
  return billing.expires !== null && new Date(billing.expires).getTime() > now;
}

/** Operation is available by subscription or a remaining one-time right. */
export function hasRight(billing: Billing, type: RightType): boolean {
  return isSubscriptionActive(billing) || billing.rights[type] > 0;
}

/** AI matching access label shown next to the feature: subscription, free trial or neither. */
export function aiAccessLabel(billing: Billing): string {
  if (isSubscriptionActive(billing)) return 'Действующая подписка';
  return billing.trialUsed ? 'Пробный запрос использован' : '1 бесплатный AI-запрос';
}

/** What each role gets for free and what needs a purchase or subscription. */
export const accessSummary: Record<Role, string> = {
  speaker: 'Отклики бесплатны. AI-подбор: 1 пробный запрос, далее разово или по подписке. План развития — по подписке.',
  devrel: 'Каталог Спикеров и отзывы бесплатны. Публикация мероприятий и AI-подбор — по покупке или подписке.',
};
