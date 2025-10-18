import { test, expect } from '@playwright/test';
import { users } from '../../test-data/users';

const { apiCreateUser } = users;

test.describe('ReqRes API - Create User', () => {    
  test('should create a new user successfully (handles optional API key)', async ({ request }) => {
    const apiKey = process.env.REQRES_API_KEY;
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (apiKey) headers['x-api-key'] = apiKey;

    const response = await request.post('https://reqres.in/api/users', {
      headers,
      data: {
        name: apiCreateUser.name,
        job: apiCreateUser.job
      }
    });

    const status = response.status();
    const responseBody = await response.json();

    if (status === 201) {
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('createdAt');
    } else {
      expect(status).toBe(401);
      expect(responseBody).toHaveProperty('error', 'Missing API key');
    }
  });
});
