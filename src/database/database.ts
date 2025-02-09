import { DatabaseSync } from 'node:sqlite';
import type { IDatabase } from '../interfaces/index.ts';

export class Database implements IDatabase {
  private static instance: DatabaseSync | null = null;

  private constructor() {}

  static getInstance(): DatabaseSync {
    if (!Database.instance) {
      Database.instance = new DatabaseSync('users.db');
      Database.instance.exec(`
          CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL,
              refresh_token TEXT
          );
          CREATE TABLE IF NOT EXISTS redis_store (
              key TEXT PRIMARY KEY,
              value TEXT,
              expires_at INTEGER
          );
      `);
    }
    return Database.instance;
  }

  prepare(query: string) {
    return Database.getInstance().prepare(query);
  }
}
