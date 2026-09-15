import { test, expect } from '@playwright/test';
import { users } from '../../test-data/users';

const { apiLoginMissingPassword } = users;

test.describe('ReqRes API - Login Negative', () => {
  test('returns 400 when password is missing', async ({ request }) => {
    const apiKey = process.env.REQRES_API_KEY;
    expect(apiKey, 'REQRES_API_KEY must be configured').toBeTruthy();

    const response = await request.post('https://reqres.in/api/login', {
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey! },
      data: { email: apiLoginMissingPassword.email },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'Missing password' });
  });
});
