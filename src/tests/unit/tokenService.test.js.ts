import test from 'node:test';
import assert from 'node:assert/strict';
import type { IJWT } from '../../interfaces/index.ts';
import { TokenService } from '../../token/token.service.ts';

/** ✅ Mock JWT Implementation */
class MockJWT implements IJWT {
  sign(payload: object, isRefresh = false, expiresIn = 3600): string {
    return `mocked.${isRefresh ? 'refresh' : 'access'}.${JSON.stringify(payload)}`;
  }

  verify(token: string): boolean {
    return token.startsWith('mocked.access') || token.startsWith('mocked.refresh');
  }

  decode<T>(token: string): T | null {
    try {
      const parts = token.split('.');
      return parts.length === 3 ? JSON.parse(parts[2]) as T : null;
    } catch {
      return null;
    }
  }
}

// ✅ Use the Mock JWT for Testing
const jwt = new MockJWT();
const tokenService = new TokenService(jwt);

/** ✅ Test Cases */
test('TokenService should sign and verify access tokens', () => {
  const payload = { id: 1, username: 'testuser' };
  const token = tokenService.signAccessToken(payload);
  assert.ok(tokenService.verify(token), 'Token should be valid');
});

test('TokenService should sign and verify refresh tokens', () => {
  const payload = { id: 1, username: 'testuser' };
  const token = tokenService.signRefreshToken(payload);
  assert.ok(tokenService.verifyRefreshToken(token), 'Refresh token should be valid');
});

test('TokenService should decode tokens correctly', () => {
  const payload = { id: 1, username: 'testuser' };
  const token = tokenService.signAccessToken(payload);
  const decoded = tokenService.decodeToken(token);

  if (decoded) {
    delete decoded.exp; // Remove expiration for comparison
  }

  assert.deepStrictEqual(decoded, payload, 'Decoded token should match the payload');
});
