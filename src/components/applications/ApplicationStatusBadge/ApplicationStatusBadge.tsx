import { Badge } from '@/components/ui';
import { applicationStatuses } from '@/features/applications/applicationStatus';
import type { ApplicationStatus } from '@/types/domain';

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, tone } = applicationStatuses[status];
  return <Badge tone={tone}>{label}</Badge>;
}
