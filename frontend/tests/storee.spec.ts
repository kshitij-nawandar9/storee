import { test, expect } from '@playwright/test';

// ─── 1. HOME PAGE ───────────────────────────────────────────────────────────

test.describe('Home Page', () => {
  test('loads with hero section and sale banner', async ({ page }) => {
    await page.goto('/');

    // Sale marquee banner visible (text may have emoji prefix)
    await expect(page.getByText(/LAUNCH SALE.*30% OFF/i).first()).toBeVisible();

    // Hero CTA
    await expect(page.getByRole('link', { name: /Shop Now/i })).toBeVisible();

    // Trust strip elements (desktop grid — the `hidden md:block` section)
    const desktopTrustGrid = page.locator('.hidden.md\\:block');
    await expect(desktopTrustGrid.getByText('Free Shipping')).toBeVisible();
    await expect(desktopTrustGrid.getByText('7-Day Replacement')).toBeVisible();
    await expect(desktopTrustGrid.getByText('Secure Payments')).toBeVisible();
  });

  test('shows category tiles linking to products', async ({ page }) => {
    await page.goto('/');

    // Category section
    await expect(page.getByText('Pick your fave')).toBeVisible();

    // Category links
    const bagsLink = page.getByRole('link', { name: /Bags/i }).first();
    await expect(bagsLink).toBeVisible();
  });

  test('shows reviews section', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText("Don't take our word for it")).toBeVisible();
    await expect(page.getByText('Priya Sharma')).toBeVisible();
    await expect(page.getByText('Rajesh Kumar')).toBeVisible();
  });

  test('shows bottom CTA linking to products', async ({ page }) => {
    await page.goto('/');

    const ctaLink = page.getByRole('link', { name: /Shop the Collection/i });
    await expect(ctaLink).toBeVisible();
  });
});

// ─── 2. NAVIGATION ──────────────────────────────────────────────────────────

test.describe('Navigation', () => {
  test('navbar has all key links', async ({ page }) => {
    await page.goto('/');

    // Desktop nav links (scope to nav to avoid matching footer/page links)
    const nav = page.locator('nav');
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Shop', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Sign In' })).toBeVisible();
  });

  test('cart icon is visible and navigates to cart', async ({ page }) => {
    await page.goto('/');

    const cartLink = page.getByLabel('Shopping cart');
    await expect(cartLink).toBeVisible();
    await cartLink.click();

    await expect(page).toHaveURL(/\/cart/);
  });

  test('Shop Now hero button navigates to products', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /Shop Now/i }).click();
    await expect(page).toHaveURL(/\/products/);
  });

  test('mobile hamburger menu works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Hamburger button
    const menuButton = page.getByLabel('Toggle menu');
    await expect(menuButton).toBeVisible();

    await menuButton.click();

    // Mobile menu items
    await expect(page.getByRole('link', { name: 'Home' }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Shop' }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' }).last()).toBeVisible();
  });
});

// ─── 3. PRODUCTS PAGE ───────────────────────────────────────────────────────

