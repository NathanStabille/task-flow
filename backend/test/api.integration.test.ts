import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { closeSync, mkdirSync, openSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { after, beforeEach, describe, it } from 'node:test';
import request from 'supertest';

const testDatabaseUrl = 'file:./prisma/test.db';
const testDatabasePath = resolve(process.cwd(), testDatabaseUrl.slice('file:'.length));

process.env.DATABASE_URL = testDatabaseUrl;
process.env.FRONTEND_URL = 'http://localhost:5173';

mkdirSync(dirname(testDatabasePath), { recursive: true });
closeSync(openSync(testDatabasePath, 'a'));

const prismaCliPath = resolve(process.cwd(), 'node_modules/prisma/build/index.js');
const migration = spawnSync(process.execPath, [prismaCliPath, 'migrate', 'deploy'], {
  cwd: process.cwd(),
  encoding: 'utf8',
  env: process.env,
});

if (migration.status !== 0) {
  throw new Error(`Não foi possível preparar o banco de testes.\n${migration.stderr}`);
}

const [{ app }, { prisma }, { hashPassword }] = await Promise.all([
  import('../src/app.js'),
  import('../src/prisma/client.js'),
  import('../src/services/auth-service.js'),
]);

const testPassword = 'TaskFlow123!';
const testPasswordHash = await hashPassword(testPassword);

async function resetDatabase() {
  await prisma.activity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
}

async function createAuthenticatedAgent() {
  const user = await prisma.user.create({
    data: {
      name: 'Test Admin',
      email: 'admin@test.dev',
      passwordHash: testPasswordHash,
      avatar: 'TA',
    },
  });
  const agent = request.agent(app);
  const loginResponse = await agent
    .post('/api/auth/login')
    .send({ email: user.email, password: testPassword })
    .expect(200);

  return { agent, user, loginResponse };
}

describe('TaskFlow API', { concurrency: false }, () => {
  beforeEach(resetDatabase);

  after(async () => {
    await resetDatabase();
    await prisma.$disconnect();
  });

  it('returns the public API health status', async () => {
    const healthResponse = await request(app).get('/api/health').expect(200);

    assert.deepEqual(healthResponse.body, {
      status: 'ok',
      service: 'taskflow-api',
    });
  });

  it('authenticates a user and protects private routes', async () => {
    await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: 'admin@test.dev',
        passwordHash: testPasswordHash,
        avatar: 'TA',
      },
    });

    const unauthorizedResponse = await request(app).get('/api/projects').expect(401);
    assert.equal(unauthorizedResponse.body.message, 'Autenticação necessária.');

    const invalidLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.dev', password: 'senha-incorreta' })
      .expect(401);
    assert.equal(invalidLoginResponse.body.message, 'Email ou senha inválidos.');

    const agent = request.agent(app);
    const loginResponse = await agent
      .post('/api/auth/login')
      .send({ email: 'ADMIN@TEST.DEV', password: testPassword })
      .expect(200);

    assert.equal(loginResponse.body.user.email, 'admin@test.dev');
    assert.equal('passwordHash' in loginResponse.body.user, false);
    const sessionCookie = loginResponse.headers['set-cookie']?.[0] ?? '';
    assert.match(sessionCookie, /taskflow_session=/);
    assert.match(sessionCookie, /HttpOnly/);
    assert.match(sessionCookie, /SameSite=Lax/);

    const meResponse = await agent.get('/api/auth/me').expect(200);
    assert.equal(meResponse.body.user.name, 'Test Admin');

    const notFoundResponse = await agent.get('/api/unknown').expect(404);
    assert.equal(notFoundResponse.body.message, 'Rota GET /api/unknown não encontrada.');

    await agent.post('/api/auth/logout').expect(204);
    await agent.get('/api/auth/me').expect(401);
  });

  it('validates malformed requests', async () => {
    const { agent } = await createAuthenticatedAgent();

    const invalidJsonResponse = await agent
      .post('/api/projects')
      .set('Content-Type', 'application/json')
      .send('{"name":')
      .expect(400);

    assert.equal(invalidJsonResponse.body.message, 'O JSON enviado é inválido.');

    const missingNameResponse = await agent
      .post('/api/projects')
      .send({ description: 'Sem nome' })
      .expect(400);

    assert.equal(missingNameResponse.body.message, 'O campo name é obrigatório.');

    const invalidIdResponse = await agent.get('/api/projects/invalid').expect(400);
    assert.equal(invalidIdResponse.body.message, 'O identificador informado é inválido.');
  });

  it('creates, lists, updates, reads and deletes a project', async () => {
    const { agent } = await createAuthenticatedAgent();

    const createResponse = await agent
      .post('/api/projects')
      .send({
        name: 'Portal de testes',
        description: 'Projeto criado pela suíte de integração.',
        status: 'ACTIVE',
      })
      .expect(201);

    const projectId = Number(createResponse.body.id);
    assert.ok(projectId > 0);
    assert.equal(createResponse.body.name, 'Portal de testes');
    assert.deepEqual(createResponse.body._count, { tasks: 0 });

    const listResponse = await agent.get('/api/projects').expect(200);
    assert.equal(listResponse.body.length, 1);
    assert.equal(listResponse.body[0].id, projectId);

    const detailsResponse = await agent.get(`/api/projects/${projectId}`).expect(200);
    assert.equal(detailsResponse.body.id, projectId);
    assert.deepEqual(detailsResponse.body.tasks, []);

    const updateResponse = await agent
      .put(`/api/projects/${projectId}`)
      .send({ status: 'COMPLETED' })
      .expect(200);

    assert.equal(updateResponse.body.status, 'COMPLETED');

    await agent.delete(`/api/projects/${projectId}`).expect(204);
    await agent.get(`/api/projects/${projectId}`).expect(404);

    const activities = await prisma.activity.findMany({ orderBy: { id: 'asc' } });
    assert.deepEqual(
      activities.map((activity) => activity.description),
      [
        'Test Admin criou o projeto Portal de testes',
        'Test Admin atualizou o projeto Portal de testes',
        'Test Admin excluiu o projeto Portal de testes',
      ],
    );
  });

  it('lists the available users alphabetically', async () => {
    const { agent } = await createAuthenticatedAgent();

    await prisma.user.createMany({
      data: [
        {
          name: 'Carlos Lima',
          email: 'carlos@test.dev',
          passwordHash: testPasswordHash,
          avatar: 'CL',
        },
        {
          name: 'Ana Souza',
          email: 'ana@test.dev',
          passwordHash: testPasswordHash,
          avatar: 'AS',
        },
      ],
    });

    const response = await agent.get('/api/users').expect(200);

    assert.deepEqual(
      response.body.map((user: { name: string }) => user.name),
      ['Ana Souza', 'Carlos Lima', 'Test Admin'],
    );
    assert.equal(
      response.body.some((user: object) => 'passwordHash' in user),
      false,
    );
  });

  it('manages a task and records workflow activities', async () => {
    const { agent } = await createAuthenticatedAgent();
    const project = await prisma.project.create({
      data: {
        name: 'Plataforma educacional',
        description: 'Projeto usado nos testes.',
      },
    });
    const assignee = await prisma.user.create({
      data: {
        name: 'Ana Souza',
        email: 'ana@test.dev',
        passwordHash: testPasswordHash,
        avatar: 'AS',
      },
    });

    const createResponse = await agent
      .post('/api/tasks')
      .send({
        title: 'Validar ambiente',
        description: 'Executar a validação completa.',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: '2026-09-30',
        projectId: project.id,
        assigneeId: null,
      })
      .expect(201);

    const taskId = Number(createResponse.body.id);
    assert.ok(taskId > 0);
    assert.equal(createResponse.body.project.id, project.id);
    assert.equal(createResponse.body.assignee, null);

    const filteredResponse = await agent.get(`/api/tasks?projectId=${project.id}`).expect(200);
    assert.equal(filteredResponse.body.length, 1);
    assert.equal(filteredResponse.body[0].id, taskId);

    const detailsResponse = await agent.get(`/api/tasks/${taskId}`).expect(200);
    assert.equal(detailsResponse.body.priority, 'HIGH');

    const progressResponse = await agent
      .put(`/api/tasks/${taskId}`)
      .send({ status: 'IN_PROGRESS', assigneeId: assignee.id })
      .expect(200);

    assert.equal(progressResponse.body.status, 'IN_PROGRESS');
    assert.equal(progressResponse.body.assignee.id, assignee.id);
    assert.equal('passwordHash' in progressResponse.body.assignee, false);

    const doneResponse = await agent
      .put(`/api/tasks/${taskId}`)
      .send({ status: 'DONE' })
      .expect(200);
    assert.equal(doneResponse.body.status, 'DONE');

    await agent.delete(`/api/tasks/${taskId}`).expect(204);
    await agent.get(`/api/tasks/${taskId}`).expect(404);

    const activities = await prisma.activity.findMany({ orderBy: { id: 'asc' } });
    assert.deepEqual(
      activities.map((activity) => activity.description),
      [
        'Test Admin criou a tarefa Validar ambiente',
        'A tarefa Validar ambiente foi movida para Em andamento',
        'Ana Souza foi definido como responsável por Validar ambiente',
        'A tarefa Validar ambiente foi concluída',
        'Test Admin excluiu a tarefa Validar ambiente',
      ],
    );
  });

  it('rejects invalid task relationships and values', async () => {
    const { agent } = await createAuthenticatedAgent();
    const project = await prisma.project.create({
      data: { name: 'Projeto válido', description: '' },
    });

    const missingProjectResponse = await agent
      .post('/api/tasks')
      .send({ title: 'Sem projeto' })
      .expect(400);
    assert.equal(missingProjectResponse.body.message, 'O campo projectId é obrigatório.');

    const unknownProjectResponse = await agent
      .post('/api/tasks')
      .send({ title: 'Projeto inexistente', projectId: 999999 })
      .expect(400);
    assert.equal(unknownProjectResponse.body.message, 'O projeto informado não existe.');

    const invalidPriorityResponse = await agent
      .post('/api/tasks')
      .send({ title: 'Prioridade inválida', projectId: project.id, priority: 'URGENT' })
      .expect(400);
    assert.match(invalidPriorityResponse.body.message, /LOW, MEDIUM, HIGH/);
  });

  it('limits the activity history results', async () => {
    const { agent } = await createAuthenticatedAgent();
    await prisma.activity.createMany({
      data: [
        { description: 'Primeira atividade' },
        { description: 'Segunda atividade' },
        { description: 'Terceira atividade' },
      ],
    });

    const limitedResponse = await agent.get('/api/activities?limit=2').expect(200);
    assert.equal(limitedResponse.body.length, 2);

    const minimumResponse = await agent.get('/api/activities?limit=0').expect(200);
    assert.equal(minimumResponse.body.length, 1);
  });
});
