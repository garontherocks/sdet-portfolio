import { users } from '../../test-data/users';

const { apiLoginMissingPassword } = users;

describe('ReqRes API - Login Negative', () => {
  const apiKey = Cypress.env('REQRES_API_KEY');
  const maybeAuthHeaders = apiKey ? { 'x-api-key': apiKey } : {};

  it('should return 400 if password is missing (or 401 without API key)', () => {
    cy.request({
      method: 'POST',
      url: 'https://reqres.in/api/login',
      headers: { ...maybeAuthHeaders, 'Content-Type': 'application/json' },
      failOnStatusCode: false,
      body: {
        email: apiLoginMissingPassword.email
      },
    }).then((response) => {
      if (apiKey) {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('error', 'Missing password');
      } else {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('error', 'Missing API key');
      }
    });
  });
});
