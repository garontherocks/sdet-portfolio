import { test, expect } from '@playwright/test';
import { users } from '../../test-data/users';

const { apiLoginMissingPassword } = users;

test.describe('ReqRes API - Login Negative', () => {
  test('should return 400 if password is missing', async ({ request }) => {
    const response = await request.post('https://reqres.in/api/login', {
      data: {
        email: apiLoginMissingPassword.email
      }
    });

    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error', 'Missing password');
  });
});
