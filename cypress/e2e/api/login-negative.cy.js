import { users } from '../../test-data/users';

const { apiLoginMissingPassword } = users;

describe('ReqRes API - Login Negative', () => {
  it('should return 400 if password is missing', () => {
    cy.request({
      method: 'POST',
      url: 'https://reqres.in/api/login',
      failOnStatusCode: false,
      body: {
        email: apiLoginMissingPassword.email
      },
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('error', 'Missing password');
    });
  });
});
