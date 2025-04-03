import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../page-objects/LoginPage';
import { CartPage } from '../../../page-objects/CartPage';
import { users } from '../../../test-data/users';
import { cartData } from '../../../test-data/cart';

let loginPage: LoginPage;
let cartPage: CartPage;

const { validStandard, checkoutInfo } = users;
const { productA } = cartData.products;

test.describe('Cart UI - Complete Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    cartPage = new CartPage(page);

    await loginPage.visit();
    await loginPage.loginAs(validStandard.username, validStandard.password);
    await cartPage.addProductByName(productA);
    await cartPage.goToCart();
    await cartPage.proceedToCheckout();
    await cartPage.fillCheckoutForm(checkoutInfo);
    await cartPage.clickContinueButton();
  });

  test('should complete the checkout and show confirmation', async () => {
    await cartPage.finishPurchase();
    await cartPage.assertPurchaseComplete();
  });
});
