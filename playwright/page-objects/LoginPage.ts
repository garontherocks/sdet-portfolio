import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async visit() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  async fillUsername(username: string) {
    await this.page.fill('[data-test="username"]', username);
  }

  async fillPassword(password: string) {
    await this.page.fill('[data-test="password"]', password);
  }

  async clickLogin() {
    await this.page.click('[data-test="login-button"]');
  }

  async loginAs(username: string, password: string) {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  async getErrorMessage() {
    return this.page.locator('[data-test="error"]');
  }
}
