import { test, expect } from '@playwright/test';
import { PaymentPage } from '../pages/payment.page.js';
import { BookingPage } from '../pages/booking.page.js';
import testData from '../data/testData.js';
import { randomEmail, randomDutchPhone, randomDutchPostcode } from '../utils/helpers.js';

/**
 * Payment — payment processing flow.
 *
 * Real money is NEVER charged: the checkout E2E block is auto-gated until a
 * real WooCommerce checkout page is detected on the live site.
 */
test.describe('Payment · Payment processing flow', () => {
  test('Supported payment methods are advertised on the website', async ({ page }) => {
    const booking = new BookingPage(page);
    await booking.open();

    const question = page.locator(booking.selectors.faq.paymentQuestion).first();
    await expect(question).toBeVisible();
    // The FAQ answers live inside native <details> disclosures — open the
    // payment-methods item so the answer paragraph (with the methods) is visible.
    await question.click();
    await page.waitForTimeout(600);

    for (const method of ['Visa', 'MasterCard', 'Amex', 'PayPal', 'bank transfers']) {
      await expect(page.locator(`text=${method}`).first()).toBeVisible();
    }
  });

  test.describe('Checkout & order placement (gated on live checkout availability)', () => {
    let checkoutAvailable = false;

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const payment = new PaymentPage(page);
      await payment.openCheckout();
      checkoutAvailable = await payment.isCheckoutAvailable();
      await context.close();
    });

    const checkoutCases = [
      {
        label: 'Place order using the sandbox credit card (Visa)',
        method: 'credit_card',
        card: testData.checkout.sandboxCard,
      },
      { label: 'Place order using PayPal', method: 'paypal' },
      { label: 'Place order using direct bank transfer', method: 'bank_transfer' },
    ];

    for (const tc of checkoutCases) {
      test(`${tc.label} completes successfully`, async ({ page }) => {
        test.skip(!checkoutAvailable, 'WooCommerce checkout page is not live yet (currently resolves to the homepage)');

        const payment = new PaymentPage(page);
        await payment.openCheckout();
        await expect(page).toHaveURL(/checkout/);

        await payment.fillBilling({
          firstName: testData.checkout.billing.firstName,
          lastName: testData.checkout.billing.lastName,
          email: randomEmail(),
          phone: randomDutchPhone(),
          address: testData.checkout.billing.address,
          postcode: randomDutchPostcode(),
          city: testData.checkout.billing.city,
        });

        await payment.selectPaymentMethod(tc.method);
        if (tc.card) await payment.fillCard(tc.card);

        await payment.placeOrder();
        await expect(payment.orderReceived).toBeVisible({ timeout: 30_000 });
      });
    }
  });

  test.describe('Order tracking (always active)', () => {
    test('Tracking form is present with Order ID + billing email fields', async ({ page }) => {
      const payment = new PaymentPage(page);
      await payment.openOrderTracking();

      await expect(page).toHaveURL(/order-tracking/);
      await expect(page.locator(payment.selectors.tracking.orderId).first()).toBeVisible();
      await expect(page.locator(payment.selectors.tracking.email).first()).toBeVisible();
      await expect(page.locator(payment.selectors.tracking.submit).first()).toBeVisible();
    });

    test('Tracking an unknown order returns a friendly message', async ({ page }) => {
      const payment = new PaymentPage(page);
      await payment.openOrderTracking();

      await payment.trackOrder('999999999', 'korla.tracking@example.com');

      // WooCommerce surfaces an error notice for unknown order references.
      await expect(page.locator(payment.selectors.login.error).first()).toBeVisible({ timeout: 15_000 });
      await expect(page).toHaveURL(/order-tracking/);
    });
  });
});
