import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader/PageHeader';
import { NotificationList } from '@/components/notifications/NotificationList/NotificationList';
import { Badge, Button, Card, EmptyState, FilterChips, Stack } from '@/components/ui';
import { useDemoActions, useDemoState } from '@/store/useDemoStore';
import type { Role } from '@/types/role';

type NotificationFilter = 'all' | 'unread';

export interface NotificationsPageProps {
  role: Role;
}

/** System notifications about applications, invitations, purchases and feedback. */
export function NotificationsPage({ role }: NotificationsPageProps) {
  const notifications = useDemoState().notifications[role];
  const { markNotificationsRead } = useDemoActions();
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const shown = filter === 'unread' ? notifications.filter((notification) => !notification.read) : notifications;

  return (
    <>
      <PageHeader
        title="Уведомления"
        description="Системные уведомления о заявках, приглашениях, подписках и отзывах."
        actions={
          <Button variant="secondary" disabled={unreadCount === 0} onClick={() => markNotificationsRead(role)}>
            Отметить всё прочитанным
          </Button>
        }
      />

      <Stack>
        <FilterChips
          label="Показать:"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: `Все · ${notifications.length}` },
            { value: 'unread', label: `Непрочитанные · ${unreadCount}` },
          ]}
        />

        <Card as="section" aria-label="Уведомления">
          {shown.length > 0 ? (
            <NotificationList
              notifications={shown}
              renderAction={(notification) =>
                notification.read ? (
                  <Badge tone="muted">Прочитано</Badge>
                ) : (
                  <Button
                    variant="soft"
                    size="sm"
                    aria-label={`Отметить прочитанным: ${notification.text}`}
                    onClick={() => markNotificationsRead(role, notification.id)}
                  >
                    Прочитано
                  </Button>
                )
              }
            />
          ) : (
            <EmptyState
              variant="plain"
              title={filter === 'unread' ? 'Непрочитанных уведомлений нет' : 'Уведомлений пока нет'}
              description={filter === 'unread' ? 'Все уведомления прочитаны.' : 'Здесь появятся события по заявкам, приглашениям и покупкам.'}
            />
          )}
        </Card>
      </Stack>
    </>
  );
}
