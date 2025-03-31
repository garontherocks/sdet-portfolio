import { LoginPage } from '../../../page-objects/LoginPage';
import { CartPage } from '../../../page-objects/CartPage';
import { users } from '../../../test-data/users';
import { cartData } from '../../../test-data/cart';

const loginPage = new LoginPage();
const cartPage = new CartPage();
const { validStandard, checkoutInfo } = users;
const { productA, productB } = cartData.products;

const productsToAdd = [productA, productB];

describe('Cart UI - Remove Products', () => {
  beforeEach(() => {
    cy.visit('/');
    loginPage.loginAs(validStandard.username, validStandard.password);
    productsToAdd.forEach(product => {
      cartPage.addProductByName(product);
    });
    cartPage.goToCart();
  });

  it('should remove a single product from the cart', () => {
    cartPage.removeProductByName(productA);
    cartPage.assertProductNotInCart(productA);
    cartPage.assertProductInCart(productB);
    cartPage.assertCartCount(1);
  });

  it('should allow proceeding with one product removed', () => {
    cartPage.removeProductByName(productB);
    cartPage.assertProductNotInCart(productB);
    cartPage.proceedToCheckout();
    cartPage.fillCheckoutForm(checkoutInfo);
    cartPage.clickContinueButton();
    cartPage.finishPurchase();
    cartPage.assertPurchaseComplete();
  });
});
