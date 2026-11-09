import type { Session } from '@/auth/session';

export const demoEnabled = import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === 'true';
export const emptyDemo = import.meta.env.VITE_DEMO_SCENARIO === 'empty';

export function demoSession(): Session {
  const { pathname } = window.location;
  const devrel = pathname === '/devrel' || pathname.startsWith('/devrel/');
  return {
    accessToken: 'demo-access', refreshToken: 'demo-refresh',
    user: {
      id: devrel ? -2 : -1, username: devrel ? 'demo-devrel' : 'demo-speaker',
      firstName: devrel ? 'Мария' : 'Алексей', lastName: devrel ? 'Смирнова' : 'Петров',
      roles: [devrel ? 'DEVREL' : 'SPEAKER'],
    },
  };
}
