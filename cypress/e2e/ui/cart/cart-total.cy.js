import { LoginPage } from '../../../page-objects/LoginPage';
import { CartPage } from '../../../page-objects/CartPage';
import { users } from '../../../test-data/users';
import { cartData } from '../../../test-data/cart';

const loginPage = new LoginPage();
const cartPage = new CartPage();
const { validStandard, checkoutInfo } = users;
const { productA, productB } = cartData.products;
const { prices } = cartData;

const productsToAdd = [productA, productB];

describe('Cart UI - Total Calculation', () => {
  beforeEach(() => {
    cy.visit('/');
    loginPage.loginAs(validStandard.username, validStandard.password);
    productsToAdd.forEach(product => {
      cartPage.addProductByName(product);
    });
    cartPage.goToCart();
    cartPage.clickCheckoutButton();
    cartPage.fillCheckoutForm(checkoutInfo);
    cartPage.clickContinueButton();
  });

  it('should correctly calculate the item subtotal', () => {
    const expectedTotal = productsToAdd.reduce((sum, product) => sum + prices[product], 0);
    cartPage.assertItemSubtotal(expectedTotal);
  });
});
