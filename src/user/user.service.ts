import type { IDatabase, IUserService } from '../interfaces/index.ts';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

interface User {
  id: number;
  username: string;
  password: string;
  refresh_token?: string;
}

export class UserService implements IUserService{
  private db: IDatabase;
  private readonly saltRounds: number;

  constructor(db: IDatabase) {
    this.db = db;
    this.saltRounds = parseInt(process.env.SALT_ROUNDS || '12', 10);
  }

  /** ✅ Securely create a new user */
  createUser(username: string, password: string): User | null {
    const hashedPassword = this.hashPassword(password);
    try {
      const stmt = this.db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
      const result = stmt.run(username, hashedPassword);
      return result.changes > 0 ? this.getUserByUsername(username) : null;
    } catch (error) {
      console.error(`⚠️ Error creating user:`, error);
      return null;
    }
  }

  /** ✅ Get user by username */
  getUserByUsername(username: string): User | null {
    try {
      const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
      return stmt.get(username) as User | null;
    } catch (error) {
      console.error(`⚠️ Error fetching user by username (${username}):`, error);
      return null;
    }
  }

  /** ✅ Get user by ID */
  getUserById(userId: number | undefined): User | null {
    if (!userId) return null; // ✅ Handle undefined values safely
    try {
      const stmt = this.db.prepare('SELECT id, username FROM users WHERE id = ?');
      return stmt.get(userId) as User | null;
    } catch (error) {
      console.error(`⚠️ Error fetching user by ID (${userId}):`, error);
      return null;
    }
  }

  /** ✅ Store refresh token in DB */
  storeRefreshToken(userId: number, refreshToken: string): boolean {
    try {
      const stmt = this.db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?');
      return stmt.run(refreshToken, userId).changes > 0;
    } catch (error) {
      console.error(`⚠️ Error storing refresh token for user ID (${userId}):`, error);
      return false;
    }
  }

  /** ✅ Remove refresh token (logout) */
  removeRefreshToken(refreshToken: string): boolean {
    try {
      const stmt = this.db.prepare('UPDATE users SET refresh_token = NULL WHERE refresh_token = ?');
      return stmt.run(refreshToken).changes > 0;
    } catch (error) {
      console.error(`⚠️ Error removing refresh token:`, error);
      return false;
    }
  }

  /** ✅ Hash password securely */
  hashPassword(password: string): string {
    const salt = randomBytes(this.saltRounds).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}.${hash}`;
  }

  /** ✅ Verify if password is correct */
  verifyPassword(password: string, hashedPassword: string): boolean {
    try {
      const [salt, hash] = hashedPassword.split('.');
      const newHash = scryptSync(password, salt, 64).toString('hex');
      return timingSafeEqual(Buffer.from(newHash), Buffer.from(hash));
    } catch (error) {
      console.error(`⚠️ Error verifying password:`, error);
      return false;
    }
  }
}
