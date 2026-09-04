import type { Request, Response } from 'express';

export function notFound(request: Request, response: Response) {
  response.status(404).json({
    message: `Rota ${request.method} ${request.originalUrl} não encontrada.`,
  });
}
