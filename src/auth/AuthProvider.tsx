import { useEffect, useState, type ReactNode } from 'react';
import type { AuthTokensResponse } from '@/api/client';
import { api } from '@/api/endpoints';
import { DEMO_ACCESS_TOKEN, demoEnabled, demoSession, demoSessionForRole } from '@/demo/config';
import { AuthContext, type AuthApi } from './authContext';
import { getSession, setSession, subscribeSession, type Session } from './session';

function sessionOf(tokens: AuthTokensResponse): Session {
  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: tokens.user };
}

/** A demo session left in storage must not sign the user in on a build without the demo mode. */
function storedSession(): Session | null {
  const stored = getSession();
  return stored?.accessToken === DEMO_ACCESS_TOKEN ? null : stored;
}

/** Signed-in user and the JWT pair; the API client drops the session when the refresh token expires. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setCurrent] = useState(() => (demoEnabled ? demoSession() : storedSession()));

  useEffect(() => demoEnabled ? undefined : subscribeSession(setCurrent), []);

  // Drop a demo session saved by an earlier demo run: it holds fake tokens.
  useEffect(() => {
    if (!demoEnabled && getSession()?.accessToken === DEMO_ACCESS_TOKEN) setSession(null);
  }, []);

  const auth: AuthApi = {
    session,
    enterDemo: (role) => setSession(demoSessionForRole(role)),
    signIn: async (username, password) => {
      if (demoEnabled) return;
      setSession(sessionOf(await api.signIn(username.trim(), password)));
    },
    register: async (input) => {
      if (demoEnabled) return;
      setSession(sessionOf(await api.signUp({ username: input.username.trim(), password: input.password, firstName: input.firstName, lastName: input.lastName })));
    },
    signOut: async () => {
      if (demoEnabled) return;
      const refreshToken = getSession()?.refreshToken;
      setSession(null);
      if (refreshToken) {
        // Revoking on the server is best effort: the local session is already gone.
        await api.logout(refreshToken).catch(() => undefined);
      }
    },
  };

  return <AuthContext value={auth}>{children}</AuthContext>;
}
