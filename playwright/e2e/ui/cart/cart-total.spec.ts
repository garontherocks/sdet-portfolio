import { test } from '@playwright/test';
import { LoginPage } from '../../../page-objects/LoginPage';
import { CartPage } from '../../../page-objects/CartPage';
import { users } from '../../../test-data/users';
import { cartData } from '../../../test-data/cart';

let loginPage: LoginPage;
let cartPage: CartPage;

const { validStandard, checkoutInfo } = users;
const { productA, productB } = cartData.products;
const { prices } = cartData;

const productsToAdd = [productA, productB];

test.describe('Cart UI - Total Calculation', () => {
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    cartPage = new CartPage(page);

    await loginPage.visit();
    await loginPage.loginAs(validStandard.username, validStandard.password);

    for (const product of productsToAdd) {
      await cartPage.addProductByName(product);
    }

    await cartPage.goToCart();
    await cartPage.proceedToCheckout();
    await cartPage.fillCheckoutForm(checkoutInfo);
    await cartPage.clickContinueButton();
  });

  test('should correctly calculate the item subtotal', async () => {
    const expectedTotal = productsToAdd.reduce((sum, product) => sum + prices[product], 0);
    await cartPage.assertSubtotal(expectedTotal);
  });
});
