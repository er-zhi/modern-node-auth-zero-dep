import { DatabaseSync } from 'node:sqlite';

export class Database {
  private static instance: DatabaseSync;

  static getInstance(): DatabaseSync {
    if (!Database.instance) {
      Database.instance = new DatabaseSync('users.db');

      // Ensure `users` table exists
      Database.instance.exec(`
          CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL,
              refresh_token TEXT
          ) STRICT;
      `);

      // Ensure `redis_store` table exists (for caching tokens)
      Database.instance.exec(`
          CREATE TABLE IF NOT EXISTS redis_store (
              key TEXT PRIMARY KEY,
              value TEXT,
              expires_at INTEGER
          ) STRICT;
      `);
    }
    return Database.instance;
  }
}
