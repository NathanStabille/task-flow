import { prisma } from '../src/prisma/client.js';
import { hashPassword } from '../src/services/auth-service.js';

async function main() {
  await prisma.activity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hashPassword('TaskFlow123!');

  const [nathan, ana, carlos, joao] = await Promise.all([
    prisma.user.create({
      data: { name: 'Nathan', email: 'nathan@taskflow.dev', passwordHash, avatar: 'NA' },
    }),
    prisma.user.create({
      data: { name: 'Ana Souza', email: 'ana@taskflow.dev', passwordHash, avatar: 'AS' },
    }),
    prisma.user.create({
      data: { name: 'Carlos Lima', email: 'carlos@taskflow.dev', passwordHash, avatar: 'CL' },
    }),
    prisma.user.create({
      data: { name: 'João Silva', email: 'joao@taskflow.dev', passwordHash, avatar: 'JS' },
    }),
  ]);

  const portal = await prisma.project.create({
    data: {
      name: 'Portal Institucional',
      description: 'Modernização do portal e organização do conteúdo institucional.',
      status: 'ACTIVE',
    },
  });

  const educacional = await prisma.project.create({
    data: {
      name: 'Plataforma Educacional',
      description: 'Melhorias de acesso, relatórios e experiência dos alunos.',
      status: 'ACTIVE',
    },
  });

  const emails = await prisma.project.create({
    data: {
      name: 'Automação de Emails',
      description: 'Padronização e automação das comunicações por email.',
      status: 'COMPLETED',
    },
  });

  const now = new Date();
  const daysFromNow = (days: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    return date;
  };

  await prisma.task.createMany({
    data: [
      {
        title: 'Atualizar documentação',
        description: 'Revisar a documentação técnica e os guias de publicação.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: daysFromNow(4),
        projectId: portal.id,
        assigneeId: nathan.id,
      },
      {
        title: 'Revisar layout responsivo',
        description: 'Validar as páginas principais em dispositivos móveis.',
        status: 'TODO',
        priority: 'HIGH',
        dueDate: daysFromNow(7),
        projectId: portal.id,
        assigneeId: ana.id,
      },
      {
        title: 'Corrigir problema de login',
        description: 'Investigar falhas intermitentes no acesso de alunos.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: daysFromNow(-2),
        projectId: educacional.id,
        assigneeId: carlos.id,
      },
      {
        title: 'Criar página de relatórios',
        description: 'Disponibilizar indicadores básicos de participação por curso.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: daysFromNow(10),
        projectId: educacional.id,
        assigneeId: joao.id,
      },
      {
        title: 'Configurar ambiente de homologação',
        description: 'Preparar o ambiente para validação antes da publicação.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: daysFromNow(-5),
        projectId: educacional.id,
        assigneeId: nathan.id,
      },
      {
        title: 'Atualizar dependências',
        description: 'Revisar pacotes e aplicar atualizações compatíveis.',
        status: 'DONE',
        priority: 'LOW',
        dueDate: daysFromNow(-8),
        projectId: emails.id,
        assigneeId: ana.id,
      },
    ],
  });

  await prisma.activity.createMany({
    data: [
      { description: 'Nathan criou o projeto Portal Institucional' },
      { description: 'Carlos foi definido como responsável por Corrigir problema de login' },
      { description: 'A tarefa Configurar ambiente de homologação foi concluída' },
      { description: 'Ana concluiu a tarefa Atualizar dependências' },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
