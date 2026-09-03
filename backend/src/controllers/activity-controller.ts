import type { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';

export async function listActivities(request: Request, response: Response) {
  const requestedLimit = Number(request.query.limit ?? 20);
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 100)
    : 20;

  const activities = await prisma.activity.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  response.json(activities);
}

