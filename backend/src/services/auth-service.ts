import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { HttpError } from '../utils/http-error.js';

export const AUTH_COOKIE_NAME = 'taskflow_session';
export const AUTH_SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

const jwtOptions = {
  audience: 'taskflow-web',
  issuer: 'taskflow-api',
} as const;

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET deve ser configurado no ambiente de produção.');
  }

  return 'taskflow-local-development-secret';
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function createSessionToken(userId: number): string {
  return jwt.sign({}, jwtSecret(), {
    ...jwtOptions,
    algorithm: 'HS256',
    expiresIn: '8h',
    subject: String(userId),
  });
}

export function verifySessionToken(token: string): number {
  let payload: JwtPayload | string;

  try {
    payload = jwt.verify(token, jwtSecret(), {
      ...jwtOptions,
      algorithms: ['HS256'],
    });
  } catch {
    throw new HttpError(401, 'Sua sessão é inválida ou expirou.');
  }

  if (typeof payload === 'string') {
    throw new HttpError(401, 'Sua sessão é inválida ou expirou.');
  }

  const userId = Number(payload.sub);
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new HttpError(401, 'Sua sessão é inválida ou expirou.');
  }

  return userId;
}
