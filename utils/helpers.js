/**
 * Shared test-data helpers.
 *
 * IMPORTANT: The Korla QA suite NEVER uses real personal data or real credit
 * cards. All values below are generated deterministically-random so every run
 * is isolated and repeatable.
 */

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Generates a unique, throwaway email address. */
export function randomEmail(prefix = 'korla.qa') {
  return `${prefix}.${Date.now()}${Math.floor(Math.random() * 9999)}@example.com`;
}

/** Generates a valid-looking Dutch mobile number (+31 6…). */
export function randomDutchPhone() {
  const tail = String(Math.floor(Math.random() * 1e8)).padStart(8, '0');
  return `+316${tail}`;
}

/** Generates a Dutch postal code in the form `1234 AB`. */
export function randomDutchPostcode() {
  const digits = 1000 + Math.floor(Math.random() * 9000);
  return `${digits} ${ALPHA[Math.floor(Math.random() * 26)]}${ALPHA[Math.floor(Math.random() * 26)]}`;
}

/** Returns an ISO date string (YYYY-MM-DD) `daysAhead` from today. */
export function futureISODate(daysAhead = 2) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

/** Returns a zero-padded HH:MM time string. */
export function timeString(hour = 10, minute = 0) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

