import { NavLink } from 'react-router';
import { navigationSections, rolePath, type NavItem } from '@/app/navigation';
import { ResetDemoButton } from '@/components/common/ResetDemoButton/ResetDemoButton';
import { BrandLogo } from '@/components/layout/BrandLogo/BrandLogo';
import { WorkspaceIcon } from '@/components/layout/WorkspaceIcon/WorkspaceIcon';
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

interface MenuLinkProps {
  role: Role;
  item: NavItem;
  onNavigate: () => void;
}

function MenuLink({ role, item, onNavigate }: MenuLinkProps) {
  return (
    <NavLink
      to={rolePath(role, item.slug)}
      end={item.slug === ''}
      className={({ isActive }) => cx(styles.link, isActive && styles.active)}
      onClick={onNavigate}
    >
      <WorkspaceIcon name={item.icon} />
      {item.title}
    </NavLink>
  );
}

export function Sidebar({ id, role, user, hasSubscription, open, inert, onNavigate }: SidebarProps) {
  return (
    <aside id={id} className={cx(styles.sidebar, open && styles.open)} inert={inert}>
      <BrandLogo to={rolePath(role)} className={styles.brand} onClick={onNavigate} />

      <nav aria-label="Основная навигация" className={styles.nav}>
        {navigationSections[role].map(({ title, items }, index) => (
          <div key={title} className={styles.menuSection}>
            <p id={`${id}-group-${index}`} className={styles.section}>{title}</p>
            <ul className={styles.list} aria-labelledby={`${id}-group-${index}`}>
              {items.flatMap((item) => item.children ?? [item]).map((item) => (
                <li key={item.slug}>
                  <MenuLink role={role} item={item} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
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
