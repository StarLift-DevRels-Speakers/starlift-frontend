import { useEffect, useId, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { findNavTrail } from '@/app/navigation';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import { TopBar } from '@/components/layout/TopBar/TopBar';
import { isSubscriptionActive } from '@/features/billing/access';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useDemoState } from '@/store/useDemoStore';
import type { Role } from '@/types/role';
import styles from './AppLayout.module.scss';

// Keep in sync with the 'tablet' breakpoint in styles/_mixins.scss.
const DRAWER_QUERY = '(max-width: 900px)';

export interface AppLayoutProps {
  role: Role;
}

/** Authenticated workspace: sidebar navigation, top bar and the current page. */
export function AppLayout({ role }: AppLayoutProps) {
  const sidebarId = useId();
  const { pathname } = useLocation();
  const isDrawer = useMediaQuery(DRAWER_QUERY);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const drawerOpen = isDrawer && menuOpen;
  const { billing, notifications, profiles } = useDemoState();
  const user = profiles[role];
  const hasSubscription = isSubscriptionActive(billing[role]);
  const trail = findNavTrail(role, pathname);

  const closeMenu = () => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  useEffect(() => {
    if (!drawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>Перейти к содержимому</a>

      <Sidebar
        id={sidebarId}
        role={role}
        user={user}
        hasSubscription={hasSubscription}
        open={drawerOpen}
        inert={isDrawer && !drawerOpen}
        onNavigate={() => setMenuOpen(false)}
      />
      {drawerOpen && <div className={styles.backdrop} aria-hidden="true" onClick={closeMenu} />}

      <div className={styles.main}>
        <TopBar
          role={role}
          user={user}
          hasSubscription={hasSubscription}
          unreadNotifications={notifications[role].filter((notification) => !notification.read).length}
          trail={trail}
          sidebarId={sidebarId}
          sidebarOpen={drawerOpen}
          onMenuToggle={() => setMenuOpen((open) => !open)}
          menuButtonRef={menuButtonRef}
        />
        <main id="main-content" className={styles.content} tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
