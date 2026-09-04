# TaskFlow

TaskFlow é uma aplicação full-stack de gerenciamento de projetos e tarefas, iniciada como um MVP e agora em evolução para uma solução mais completa, mantendo frontend e backend independentes.

A aplicação permite acompanhar indicadores, gerenciar projetos e tarefas, organizar o trabalho em um quadro Kanban e consultar um histórico automático das principais alterações.

## Objetivo

O projeto foi desenvolvido para consolidar conhecimentos de desenvolvimento full-stack, especialmente na construção de uma API REST com Node.js e na integração entre uma interface React e um banco de dados relacional.

A primeira versão priorizou um sistema funcional, organizado e fácil de explicar. A evolução atual adiciona qualidade, segurança e recursos de produto sem abandonar essa clareza arquitetural.

## Arquitetura

```text
React + TypeScript
        ↓ HTTP/JSON
REST API com Node.js + Express
        ↓
Prisma ORM
        ↓
SQLite
```

O frontend e o backend são aplicações separadas. O React acessa os endpoints da API por meio de uma camada de serviços baseada em `fetch`. No backend, as rotas direcionam as requisições aos controllers, que validam os dados e utilizam o Prisma para persistir as alterações.

```text
Frontend → Route → Controller → Prisma → SQLite
```

## Funcionalidades

- Dashboard com indicadores, projetos recentes, progresso geral e atividades recentes.
- CRUD completo de projetos.
- CRUD completo de tarefas.
- Filtros por status, prioridade, projeto e responsável.
- Associação de usuários fictícios às tarefas.
- Autenticação por email e senha com sessão expirada automaticamente.
- Proteção das rotas da API com JWT armazenado em cookie `HttpOnly`.
- Perfis de acesso `ADMIN` e `MEMBER` com autorização validada no backend.
- Gerenciamento administrativo da equipe, incluindo cadastro, edição e exclusão de usuários.
- Quadro Kanban com drag and drop acessível entre `TODO`, `IN_PROGRESS` e `DONE`.
- Atualização otimista no Kanban, com restauração automática quando a API falha.
- Registro automático de criação, edição, exclusão, atribuição e mudança de status.
- Histórico de atividades com busca, categorias e filtro por período.
- Estados de carregamento, erro, lista vazia e confirmação de exclusão.
- Interface responsiva para desktop e dispositivos móveis.
- Testes de integração automatizados para os principais fluxos da API.

## Tecnologias

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- dnd kit
- Lucide React
- ESLint e Prettier

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- SQLite
- CORS e dotenv
- bcryptjs, JSON Web Token e cookies `HttpOnly`
- Node.js Test Runner e Supertest

## Estrutura do projeto

```text
task-flow/
├── backend/
│   ├── prisma/
│   │   ├── migrations/       # Histórico de alterações do banco
│   │   ├── schema.prisma     # Modelos e relacionamentos
│   │   └── seed.ts           # Dados iniciais para demonstração
│   └── src/
│       ├── controllers/      # Validação, regras e acesso ao Prisma
│       ├── middleware/       # Tratamento de erros e rotas inexistentes
│       ├── prisma/           # Instância compartilhada do Prisma Client
│       ├── routes/           # Definição dos endpoints da API
│       ├── types/            # Tipos do domínio
│       ├── utils/            # Validação e erros HTTP
│       ├── app.ts            # Configuração do Express
│       └── server.ts         # Inicialização do servidor
├── frontend/
│   └── src/
│       ├── components/       # Componentes de interface por domínio
│       ├── hooks/            # Carregamento e estado das páginas
│       ├── pages/            # Páginas da aplicação
│       ├── services/         # Comunicação com a API REST
│       ├── types/            # Contratos TypeScript do frontend
│       └── utils/            # Formatação de datas e valores
└── README.md
```

## Como executar

### Pré-requisitos

- Node.js `^20.19.0` ou `>=22.12.0`
- npm
- Git

### 1. Clonar o repositório

```bash
git clone https://github.com/NathanStabille/task-flow.git
cd task-flow
```

### 2. Configurar e iniciar o backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

A API ficará disponível em `http://localhost:3001/api`.

> **Atenção:** o comando `npm run db:seed` recria os dados de demonstração e remove os registros existentes no banco SQLite local.

### 3. Configurar e iniciar o frontend

Em outro terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

### Dados de demonstração

