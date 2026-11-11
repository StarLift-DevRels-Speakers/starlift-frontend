import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useId, useRef, type Ref } from 'react';
import { Link, useLocation } from 'react-router';
import { rolePath } from '@/app/navigation';
import { useAuth } from '@/auth/useAuth';
import { BrandLogo } from '@/components/layout/BrandLogo/BrandLogo';
import { WorkspaceIcon } from '@/components/layout/WorkspaceIcon/WorkspaceIcon';
import { WorkspaceNav } from '@/components/layout/WorkspaceNav/WorkspaceNav';
import { NotificationList } from '@/components/notifications/NotificationList/NotificationList';
import { demoEnabled } from '@/demo/config';
import { Avatar, Badge, Button, useToast } from '@/components/ui';
import { useAppActions } from '@/store/useAppStore';
import type { AppNotification, UserProfile } from '@/types/domain';
import { roleLabels, type Role } from '@/types/role';
import styles from './TopBar.module.scss';

export interface TopBarProps {
  role: Role;
  user: UserProfile;
  hasSubscription: boolean;
  notifications: AppNotification[];
  sidebarId: string;
  sidebarOpen: boolean;
  onMenuToggle: () => void;
  /** Lets the layout return focus to the menu button when the drawer closes. */
  menuButtonRef?: Ref<HTMLButtonElement>;
}

export function TopBar({ role, user, hasSubscription, notifications, sidebarId, sidebarOpen, onMenuToggle, menuButtonRef }: TopBarProps) {
  const { signOut } = useAuth();
  const { pathname } = useLocation();
  const { markNotificationsRead } = useAppActions();
  const { toast } = useToast();
  const notificationsId = useId();
  const notificationsPanel = useRef<HTMLDivElement>(null);
  const unreadNotifications = notifications.filter((notification) => !notification.read).length;

  const markAllRead = async () => {
    const result = await markNotificationsRead();
    if (!result.ok) toast(result.error);
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          ref={menuButtonRef}
          type="button"
          className={styles.menuButton}
          aria-controls={sidebarId}
          aria-expanded={sidebarOpen}
          aria-label={sidebarOpen ? 'Закрыть меню' : 'Открыть меню'}
          onClick={onMenuToggle}
        >
          <WorkspaceIcon name="menu" />
        </button>

        <BrandLogo to={rolePath(role)} className={styles.brand} />
        <span className={styles.role}>{roleLabels[role]}</span>
      </div>

      <WorkspaceNav key={pathname} role={role} pathname={pathname} />

      <div className={styles.right}>
        <ThemeToggle />
        <Badge tone={hasSubscription ? 'brand' : 'muted'} className={styles.plan}>
          {hasSubscription ? '● Подписка PAID' : '○ FREE'}
        </Badge>

        <button
          type="button"
          popoverTarget={notificationsId}
          className={styles.iconButton}
          aria-label={unreadNotifications > 0 ? `Уведомления, непрочитанных: ${unreadNotifications}` : 'Уведомления'}
        >
          <WorkspaceIcon name="bell" />
          {unreadNotifications > 0 && (
            <span className={styles.counter} aria-hidden="true">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>
          )}
        </button>
        <div id={notificationsId} popover="auto" ref={notificationsPanel} className={styles.notifications}>
          <div className={styles.notificationsHeader}>
            <h2>Уведомления</h2>
            <Button variant="text" size="sm" disabled={unreadNotifications === 0} onClick={() => void markAllRead()}>
              Прочитать все
            </Button>
          </div>
          {notifications.length ? (
            <NotificationList notifications={notifications.slice(0, 3)} />
          ) : <p>Уведомлений пока нет</p>}
          <Link to={rolePath(role, 'notifications')} onClick={() => notificationsPanel.current?.hidePopover()}>
            Все уведомления →
          </Link>
        </div>

        <Link to={rolePath(role, 'profile')} aria-label="Мой профиль">
          <Avatar name={user.name} size="sm" decorative />
        </Link>
        {demoEnabled ? (
          <Button variant="text" size="sm" className={styles.signOut} onClick={() => window.location.assign(role === 'speaker' ? '/devrel' : '/speaker')}>
            {role === 'speaker' ? 'Демо: DevRel' : 'Демо: Спикер'}
          </Button>
        ) : <Button variant="text" size="sm" className={styles.signOut} onClick={() => void signOut()}>Выйти</Button>}
      </div>
    </header>
  );
}
