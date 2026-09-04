import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { AUTH_COOKIE_NAME, verifySessionToken } from '../services/auth-service.js';
import { USER_ROLES, type UserRole } from '../types/domain.js';
import { HttpError } from '../utils/http-error.js';

function requestToken(request: Request): string | undefined {
  const authorization = request.get('authorization');
  const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;

  return request.cookies?.[AUTH_COOKIE_NAME] ?? bearerToken;
}

export async function requireAuth(request: Request, _response: Response, next: NextFunction) {
  try {
    const token = requestToken(request);
    if (!token) throw new HttpError(401, 'Autenticação necessária.');

    const userId = verifySessionToken(token);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true, role: true },
    });

    if (!user) throw new HttpError(401, 'Usuário da sessão não foi encontrado.');

    if (!USER_ROLES.includes(user.role as UserRole)) {
      throw new HttpError(401, 'O perfil da conta é inválido.');
    }

    request.authUser = { ...user, role: user.role as UserRole };
    next();
  } catch (error) {
    next(error);
  }
}
