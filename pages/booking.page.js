import { expect } from '@playwright/test';
import { BasePage } from './base.page.js';

/**
 * BookingPage — Korla booking hub (homepage) + WooCommerce product flow.
 *
 * Exposes route/address inputs, vehicle selection, passenger & luggage
 * counters (BVA focus) and the product "Add to cart" flow.
 */
export class BookingPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async open() {
    await this.goto('/');
  }

  // ── Route selection / address inputs ──────────────────────────────────────
  async fillRoute(pickup, dropoff) {
    const from = this.page.locator(this.selectors.booking.pickup).first();
    const to = this.page.locator(this.selectors.booking.dropoff).first();
    await expect(from).toBeVisible({ timeout: 10_000 });
    await from.fill(pickup);
    await to.fill(dropoff);
  }

  async fillDeparture(date, time) {
    const dateField = this.page.locator(this.selectors.booking.departureDate).first();
    const timeField = this.page.locator(this.selectors.booking.departureTime).first();
    if (await dateField.isVisible().catch(() => false)) await dateField.fill(date);
    if (await timeField.isVisible().catch(() => false)) await timeField.fill(time);
  }

  // ── Booking widget availability ───────────────────────────────────────────
  /** True when the client-side booking widget is reachable on the page. */
  async isBookingWidgetVisible() {
    const probes = [this.selectors.booking.pickup, this.selectors.booking.passengers];
    for (const sel of probes) {
      if (await this.page.locator(sel).first().isVisible().catch(() => false)) return true;
    }
    return false;
  }

  // ── Passenger & luggage counters (BVA) ────────────────────────────────────
  /**
   * Set a numeric counter to `target`. Prefers a native input; otherwise uses
   * + / − stepper buttons with a safety guard against runaway loops.
   */
  async setCounter(inputSel, plusSel, minusSel, counterSel, target) {
    const input = this.page.locator(inputSel).first();
    if (await input.isVisible().catch(() => false)) {
      await input.fill(String(target));
      return;
    }

    const plus = this.page.locator(plusSel).first();
    const minus = this.page.locator(minusSel).first();
    const counter = this.page.locator(counterSel).first();

    let current = await this.readStepperValue(counter);
    const maxSteps = 40;
    let steps = 0;
    while (current !== target && steps < maxSteps) {
      const delta = target - current;
      const btn = delta > 0 ? plus : minus;
      if (!(await btn.isVisible().catch(() => false))) break;
      await btn.click();
      await this.page.waitForTimeout(120);
      current = await this.readStepperValue(counter);
      steps += 1;
    }
    if (current !== target) {
      throw new Error(`Counter could not be set to ${target} (reached ${current})`);
    }
  }

  /** Best-effort read of a stepper/counter element (input value or text). */
  async readStepperValue(locator) {
    const inputValue = await locator.inputValue().catch(() => null);
    if (inputValue !== null) return parseInt(inputValue, 10) || 0;
    const text = (await locator.textContent().catch(() => '')) || '';
    const match = text.match(/-?\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  async setPassengers(count) {
    await this.setCounter(
      this.selectors.booking.passengers,
      this.selectors.booking.passengerPlus,
      this.selectors.booking.passengerMinus,
      this.selectors.booking.passengerCounter,
      count
    );
  }

  async setLuggage(count) {
    await this.setCounter(
      this.selectors.booking.luggage,
      this.selectors.booking.luggagePlus,
      this.selectors.booking.luggageMinus,
      this.selectors.booking.luggageCounter,
      count
    );
  }

  /** Submit the booking search. */
  async search() {
    await this.page.locator(this.selectors.booking.search).first().click();
  }

  // ── Vehicle selection ─────────────────────────────────────────────────────
  async selectVehicle(label) {
    await this.page.locator(`text=${label}`).first().click();
    const selectBtn = this.page.locator(this.selectors.vehicle.select).first();
    if (await selectBtn.isVisible().catch(() => false)) await selectBtn.click();
  }

  // ── Product / cart flow ───────────────────────────────────────────────────
  async openProduct(url) {
    await this.goto(url);
  }

  /** Fill the product quantity and submit "Add to cart". */
  async addToCart(quantity = 1) {
    const qty = this.page.locator(this.selectors.product.quantity).first();
    await expect(qty).toBeVisible({ timeout: 10_000 });
    await qty.fill(String(quantity));
    await this.page.locator(this.selectors.product.addToCart).first().click();
  }

  /** Locator for the "…added to your cart" notice. */
  async getCartNotice() {
    return this.page.locator(this.selectors.product.notice).first();
  }

  /** Open a JS-rendered tour-package-details page. */
  async openPackageDetails(packageId) {
    await this.goto(`/tour-package-details/?package_id=${packageId}`);
  }
}


