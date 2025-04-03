import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../page-objects/LoginPage';
import { CartPage } from '../../../page-objects/CartPage';
import { users } from '../../../test-data/users';
import { cartData } from '../../../test-data/cart';

let loginPage: LoginPage;
let cartPage: CartPage;

const { validStandard, checkoutInfo } = users;
const { productA, productB } = cartData.products;

const productsToAdd = [productA, productB];

test.describe('Cart UI - Remove Products', () => {
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    cartPage = new CartPage(page);

    await loginPage.visit();
    await loginPage.loginAs(validStandard.username, validStandard.password);

    for (const product of productsToAdd) {
      await cartPage.addProductByName(product);
    }

    await cartPage.goToCart();
  });

  test('should remove a single product from the cart', async () => {
    await cartPage.removeProductByName(productA);
    await cartPage.assertProductNotInCart(productA);
    await cartPage.assertProductInCart(productB);
    await cartPage.assertCartCount(1);
  });

  test('should allow proceeding with one product removed', async () => {
    await cartPage.removeProductByName(productB);
    await cartPage.assertProductNotInCart(productB);

    await cartPage.proceedToCheckout();
    await cartPage.fillCheckoutForm(checkoutInfo);
    await cartPage.clickContinueButton();
    await cartPage.finishPurchase();
    await cartPage.assertPurchaseComplete();
  });
});
