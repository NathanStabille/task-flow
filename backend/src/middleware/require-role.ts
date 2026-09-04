import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../types/domain.js';
import { authenticatedUser } from '../utils/authenticated-user.js';
import { HttpError } from '../utils/http-error.js';

export function requireRole(...allowedRoles: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    try {
      const user = authenticatedUser(request);

      if (!allowedRoles.includes(user.role)) {
        throw new HttpError(403, 'Você não tem permissão para realizar esta ação.');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