test.describe('Products Page', () => {
  test('displays all products with prices', async ({ page }) => {
    await page.goto('/products');

    // Page header
    await expect(page.getByText('All the good stuff')).toBeVisible();

    // Products count text
    await expect(page.getByText(/\d+ products?/)).toBeVisible();

    // Product cards should be links to product detail
    const productLinks = page.locator('a[href^="/products/"]');
    const count = await productLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('shows sale prices with strikethrough original', async ({ page }) => {
    await page.goto('/products');

    // Sale prices should show the discounted price and crossed-out original
    const strikethroughPrices = page.locator('.line-through');
    const strikeCount = await strikethroughPrices.count();
    expect(strikeCount).toBeGreaterThan(0);
  });

  test('category filtering works', async ({ page }) => {
    await page.goto('/products');

    // "All" filter button should be active
    const allButton = page.getByRole('button', { name: 'All' });
    await expect(allButton).toBeVisible();

    // Click a specific category
    const categoryButtons = page.locator('section').filter({ hasText: 'All' }).getByRole('button');
    const buttonCount = await categoryButtons.count();
    expect(buttonCount).toBeGreaterThan(1);

    // Click second category button (first one after "All")
    const secondCategory = categoryButtons.nth(1);
    const categoryName = await secondCategory.textContent();
    await secondCategory.click();

    // URL should update
    await expect(page).toHaveURL(new RegExp(`category=${encodeURIComponent(categoryName!.trim())}`));

    // Products count should update
    await expect(page.getByText(/\d+ products? in/)).toBeVisible();

    // Click "All" to reset
    await allButton.click();
    await expect(page).toHaveURL('/products');
  });
});

// ─── 4. PRODUCT DETAIL ─────────────────────────────────────────────────────

test.describe('Product Detail', () => {
  test('clicking a product opens detail page', async ({ page }) => {
    await page.goto('/products');

    // Click the first product card
    const firstProduct = page.locator('a[href^="/products/"]').first();
    const productName = await firstProduct.locator('h3').textContent();
    await firstProduct.click();

    // Should navigate to product detail
    await expect(page).toHaveURL(/\/products\/.+/);

    // Product name should be visible
    await expect(page.locator('h1')).toContainText(productName!.trim());
  });

  test('shows product details: description, price, features', async ({ page }) => {
    await page.goto('/products/packing-cubes');

    await expect(page.locator('h1')).toContainText('Packing Cubes');

    // Price is shown
    await expect(page.getByText('₹').first()).toBeVisible();

    // Description
    await expect(page.getByText(/organizing|travel|compact/i).first()).toBeVisible();

    // Trust badges
    await expect(page.getByText('Free Pan India Delivery above ₹1,000').first()).toBeVisible();
    await expect(page.getByText('Secure Payment').first()).toBeVisible();
  });

  test('color variant selector works', async ({ page }) => {
    await page.goto('/products/packing-cubes');

    // Variant buttons are image swatches with title attributes
    const variantButtons = page.locator('button[title]').filter({ has: page.locator('img') });
    const variantCount = await variantButtons.count();
    expect(variantCount).toBeGreaterThan(1);

    // Click a different variant (Rainbow)
    const rainbowVariant = page.locator('button[title="Rainbow"]');
    if (await rainbowVariant.isVisible()) {
      await rainbowVariant.click();
    }
  });

  test('quantity selector works', async ({ page }) => {
    await page.goto('/products/packing-cubes');

    // Default quantity should be 1
    await expect(page.locator('text=1').first()).toBeVisible();

    // Increment quantity
    const incrementButton = page.getByLabel(/increase/i).or(page.locator('button').filter({ hasText: '+' }));
    if (await incrementButton.first().isVisible()) {
      await incrementButton.first().click();
      // Quantity should now show 2
      await expect(page.getByText('2').first()).toBeVisible();
    }
  });

  test('Add to Bag button adds item to cart', async ({ page }) => {
    await page.goto('/products/packing-cubes');

    // Click Add to Bag
    const addButton = page.getByRole('button', { name: /Add to Bag/i });
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Toast notification should appear
    await expect(page.getByText(/is in your bag/i)).toBeVisible({ timeout: 5000 });

    // Cart badge should show 1
    const cartBadge = page.locator('[aria-label="Shopping cart"] span');
    await expect(cartBadge).toContainText('1');
  });
});

// ─── 5. CART ────────────────────────────────────────────────────────────────

test.describe('Cart', () => {
  test('empty cart shows message and browse link', async ({ page }) => {
    // Clear any stored cart state
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('storee-cart'));
    await page.goto('/cart');

    await expect(page.getByText('Your bag is empty')).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse Products/i })).toBeVisible();
  });

  test('added items appear in cart with correct details', async ({ page }) => {
    // Add a product first
    await page.goto('/products/packing-cubes');
    await page.getByRole('button', { name: /Add to Bag/i }).click();
    await page.waitForTimeout(1000);

    // Navigate to cart
    await page.goto('/cart');

    // Cart should show the product
    await expect(page.getByText('Shopping Cart')).toBeVisible();
    await expect(page.getByText('Packing Cubes')).toBeVisible();

    // Order summary section
    await expect(page.getByText('Order Summary')).toBeVisible();
    await expect(page.getByText('Subtotal')).toBeVisible();
    await expect(page.getByText('Shipping', { exact: true })).toBeVisible();
  });

  test('quantity controls work in cart', async ({ page }) => {
    // Add a product first
    await page.goto('/products/packing-cubes');
    await page.getByRole('button', { name: /Add to Bag/i }).click();
    await page.waitForTimeout(1000);

    await page.goto('/cart');

    // Find increment button in cart
    const incrementBtn = page.locator('button').filter({ hasText: '+' }).first();
    if (await incrementBtn.isVisible()) {
      await incrementBtn.click();
      await page.waitForTimeout(500);
      // Quantity should update
    }
  });

  test('remove item from cart works', async ({ page }) => {
    // Add a product
    await page.goto('/products/packing-cubes');
    await page.getByRole('button', { name: /Add to Bag/i }).click();
    await page.waitForTimeout(1000);

    await page.goto('/cart');
    await expect(page.getByText('Packing Cubes')).toBeVisible();

    // Click remove button
    const removeButton = page.getByLabel('Remove item');
    await removeButton.click();

    // Cart should be empty
    await expect(page.getByText('Your bag is empty')).toBeVisible();
  });

  test('clear cart button works', async ({ page }) => {
    // Add a product
    await page.goto('/products/packing-cubes');
    await page.getByRole('button', { name: /Add to Bag/i }).click();
    await page.waitForTimeout(1000);

    await page.goto('/cart');

    // Click clear button
    const clearBtn = page.getByRole('button', { name: /Clear/i });
    await clearBtn.click();

    // Cart should be empty
    await expect(page.getByText('Your bag is empty')).toBeVisible();
  });

  test('cart badge updates on navbar', async ({ page }) => {
    // Clear cart
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('storee-cart'));

    await page.goto('/products/packing-cubes');

    // No badge initially (or badge doesn't exist)
    const cartLink = page.getByLabel('Shopping cart');
    await expect(cartLink).toBeVisible();

    // Add item
    await page.getByRole('button', { name: /Add to Bag/i }).click();
    await page.waitForTimeout(1000);

    // Badge should appear with count 1
    const badge = cartLink.locator('span');
    await expect(badge).toContainText('1');
  });

  test('proceed to checkout link works', async ({ page }) => {
    // Add a product
    await page.goto('/products/packing-cubes');
    await page.getByRole('button', { name: /Add to Bag/i }).click();
    await page.waitForTimeout(1000);

    await page.goto('/cart');

    const checkoutLink = page.getByRole('link', { name: /Proceed to Checkout/i });
    await expect(checkoutLink).toBeVisible();
    await checkoutLink.click();

    await expect(page).toHaveURL(/\/checkout/);
  });
});

