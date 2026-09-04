import type { UserRole } from './domain.js';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: UserRole;
}
