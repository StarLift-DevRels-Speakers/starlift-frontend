import { useEffect, useId, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { findNavTrail, rolePath } from '@/app/navigation';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import { SpeakerReminderBanner } from '@/components/schedule/SpeakerReminderBanner/SpeakerReminderBanner';
import { TopBar } from '@/components/layout/TopBar/TopBar';
import { isSubscriptionActive } from '@/features/billing/access';
import { useDailyCheckIn } from '@/hooks/useDailyCheckIn';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAppState } from '@/store/useAppStore';
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
  const mainRef = useRef<HTMLElement>(null);

  const drawerOpen = isDrawer && menuOpen;
  const { billing, notifications, profile: user } = useAppState();
  const hasSubscription = isSubscriptionActive(billing[role]);
  const trail = findNavTrail(role, pathname);
  const editingProfile = pathname.replace(/\/$/, '') === rolePath(role, 'profile/edit');
  useDailyCheckIn(user.id, role === 'speaker');

  const closeMenu = () => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  useEffect(() => {
    if (!drawerOpen) return;

    document.getElementById(sidebarId)?.querySelector('a')?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen, sidebarId]);

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
        onNavigate={() => {
          if (!drawerOpen) return;
          setMenuOpen(false);
          mainRef.current?.focus();
        }}
      />
      <div className={styles.backdrop} data-open={drawerOpen} aria-hidden="true" onClick={closeMenu} />

      <div className={styles.main}>
        <TopBar
          role={role}
          user={user}
          hasSubscription={hasSubscription}
          notifications={notifications}
          sidebarId={sidebarId}
          sidebarOpen={drawerOpen}
          onMenuToggle={() => setMenuOpen((open) => !open)}
          menuButtonRef={menuButtonRef}
        />
        <main ref={mainRef} id="main-content" className={styles.content} tabIndex={-1}>
          {pathname.replace(/\/$/, '') !== rolePath(role) && (
            <nav aria-label="Хлебные крошки" className={styles.trail}>
              <Link to={rolePath(role)}>Обзор</Link>
              <span aria-hidden="true">/</span>
              {editingProfile ? (
                <>
                  <Link to={rolePath(role, 'profile')}>Мой профиль</Link>
                  <span aria-hidden="true">/</span>
                  <span aria-current="page">Редактирование</span>
                </>
              ) : <span aria-current="page">{trail.at(-1)?.title}</span>}
            </nav>
          )}
          {role === 'speaker' && <SpeakerReminderBanner />}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
