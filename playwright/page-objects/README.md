# Page Objects

This folder contains the Page Object Model (POM) classes used throughout the test suite.  
Each class encapsulates UI interactions and element selectors related to a specific page or feature in the application.

## Included Page Objects

### `LoginPage.ts`
Handles interactions with the login screen.

**Main responsibilities:**
- Navigating to the login page
- Typing username and password
- Clicking the login button
- Asserting error messages for invalid login

---

### `CartPage.ts`
Handles interactions with the shopping cart, checkout process, and confirmation.

**Main responsibilities:**
- Adding/removing products by name
- Navigating to the cart
- Validating products and cart count
- Filling the checkout form
- Completing the purchase
- Validating cart totals and confirmation message
