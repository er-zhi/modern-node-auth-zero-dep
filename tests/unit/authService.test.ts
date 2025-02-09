import test from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from '../../src/auth/auth.service.ts';
import { IUserService, User, ITokenService, IRedis, IAuthService } from '../../src/interfaces/index.ts';

// ✅ Fixed `getUserById`: Added `password`
const mockUserService: Partial<IUserService> = {
  hashPassword: (password: string) => `mockHashed_${password}`,
  createUser: (username: string, hashedPassword: string) => ({ id: 1, username, password: hashedPassword }),
  getUserByUsername: (username: string) => ({ id: 1, username, password: `mockHashed_securepassword123` }),
  getUserById: (id: number) => (id === 1 ? { id: 1, username: 'testuser', password: 'mockPassword' } as User : null),  // ✅ Fixed
  verifyPassword: (password: string, hashedPassword: string) => hashedPassword === `mockHashed_${password}`,
  storeRefreshToken: (id: number, refreshToken: string) => true,
  removeRefreshToken: (refreshToken: string) => true,
};

// ✅ Partial Mocked `ITokenService`
const mockTokenService: Partial<ITokenService> = {
  signAccessToken: (payload) => `mockAccessToken_${payload.id}`,
  signRefreshToken: (payload) => `mockRefreshToken_${payload.id}`,
  verify: (token) => token.startsWith('mockAccessToken'),
  verifyRefreshToken: (token) => token.startsWith('mockRefreshToken'),
  decodeToken: (token) => (token.includes('mock') ? { id: 1, username: 'testuser' } : null),
};

// ✅ Partial Mocked `IRedis`
const mockRedis: Partial<IRedis> = {
  get: (key) => (key.startsWith('mockAccessToken') ? 'valid' : null),
  set: (key, value, ttl) => {},
};

// ✅ Initialize `AuthService` with Mocked Interfaces
const authService: IAuthService = new AuthService(
  mockUserService as IUserService,
  mockTokenService as ITokenService,
  mockRedis as IRedis
);

test('AuthService should sign up a user and return tokens', () => {
  const result = authService.signUp('testuser', 'securepassword123');

  assert.ok(result, 'Sign-up should return tokens');
  assert.equal(result?.accessToken, 'mockAccessToken_1', 'Access token should be correct');
  assert.equal(result?.refreshToken, 'mockRefreshToken_1', 'Refresh token should be correct');
});

test('AuthService should log in a user and return tokens', () => {
  const result = authService.login('testuser', 'securepassword123');

  assert.ok(result, 'Login should return tokens');
  assert.equal(result?.accessToken, 'mockAccessToken_1', 'Access token should be correct');
  assert.equal(result?.refreshToken, 'mockRefreshToken_1', 'Refresh token should be correct');
});

test('AuthService should refresh a token', () => {
  const result = authService.refresh('mockRefreshToken_1');

  assert.ok(result, 'Refresh should return new tokens');
  assert.equal(result?.accessToken, 'mockAccessToken_1', 'New access token should be correct');
  assert.equal(result?.refreshToken, 'mockRefreshToken_1', 'New refresh token should be correct');
});

test('AuthService should log out and invalidate tokens', () => {
  const result = authService.logout('mockAccessToken_1', 'mockRefreshToken_1');

  assert.equal(result, true, 'Logout should succeed');
});

test('AuthService should verify an access token', () => {
  const result = authService.verifyAccessToken('mockAccessToken_1');

  assert.ok(result, 'Verification should return a user');
  assert.equal(result?.id, 1, 'User ID should be correct');
  assert.equal(result?.username, 'testuser', 'Username should be correct');
});
