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

const [{ app }, { prisma }] = await Promise.all([
  import('../src/app.js'),
  import('../src/prisma/client.js'),
]);

async function resetDatabase() {
  await prisma.activity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
}

describe('TaskFlow API', { concurrency: false }, () => {
  beforeEach(resetDatabase);

  after(async () => {
    await resetDatabase();
    await prisma.$disconnect();
  });

  it('returns the API health status and handles unknown routes', async () => {
    const healthResponse = await request(app).get('/api/health').expect(200);

    assert.deepEqual(healthResponse.body, {
      status: 'ok',
      service: 'taskflow-api',
    });

    const notFoundResponse = await request(app).get('/api/unknown').expect(404);
    assert.equal(notFoundResponse.body.message, 'Rota GET /api/unknown não encontrada.');
  });

  it('validates malformed requests', async () => {
    const invalidJsonResponse = await request(app)
      .post('/api/projects')
      .set('Content-Type', 'application/json')
      .send('{"name":')
      .expect(400);

    assert.equal(invalidJsonResponse.body.message, 'O JSON enviado é inválido.');

    const missingNameResponse = await request(app)
      .post('/api/projects')
      .send({ description: 'Sem nome' })
      .expect(400);

    assert.equal(missingNameResponse.body.message, 'O campo name é obrigatório.');

    const invalidIdResponse = await request(app).get('/api/projects/invalid').expect(400);
    assert.equal(invalidIdResponse.body.message, 'O identificador informado é inválido.');
  });

  it('creates, lists, updates, reads and deletes a project', async () => {
    const createResponse = await request(app)
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

    const listResponse = await request(app).get('/api/projects').expect(200);
    assert.equal(listResponse.body.length, 1);
    assert.equal(listResponse.body[0].id, projectId);

    const detailsResponse = await request(app).get(`/api/projects/${projectId}`).expect(200);
    assert.equal(detailsResponse.body.id, projectId);
    assert.deepEqual(detailsResponse.body.tasks, []);

    const updateResponse = await request(app)
      .put(`/api/projects/${projectId}`)
      .send({ status: 'COMPLETED' })
      .expect(200);

    assert.equal(updateResponse.body.status, 'COMPLETED');

    await request(app).delete(`/api/projects/${projectId}`).expect(204);
    await request(app).get(`/api/projects/${projectId}`).expect(404);

    const activities = await prisma.activity.findMany({ orderBy: { id: 'asc' } });
    assert.deepEqual(
      activities.map((activity) => activity.description),
      [
        'Nathan criou o projeto Portal de testes',
        'Nathan atualizou o projeto Portal de testes',
        'Nathan excluiu o projeto Portal de testes',
      ],
    );
  });

  it('lists the available users alphabetically', async () => {
    await prisma.user.createMany({
      data: [
        { name: 'Carlos Lima', email: 'carlos@test.dev', avatar: 'CL' },
        { name: 'Ana Souza', email: 'ana@test.dev', avatar: 'AS' },
      ],
    });

    const response = await request(app).get('/api/users').expect(200);

    assert.deepEqual(
      response.body.map((user: { name: string }) => user.name),
      ['Ana Souza', 'Carlos Lima'],
    );
  });

  it('manages a task and records workflow activities', async () => {
    const project = await prisma.project.create({
      data: {
        name: 'Plataforma educacional',
        description: 'Projeto usado nos testes.',
      },
    });
    const assignee = await prisma.user.create({
      data: { name: 'Ana Souza', email: 'ana@test.dev', avatar: 'AS' },
    });

    const createResponse = await request(app)
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

    const filteredResponse = await request(app)
      .get(`/api/tasks?projectId=${project.id}`)
      .expect(200);
    assert.equal(filteredResponse.body.length, 1);
    assert.equal(filteredResponse.body[0].id, taskId);

    const detailsResponse = await request(app).get(`/api/tasks/${taskId}`).expect(200);
    assert.equal(detailsResponse.body.priority, 'HIGH');

    const progressResponse = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ status: 'IN_PROGRESS', assigneeId: assignee.id })
      .expect(200);

    assert.equal(progressResponse.body.status, 'IN_PROGRESS');
    assert.equal(progressResponse.body.assignee.id, assignee.id);

    const doneResponse = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({ status: 'DONE' })
      .expect(200);
    assert.equal(doneResponse.body.status, 'DONE');

    await request(app).delete(`/api/tasks/${taskId}`).expect(204);
    await request(app).get(`/api/tasks/${taskId}`).expect(404);

    const activities = await prisma.activity.findMany({ orderBy: { id: 'asc' } });
    assert.deepEqual(
      activities.map((activity) => activity.description),
      [
        'Nathan criou a tarefa Validar ambiente',
        'A tarefa Validar ambiente foi movida para Em andamento',
        'Ana Souza foi definido como responsável por Validar ambiente',
        'A tarefa Validar ambiente foi concluída',
        'Nathan excluiu a tarefa Validar ambiente',
      ],
    );
  });

  it('rejects invalid task relationships and values', async () => {
    const project = await prisma.project.create({
      data: { name: 'Projeto válido', description: '' },
    });

    const missingProjectResponse = await request(app)
      .post('/api/tasks')
      .send({ title: 'Sem projeto' })
      .expect(400);
    assert.equal(missingProjectResponse.body.message, 'O campo projectId é obrigatório.');

    const unknownProjectResponse = await request(app)
      .post('/api/tasks')
      .send({ title: 'Projeto inexistente', projectId: 999999 })
      .expect(400);
    assert.equal(unknownProjectResponse.body.message, 'O projeto informado não existe.');

    const invalidPriorityResponse = await request(app)
      .post('/api/tasks')
      .send({ title: 'Prioridade inválida', projectId: project.id, priority: 'URGENT' })
      .expect(400);
    assert.match(invalidPriorityResponse.body.message, /LOW, MEDIUM, HIGH/);
  });

  it('limits the activity history results', async () => {
    await prisma.activity.createMany({
      data: [
        { description: 'Primeira atividade' },
        { description: 'Segunda atividade' },
        { description: 'Terceira atividade' },
      ],
    });

    const limitedResponse = await request(app).get('/api/activities?limit=2').expect(200);
    assert.equal(limitedResponse.body.length, 2);

    const minimumResponse = await request(app).get('/api/activities?limit=0').expect(200);
    assert.equal(minimumResponse.body.length, 1);
  });
});
