import type { IDatabase, IRedis } from '../interfaces/index.ts';

export class Redis implements IRedis {
  private db: IDatabase;

  constructor(db: IDatabase) {
    this.db = db;
    this.startCleanupJob();
  }

  set(key: string, value: string, ttlSeconds: number = 600): void {
    const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
    const stmt = this.db.prepare(`
        INSERT INTO redis_store (key, value, expires_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, expires_at = excluded.expires_at
    `);
    stmt.run(key, value, expiresAt);
  }

  get(key: string): string | null {
    try {
      const stmt = this.db.prepare('SELECT value, expires_at FROM redis_store WHERE key = ?');
      const row = stmt.get(key) as { value: string; expires_at: number } | undefined;

      if (!row || row.expires_at < Math.floor(Date.now() / 1000)) {
        this.del(key); // Auto-delete expired keys
        return null;
      }
      return row.value;
    } catch (error) {
      console.error(`Redis Error: Failed to get key "${key}"`, error);
      return null;
    }
  }

  del(key: string): boolean {
    try {
      const stmt = this.db.prepare('DELETE FROM redis_store WHERE key = ?');
      return stmt.run(key).changes > 0;
    } catch (error) {
      console.error(`Redis Error: Failed to delete key "${key}"`, error);
      return false;
    }
  }

  private startCleanupJob() {
    setInterval(() => {
      try {
        const stmt = this.db.prepare('DELETE FROM redis_store WHERE expires_at < ?');
        stmt.run(Math.floor(Date.now() / 1000));
      } catch (error) {
        console.error('Redis Cleanup Error:', error);
      }
    }, 5 * 60 * 1000);
  }
}
