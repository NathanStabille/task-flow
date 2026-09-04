import type { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { publicUserSelect } from '../prisma/selects.js';
import { TASK_PRIORITIES, TASK_STATUSES } from '../types/domain.js';
import { authenticatedUser } from '../utils/authenticated-user.js';
import { HttpError } from '../utils/http-error.js';
import {
  enumValue,
  optionalDate,
  optionalEntityId,
  optionalText,
  parseId,
  requiredText,
} from '../utils/validation.js';

const taskInclude = {
  project: true,
  assignee: { select: publicUserSelect },
} as const;

async function ensureRelations(
  projectId: number | undefined,
  assigneeId: number | null | undefined,
) {
  if (projectId !== undefined) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new HttpError(400, 'O projeto informado não existe.');
  }

  if (assigneeId !== undefined && assigneeId !== null) {
    const user = await prisma.user.findUnique({ where: { id: assigneeId } });
    if (!user) throw new HttpError(400, 'O responsável informado não existe.');
  }
}

export async function listTasks(request: Request, response: Response) {
  const projectId = request.query.projectId ? parseId(String(request.query.projectId)) : undefined;

  const tasks = await prisma.task.findMany({
    where: projectId ? { projectId } : undefined,
    include: taskInclude,
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
  });

  response.json(tasks);
}

export async function getTask(request: Request, response: Response) {
  const id = parseId(request.params.id);
  const task = await prisma.task.findUnique({ where: { id }, include: taskInclude });
  if (!task) throw new HttpError(404, 'Tarefa não encontrada.');

  response.json(task);
}

export async function createTask(request: Request, response: Response) {
  const actor = authenticatedUser(request);
  const body = request.body ?? {};
  const title = requiredText(body.title, 'title');
  const projectId = optionalEntityId(body.projectId, 'projectId');
  if (projectId === undefined || projectId === null) {
    throw new HttpError(400, 'O campo projectId é obrigatório.');
  }

  const assigneeId = optionalEntityId(body.assigneeId, 'assigneeId');
  await ensureRelations(projectId, assigneeId);

  const data = {
    title,
    description: optionalText(body.description) ?? '',
    status: body.status ? enumValue(body.status, TASK_STATUSES, 'status') : 'TODO',
    priority: body.priority ? enumValue(body.priority, TASK_PRIORITIES, 'priority') : 'MEDIUM',
    dueDate: optionalDate(body.dueDate),
    projectId,
    assigneeId: assigneeId ?? null,
  };

  const task = await prisma.$transaction(async (database) => {
    const created = await database.task.create({ data, include: taskInclude });
    await database.activity.create({
      data: { description: `${actor.name} criou a tarefa ${created.title}` },
    });
    return created;
  });

  response.status(201).json(task);
}

export async function updateTask(request: Request, response: Response) {
  const actor = authenticatedUser(request);
  const id = parseId(request.params.id);
  const existing = await prisma.task.findUnique({
    where: { id },
    include: { assignee: true },
  });
  if (!existing) throw new HttpError(404, 'Tarefa não encontrada.');

  const body = request.body ?? {};
  const projectIdValue = optionalEntityId(body.projectId, 'projectId');
  if (projectIdValue === null) {
    throw new HttpError(400, 'A tarefa deve estar vinculada a um projeto.');
  }
  const projectId = projectIdValue;
  const assigneeId = optionalEntityId(body.assigneeId, 'assigneeId');
  await ensureRelations(projectId, assigneeId);

  const data = {
    title: body.title === undefined ? undefined : requiredText(body.title, 'title'),
    description: optionalText(body.description),
    status: body.status === undefined ? undefined : enumValue(body.status, TASK_STATUSES, 'status'),
    priority:
      body.priority === undefined
        ? undefined
        : enumValue(body.priority, TASK_PRIORITIES, 'priority'),
    dueDate: optionalDate(body.dueDate),
    projectId: projectId ?? undefined,
    assigneeId,
  };

  const task = await prisma.$transaction(async (database) => {
    const updated = await database.task.update({ where: { id }, data, include: taskInclude });

    const descriptions: string[] = [];
    if (data.status && data.status !== existing.status) {
      descriptions.push(
        data.status === 'DONE'
          ? `A tarefa ${updated.title} foi concluída`
          : `A tarefa ${updated.title} foi movida para ${data.status === 'IN_PROGRESS' ? 'Em andamento' : 'A fazer'}`,
      );
    }
    if (assigneeId !== undefined && assigneeId !== existing.assigneeId) {
      descriptions.push(
        updated.assignee
          ? `${updated.assignee.name} foi definido como responsável por ${updated.title}`
          : `O responsável foi removido da tarefa ${updated.title}`,
      );
    }
    if (descriptions.length === 0) {
      descriptions.push(`${actor.name} atualizou a tarefa ${updated.title}`);
    }

    await database.activity.createMany({
      data: descriptions.map((description) => ({ description })),
    });

    return updated;
  });

  response.json(task);
}

export async function deleteTask(request: Request, response: Response) {
  const actor = authenticatedUser(request);
  const id = parseId(request.params.id);
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new HttpError(404, 'Tarefa não encontrada.');

  await prisma.$transaction(async (database) => {
    await database.task.delete({ where: { id } });
    await database.activity.create({
      data: { description: `${actor.name} excluiu a tarefa ${task.title}` },
    });
  });

  response.status(204).send();
}
