import type { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';

export async function listUsers(_request: Request, response: Response) {
  const users = await prisma.user.findMany({ orderBy: { name: 'asc' } });
  response.json(users);
}

