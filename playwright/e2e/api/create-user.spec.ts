import { test, expect } from '@playwright/test';
import { users } from '../../test-data/users';

const { apiCreateUser } = users;

test.describe('ReqRes API - Create User', () => {
  test('creates a new user successfully', async ({ request }) => {
    const apiKey = process.env.REQRES_API_KEY;
    expect(apiKey, 'REQRES_API_KEY must be configured').toBeTruthy();

    const response = await request.post('https://reqres.in/api/users', {
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey! },
      data: apiCreateUser,
    });

    expect(response.status()).toBe(201);
    expect(response.headers()['content-type']).toContain('application/json');
    await expect(response).toBeOK();
    const body = await response.json();
    expect(body).toMatchObject(apiCreateUser);
    expect(body.id).toBeTruthy();
    expect(body.createdAt).toBeTruthy();
  });
});
