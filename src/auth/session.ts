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
let current: Session | null = load() ?? null;

/** Stored session; `undefined` when storage is unavailable. */
function load(): Session | null | undefined {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return undefined;
  }
  try {
    const parsed = raw ? (JSON.parse(raw) as Partial<Session>) : null;
    return parsed?.accessToken && parsed.refreshToken && parsed.user ? (parsed as Session) : null;
  } catch {
    return null;
  }
}

export function getSession(): Session | null {
  return current;
}

function emit(): void {
  listeners.forEach((listener) => listener(current));
}

export function setSession(session: Session | null): void {
  current = session;
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be unavailable: the session then lives only in memory.
  }
  emit();
}

/** Re-reads the session from storage: another tab may have refreshed the tokens or signed out. */
export function syncSession(): Session | null {
  const stored = load();
  // Without storage the session lives only in memory, so there is nothing to sync.
  if (stored !== undefined && stored?.accessToken !== current?.accessToken) {
    current = stored;
    emit();
  }
  return current;
}

// Sign-in, token refresh and sign-out in another tab apply to this one too.
window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY || event.key === null) syncSession();
});

export function subscribeSession(listener: (session: Session | null) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** DEVREL and ADMIN work in the DevRel section; everyone else is a speaker. */
export function roleOf(user: SessionUser): Role {
  return user.roles.includes('DEVREL') || user.roles.includes('ADMIN') ? 'devrel' : 'speaker';
}
