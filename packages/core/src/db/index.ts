import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export const initDb = (dbPath: string) => {
  const client = createClient({ url: `file:${dbPath}` });
  db = drizzle(client, { schema });
  return db;
};

export const getDb = () => {
  if (!db) throw new Error('Database not initialized. Call initDb first.');
  return db;
};

export * from './schema';
