import { expect } from '@playwright/test';
import { BasePage } from './base.page.js';

/**
 * PaymentPage — WooCommerce checkout, payment-method selection, order
 * placement and order tracking.
 *
 * NOTE: On the live site the /checkout page currently resolves back to the
 * homepage. These helpers target the standard WooCommerce checkout markup and
 * are exercised as soon as the checkout page becomes available (see
 * PAYMENT_TEST_MODE in .env.example). Never use real card details.
 */
export class PaymentPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async openCheckout() {
    await this.goto('/checkout/');
  }

  /**
   * True only when a real WooCommerce checkout form is present. Used to gate
   * the payment E2E tests so automation can never charge real money while the
   * checkout page is unavailable.
   */
  async isCheckoutAvailable() {
    await this.page.waitForLoadState('load').catch(() => {});
    const url = this.page.url();
    const hasForm = await this.page
      .locator(this.selectors.checkout.form)
      .first()
      .isVisible()
      .catch(() => false);
    return /\/checkout/.test(url) && hasForm;
  }

  /** Fill the standard WooCommerce billing fields. */
  async fillBilling(customer) {
    const mapping = {
      billingFirstName: customer.firstName,
      billingLastName: customer.lastName,
      billingEmail: customer.email,
      billingPhone: customer.phone,
      billingAddress: customer.address,
      billingPostcode: customer.postcode,
      billingCity: customer.city,
    };
    for (const [key, value] of Object.entries(mapping)) {
      const field = this.page.locator(this.selectors.checkout[key]).first();
      await expect(field).toBeVisible({ timeout: 10_000 });
      await field.fill(value);
    }
  }

  /**
   * Select a payment method by its WooCommerce gateway value
   * (e.g. 'credit_card', 'paypal', 'bank_transfer').
   *
   * Prefers the native radio input (matched via the central selector map);
   * some themes render the radio visually hidden, in which case the modern
   * getByText locator clicks its associated label.
   */
  async selectPaymentMethod(methodValue) {
    const methodRow = this.page
      .locator(this.selectors.payment.methodRow)
      .filter({
        has: this.page.locator(
          `${this.selectors.payment.methodRadio}[value="${methodValue}"]`,
        ),
      })
      .first();
    await expect(methodRow).toBeVisible({ timeout: 10_000 });

    const radio = methodRow.locator(this.selectors.payment.methodRadio).first();
    if (await radio.isVisible().catch(() => false)) {
      await radio.check({ force: true });
      return;
    }

    // Hidden radio → click its label, matching the human-readable gateway name
    // (underscores normalised to spaces, e.g. bank_transfer → "Direct bank transfer").
    const label = methodRow
      .locator(this.selectors.payment.methodLabel)
      .getByText(methodValue.replace(/_/g, ' '), { exact: false })
      .first();
    await expect(label).toBeVisible({ timeout: 10_000 });
    await label.click();
  }

  /** Fill sandbox card fields (never real cards). */
  async fillCard(card) {
    const number = this.page.locator(this.selectors.payment.cardNumber).first();
    const expiry = this.page.locator(this.selectors.payment.cardExpiry).first();
    const cvc = this.page.locator(this.selectors.payment.cardCvc).first();
    const name = this.page.locator(this.selectors.payment.cardName).first();
    await number.fill(card.number);
    await expiry.fill(card.expiry);
    await cvc.fill(card.cvc);
    if (await name.isVisible().catch(() => false)) await name.fill(card.name);
  }

  /** Place the order. */
  async placeOrder() {
    await this.page.locator(this.selectors.checkout.placeOrder).first().click();
  }

  /** Locator for the "Order received" confirmation. */
  get orderReceived() {
    return this.page.locator(this.selectors.payment.orderReceived).first();
  }

  /** First WooCommerce checkout validation error notice. */
  get checkoutErrorNotice() {
    return this.page.locator(this.selectors.login.error).first();
  }

  // ── Order tracking ────────────────────────────────────────────────────────
  async openOrderTracking() {
    await this.goto('/order-tracking/');
  }

  async trackOrder(orderId, email) {
    const idField = this.page.locator(this.selectors.tracking.orderId).first();
    const emailField = this.page.locator(this.selectors.tracking.email).first();
    await expect(idField).toBeVisible({ timeout: 10_000 });
    await idField.fill(orderId);
    await emailField.fill(email);
    await this.page.locator(this.selectors.tracking.submit).first().click();
  }
}


