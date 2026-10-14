import type { AiOutcome, Billing, RightType } from '@/types/domain';
import type { Role } from '@/types/role';
import { isSubscriptionActive } from '@/features/billing/access';

export const aiRight: Record<Role, RightType> = {
  speaker: 'match_speaker',
  devrel: 'match_devrel',
};

/** What pays for a run: subscription → free trial → purchased attempt; null when nothing is available. */
export type AiPayment = 'subscription' | 'trial' | 'right';

export function aiPayment(billing: Billing, role: Role): AiPayment | null {
  if (isSubscriptionActive(billing)) return 'subscription';
  if (!billing.trialUsed) return 'trial';
  if (billing.rights[aiRight[role]] > 0) return 'right';
  return null;
}

/** Only completed requests are charged; failures keep the trial or the purchased attempt. */
export function isChargedOutcome(outcome: AiOutcome): boolean {
  return outcome === 'success' || outcome === 'empty';
}

export const aiOutcomeOptions: { value: AiOutcome; label: string }[] = [
  { value: 'success', label: 'Успешный подбор' },
  { value: 'empty', label: 'Нет подходящих результатов' },
  { value: 'insufficient', label: 'Недостаточно данных' },
  { value: 'error', label: 'Техническая ошибка AI' },
];
