import 'dotenv/config';
import { app } from './app.js';
import { prisma } from './prisma/client.js';

const port = Number(process.env.PORT) || 3001;

const server = app.listen(port, () => {
  console.log(`TaskFlow API disponível em http://localhost:${port}/api`);
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
