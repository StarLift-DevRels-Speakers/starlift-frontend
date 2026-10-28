import { useContext } from 'react';
import { AuthContext, type AuthApi } from './authContext';

export function useAuth(): AuthApi {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth must be used inside <AuthProvider>');
  return auth;
}
