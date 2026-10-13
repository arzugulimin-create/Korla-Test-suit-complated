/**
 * Central business + test data for Korla.nl.
 *
 * Sources:
 *   - Static user fixtures ............... data/users.json
 *   - Checkout/billing + sandbox payloads  data/checkout.json
 *   - Sensitive credentials ............... environment variables (.env)
 *   - Business rules (vehicles/BVA) ...... this file
 *
 * Vehicle capacities come from the Korla booking business contract:
 *   - Standard Sedan : max 4 passengers
 *   - Vito Van       : max 8 passengers
 *
 * Keep business rules here so tests stay declarative and the BVA matrix in
 * test-plan.md stays in sync with the automation.
 */
import users from './users.json' with { type: 'json' };
import checkout from './checkout.json' with { type: 'json' };

export default {
  baseURL: process.env.BASE_URL || 'https://korla.nl',

  booking: {
    /** Popular routes surfaced on the Korla homepage. */
    popularRoutes: [
      { pickup: 'Amsterdam', dropoff: 'Schiphol Airport' },
      { pickup: 'Rotterdam', dropoff: 'Schiphol Airport' },
      { pickup: 'The Hague', dropoff: 'Schiphol Airport' },
    ],
    /** Airport transfer starting prices advertised on the homepage. */
    airportTransfers: [
      { destination: 'Schiphol Airport Amsterdam', fromPrice: 49 },
      { destination: 'Rotterdam Airport Rotterdam', fromPrice: 69 },
      { destination: 'Eindhoven Airport Eindhoven', fromPrice: 69 },
      { destination: 'Düsseldorf Airport Düsseldorf', fromPrice: 89 },
    ],
  },

  /** Vehicle fleet + capacity limits (drives the BVA automation). */
  vehicles: {
    sedan: { id: 'sedan', label: 'Standard Sedan', maxPassengers: 4, maxLuggage: 3 },
    vitoVan: { id: 'vito-van', label: 'Vito Van', maxPassengers: 8, maxLuggage: 10 },
  },

  /** Boundary Value Analysis (BVA) values derived from the capacity contract. */
  bva: {
    passengers: {
      sedan: { belowMin: 0, min: 1, validMax: 4, aboveMax: 5 },
      vitoVan: { highValid: 7, validMax: 8, aboveMax: 9 },
    },
    luggage: {
      belowMin: 0,
      min: 1,
      sedanMax: 3,
      aboveSedanMax: 4,
      vanMax: 10,
      aboveVanMax: 11,
    },
  },

  /** WooCommerce products confirmed on Korla.nl. */
  products: {
    packages: { url: '/product/packages/', name: 'Tour Packages', productId: 2204 },
    tickets: { url: '/product/tickets/', name: 'Taxi Tickets' },
    dynamicRoutes: { url: '/product/dynamic-routes/', name: 'Taxi Dynamic Routes' },
  },

  /** Homepage "View Details" tour package pages (JS-rendered). */
  packageDetails: [
    { url: '/tour-package-details/?package_id=2257' },
    { url: '/tour-package-details/?package_id=2258' },
    { url: '/tour-package-details/?package_id=2259' },
  ],

  /** Payment methods advertised on the Korla website FAQ. */
  paymentMethods: [
    'Credit Cards (Visa, MasterCard, Amex)',
    'PayPal',
    'Direct bank transfer',
  ],

  /** Static user fixtures loaded from data/users.json. */
  users,

  /** Static checkout/billing + sandbox card payloads from data/checkout.json. */
  checkout,

  /** Optional real account used only by the login smoke test (set via .env). */
  registeredUser: {
    username: process.env.TEST_USER_EMAIL || 'jonad34604@18lover.com',
    password: process.env.TEST_USER_PASSWORD || 'Test.1234',
  },
};
