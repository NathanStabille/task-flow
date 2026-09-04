import type { Request } from 'express';
import type { AuthUser } from '../types/auth.js';
import { HttpError } from './http-error.js';

export function authenticatedUser(request: Request): AuthUser {
  if (!request.authUser) throw new HttpError(401, 'Autenticação necessária.');
  return request.authUser;
}
