import type { AuthUser } from '../types';
import { api } from './api';

interface AuthResponse {
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  login: (credentials: LoginCredentials) => api.post<AuthResponse>('/auth/login', credentials),
  logout: () => api.post<void>('/auth/logout', {}),
  me: (signal?: AbortSignal) => api.get<AuthResponse>('/auth/me', signal),
};
