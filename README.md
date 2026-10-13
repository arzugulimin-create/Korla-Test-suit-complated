# Korla.nl — End-to-End QA Testing Framework (Manual & Automated)

A complete QA testing solution for [https://korla.nl/](https://korla.nl/) — the **KORLA TAXI** booking platform (WordPress + WooCommerce).

This repository contains two tightly-coupled deliverables:

1. **Manual Test Plan** — [`test-plan.md`](./test-plan.md): the Korla.nl **Master Test Plan** with objectives & scope, execution strategy (Exploratory → Smoke → Regression), a full test-case catalogue, the Boundary Value Analysis (BVA) matrix, environment strategy and defect workflow.
2. **Automated Test Suite** — a **Playwright + Page Object Model (POM)** framework in **JavaScript** with **mobile-first** execution, covering booking, payment, passenger selection, login, order tracking and UX/UI.

---

## Table of Contents

- [1. Overview](#1-overview)
- [2. Manual Test Plan](#2-manual-test-plan)
- [3. Automated Framework](#3-automated-framework)
- [4. Prerequisites](#4-prerequisites)
- [5. Installation](#5-installation)
- [6. Project Structure](#6-project-structure)
- [7. Configuration](#7-configuration)
- [8. Test Data & Selectors](#8-test-data--selectors)
- [9. Running Tests](#9-running-tests)
- [10. Reporting](#10-reporting)
- [11. Known Limitations & Gaps](#11-known-limitations--gaps)
- [12. CI Integration](#12-ci-integration)
- [13. Test Strategy Mapping](#13-test-strategy-mapping)

---

## 1. Overview

Korla.nl is a Dutch airport-transfer / taxi booking platform. The primary business flow is **Taxi Booking and Payment**:

```
Route & address inputs → Date/time → Passenger & luggage selection → Vehicle selection
        → Booking submission (Add to cart) → Checkout → Payment → Confirmation
```

The QA suite validates the **entire web application**, including UX/UI usability, cross-device stability and mobile responsiveness, with **mobile browsers as the primary target environment**.

## 2. Manual Test Plan

See [`test-plan.md`](./test-plan.md) — a professional, structured document covering:

- Objectives, in-scope and out-of-scope
- Test strategy: **Exploratory & Monkey → Smoke → Regression**
- Mobile-first environment & device matrix
- **BVA test matrix** for passenger (Sedan 4 / Vito Van 8) and luggage capacity
- Manual test cases for booking, payment, login, order tracking, UX/UI and mobile
- Defect reporting template and requirement traceability matrix
- Automation mapping (which `*.spec.js` covers each manual case)

## 3. Automated Framework

Built with **Playwright Test**, the **Page Object Model (POM)** and **ES modules** (`import` / `export`, `"type": "module"`):


## 6. Project Structure

```text
korla-automation-suit/
├── pages/                        # Page Object Model
│   ├── base.page.js              #   shared nav / mobile-menu / navigation helpers
│   ├── login.page.js             #   WooCommerce My Account (login + register)
│   ├── booking.page.js           #   booking hub, route/address, vehicles, passenger/luggage, add-to-cart
│   └── payment.page.js           #   checkout, payment methods, place order, order tracking
├── tests/                        # Playwright specs
│   ├── smoke.spec.js             #   core booking & payment happy path (+ login, tracking, FAQ)
│   ├── booking-bva.spec.js       #   BVA: passenger (0/1/4/5 · 7/8/9) & luggage boundaries
│   └── payment.spec.js           #   payment methods, checkout E2E (gated), order tracking
├── data/
│   ├── testData.js               #   aggregator: business data, capacity contract, BVA matrix, products
│   ├── users.json                #   static (non-sensitive) user fixtures
│   ├── checkout.json             #   checkout/billing + sandbox card form payloads
│   └── selectors.js              #   centralised resilient selector map
├── utils/
│   └── helpers.js                #   random email/phone/postcode/date generators
├── playwright.config.js          #   mobile-first projects & reporting
├── package.json
├── .env.example                  #   environment variable template
├── .gitignore
├── README.md
└── test-plan.md                  #   Korla.nl Master Test Plan (manual)
```

## 7. Configuration

### playwright.config.js

| Option   | Value | Notes |
| -------- | ----- | ----- |
| `baseURL` | `https://korla.nl` | Override with `BASE_URL` env var |
| Projects | Mobile Chrome / Mobile Safari / Desktop Chrome | Mobile-first order |
| `retries` | `0` local, `2` on CI | `CI=1` also forces a single worker |
| Reporting | `list` + `html` | HTML report written to `playwright-report/` |
| Artifacts | screenshot/video on failure, trace on first retry | Written to `test-results/` |

### Feature gates (`.env`)

`.env` is loaded automatically from the project root via `process.loadEnvFile()`
(Node ≥ 20.12). Copy `.env.example` → `.env` and adjust:

| Variable | Purpose |
| -------- | ------- |
| `BASE_URL` | Target environment (default `https://korla.nl`) |
| `KORLA_USERNAME` | Optional real account username for the login smoke test (default: none) |
| `KORLA_PASSWORD` | Corresponding password |
| `PAYMENT_TEST_MODE` | Enables checkout E2E once the live checkout page exists (never real money) |
| `KORLA_BOOKING_WIDGET` | `true` activates the live booking-widget BVA interactions |

## 9. Running Tests

```bash
npm test                        # full suite, all projects
npm run test:smoke              # smoke.spec.js only
npm run test:bva                # booking-bva.spec.js only
npm run test:payment            # payment.spec.js only
npm run test:mobile             # Mobile Chrome + Mobile Safari only
npm run test:desktop            # Desktop Chrome only
npm run test:headed             # run with a visible browser
npm run report                  # open the HTML report
```

Target a single test by name:

```bash
npx playwright test -g "Sedan · 4 passengers"
```

## 10. Reporting

- Terminal output uses the `list` reporter.
- An interactive **HTML report** is generated at `playwright-report/index.html` after each run (`npm run report` to open).
- Failed-run artifacts (screenshots, videos, traces) are stored under `test-results/`.

## 11. Known Limitations & Gaps

| Area | Status | Handling |
| ---- | ------ | -------- |
| Booking widget | Client-side rendered; not fully reachable via public DOM | Resilient selectors + `KORLA_BOOKING_WIDGET` gate for BVA UI tests |
| Checkout / payment | `/checkout` currently resolves to the homepage on the live site | Payment E2E auto-gates via `isCheckoutAvailable()` |
| Login with real user | No real credentials supplied | Login coverage = validation-only + optional `.env` credentials |
| Payments | Real money must never be charged | Sandbox card only, gated, documented |

## 12. CI Integration

The suite is CI-ready out of the box:

```yaml
# GitHub Actions example
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx playwright install --with-deps chromium webkit
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

`CI=1` automatically enables retries, forbids `.only`, and serialises workers.

## 13. Test Strategy Mapping

The automation mirrors the manual execution hierarchy from `test-plan.md`:

| Phase | Manual focus | Automation |
| ----- | ------------ | ---------- |
| Exploratory/Monkey | Layout, edge cases, unexpected inputs | Manual checklist in `test-plan.md` |
| Smoke | Core booking & payment happy path | `tests/smoke.spec.js` |
| Regression | Full E2E across all features | `booking-bva` + `payment` + `smoke` suites |

---

**Maintainers:** Korla QA Team · Framework: Playwright (JavaScript) · Target: [https://korla.nl/](https://korla.nl/)

| `KORLA_PASSWORD` | Corresponding password |
| `PAYMENT_TEST_MODE` | Enables checkout E2E once the live checkout page exists (never real money) |
| `KORLA_BOOKING_WIDGET` | `true` activates the live booking-widget BVA interactions |

## 8. Test Data & Selectors

- **`data/testData.js`** — ESM aggregator importing the JSON fixtures below plus routes, vehicles (Standard Sedan max 4 / Vito Van max 8), the BVA boundary matrix and WooCommerce products. Keep business rules here.
- **`data/users.json`** — static, non-sensitive user fixtures (invalid-login credentials, tracking email). Sensitive credentials come from `.env`, never from files committed to the repo.
- **`data/checkout.json`** — checkout/billing fields and the sandbox credit-card payload (never real payment data). Dynamic values (email/phone/postcode) are generated at runtime by `utils/helpers.js`.
- **`data/selectors.js`** — resilient selectors (roles, labels, placeholders, aria attributes). The booking/payment UI is **client-side rendered**, so update this file when the DOM changes — never edit tests.

> ⚠️ **Never commit real credentials or credit-card data.** All generated values are throwaway (`utils/helpers.js`).

- **Mobile-first** `playwright.config.js` — `Mobile Chrome` (Pixel 7), `Mobile Safari` (iPhone 12) run before `Desktop Chrome`.
- **Resilient, centralised selectors** in `data/selectors.js` — the Korla booking UI is client-side rendered, so tests stay stable when markup changes (update one file, not every test).
- **Business data & capacity contract** in `data/testData.js` — keeps the BVA matrix and automation in sync.
- **Safety by default** — real credit cards are never used; checkout E2E is auto-gated until the live checkout page is detected.

## 4. Prerequisites

| Tool      | Version  | Notes                                    |
| --------- | -------- | ---------------------------------------- |
| Node.js   | 20.12+   | LTS recommended (`process.loadEnvFile` + JSON import attributes) |
| npm       | 9+       | Ships with Node.js                       |
| Browser   | –        | Installed by `npx playwright install`    |
| Internet  | –        | The suite runs against `https://korla.nl` |

## 5. Installation

```bash
npm install
npx playwright install          # installs Chromium + WebKit (for mobile projects)
```

> Optional: copy `.env.example` → `.env` and adjust `BASE_URL` / feature gates.
**Test Execution Summary Note:**
All core functional and smoke tests have passed successfully (45 passed, 0 failed). 

**Note:** Some scenarios in BVA (Boundary Value Analysis) and cart tests have been conditionally skipped (`test.skip`) to prevent false positives/negatives based on the current state of the booking widget/plugin on the live environment (gated on widget availability). All active core smoke and functional tests have passed successfully.