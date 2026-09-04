import type { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { publicUserSelect } from '../prisma/selects.js';
import { hashPassword } from '../services/auth-service.js';
import { USER_ROLES } from '../types/domain.js';
import { authenticatedUser } from '../utils/authenticated-user.js';
import { HttpError } from '../utils/http-error.js';
import {
  emailValue,
  enumValue,
  optionalText,
  parseId,
  passwordValue,
  requiredText,
} from '../utils/validation.js';

export async function listUsers(_request: Request, response: Response) {
  const users = await prisma.user.findMany({
    select: publicUserSelect,
    orderBy: { name: 'asc' },
  });
  response.json(users);
}

export async function getUser(request: Request, response: Response) {
  const id = parseId(request.params.id);
  const user = await prisma.user.findUnique({ where: { id }, select: publicUserSelect });

  if (!user) throw new HttpError(404, 'Usuário não encontrado.');
  response.json(user);
}

export async function createUser(request: Request, response: Response) {
  const actor = authenticatedUser(request);
  const body = request.body ?? {};
  const name = requiredText(body.name, 'name');
  const email = emailValue(body.email);
  const password = passwordValue(body.password);
  const avatar = optionalText(body.avatar) || null;
  const role = body.role ? enumValue(body.role, USER_ROLES, 'role') : 'MEMBER';

  const emailOwner = await prisma.user.findUnique({ where: { email } });
  if (emailOwner) throw new HttpError(409, 'Já existe um usuário com este email.');

  const passwordHash = await hashPassword(password);
  const user = await prisma.$transaction(async (database) => {
    const created = await database.user.create({
      data: { name, email, passwordHash, avatar, role },
      select: publicUserSelect,
    });

    await database.activity.create({
      data: { description: `${actor.name} criou o usuário ${created.name}` },
    });

    return created;
  });

  response.status(201).json(user);
}

export async function updateUser(request: Request, response: Response) {
  const actor = authenticatedUser(request);
  const id = parseId(request.params.id);
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, 'Usuário não encontrado.');

  const body = request.body ?? {};
  const name = body.name === undefined ? undefined : requiredText(body.name, 'name');
  const email = body.email === undefined ? undefined : emailValue(body.email);
  const avatar = body.avatar === undefined ? undefined : optionalText(body.avatar) || null;
  const role =
    body.role === undefined ? undefined : enumValue(body.role, USER_ROLES, 'role');
  const passwordHash =
    body.password === undefined ? undefined : await hashPassword(passwordValue(body.password));

  if (
    name === undefined &&
    email === undefined &&
    avatar === undefined &&
    role === undefined &&
    passwordHash === undefined
  ) {
    throw new HttpError(400, 'Informe ao menos um campo para atualizar.');
  }

  if (email && email !== existing.email) {
    const emailOwner = await prisma.user.findUnique({ where: { email } });
    if (emailOwner) throw new HttpError(409, 'Já existe um usuário com este email.');
  }

  if (id === actor.id && role !== undefined && role !== existing.role) {
    throw new HttpError(400, 'Você não pode alterar o perfil da própria conta.');
  }

  if (existing.role === 'ADMIN' && role === 'MEMBER') {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount === 1) {
      throw new HttpError(400, 'O workspace precisa manter pelo menos um administrador.');
    }
  }

  const user = await prisma.$transaction(async (database) => {
    const updated = await database.user.update({
      where: { id },
      data: { name, email, avatar, role, passwordHash },
      select: publicUserSelect,
    });

    await database.activity.create({
      data: { description: `${actor.name} atualizou o usuário ${updated.name}` },
    });

    return updated;
  });

  response.json(user);
}

export async function deleteUser(request: Request, response: Response) {
  const actor = authenticatedUser(request);
  const id = parseId(request.params.id);

  if (id === actor.id) {
    throw new HttpError(400, 'Você não pode excluir a própria conta.');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new HttpError(404, 'Usuário não encontrado.');

  if (user.role === 'ADMIN') {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount === 1) {
      throw new HttpError(400, 'O workspace precisa manter pelo menos um administrador.');
    }
  }

  await prisma.$transaction(async (database) => {
    await database.user.delete({ where: { id } });
    await database.activity.create({
      data: { description: `${actor.name} excluiu o usuário ${user.name}` },
    });
  });

  response.status(204).send();
}
