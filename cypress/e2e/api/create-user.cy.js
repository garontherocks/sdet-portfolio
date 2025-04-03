import { users } from '../../test-data/users';

const { apiCreateUser } = users;

describe('ReqRes API - Create User', () => {
  it('should create a new user successfully', () => {
    cy.request({
      method: 'POST',
      url: 'https://reqres.in/api/users',
      body: {
        name: apiCreateUser.name,
        job: apiCreateUser.job
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('createdAt');
    });
  });
});
