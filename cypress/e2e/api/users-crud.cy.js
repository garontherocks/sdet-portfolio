describe('ReqRes API - Users CRUD Basics', () => {
  const baseUrl = 'https://reqres.in/api';
  const apiKey = Cypress.env('REQRES_API_KEY');
  const maybeAuthHeaders = apiKey ? { 'x-api-key': apiKey } : {};

  it('GET list users (page=2) with header checks', () => {
    cy.request(`${baseUrl}/users?page=2`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers).to.have.property('content-type');
      expect(response.headers['content-type']).to.include('application/json');
      expect(response.body.data).to.be.an('array').and.not.be.empty;
    });
  });

  it('GET single user id=2', () => {
    cy.request(`${baseUrl}/users/2`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data).to.have.property('id', 2);
    });
  });

  it('PUT update user (handles optional API key)', () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/users/2`,
      headers: { ...maybeAuthHeaders, 'Content-Type': 'application/json' },
      body: { name: 'John', job: 'Senior SDET' },
      failOnStatusCode: false,
    }).then((response) => {
      if (apiKey) {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('updatedAt');
      } else {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('error', 'Missing API key');
      }
    });
  });

  it('DELETE user returns 204 (handles optional API key)', () => {
    cy.request({
      method: 'DELETE',
      url: `${baseUrl}/users/2`,
      headers: maybeAuthHeaders,
      failOnStatusCode: false,
    }).then((response) => {
      if (apiKey) {
        expect(response.status).to.eq(204);
        expect(response.body).to.be.empty; // no content
      } else {
        expect(response.status).to.eq(401);
        expect(response.body).to.have.property('error', 'Missing API key');
      }
    });
  });
});
