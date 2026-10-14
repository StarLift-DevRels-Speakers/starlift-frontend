import { Badge } from '@/components/ui';
import { invitationStatuses } from '@/features/invitations/invitationStatus';
import type { InvitationStatus } from '@/types/domain';
import type { Role } from '@/types/role';

export interface InvitationStatusBadgeProps {
  status: InvitationStatus;
  /** Whose point of view the label uses. */
  role: Role;
}

export function InvitationStatusBadge({ status, role }: InvitationStatusBadgeProps) {
  const { label, tone } = invitationStatuses[role][status];
  return <Badge tone={tone}>{label}</Badge>;
}