O seed inclui quatro usuários, três projetos e seis tarefas distribuídas entre diferentes status e prioridades. Nathan possui o perfil de administrador e as demais contas são membros. Todas as contas de demonstração usam a senha `TaskFlow123!`.

Para entrar como Nathan:

```text
Email: nathan@taskflow.dev
Senha: TaskFlow123!
```

## Variáveis de ambiente

### Backend

| Variável       | Valor padrão                           | Descrição                         |
| -------------- | -------------------------------------- | --------------------------------- |
| `DATABASE_URL` | `file:./prisma/dev.db`                 | Localização do banco SQLite       |
| `PORT`         | `3001`                                 | Porta da API                      |
| `FRONTEND_URL` | `http://localhost:5173`                | Origem permitida pelo CORS        |
| `JWT_SECRET`   | Segredo local fora do modo de produção | Assinatura das sessões do usuário |

Em produção, `JWT_SECRET` é obrigatório e deve receber um valor longo, aleatório e mantido fora do repositório.

### Frontend

| Variável       | Valor padrão                | Descrição            |
| -------------- | --------------------------- | -------------------- |
| `VITE_API_URL` | `http://localhost:3001/api` | Endereço base da API |

## API REST

### Status da aplicação

| Método | Endpoint      | Descrição                         |
| ------ | ------------- | --------------------------------- |
| `GET`  | `/api/health` | Verifica se a API está disponível |

### Autenticação

| Método | Endpoint           | Descrição                           |
| ------ | ------------------ | ----------------------------------- |
| `POST` | `/api/auth/login`  | Autentica e cria o cookie de sessão |
| `GET`  | `/api/auth/me`     | Retorna o usuário autenticado       |
| `POST` | `/api/auth/logout` | Encerra e remove a sessão           |

As rotas de projetos, tarefas, usuários e atividades exigem uma sessão autenticada. O frontend envia o cookie automaticamente com `credentials: include`. Operações de gerenciamento de usuários exigem o perfil `ADMIN`; a listagem permanece disponível aos membros para atribuição de responsáveis.

### Projetos

| Método   | Endpoint            | Descrição                         |
| -------- | ------------------- | --------------------------------- |
| `GET`    | `/api/projects`     | Lista os projetos                 |
| `GET`    | `/api/projects/:id` | Retorna um projeto e suas tarefas |
| `POST`   | `/api/projects`     | Cria um projeto                   |
| `PUT`    | `/api/projects/:id` | Atualiza um projeto               |
| `DELETE` | `/api/projects/:id` | Exclui um projeto                 |

### Tarefas

| Método   | Endpoint                   | Descrição                     |
| -------- | -------------------------- | ----------------------------- |
| `GET`    | `/api/tasks`               | Lista as tarefas              |
| `GET`    | `/api/tasks?projectId=:id` | Filtra as tarefas por projeto |
| `GET`    | `/api/tasks/:id`           | Retorna uma tarefa            |
| `POST`   | `/api/tasks`               | Cria uma tarefa               |
| `PUT`    | `/api/tasks/:id`           | Atualiza uma tarefa           |
| `DELETE` | `/api/tasks/:id`           | Exclui uma tarefa             |

### Usuários

| Método   | Endpoint         | Perfil exigido | Descrição                       |
| -------- | ---------------- | -------------- | ------------------------------- |
| `GET`    | `/api/users`     | Autenticado    | Lista os usuários do workspace  |
| `GET`    | `/api/users/:id` | Administrador  | Retorna os dados de um usuário  |
| `POST`   | `/api/users`     | Administrador  | Cadastra um usuário             |
| `PUT`    | `/api/users/:id` | Administrador  | Atualiza dados, perfil ou senha |
| `DELETE` | `/api/users/:id` | Administrador  | Remove um usuário               |

O sistema impede a exclusão da própria conta administrativa e mantém pelo menos um administrador. Quando um usuário é removido, suas tarefas continuam no sistema e ficam sem responsável.

### Atividades

| Método | Endpoint                   | Descrição                                  |
| ------ | -------------------------- | ------------------------------------------ |
| `GET`  | `/api/activities`          | Lista as atividades mais recentes          |
| `GET`  | `/api/activities?limit=20` | Limita o resultado entre 1 e 100 registros |

As operações de criação retornam `201 Created`, exclusões retornam `204 No Content` e erros de validação ou recursos inexistentes retornam respostas JSON com os status HTTP apropriados.

## Testes automatizados

