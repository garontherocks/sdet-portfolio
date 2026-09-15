import { test, expect } from '@playwright/test';
import { users } from '../../test-data/users';

const { apiLoginMissingPassword } = users;

test.describe('ReqRes API - Login Negative', () => {
  test('returns 400 when password is missing', async ({ request }) => {
    const response = await request.post('https://reqres.in/api/login', {
      headers: { 'content-type': 'application/json' },
      data: { email: apiLoginMissingPassword.email },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'Missing password' });
  });
});
