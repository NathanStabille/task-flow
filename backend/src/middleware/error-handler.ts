import type { ErrorRequestHandler } from 'express';
import { Prisma } from '../generated/prisma/client.js';
import { HttpError } from '../utils/http-error.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    response.status(400).json({ message: 'Não foi possível concluir a operação no banco.' });
    return;
  }

  if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
    response.status(400).json({ message: 'O JSON enviado é inválido.' });
    return;
  }

  console.error(error);
  response.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
};
