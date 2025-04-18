import { LoginPage } from '../../../page-objects/LoginPage';
import { CartPage } from '../../../page-objects/CartPage';
import { users } from '../../../test-data/users';
import { cartData } from '../../../test-data/cart';

const loginPage = new LoginPage();
const cartPage = new CartPage();
const { validStandard } = users;
const { productA } = cartData.products;

describe('Cart UI - Add to Cart', () => {
  beforeEach(() => {
    loginPage.visit();
    loginPage.loginAs(validStandard.username, validStandard.password);
  });

  it('should add the first product to cart successfully', () => {
    cartPage.addFirstProductToCart();
    cartPage.goToCart();
    cartPage.assertProductInCart(productA);
    cy.percySnapshot('Products in cart');
  });
});
