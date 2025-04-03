import { Page, expect } from '@playwright/test';

export class CartPage {
  constructor(private page: Page) {}

  async addProductByName(productName: string) {
    const selector = `button[data-test="add-to-cart-${this.getProductId(productName)}"]`;
    await this.page.locator(selector).click();
  }

  async removeProductByName(productName: string) {
    const selector = `button[data-test="remove-${this.getProductId(productName)}"]`;
    await this.page.locator(selector).click();
  }

  async goToCart() {
    await this.page.locator('.shopping_cart_link').click();
  }

  async assertProductInCart(productName: string) {
    await expect(this.page.locator('.inventory_item_name', { hasText: productName })).toBeVisible();
  }

  async assertProductNotInCart(productName: string) {
    await expect(this.page.locator('.cart_item')).not.toContainText(productName);
  }

  async assertCartCount(expectedCount: number) {
    const badge = this.page.locator('.shopping_cart_badge');
    await expect(badge).toHaveText(expectedCount.toString());
  }

  async proceedToCheckout() {
    await this.page.locator('[data-test="checkout"]').click();
  }

  async fillCheckoutForm({ firstName, lastName, postalCode }: { firstName: string, lastName: string, postalCode: string }) {
    await this.page.locator('[data-test="firstName"]').fill(firstName);
    await this.page.locator('[data-test="lastName"]').fill(lastName);
    await this.page.locator('[data-test="postalCode"]').fill(postalCode);
  }

  async clickContinueButton() {
    await this.page.locator('[data-test="continue"]').click();
  }

  async finishPurchase() {
    await this.page.locator('[data-test="finish"]').click();
  }

  async assertPurchaseComplete() {
    await expect(this.page.locator('.complete-header')).toHaveText('Thank you for your order!');
  }

  async assertSubtotal(expected: number) {
    const totalText = await this.page.locator('.summary_subtotal_label').textContent();
    const actual = parseFloat(totalText?.replace('Item total: $', '') || '');
    expect(actual).toBeCloseTo(expected, 2);
  }

  private getProductId(productName: string): string {
    return productName.toLowerCase().replace(/ /g, '-');
  }
}
