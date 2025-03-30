import { LoginPage } from '../../../page-objects/LoginPage';
import { users } from '../../../test-data/users';

const loginPage = new LoginPage();

describe('SauceDemo - Login', () => {
  beforeEach(() => {
    loginPage.visit();
  });

  it('should login successfully with standard user', () => {
    loginPage.loginAs(users.validStandard.username, users.validStandard.password);
    cy.url().should('include', '/inventory.html');
    cy.get('.inventory_list').should('be.visible');
  });
});
