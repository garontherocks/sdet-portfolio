import { test, expect } from '@playwright/test';
import { users } from '../../test-data/users';

const { apiLoginMissingPassword } = users;

test.describe('ReqRes API - Login Negative', () => {
  test('should return 400 if password is missing (or 401 without API key)', async ({ request }) => {
    const apiKey = process.env.REQRES_API_KEY;
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (apiKey) headers['x-api-key'] = apiKey;

    const response = await request.post('https://reqres.in/api/login', {
      headers,
      data: {
        email: apiLoginMissingPassword.email
      }
    });

    const status = response.status();
    const responseBody = await response.json();

    if (status === 400) {
      expect(responseBody).toHaveProperty('error', 'Missing password');
    } else {
      expect(status).toBe(401);
      expect(responseBody).toHaveProperty('error', 'Missing API key');
    }
  });
});
