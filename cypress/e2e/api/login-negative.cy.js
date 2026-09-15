import { users } from '../../test-data/users';

const { apiLoginMissingPassword } = users;

describe('ReqRes API - Login Negative', () => {
  it('returns 400 when password is missing', () => {
    cy.request({
      method: 'POST',
      url: 'https://reqres.in/api/login',
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
      body: { email: apiLoginMissingPassword.email },
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error', 'Missing password');
    });
  });
});
