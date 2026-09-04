import type { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { publicUserSelect } from '../prisma/selects.js';

export async function listUsers(_request: Request, response: Response) {
  const users = await prisma.user.findMany({
    select: publicUserSelect,
    orderBy: { name: 'asc' },
  });
  response.json(users);
}
