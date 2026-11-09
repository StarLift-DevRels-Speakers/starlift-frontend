import { useEffect, useState, type ReactNode } from 'react';
import type { AuthTokensResponse } from '@/api/client';
import { api } from '@/api/endpoints';
import { demoEnabled, demoSession } from '@/demo/config';
import { AuthContext, type AuthApi } from './authContext';
import { getSession, setSession, subscribeSession, type Session } from './session';

function sessionOf(tokens: AuthTokensResponse): Session {
  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: tokens.user };
}

/** Signed-in user and the JWT pair; the API client drops the session when the refresh token expires. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setCurrent] = useState(() => demoEnabled ? demoSession() : getSession());

  useEffect(() => demoEnabled ? undefined : subscribeSession(setCurrent), []);

  const auth: AuthApi = {
    session,
    signIn: async (username, password) => {
      if (demoEnabled) return;
      setSession(sessionOf(await api.signIn(username.trim(), password)));
    },
    register: async (input) => {
      if (demoEnabled) return;
      setSession(sessionOf(await api.signUp({ ...input, username: input.username.trim() })));
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
