import { createContext } from 'react';
import type { LoginCredentials } from '../services/auth';
import type { AuthUser } from '../types';

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
