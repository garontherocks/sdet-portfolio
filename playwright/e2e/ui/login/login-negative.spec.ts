import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../page-objects/LoginPage';
import { users } from '../../../test-data/users';

let loginPage: LoginPage;
const { lockedOut } = users;

test.describe('SauceDemo - Login Negative Tests', () => {
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.visit();
  });

  test('should display error for locked out user', async () => {
    await loginPage.loginAs(lockedOut.username, lockedOut.password);
    const errorMsg = await loginPage.getErrorMessage();
    await expect(errorMsg).toContainText(
      'Epic sadface: Sorry, this user has been locked out.'
    );
  });
});
