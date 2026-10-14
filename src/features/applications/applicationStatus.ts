import type { BadgeTone } from '@/components/ui';
import type { ApplicationStatus } from '@/types/domain';

// The full status list and transition rules are still pending approval (Q-03 of the functional spec).
export const applicationStatuses: Record<ApplicationStatus, { label: string; tone: BadgeTone }> = {
  sent: { label: 'На рассмотрении', tone: 'warning' },
  accepted: { label: 'Принята', tone: 'brand' },
  reserve: { label: 'Резерв', tone: 'muted' },
  rejected: { label: 'Отклонена', tone: 'danger' },
};
