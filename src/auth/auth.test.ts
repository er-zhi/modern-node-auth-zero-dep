import assert from 'assert';
import { test } from 'node:test';

const BASE_URL = 'http://localhost:3000';

test('E2E Testing for User Authentication', async (t) => {
  let userId: number;
  let username: string;
  let accessToken: string;
  let refreshToken: string;

  const randomUsername = `user_${Math.random().toString(36).substring(7)}`;
  const password = 'securepassword';

  // Test: Register a user
  await t.test('Register User - Success', async () => {
    const response = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: randomUsername,
        password,
      }),
    });

    assert.strictEqual(response.status, 201);
    const data = await response.json();
    assert.ok(data.id, 'User ID should be returned');
    assert.ok(data.accessToken, 'Access token should be returned');
    assert.ok(data.refreshToken, 'Refresh token should be returned');

    userId = data.id;
    username = randomUsername;
    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
  });

  // Test: Fetch Profile (Protected Route)
  await t.test('Get Profile - Success', async () => {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`, // ✅ Send access token correctly
      },
    });

    assert.strictEqual(response.status, 200);
    const data = await response.json();
    assert.strictEqual(data.id, userId, `Profile ID should match user ID (${userId})`);
    assert.strictEqual(data.username, username, 'Profile username should match registered username');
  });

  // Test: Refresh Token
  await t.test('Refresh Token - Success', async () => {
    const response = await fetch(`${BASE_URL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    assert.strictEqual(response.status, 200);
    const data = await response.json();
    assert.ok(data.accessToken, 'New access token should be returned');
    assert.ok(data.refreshToken, 'New refresh token should be returned');

    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
  });

  // Test: Logout
  await t.test('Logout User - Success', async () => {
    const response = await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, refreshToken }),
    });

    assert.strictEqual(response.status, 200);
    const data = await response.json();
    assert.strictEqual(data.message, 'User logged out successfully');
  });
});
