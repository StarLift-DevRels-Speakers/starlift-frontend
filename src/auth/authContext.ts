import { createContext } from 'react';
import type { Session } from './session';

export interface RegisterInput {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthApi {
  session: Session | null;
  signIn: (username: string, password: string) => Promise<void>;
  /** New accounts get the speaker role; DevRel access is granted by an administrator. */
  register: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthApi | null>(null);
