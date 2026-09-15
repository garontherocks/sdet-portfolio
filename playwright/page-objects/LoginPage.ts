import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async visit() {
    await this.page.goto('/');
  }

  async fillUsername(username: string) {
    await this.page.locator('[data-test="username"]').fill(username);
  }

  async fillPassword(password: string) {
    await this.page.locator('[data-test="password"]').fill(password);
  }

  async clickLogin() {
    await this.page.locator('[data-test="login-button"]').click();
  }

  async loginAs(username: string, password: string) {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  getErrorMessage() {
    return this.page.locator('[data-test="error"]');
  }
}
