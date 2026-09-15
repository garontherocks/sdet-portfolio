import { users } from '../../test-data/users';

const { apiCreateUser } = users;

describe('ReqRes API - Create User', () => {
  it('creates a new user successfully', () => {
    const apiKey = Cypress.env('REQRES_API_KEY');
    expect(apiKey, 'REQRES_API_KEY must be configured').to.be.a('string').and.not.be.empty;

    cy.request({
      method: 'POST',
      url: 'https://reqres.in/api/users',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      body: apiCreateUser,
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.headers['content-type']).to.include('application/json');
      expect(response.body).to.include({ name: apiCreateUser.name, job: apiCreateUser.job });
      expect(response.body).to.have.property('id').and.not.be.empty;
      expect(response.body).to.have.property('createdAt').and.not.be.empty;
    });
  });
});
