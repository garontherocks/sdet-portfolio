import { test } from '@playwright/test';
import { LoginPage } from '../../../page-objects/LoginPage';
import { CartPage } from '../../../page-objects/CartPage';
import { users } from '../../../test-data/users';
import { cartData } from '../../../test-data/cart';

let loginPage: LoginPage;
let cartPage: CartPage;

const { validStandard } = users;
const { productA, productB, productC } = cartData.products;

const productsToAdd = [productA, productB, productC];

test.describe('Cart UI - Add Multiple Products', () => {
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    cartPage = new CartPage(page);

    await loginPage.visit();
    await loginPage.loginAs(validStandard.username, validStandard.password);
  });

  test('should add multiple products and verify cart count', async () => {
    for (const product of productsToAdd) {
      await cartPage.addProductByName(product);
    }

    await cartPage.assertCartCount(productsToAdd.length);
    await cartPage.goToCart();

    for (const product of productsToAdd) {
      await cartPage.assertProductInCart(product);
    }
  });
});
