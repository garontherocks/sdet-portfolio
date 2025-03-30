import { LoginPage } from '../../../support/page-objects/LoginPage';
import { users } from '../../../test-data/users';

const loginPage = new LoginPage();

describe('SauceDemo - Login Negative Tests', () => {
  beforeEach(() => {
    loginPage.visit();
  });

  it('should display error for locked out user', () => {
    loginPage.loginAs(users.lockedOut.username, users.lockedOut.password);
    loginPage.getError().should('contain', 'Epic sadface: Sorry, this user has been locked out.');
  });
});
