import { rolePath } from '@/app/navigation';
import { NotificationList } from '@/components/notifications/NotificationList/NotificationList';
import { Card, EmptyState, LinkButton } from '@/components/ui';
import type { AppNotification } from '@/types/domain';
import type { Role } from '@/types/role';

export interface NotificationsCardProps {
  role: Role;
  notifications: AppNotification[];
}

/** Latest notifications with a link to the full list. */
export function NotificationsCard({ role, notifications }: NotificationsCardProps) {
  return (
    <Card
      as="section"
      title="Последние уведомления"
      titleAs="h2"
      actions={<LinkButton to={rolePath(role, 'notifications')} variant="text" size="sm">Все →</LinkButton>}
    >
      {notifications.length > 0 ? (
        <NotificationList notifications={notifications} />
      ) : (
        <EmptyState title="Новых уведомлений нет" />
      )}
    </Card>
  );
}