O backend possui testes de integração que exercitam a API Express completa, incluindo login, sessão, rotas protegidas, validações, CRUD de projetos e tarefas, usuários, atividades e respostas de erro.

```bash
cd backend
npm test
```

Os testes usam o banco isolado `backend/prisma/test.db`, que é preparado automaticamente e ignorado pelo Git. O banco de desenvolvimento não é alterado.

## Exemplo de fluxo

Ao criar uma tarefa, o fluxo principal é:

1. O formulário React envia um `POST /api/tasks`.
2. O Express encaminha a requisição para o controller de tarefas.
3. O controller valida os campos e os relacionamentos informados.
4. O Prisma salva a tarefa e sua atividade em uma transação.
5. A API retorna a tarefa criada em JSON.
6. O frontend atualiza a listagem com os dados da API.

Exemplo de payload:

```json
{
  "title": "Atualizar documentação",
  "description": "Revisar o guia de publicação",
  "status": "TODO",
  "priority": "MEDIUM",
  "dueDate": "2026-09-10",
  "projectId": 1,
  "assigneeId": 1
}
```

## Scripts úteis

### Backend

| Comando                  | Descrição                                   |
| ------------------------ | ------------------------------------------- |
| `npm run dev`            | Inicia a API com recarregamento automático  |
| `npm run build`          | Gera o Prisma Client e compila o TypeScript |
| `npm start`              | Executa a versão compilada                  |
| `npm run typecheck`      | Verifica os tipos sem gerar arquivos        |
| `npm test`               | Executa os testes de integração da API      |
| `npm run test:typecheck` | Verifica os tipos da suíte de testes        |
| `npm run db:prepare`     | Prepara o arquivo SQLite configurado        |
| `npm run db:migrate`     | Prepara o banco e aplica migrations locais  |
| `npm run db:deploy`      | Aplica migrations existentes em produção    |
| `npm run db:seed`        | Recria os dados de demonstração             |
| `npm run db:studio`      | Abre a interface do Prisma Studio           |

### Frontend

| Comando                | Descrição                                    |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Inicia o Vite em modo de desenvolvimento     |
| `npm run build`        | Verifica os tipos e gera o build de produção |
| `npm run preview`      | Visualiza localmente o build gerado          |
| `npm run lint`         | Executa o ESLint                             |
| `npm run format`       | Formata os arquivos com Prettier             |
| `npm run format:check` | Verifica a formatação sem alterar arquivos   |

## Decisões técnicas

- Frontend e backend separados para deixar clara a comunicação via API REST.
- SQLite para reduzir a configuração local e manter a demonstração portátil.
- Prisma para modelagem, migrations e acesso tipado ao banco.
- `fetch` em vez de uma dependência HTTP adicional.
- Drag and drop no Kanban com suporte a mouse, toque e teclado, mantendo o seletor como alternativa acessível.
- Carregamento do módulo do Kanban sob demanda para reduzir o JavaScript inicial.
- Senhas armazenadas somente como hashes bcrypt.
- JWT com expiração de oito horas armazenado em cookie inacessível ao JavaScript.
- Autorização por perfil aplicada na API, independentemente da visibilidade dos controles no frontend.
- Logs de atividade associados ao nome do usuário autenticado.

## Aprendizados

- Estruturação de rotas, controllers e middlewares com Express.
- Modelagem de relacionamentos entre projetos, tarefas e usuários.
- Persistência e migrations com Prisma e SQLite.
- Integração entre uma SPA React e uma API REST independente.
- Tratamento de estados assíncronos e erros no frontend.
- Organização e manutenção de uma aplicação full-stack em TypeScript.
- Autenticação entre aplicações separadas usando cookies, CORS e JWT.

## Próximas evoluções

- Recuperação e redefinição de senha.
- Paginação e filtros processados pelo backend.
- Migração do SQLite para PostgreSQL em produção.
- Testes unitários do frontend e testes end-to-end.
- Docker e Docker Compose.
- Notificações e auditoria associada ao usuário autenticado.

## Roteiro rápido de demonstração

1. Entrar com a conta de demonstração do Nathan.
2. Apresentar os indicadores e atividades recentes no dashboard.
3. Criar ou abrir um projeto e visualizar suas tarefas.
4. Criar uma tarefa com responsável, prioridade e prazo.
5. Mover a tarefa pelo Kanban e localizar a ação no histórico.

Esse fluxo demonstra, em poucos minutos, a integração completa entre React, API REST, Express, Prisma e SQLite.
