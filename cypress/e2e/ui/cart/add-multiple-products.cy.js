import { LoginPage } from '../../../page-objects/LoginPage';
import { CartPage } from '../../../page-objects/CartPage';
import { users } from '../../../test-data/users';
import { cartData } from '../../../test-data/cart';

const loginPage = new LoginPage();
const cartPage = new CartPage();
const { validStandard } = users;
const { productA, productB, productC } = cartData.products;

const productsToAdd = [productA, productB, productC];

describe('Cart UI - Add Multiple Products', () => {
  beforeEach(() => {
    loginPage.visit();
    loginPage.loginAs(validStandard.username, validStandard.password);
  });

  it('should add multiple products and verify cart count', () => {
    productsToAdd.forEach(product => {
      cartPage.addProductByName(product);
    });

    cartPage.assertCartCount(productsToAdd.length);
    cartPage.goToCart();

    productsToAdd.forEach(product => {
      cartPage.assertProductInCart(product);
    });
  });
});
