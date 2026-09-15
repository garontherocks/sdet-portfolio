import { users } from '../../test-data/users';

const { apiLoginMissingPassword } = users;

describe('ReqRes API - Login Negative', () => {
  it('returns 400 when password is missing', () => {
    const apiKey = Cypress.env('REQRES_API_KEY');
    expect(apiKey, 'REQRES_API_KEY must be configured').to.be.a('string').and.not.be.empty;

    cy.request({
      method: 'POST',
      url: 'https://reqres.in/api/login',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      failOnStatusCode: false,
      body: { email: apiLoginMissingPassword.email },
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error', 'Missing password');
    });
  });
});
