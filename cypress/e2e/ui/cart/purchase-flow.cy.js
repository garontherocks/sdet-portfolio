import { LoginPage } from '../../../page-objects/LoginPage';
import { CartPage } from '../../../page-objects/CartPage';
import { users } from '../../../test-data/users';
import { cartData } from '../../../test-data/cart';

const loginPage = new LoginPage();
const cartPage = new CartPage();
const { validStandard, checkoutInfo } = users;
const { productA, productB } = cartData.products;

const productsToAdd = [productA, productB];

describe('Cart UI - Complete Purchase Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    loginPage.loginAs(validStandard.username, validStandard.password);
    productsToAdd.forEach(product => {
      cartPage.addProductByName(product);
    });
    cartPage.goToCart();
  });

  it('should complete the full purchase flow successfully', () => {
    cartPage.proceedToCheckout();
    cartPage.fillCheckoutForm(checkoutInfo);
    cartPage.clickContinueButton();
    cartPage.finishPurchase();
    cartPage.assertPurchaseComplete();
  });
});
