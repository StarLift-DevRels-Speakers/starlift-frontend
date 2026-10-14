import type { BadgeTone } from '@/components/ui';
import type { InvitationStatus } from '@/types/domain';
import type { Role } from '@/types/role';

/** Invitation states worded for each side: the inviting DevRel and the invited speaker. */
export const invitationStatuses: Record<Role, Record<InvitationStatus, { label: string; tone: BadgeTone }>> = {
  devrel: {
    sent: { label: 'Отправлено', tone: 'warning' },
    accepted: { label: 'Принято', tone: 'brand' },
    declined: { label: 'Отклонено', tone: 'danger' },
  },
  speaker: {
    sent: { label: 'Ожидает ответа', tone: 'warning' },
    accepted: { label: 'Принято', tone: 'brand' },
    declined: { label: 'Отклонено', tone: 'danger' },
  },
};
