import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { JWT } from '../utils/JWT.ts';
import { Database } from '../database/database.ts';
import { Redis } from '../redis/fake-redis.ts';

interface User {
  id: number;
  username: string;
  password: string;
  refresh_token?: string;
}

export class AuthService {
  private saltRounds: number;
  private jwt: JWT;
  private db = Database.getInstance();
  private redis: Redis;

  constructor(jwt: JWT, redis: Redis) {
    this.saltRounds = parseInt(process.env.SALT_ROUNDS || '12', 10);
    this.jwt = jwt;
    this.redis = redis;
  }

  hashPassword(password: string): string {
    const salt = randomBytes(this.saltRounds).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}.${hash}`;
  }

  verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split('.');
    const newHash = scryptSync(password, salt, 64).toString('hex');
    return timingSafeEqual(Buffer.from(newHash), Buffer.from(hash));
  }

  signUp(username: string, password: string): { id: number; accessToken: string; refreshToken: string } | null {
    const hashedPassword = this.hashPassword(password);
    try {
      const stmt = this.db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
      const { lastInsertRowid } = stmt.run(username, hashedPassword);
      const id = Number(lastInsertRowid);

      const accessToken = this.jwt.sign({ id, username });
      const refreshToken = this.jwt.sign({ id }, true);

      this.redis.set(accessToken, 'valid', 600); // 10 min TTL
      this.db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').run(refreshToken, id);

      return { id, accessToken, refreshToken };
    } catch (error) {
      console.error('SignUp Error:', error);
      return null;
    }
  }

  login(username: string, password: string): { accessToken: string; refreshToken: string } | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username) as User | undefined;

    if (!user || !this.verifyPassword(password, user.password)) {
      return null;
    }

    const accessToken = this.jwt.sign({ id: user.id, username: user.username });
    const refreshToken = this.jwt.sign({ id: user.id }, true);

    this.redis.set(accessToken, 'valid', 600);
    this.db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').run(refreshToken, user.id);

    return { accessToken, refreshToken };
  }

  refresh(refreshToken: string): { accessToken: string; refreshToken: string } | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE refresh_token = ?');
    const user = stmt.get(refreshToken) as User | undefined;

    if (!user) return null;

    const newAccessToken = this.jwt.sign({ id: user.id, username: user.username });
    const newRefreshToken = this.jwt.sign({ id: user.id }, true);

    this.redis.set(newAccessToken, 'valid', 600);
    this.db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').run(newRefreshToken, user.id);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  logout(accessToken: string, refreshToken: string): boolean {
    try {
      if (!accessToken || !refreshToken) {
        console.error('Logout Error: Missing tokens');
        return false; // Ensure both tokens are required
      }

      // Blacklist the access token to prevent reuse
      this.redis.set(accessToken, 'blacklisted', 3600); // Blacklist for 1 hour

      // Remove refresh token from database
      const stmt = this.db.prepare('UPDATE users SET refresh_token = NULL WHERE refresh_token = ?');
      const result = stmt.run(refreshToken);

      return result.changes > 0; // Return `true` if the refresh token was removed
    } catch (error) {
      console.error('Logout Error:', error);
      return false; // Ensure failure is handled properly
    }
  }
  getUserById(userId: number): { id: number; username: string } | null {
    try {
      const stmt = this.db.prepare('SELECT id, username FROM users WHERE id = ?');
      const user = stmt.get(userId) as { id: number; username: string } | undefined;
      return user || null;
    } catch (error) {
      console.error(`Error fetching user by ID (${userId}):`, error);
      return null;
    }
  }

  verifyAccessToken(token: string): { id: number; username: string } | null {
    try {
      const status = this.redis.get(token);

      if (status === 'blacklisted') {
        return null; // Token is blacklisted
      }

      if (status === 'valid') {
        const decoded = this.jwt.decode(token);
        if (!decoded || !decoded.id) {
          return null;
        }

        return this.getUserById(decoded.id);
      }

      // 🚨 If Redis doesn't have the token, verify using JWT
      if (!this.jwt.verify(token)) {
        return null;
      }

      const decoded = this.jwt.decode(token);
      if (!decoded || !decoded.id) {
        return null;
      }

      return this.getUserById(decoded.id); // ✅ Fallback to DB lookup
    } catch (error) {
      console.error('⚠️ Redis Failure: Falling back to JWT & Database Lookup', error);

      // 🚨 Fallback: Verify token + Fetch from DB
      if (!this.jwt.verify(token)) {
        return null;
      }

      const decoded = this.jwt.decode(token);
      if (!decoded || !decoded.id) {
        return null;
      }

      return this.getUserById(decoded.id); // Final fallback to DB
    }
  }
}
