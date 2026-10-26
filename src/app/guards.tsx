import { Navigate, Outlet, useLocation } from 'react-router';
import { roleBasePath } from '@/app/navigation';
import { useAuth } from '@/auth/useAuth';
import { AppLayout } from '@/components/layout/AppLayout/AppLayout';
import { AppStoreProvider } from '@/store/AppStoreProvider';
import { useAppState } from '@/store/useAppStore';
import type { Role } from '@/types/role';

/** Signed-in area: without a session the user goes to the login page and comes back afterwards. */
export function ProtectedArea() {
  const { session } = useAuth();
  const location = useLocation();
  if (!session) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return (
    <AppStoreProvider key={session.user.id} user={session.user}>
      <Outlet />
    </AppStoreProvider>
  );
}

/** A role section opens only for its own role; the other one is redirected home. */
export function RoleSection({ role }: { role: Role }) {
  const { role: own } = useAppState();
  return own === role ? <AppLayout role={role} /> : <Navigate to={roleBasePath[own]} replace />;
}

export function Home() {
  return <Navigate to={roleBasePath[useAppState().role]} replace />;
}
