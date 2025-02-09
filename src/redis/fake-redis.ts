import { Database } from '../database/database.ts';

export class Redis {
  private db = Database.getInstance();

  constructor() {
    this.startCleanupJob(); // fake cron job
  }

  set(key: string, value: string, ttlSeconds: number) {
    const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
    try {
      const stmt = this.db.prepare(`
        INSERT INTO redis_store (key, value, expires_at) 
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, expires_at = excluded.expires_at
      `);
      stmt.run(key, value, expiresAt);
    } catch (error) {
      console.error(`Redis Fallback: Failed to set key ${key}`, error);
    }
  }

  get(key: string): string | null {
    try {
      const stmt = this.db.prepare('SELECT value, expires_at FROM redis_store WHERE key = ?');
      const row = stmt.get(key) as { value: string; expires_at: number } | undefined;

      if (!row || row.expires_at < Math.floor(Date.now() / 1000)) {
        this.del(key); // Auto delete expired keys
        return null;
      }
      return row.value;
    } catch (error) {
      console.error(`Redis Fallback: Failed to get key ${key}`, error);
      return null;
    }
  }

  del(key: string): boolean {
    try {
      const stmt = this.db.prepare('DELETE FROM redis_store WHERE key = ?');
      const result = stmt.run(key);
      return result.changes > 0;
    } catch (error) {
      console.error(`Redis Fallback: Failed to delete key ${key}`, error);
      return false;
    }
  }

  // Cleanup Job: Remove Expired Keys Every 5 Minutes
  private startCleanupJob() {
    setInterval(() => {
      try {
        const stmt = this.db.prepare('DELETE FROM redis_store WHERE expires_at < ?');
        stmt.run(Math.floor(Date.now() / 1000));
        console.log('Redis Cleanup: Expired tokens removed.');
      } catch (error) {
        console.error('Redis Fallback: Cleanup failed.', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }
}
