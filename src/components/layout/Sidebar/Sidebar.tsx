import { NavLink } from 'react-router';
import { navigation, rolePath } from '@/app/navigation';
import { ResetDemoButton } from '@/components/common/ResetDemoButton/ResetDemoButton';
import { BrandLogo } from '@/components/layout/BrandLogo/BrandLogo';
import { Avatar } from '@/components/ui';
import type { UserProfile } from '@/types/domain';
import { roleLabels, type Role } from '@/types/role';
import { cx } from '@/utils/cx';
import styles from './Sidebar.module.scss';

export interface SidebarProps {
  id: string;
  role: Role;
  user: UserProfile;
  hasSubscription: boolean;
  /** Drawer state on narrow screens; ignored on desktop. */
  open: boolean;
  /** Hides the drawer from keyboard and screen readers while it's closed. */
  inert: boolean;
  onNavigate: () => void;
}

export function Sidebar({ id, role, user, hasSubscription, open, inert, onNavigate }: SidebarProps) {
  return (
    <aside id={id} className={cx(styles.sidebar, open && styles.open)} inert={inert}>
      <BrandLogo to={rolePath(role)} className={styles.brand} />

      <nav aria-label="Основная навигация" className={styles.nav}>
        <p className={styles.section}>Рабочее пространство</p>
        <ul className={styles.list}>
          {navigation[role].map((item) => (
            <li key={item.slug}>
              <NavLink
                to={rolePath(role, item.slug)}
                end={item.slug === ''}
                className={({ isActive }) => cx(styles.link, isActive && styles.active)}
                onClick={onNavigate}
              >
                <span className={styles.icon} aria-hidden="true">{item.icon}</span>
                {item.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.account}>
        <div className={styles.accountUser}>
          <Avatar name={user.name} decorative />
          <div className={styles.accountText}>
            <strong className={styles.accountName}>{user.name}</strong>
            <span className={styles.accountMeta}>{roleLabels[role]}</span>
          </div>
        </div>
        <p className={styles.accountPlan}>
          {hasSubscription ? 'Подписка активна' : 'Базовый доступ · FREE'}
        </p>
        <ResetDemoButton className={styles.reset} />
      </div>
    </aside>
  );
}
