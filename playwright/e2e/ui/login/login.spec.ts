import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../page-objects/LoginPage';
import { users } from '../../../test-data/users';

test.describe('SauceDemo - Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.visit();
  });

  test('should login successfully with standard user', async ({ page }) => {
    await loginPage.loginAs(users.validStandard.username, users.validStandard.password);
    await expect(page).toHaveURL(/.*inventory/);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  test('should display error for locked out user', async () => {
    await loginPage.loginAs(users.lockedOut.username, users.lockedOut.password);
    const errorMsg = await loginPage.getErrorMessage();
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Sorry, this user has been locked out');
  });
});
