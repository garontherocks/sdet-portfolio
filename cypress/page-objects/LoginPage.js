export class LoginPage {
  visit() {
    cy.visit('/');
  }

  fillUsername(username) {
    cy.get('[data-test="username"]').type(username);
  }

  fillPassword(password) {
    cy.get('[data-test="password"]').type(password);
  }

  clickLogin() {
    cy.get('[data-test="login-button"]').click();
  }

  loginAs(username, password) {
    this.fillUsername(username);
    this.fillPassword(password);
    this.clickLogin();
  }

  getError() {
    return cy.get('[data-test="error"]');
  }
}