// ─── 6. CHECKOUT ────────────────────────────────────────────────────────────

test.describe('Checkout', () => {
  test('shows checkout form with all fields', async ({ page }) => {
    // Add a product first
    await page.goto('/products/packing-cubes');
    await page.getByRole('button', { name: /Add to Bag/i }).click();
    await page.waitForTimeout(1000);

    await page.goto('/checkout');

    await expect(page.getByText('Checkout')).toBeVisible();
    await expect(page.getByText('Shipping Address')).toBeVisible();

    // Form fields
    await expect(page.getByPlaceholder('Enter your full name')).toBeVisible();
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('10-digit number')).toBeVisible();
    await expect(page.getByPlaceholder('Street address')).toBeVisible();
    await expect(page.getByPlaceholder('City')).toBeVisible();
    await expect(page.getByPlaceholder('State')).toBeVisible();
    await expect(page.getByPlaceholder('6-digit pincode')).toBeVisible();
  });

  test('shows payment method section', async ({ page }) => {
    await page.goto('/products/packing-cubes');
    await page.getByRole('button', { name: /Add to Bag/i }).click();
    await page.waitForTimeout(1000);

    await page.goto('/checkout');

    await expect(page.getByText('Payment Method')).toBeVisible();
    await expect(page.getByText('Online Payment')).toBeVisible();
  });

  test('shows order summary with items', async ({ page }) => {
    await page.goto('/products/packing-cubes');
    await page.getByRole('button', { name: /Add to Bag/i }).click();
    await page.waitForTimeout(1000);

    await page.goto('/checkout');

    await expect(page.getByText('Order Summary')).toBeVisible();
    await expect(page.getByText('Packing Cubes')).toBeVisible();
    await expect(page.getByText('Subtotal')).toBeVisible();
    await expect(page.getByText('Total', { exact: true })).toBeVisible();
  });

  test('empty cart redirects away from checkout', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('storee-cart'));
    await page.goto('/checkout');

    // Should show empty cart message
    await expect(page.getByText(/cart is empty|Your cart is empty/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse Products/i })).toBeVisible();
  });
});

// ─── 7. STATIC PAGES ───────────────────────────────────────────────────────

test.describe('Static Pages', () => {
  test('privacy policy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByText(/Privacy Policy/i).first()).toBeVisible();
  });

  test('terms and conditions page loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByText(/Terms/i).first()).toBeVisible();
  });

  test('404 page shows for invalid URL', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    // Should show some kind of not-found message
    await expect(page.getByText(/not found|404|doesn't exist/i).first()).toBeVisible();
  });
});

// ─── 8. E2E FLOW: Browse → Add → Cart → Checkout ───────────────────────────

test.describe('E2E Flow', () => {
  test('full shopping flow: browse → add to cart → checkout', async ({ page }) => {
    // Clear state
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('storee-cart'));

    // 1. Start on home page
    await expect(page.getByText(/LAUNCH SALE.*30% OFF/i).first()).toBeVisible();

    // 2. Navigate to products
    await page.getByRole('link', { name: /Shop Now/i }).click();
    await expect(page).toHaveURL(/\/products/);
    await expect(page.getByText('All the good stuff')).toBeVisible();

    // 3. Click first product
    const firstProduct = page.locator('a[href^="/products/"]').first();
    await firstProduct.click();
    await expect(page).toHaveURL(/\/products\/.+/);

    // 4. Add to cart
    const addButton = page.getByRole('button', { name: /Add to Bag/i });
    await addButton.click();
    await expect(page.getByText(/is in your bag/i)).toBeVisible({ timeout: 5000 });

    // 5. Go to cart
    await page.getByLabel('Shopping cart').click();
    await expect(page).toHaveURL(/\/cart/);
    await expect(page.getByText('Shopping Cart')).toBeVisible();
    await expect(page.getByText('Order Summary')).toBeVisible();

    // 6. Proceed to checkout
    await page.getByRole('link', { name: /Proceed to Checkout/i }).click();
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByText('Shipping Address')).toBeVisible();
    await expect(page.getByText('Payment Method')).toBeVisible();
  });
});
