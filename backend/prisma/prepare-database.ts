import 'dotenv/config';
import { closeSync, mkdirSync, openSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const databaseUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';

if (!databaseUrl.startsWith('file:')) {
  throw new Error(
    'DATABASE_URL deve apontar para um arquivo SQLite usando o protocolo file:.',
  );
}

const configuredPath = decodeURIComponent(
  databaseUrl.slice('file:'.length).split('?')[0] ?? '',
);

if (!configuredPath) {
  throw new Error('DATABASE_URL não contém um caminho válido para o banco SQLite.');
}

const databasePath = resolve(process.cwd(), configuredPath);
mkdirSync(dirname(databasePath), { recursive: true });
closeSync(openSync(databasePath, 'a'));
