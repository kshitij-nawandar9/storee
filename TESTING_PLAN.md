# Storee E2E Testing Plan

## Quick Start

```bash
cd frontend
npm run dev          # Terminal 1: start dev server on localhost:5173
npx playwright test  # Terminal 2: run all tests (opens real browser)
```

### Useful Commands

```bash
# Run all tests (headless)
npx playwright test --headed=false

# Run a single test group
npx playwright test --grep "Home Page"
npx playwright test --grep "Navigation"
npx playwright test --grep "Products Page"
npx playwright test --grep "Product Detail"
npx playwright test --grep "Cart"
npx playwright test --grep "Checkout"
npx playwright test --grep "Static Pages"
npx playwright test --grep "E2E Flow"

# Run a specific test by name
npx playwright test --grep "loads with hero section"

# Debug mode (step through tests)
npx playwright test --debug

# Show HTML report after run
npx playwright show-report
```

## Setup

- **Playwright config**: `frontend/playwright.config.ts`
- **Test file**: `frontend/tests/storee.spec.ts`
- **Frontend must run on** `http://localhost:5173` (uses mock data, no backend needed)
- **Mock data enabled** via `VITE_USE_MOCK_DATA=true` in `frontend/.env`

## Test Scenarios (31 tests across 8 groups)

### 1. Home Page (4 tests)
| # | Test | What it checks |
|---|------|----------------|
| 1 | loads with hero section and sale banner | Sale marquee ("30% OFF"), Shop Now CTA, trust strip (Free Shipping, 7-Day Replacement, Secure Payments) |
| 2 | shows category tiles linking to products | "Pick your fave" section, Bags category link |
| 3 | shows reviews section | "Don't take our word for it", Priya Sharma, Rajesh Kumar reviews |
| 4 | shows bottom CTA linking to products | "Shop the Collection" link |

### 2. Navigation (4 tests)
| # | Test | What it checks |
|---|------|----------------|
| 5 | navbar has all key links | Home, Shop, Sign In links in desktop nav |
| 6 | cart icon is visible and navigates to cart | Cart icon click → `/cart` |
| 7 | Shop Now hero button navigates to products | Hero CTA click → `/products` |
| 8 | mobile hamburger menu works | 375px viewport, toggle menu, Home/Shop/Sign In links visible |

### 3. Products Page (3 tests)
| # | Test | What it checks |
|---|------|----------------|
| 9 | displays all products with prices | "All the good stuff" heading, product count text, product card links |
| 10 | shows sale prices with strikethrough original | `.line-through` elements present for original prices |
| 11 | category filtering works | "All" button, click a category → URL updates, product count updates, click "All" resets |

### 4. Product Detail (5 tests)
| # | Test | What it checks |
|---|------|----------------|
| 12 | clicking a product opens detail page | Products list → click → `/products/{slug}`, product name in h1 |
| 13 | shows product details: description, price, features | h1 "Packing Cubes", ₹ price, description text, trust badges |
| 14 | color variant selector works | Lion/Rainbow/Aqua/Beach/Bunny variant buttons, click Rainbow |
| 15 | quantity selector works | Default quantity 1, increment to 2 |
| 16 | Add to Bag button adds item to cart | Click "Add to Bag" → toast "is in your bag", cart badge shows 1 |

### 5. Cart (7 tests)
| # | Test | What it checks |
|---|------|----------------|
| 17 | empty cart shows message and browse link | "Your bag is empty", Browse Products link |
| 18 | added items appear in cart with correct details | Add packing cubes → cart shows product name, Order Summary, Subtotal, Shipping |
| 19 | quantity controls work in cart | Increment button (+) updates quantity |
| 20 | remove item from cart works | Remove button → "Your bag is empty" |
| 21 | clear cart button works | Clear button → "Your bag is empty" |
| 22 | cart badge updates on navbar | Clear cart → add item → badge shows "1" |
| 23 | proceed to checkout link works | "Proceed to Checkout" → `/checkout` |

### 6. Checkout (4 tests)
| # | Test | What it checks |
|---|------|----------------|
| 24 | shows checkout form with all fields | "Checkout" heading, Shipping Address, all form field placeholders |
| 25 | shows payment method section | "Payment Method", "Online Payment" |
| 26 | shows order summary with items | Order Summary, product name, Subtotal, Total |
| 27 | empty cart redirects away from checkout | Clear cart → checkout shows "cart is empty" + Browse Products link |

### 7. Static Pages (3 tests)
| # | Test | What it checks |
|---|------|----------------|
| 28 | privacy policy page loads | `/privacy` → "Privacy Policy" text |
| 29 | terms and conditions page loads | `/terms` → "Terms" text |
| 30 | 404 page shows for invalid URL | `/this-page-does-not-exist` → "not found" / "404" text |

### 8. E2E Flow (1 test)
| # | Test | What it checks |
|---|------|----------------|
| 31 | full shopping flow: browse → add to cart → checkout | Home → sale banner → Shop Now → products list → click product → Add to Bag → toast → cart → Order Summary → Proceed to Checkout → Shipping Address + Payment Method |

## Known Issues / Fixes Applied

All 31 tests pass as of the latest run. Key fixes that were made:

1. **Marquee text** — Used regex `/LAUNCH SALE.*30% OFF/i` to handle emoji prefix in banner text.
2. **Trust strip locators** — Scoped to desktop grid (`.hidden.md\\:block`) since mobile marquee elements are hidden at 1280px viewport.
3. **Nav "Shop" link** — Used `{ exact: true }` and scoped to `nav` element to avoid matching "Shop Now", "Shop All", "Shop the Collection".
4. **Product slug** — Changed `packing_cubes` to `packing-cubes` to match actual product data (hyphens, not underscores).
5. **Variant selector** — Used `button[title]` with `img` child instead of text-based matching (variants are image swatches with `title` attribute).
6. **Strict mode** — Added `{ exact: true }` for "Shipping" and "Total" to avoid matching "Shipping Info" and "Subtotal".

## Future Test Ideas (Not Yet Implemented)

- **Shipping fee logic**: Add items < ₹1,000 → verify shipping fee shown; add items ≥ ₹1,000 → verify "Free" shipping
- **Multiple items in cart**: Add 2 different products, verify both appear
- **Checkout form validation**: Submit with empty fields, verify HTML5 validation
- **Address save/load**: Save an address, reload checkout, verify it loads
- **Sign-in page**: Verify Google OAuth button is present
- **Admin dashboard**: (Requires auth mocking) Verify order list, approve button
- **Order history**: (Requires auth mocking) Verify order list after placing order
- **Responsive design**: Run full suite at mobile (375px), tablet (768px), desktop (1280px)
- **Performance**: Measure page load times, Largest Contentful Paint
- **Accessibility**: Add axe-core integration for a11y audits
