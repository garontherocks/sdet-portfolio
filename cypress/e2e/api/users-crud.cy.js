describe('ReqRes API - Users CRUD', () => {
  const baseUrl = 'https://reqres.in/api';
  let headers;

  before(() => {
    const apiKey = Cypress.env('REQRES_API_KEY');
    expect(apiKey, 'REQRES_API_KEY must be configured').to.be.a('string').and.not.be.empty;
    headers = { 'x-api-key': apiKey };
  });

  it('lists users with contract checks', () => {
    cy.request({ method: 'GET', url: `${baseUrl}/users?page=2`, headers }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers['content-type']).to.include('application/json');
      expect(response.body).to.include.keys('page', 'per_page', 'total', 'data');
      expect(response.body.data).to.be.an('array').and.not.be.empty;
      response.body.data.forEach((user) => {
        expect(user).to.include.keys('id', 'email', 'first_name', 'last_name', 'avatar');
      });
    });
  });

  it('gets a single user', () => {
    cy.request({ method: 'GET', url: `${baseUrl}/users/2`, headers }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.include({ id: 2 });
      expect(response.body.data.email).to.match(/^\S+@\S+\.\S+$/);
    });
  });

  it('updates a user', () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/users/2`,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: { name: 'John', job: 'Senior SDET' },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.include({ name: 'John', job: 'Senior SDET' });
      expect(response.body).to.have.property('updatedAt').and.not.be.empty;
    });
  });

  it('deletes a user', () => {
    cy.request({ method: 'DELETE', url: `${baseUrl}/users/2`, headers }).then((response) => {
      expect(response.status).to.eq(204);
      expect(response.body).to.be.empty;
    });
  });
});
