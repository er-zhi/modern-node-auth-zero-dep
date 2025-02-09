import type { User } from './IUser.ts';

export interface IUserService {
  createUser(username: string, password: string): User | null;
  getUserByUsername(username: string): User | null;
  getUserById(userId: number | undefined): User | null;
  storeRefreshToken(userId: number, refreshToken: string): boolean;
  removeRefreshToken(refreshToken: string): boolean;
  hashPassword(password: string): string;
  verifyPassword(password: string, hashedPassword: string): boolean;
}
