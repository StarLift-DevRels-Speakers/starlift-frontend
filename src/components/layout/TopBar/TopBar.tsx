import type { Ref } from 'react';
import { Link, useNavigate } from 'react-router';
import { rolePath, type NavItem } from '@/app/navigation';
import { Avatar, Badge } from '@/components/ui';
import type { UserProfile } from '@/types/domain';
import { roleLabels, type Role } from '@/types/role';
import styles from './TopBar.module.scss';

export interface TopBarProps {
  role: Role;
  user: UserProfile;
  hasSubscription: boolean;
  unreadNotifications: number;
  /** Current menu items, outermost first; the last one is the current page. */
  trail: ReadonlyArray<NavItem>;
  sidebarId: string;
  sidebarOpen: boolean;
  onMenuToggle: () => void;
  /** Lets the layout return focus to the menu button when the drawer closes. */
  menuButtonRef?: Ref<HTMLButtonElement>;
}

export function TopBar({ role, user, hasSubscription, unreadNotifications, trail, sidebarId, sidebarOpen, onMenuToggle, menuButtonRef }: TopBarProps) {
  const navigate = useNavigate();

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
          <span aria-hidden="true">☰</span>
        </button>

        <nav aria-label="Хлебные крошки" className={styles.crumbs}>
          <ol>
            <li>StarLift</li>
            <li>
              <Link to={rolePath(role)}>{roleLabels[role]}</Link>
            </li>
            {trail.map((item, index) => (
              <li key={item.slug} aria-current={index === trail.length - 1 ? 'page' : undefined}>{item.title}</li>
            ))}
          </ol>
        </nav>
      </div>

      <div className={styles.right}>
        <Badge tone={hasSubscription ? 'brand' : 'muted'} className={styles.plan}>
          {hasSubscription ? '● Подписка PAID' : '○ FREE'}
        </Badge>

        {/* Demo-only account switch until authentication is connected. */}
        <select
          className={styles.roleSwitch}
          aria-label="Демо-переключение учётной записи"
          value={role}
          onChange={(event) => navigate(rolePath(event.target.value as Role))}
        >
          <option value="speaker">🎤 Спикер · демо</option>
          <option value="devrel">👥 DevRel · демо</option>
        </select>

        <Link
          to={rolePath(role, 'notifications')}
          className={styles.iconButton}
          aria-label={unreadNotifications > 0 ? `Уведомления, непрочитанных: ${unreadNotifications}` : 'Уведомления'}
        >
          <span aria-hidden="true">🔔</span>
          {unreadNotifications > 0 && (
            <span className={styles.counter} aria-hidden="true">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>
          )}
        </Link>

        <Avatar name={user.name} size="sm" />
      </div>
    </header>
  );
}
