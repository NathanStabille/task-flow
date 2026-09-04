import type { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { publicUserSelect } from '../prisma/selects.js';
import { PROJECT_STATUSES } from '../types/domain.js';
import { authenticatedUser } from '../utils/authenticated-user.js';
import { HttpError } from '../utils/http-error.js';
import { enumValue, optionalText, parseId, requiredText } from '../utils/validation.js';

const projectInclude = {
  _count: { select: { tasks: true } },
} as const;

export async function listProjects(_request: Request, response: Response) {
  const projects = await prisma.project.findMany({
    include: projectInclude,
    orderBy: { updatedAt: 'desc' },
  });

  response.json(projects);
}

export async function getProject(request: Request, response: Response) {
  const id = parseId(request.params.id);
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      tasks: {
        include: { assignee: { select: publicUserSelect } },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { tasks: true } },
    },
  });

  if (!project) throw new HttpError(404, 'Projeto não encontrado.');
  response.json(project);
}

export async function createProject(request: Request, response: Response) {
  const actor = authenticatedUser(request);
  const body = request.body ?? {};
  const name = requiredText(body.name, 'name');
  const description = optionalText(body.description) ?? '';
  const status = body.status ? enumValue(body.status, PROJECT_STATUSES, 'status') : 'ACTIVE';

  const project = await prisma.$transaction(async (database) => {
    const created = await database.project.create({
      data: { name, description, status },
      include: projectInclude,
    });

    await database.activity.create({
      data: { description: `${actor.name} criou o projeto ${created.name}` },
    });

    return created;
  });

  response.status(201).json(project);
}

export async function updateProject(request: Request, response: Response) {
  const actor = authenticatedUser(request);
  const id = parseId(request.params.id);
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, 'Projeto não encontrado.');

  const body = request.body ?? {};
  const data = {
    name: body.name === undefined ? undefined : requiredText(body.name, 'name'),
    description: optionalText(body.description),
    status:
      body.status === undefined ? undefined : enumValue(body.status, PROJECT_STATUSES, 'status'),
  };

  const project = await prisma.$transaction(async (database) => {
    const updated = await database.project.update({
      where: { id },
      data,
      include: projectInclude,
    });

    await database.activity.create({
      data: { description: `${actor.name} atualizou o projeto ${updated.name}` },
    });

    return updated;
  });

  response.json(project);
}

export async function deleteProject(request: Request, response: Response) {
  const actor = authenticatedUser(request);
  const id = parseId(request.params.id);
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) throw new HttpError(404, 'Projeto não encontrado.');

  await prisma.$transaction(async (database) => {
    await database.project.delete({ where: { id } });
    await database.activity.create({
      data: { description: `${actor.name} excluiu o projeto ${project.name}` },
    });
  });

  response.status(204).send();
}
