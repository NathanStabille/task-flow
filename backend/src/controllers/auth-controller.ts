import type { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import {
  AUTH_COOKIE_NAME,
  AUTH_SESSION_DURATION_MS,
  createSessionToken,
  verifyPassword,
} from '../services/auth-service.js';
import type { UserRole } from '../types/domain.js';
import { authenticatedUser } from '../utils/authenticated-user.js';
import { HttpError } from '../utils/http-error.js';
import { requiredText } from '../utils/validation.js';

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export async function login(request: Request, response: Response) {
  const email = requiredText(request.body?.email, 'email').toLocaleLowerCase('pt-BR');
  const password = requiredText(request.body?.password, 'password');
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new HttpError(401, 'Email ou senha inválidos.');
  }

  const authUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role as UserRole,
  };

  response.cookie(AUTH_COOKIE_NAME, createSessionToken(user.id), {
    ...sessionCookieOptions,
    maxAge: AUTH_SESSION_DURATION_MS,
  });
  response.json({ user: authUser });
}

export function logout(_request: Request, response: Response) {
  response.clearCookie(AUTH_COOKIE_NAME, sessionCookieOptions);
  response.status(204).send();
}

export function currentUser(request: Request, response: Response) {
  response.json({ user: authenticatedUser(request) });
}
