import type { Role } from '@/types/role';

// Tokens and the signed-in user, kept in localStorage so a reload stays signed in.
// The API client refreshes tokens here; the auth provider listens for changes.

export interface SessionUser {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

const STORAGE_KEY = 'starlift-session';
const listeners = new Set<(session: Session | null) => void>();
let current: Session | null = load();

function load(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session>;
    return parsed.accessToken && parsed.refreshToken && parsed.user ? (parsed as Session) : null;
  } catch {
    return null;
  }
}

export function getSession(): Session | null {
  return current;
}

export function setSession(session: Session | null): void {
  current = session;
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be unavailable: the session then lives only in memory.
  }
  listeners.forEach((listener) => listener(session));
}

export function subscribeSession(listener: (session: Session | null) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** DEVREL and ADMIN work in the DevRel section; everyone else is a speaker. */
export function roleOf(user: SessionUser): Role {
  return user.roles.includes('DEVREL') || user.roles.includes('ADMIN') ? 'devrel' : 'speaker';
}
