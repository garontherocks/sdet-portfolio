import { test, expect } from '@playwright/test';
import { users } from '../../test-data/users';

test.describe('ReqRes API - Create User', () => {
    const { apiCreateUser } = users;
  test('should create a new user successfully', async ({ request }) => {
    const response = await request.post('https://reqres.in/api/users', {
      data: {
        name: apiCreateUser.name,
        job: apiCreateUser.job
      }
    });

    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    expect(responseBody).toHaveProperty('createdAt');
  });
});
