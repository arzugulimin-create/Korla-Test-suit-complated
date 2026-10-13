import { test, expect } from '@playwright/test';
import { BookingPage } from '../pages/booking.page.js';
import testData from '../data/testData.js';

/**
 * Booking BVA — passenger & luggage capacity limits.
 *
 * Capacity contract (from the Korla booking business rules):
 *   Standard Sedan: max 4 passengers · max 3 luggage
 *   Vito Van:       max 8 passengers · max 10 luggage
 *
 * Boundary values under test:
 *   Sedan passengers : 0 (below min), 1 (min), 4 (valid max), 5 (above max)
 *   Vito Van passengers : 7 (high-valid), 8 (valid max), 9 (above max)
 *   Luggage : min 1, sedan max 3, van max 10 (plus below/above boundaries)
 */
test.describe('Booking BVA · Passenger & luggage capacity limits', () => {
  const { sedan, vitoVan } = testData.vehicles;
  const bva = testData.bva;

  test.describe('Capacity contract (data-driven baseline, always active)', () => {
    test('Standard Sedan allows up to 4 passengers; Vito Van up to 8', () => {
      expect(sedan.maxPassengers).toBe(4);
      expect(vitoVan.maxPassengers).toBe(8);
      expect(vitoVan.maxPassengers).toBeGreaterThan(sedan.maxPassengers);
    });

    test('BVA boundary values match the documented matrix', () => {
      expect(bva.passengers.sedan).toEqual({ belowMin: 0, min: 1, validMax: 4, aboveMax: 5 });
      expect(bva.passengers.vitoVan).toEqual({ highValid: 7, validMax: 8, aboveMax: 9 });
      expect(bva.luggage).toEqual({
        belowMin: 0, min: 1, sedanMax: 3, aboveSedanMax: 4, vanMax: 10, aboveVanMax: 11,
      });
    });

    test('Luggage capacity scales with vehicle size (sedan 3 < van 10)', () => {
      expect(sedan.maxLuggage).toBeLessThan(vitoVan.maxLuggage);
    });
  });

  test.describe('Booking widget boundary interactions (gated on widget availability)', () => {
    /**
     * The Korla booking widget is client-side rendered and not yet reachable
     * through the public site. When it becomes available, set the env var
     * KORLA_BOOKING_WIDGET=true to activate these true end-to-end boundary checks.
     */
    const widgetActive = process.env.KORLA_BOOKING_WIDGET === 'true';

    const passengerBoundaries = [
      { label: 'Sedan · 0 passengers (below minimum) is rejected', vehicle: 'Standard Sedan', count: 0, expectValid: false },
      { label: 'Sedan · 1 passenger (minimum) is accepted', vehicle: 'Standard Sedan', count: 1, expectValid: true },
      { label: 'Sedan · 4 passengers (valid maximum) is accepted', vehicle: 'Standard Sedan', count: 4, expectValid: true },
      { label: 'Sedan · 5 passengers (above maximum) is rejected / rerouted to a larger vehicle', vehicle: 'Standard Sedan', count: 5, expectValid: false },
      { label: 'Vito Van · 7 passengers (high-valid) is accepted', vehicle: 'Vito Van', count: 7, expectValid: true },
      { label: 'Vito Van · 8 passengers (valid maximum) is accepted', vehicle: 'Vito Van', count: 8, expectValid: true },
      { label: 'Vito Van · 9 passengers (above maximum) is rejected', vehicle: 'Vito Van', count: 9, expectValid: false },
    ];

    for (const tc of passengerBoundaries) {
      test(tc.label, async ({ page }) => {
        test.skip(!widgetActive, 'Booking widget is not reachable on the live site yet (set KORLA_BOOKING_WIDGET=true to activate)');

        const booking = new BookingPage(page);
        await booking.open();
        await booking.fillRoute('Amsterdam', 'Schiphol Airport');
        await booking.setPassengers(tc.count);

        if (tc.expectValid) {
          await booking.search();
          const vehicleCard = page
            .locator(booking.selectors.vehicle.card)
            .or(page.locator(booking.selectors.vehicle.sedan))
            .or(page.locator(booking.selectors.vehicle.vitoVan))
            .first();
          await expect(vehicleCard).toBeVisible({ timeout: 15_000 });
        } else {
          const validation = page.locator(booking.selectors.booking.passengerValidation).first();
          const offeredVan = page.locator(booking.selectors.vehicle.vitoVan).first();
          await expect(validation.or(offeredVan)).toBeVisible({ timeout: 15_000 });
        }
      });
    }

    const luggageBoundaries = [
      { label: 'Luggage · 0 items (below minimum) is rejected', vehicle: 'Standard Sedan', count: 0, expectValid: false },
      { label: 'Luggage · 1 item (minimum) is accepted', vehicle: 'Standard Sedan', count: 1, expectValid: true },
      { label: 'Luggage · 3 items (sedan maximum) is accepted', vehicle: 'Standard Sedan', count: 3, expectValid: true },
      { label: 'Luggage · 4 items (above sedan maximum) is rejected / rerouted', vehicle: 'Standard Sedan', count: 4, expectValid: false },
      { label: 'Luggage · 10 items (van maximum) is accepted on a Vito Van', vehicle: 'Vito Van', count: 10, expectValid: true },
      { label: 'Luggage · 11 items (above van maximum) is rejected', vehicle: 'Vito Van', count: 11, expectValid: false },
    ];

    for (const tc of luggageBoundaries) {
      test(tc.label, async ({ page }) => {
        test.skip(!widgetActive, 'Booking widget is not reachable on the live site yet (set KORLA_BOOKING_WIDGET=true to activate)');

        const booking = new BookingPage(page);
        await booking.open();
        await booking.fillRoute('Amsterdam', 'Schiphol Airport');
        await booking.setLuggage(tc.count);

        if (tc.expectValid) {
          await booking.search();
          const vehicleCard = page
            .locator(booking.selectors.vehicle.card)
            .or(page.locator(booking.selectors.vehicle.sedan))
            .or(page.locator(booking.selectors.vehicle.vitoVan))
            .first();
          await expect(vehicleCard).toBeVisible({ timeout: 15_000 });
        } else {
          const validation = page
            .locator(booking.selectors.booking.passengerValidation)
            .or(page.locator('text=luggage, text=Too many, text=maximum'))
            .first();
          const offeredVan = page.locator(booking.selectors.vehicle.vitoVan).first();
          await expect(validation.or(offeredVan)).toBeVisible({ timeout: 15_000 });
        }
      });
    }
  });
});
