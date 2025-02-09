import test from 'node:test';
import assert from 'node:assert/strict';
import type { IDatabase } from '../../src/interfaces/index.ts';
import { UserService } from '../../src/user/user.service.ts';

/** ✅ Mock Database Implementation */
class MockDatabase implements IDatabase {
  private users: Map<string, { id: number; username: string; password: string; refresh_token?: string }> = new Map();
  private userIdCounter = 1;

  prepare(query: string) {
    return {
      run: (username: string, password?: string) => {
        if (query.startsWith('INSERT INTO users')) {
          const id = this.userIdCounter++;
          this.users.set(username, { id, username, password: password || '', refresh_token: undefined });
          return { changes: 1 };
        }

        if (query.startsWith('UPDATE users SET refresh_token')) {
          if (this.users.has(username)) {
            this.users.get(username)!.refresh_token = password; // password param used as refresh_token
            return { changes: 1 };
          }
          return { changes: 0 };
        }

        return { changes: 0 };
      },

      get: (username: string) => {
        return this.users.get(username) || null;
      },
    };
  }
}

// ✅ Use the Mock Database for Testing
const db = new MockDatabase();
const userService = new UserService(db);

/** ✅ Test Cases */
test('UserService should create a user and retrieve it', () => {
  const username = `testuser_${Date.now()}`;
  const password = 'securepassword123';

  const user = userService.createUser(username, password);
  assert.ok(user, 'User should be created');

  const fetchedUser = userService.getUserByUsername(username);
  assert.deepStrictEqual(fetchedUser?.username, username, 'Retrieved username should match');
});

test('UserService should hash and verify passwords correctly', () => {
  const password = 'securepassword123';
  const hashedPassword = userService.hashPassword(password);

  assert.ok(userService.verifyPassword(password, hashedPassword), 'Password verification should pass');
  assert.ok(!userService.verifyPassword('wrongpassword', hashedPassword), 'Wrong password should fail');
});
