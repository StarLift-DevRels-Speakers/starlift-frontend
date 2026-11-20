import type { Session } from '@/auth/session';
import type { Role } from '@/types/role';

export const demoEnabled = import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === 'true';
export const emptyDemo = import.meta.env.VITE_DEMO_SCENARIO === 'empty';

/** Access token of a session created by the demo entry; a real build must never treat it as signed in. */
export const DEMO_ACCESS_TOKEN = 'demo-access';
const DEMO_REFRESH_TOKEN = 'demo-refresh';

const demoUsers = {
  speaker: { id: -1, username: 'demo-speaker', firstName: 'Алексей', lastName: 'Петров', roles: ['SPEAKER'] },
  devrel: { id: -2, username: 'demo-devrel', firstName: 'Мария', lastName: 'Смирнова', roles: ['DEVREL'] },
} as const;

/** Demo session of an explicit role: used by the demo entry from the login page. */
export function demoSessionForRole(role: Role): Session {
  const user = demoUsers[role];
  return {
    accessToken: DEMO_ACCESS_TOKEN,
    refreshToken: DEMO_REFRESH_TOKEN,
    user: { ...user, roles: [...user.roles] },
  };
}

/** Demo session of the role encoded in the address: `/devrel/*` → DevRel, everything else → speaker. */
export function demoSession(): Session {
  const { pathname } = window.location;
  const devrel = pathname === '/devrel' || pathname.startsWith('/devrel/');
  return demoSessionForRole(devrel ? 'devrel' : 'speaker');
}
