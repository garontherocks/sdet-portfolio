import { test } from '@playwright/test';
import { LoginPage } from '../../../page-objects/LoginPage';
import { CartPage } from '../../../page-objects/CartPage';
import { users } from '../../../test-data/users';
import { cartData } from '../../../test-data/cart';

let loginPage: LoginPage;
let cartPage: CartPage;

const { validStandard } = users;
const { productA } = cartData.products;

test.describe('Cart UI - Add Single Product', () => {
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    cartPage = new CartPage(page);

    await loginPage.visit();
    await loginPage.loginAs(validStandard.username, validStandard.password);
  });

  test('should add a single product and update cart count', async () => {
    await cartPage.addProductByName(productA);
    await cartPage.assertCartCount(1);
    await cartPage.goToCart();
    await cartPage.assertProductInCart(productA);
  });
});
