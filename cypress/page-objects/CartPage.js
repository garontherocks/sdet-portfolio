export class CartPage {
  // Elements
  getCartIcon() {
    return cy.get('.shopping_cart_link');
  }

  getCartBadge() {
    return cy.get('.shopping_cart_badge');
  }

  getCartItems() {
    return cy.get('.cart_item');
  }

  getCartItemPrices() {
    return cy.get('.inventory_item_price');
  }

  getCheckoutButton() {
    return cy.get('[data-test="checkout"]');
  }

  getContinueButton() {
    return cy.get('[data-test="continue"]');
  }

  getFinishButton() {
    return cy.get('[data-test="finish"]');
  }

  getTotalPriceLabel() {
    return cy.get('.summary_total_label');
  }

  getPurchaseConfirmationMessage() {
    return cy.get('.complete-header');
  }

  // Cart interaction
  addFirstProductToCart() {
    cy.get('.inventory_item').first().find('button').click();
  }

  addProductByName(productName) {
    cy.contains('.inventory_item', productName)
      .find('button')
      .click();
  }

  removeProductByName(productName) {
    cy.contains('.cart_item', productName)
      .find('[data-test^="remove"]')
      .click();
  }

  goToCart() {
    this.getCartIcon().click();
  }

  assertProductInCart(productName) {
    cy.get('.cart_item').should('contain.text', productName);
  }

  assertProductNotInCart(productName) {
    this.getCartItems().each(($el) => {
      cy.wrap($el).should('not.contain.text', productName);
    });
  }

  assertCartCount(expectedCount) {
    this.getCartBadge().should('have.text', expectedCount.toString());
  }

  assertItemSubtotal(expectedSubtotal) {
    cy.contains('.summary_subtotal_label', `Item total: $${expectedSubtotal.toFixed(2)}`);
  }
  
  // Checkout steps
  clickCheckoutButton() {
    this.getCheckoutButton().click();
  }

  fillCheckoutForm({ firstName, lastName, postalCode }) {
    cy.get('[data-test="firstName"]').type(firstName);
    cy.get('[data-test="lastName"]').type(lastName);
    cy.get('[data-test="postalCode"]').type(postalCode);
  }

  clickContinueButton() {
    this.getContinueButton().click();
  }

  clickFinishButton() {
    this.getFinishButton().click();
  }

  proceedToCheckout() {
    this.clickCheckoutButton();
    this.clickContinueButton();
  }

  finishPurchase() {
    this.clickFinishButton();
  }

  assertPurchaseComplete() {
    this.getPurchaseConfirmationMessage().should('contain.text', 'Thank you for your order!');
  }

  assertCartTotal(expectedTotal) {
    this.getTotalPriceLabel().should('contain.text', `$${expectedTotal.toFixed(2)}`);
  }

  // Helper: convert prices to floats
  getCartItemPricesAsNumbers() {
    return this.getCartItemPrices().then(($els) => {
      return Cypress._.map($els, (el) =>
        parseFloat(el.innerText.replace('$', ''))
      );
    });
  }
}
