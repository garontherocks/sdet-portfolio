import { users } from '../../test-data/users';

const { apiCreateUser } = users;

describe('ReqRes API - Create User', () => {
  const apiKey = Cypress.env('REQRES_API_KEY');
  const maybeAuthHeaders = apiKey ? { 'x-api-key': apiKey } : {};

  it('should create a new user successfully (handles optional API key)', () => {
    cy.request({
      method: 'POST',
      url: 'https://reqres.in/api/users',
      headers: { ...maybeAuthHeaders, 'Content-Type': 'application/json' },
      failOnStatusCode: false,
      body: {
        name: apiCreateUser.name,
        job: apiCreateUser.job
      },
    }).then((response) => {
      if (apiKey) {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('createdAt');
      } else {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('error', 'Missing API key');
      }
    });
  });
});
