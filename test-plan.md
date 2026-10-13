# Korla.nl Master Test Plan
## End-to-End QA Testing Framework (Manual & Automated)

**Application Under Test:** [https://korla.nl/](https://korla.nl/) — KORLA TAXI booking platform
**Test Approach:** Manual + Automated (Playwright Page Object Model, JavaScript)

---

## 1. Document Control

| Field              | Value                                              |
| ------------------ | -------------------------------------------------- |
| Document Title     | Korla.nl Master Test Plan                          |
| Version            | 1.0                                                |
| Status             | Ready for execution                                |
| Author             | Senior QA Automation Engineer                      |
| Reviewers          | QA Lead, Product Owner, Development Lead           |
| Last Updated       | 2026-10-09                                         |
| Related Docs       | `README.md`, automated specs under `tests/`        |

## 2. Purpose & Objectives

The purpose of this plan is to define the complete quality assurance approach for the
**entire Korla.nl web application**, moving beyond login-only coverage to validate every
critical business workflow — with the **Taxi Booking and Payment flow as the highest
priority**.

Objectives:

1. Verify the **Taxi Booking & Payment** end-to-end flow: route/address inputs, vehicle
   selection, booking submission and payment processing.
2. Validate **passenger & luggage capacity limits** via Boundary Value Analysis (BVA):
   Standard Sedan (max 4) vs. Vito Van (max 8).
3. Verify **account management** (login/registration) and **order tracking**.
4. Assess **UX/UI usability**, **cross-device stability** and **mobile responsiveness**,
   treating **mobile browsers as the primary target environment**.
5. Provide a repeatable **exploratory → smoke → regression** execution model that is
   mirrored by an automated Playwright (POM) suite.

## 3. Application Under Test (AUT) Overview

Korla.nl is a Dutch airport-transfer / taxi booking platform built on **WordPress +
WooCommerce** (Astra theme). Confirmed key surfaces:

| Area                | URL / Entry point                                             | Notes                                   |
| ------------------- | ------------------------------------------------------------ | --------------------------------------- |
| Booking hub         | `https://korla.nl/`                                           | Book Your Trips, airport transfers, FAQ |

## 4. Scope

### 4.1 In Scope

- **Taxi Booking & Payment** (highest priority): route/address inputs, date/time,
  passenger & luggage selection, vehicle selection, booking submission, checkout, payment.
- **Passenger & luggage capacity rules** (BVA) — Sedan max 4, Vito Van max 8.
- **Account management**: login, registration, logout, password validation.
- **Order tracking** and **invoice request**.
- **UX/UI usability**: navigation, forms, clarity, error handling, accessibility basics.
- **Mobile responsiveness & cross-device stability** (mobile-first).
- Payment **method availability** (Visa, MasterCard, Amex, PayPal, bank transfer) as advertised.

### 4.2 Out of Scope

- Backend / database-level testing, performance & load testing, security penetration testing.
- Mobile **native** apps (web application only).
- Third-party payment-provider certification (gateway sandbox only).
- Content accuracy of marketing pages beyond the booking-relevant copy.

## 5. Test Strategy

Execution is layered, in **mobile-first order** (mobile browsers first, desktop second).

| #  | Layer                     | Description                                                                        | Executed |
| -- | ------------------------- | ---------------------------------------------------------------------------------- | -------- |
| 1  | **Exploratory & Monkey**  | Ad-hoc probing of the booking/payment flow, unexpected inputs, layout breakage. Document findings as bug reports. | Each release cycle |
| 2  | **Smoke**                 | High-priority happy paths: booking hub loads, nav works, product add-to-cart, login validation, order tracking. | Every build |
| 3  | **Regression**            | Full BVA matrix, all payment methods, UX/UI + mobile checks across every target device. | Before release |

The automated Playwright (POM) suite mirrors these layers:

- `tests/smoke.spec.js` → Smoke
- `tests/booking-bva.spec.js` → Regression (BVA)
- `tests/payment.spec.js` → Regression (payment + tracking)

## 6. Test Environment & Devices

### 6.1 Target Device Matrix (Mobile-First)

## 7. Test Data Strategy

| Data type            | Source                             | Notes                                        |
| -------------------- | ---------------------------------- | -------------------------------------------- |
| Routes / addresses   | Homepage popular routes            | Amsterdam ↔ Schiphol, Rotterdam, The Hague   |
| Passenger & luggage  | Capacity contract (`data/testData.js`) | Sedan max 4 / Vito Van max 8                 |
| Email / phone / postal code | Generated at runtime (`utils/helpers.js`) | Throwaway values, never reused             |
| Login                | Invalid credentials + optional `.env` user | No real personal credentials                |
| Payment              | Sandbox card only (`4242…`)        | Never charges real money                     |

## 8. Boundary Value Analysis (BVA) Test Matrix

### 8.1 Passenger Capacity

| Vehicle          | Below Min (−1) | Min          | Valid Maximum | Above Max (+1) | Expected handling                          |
| ---------------- | -------------- | ------------ | ------------- | -------------- | ------------------------------------------ |
| **Standard Sedan** | 0              | 1            | **4**         | 5              | 0/5 rejected or rerouted to larger vehicle |
| **Vito Van**       | 6 (low-valid)  | 7 (high-valid)| **8**         | 9              | 9 rejected; 6–8 accepted                   |

Automated cases (`tests/booking-bva.spec.js`):

- Sedan: **0** (rejected) · **1** (accepted) · **4** (accepted) · **5** (rejected)
- Vito Van: **7** (accepted) · **8** (accepted) · **9** (rejected)

### 8.2 Luggage Capacity

| Vehicle          | Below Min (−1) | Min          | Valid Maximum | Above Max (+1) | Expected handling                          |
| ---------------- | -------------- | ------------ | ------------- | -------------- | ------------------------------------------ |
| **Standard Sedan** | 0              | 1            | **3**         | 4              | 0/4 rejected or rerouted to larger vehicle |
| **Vito Van**       | 9 (high-valid) | –            | **10**        | 11             | 11 rejected; up to 10 accepted             |

Automated cases:

- Luggage: **0** (rejected) · **1** (accepted) · **3** (sedan max, accepted) ·
  **4** (rejected/rerouted) · **10** (van max, accepted) · **11** (rejected)

### 8.3 BVA Test Matrix

| Test ID | Boundary               | Input | Vehicle   | Expected Result                          | Automation        |
| ------- | ---------------------- | ----- | --------- | ---------------------------------------- | ----------------- |

## 9. Test Case Catalogue

> **Priority legend:** 1 = Critical (blocker for release), 2 = High, 3 = Medium, 4 = Low.
> **Automation:** references the automated spec that mirrors the manual case.

### 9.1 Taxi Booking & Payment (TC-BOOK)

| ID        | Title                                    | Priority | Steps (condensed)                                                         | Expected Result                                          | Automation         |
| --------- | ---------------------------------------- | -------- | ------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------ |
| TC-BOOK-01| Booking hub loads                        | 1        | Open homepage                                                             | Title "KORLA TAXI", Book Your Trips + Airport Transfers sections visible | smoke.spec         |
| TC-BOOK-02| Popular routes are selectable            | 1        | Homepage → choose a route (e.g. Amsterdam → Schiphol)                     | Route auto-fills into the booking widget                 | booking-bva.spec   |
| TC-BOOK-03| Date/time can be set                     | 1        | Select future date + time                                                 | Fields accept valid future values; past dates rejected   | booking-bva.spec   |
| TC-BOOK-04| Passenger count selectable               | 1        | Set 1–4 passengers (Sedan)                                                | Count updates; valid within capacity                     | booking-bva.spec   |
| TC-BOOK-05| Luggage count selectable                 | 2        | Set 0–3 luggage (Sedan)                                                   | Count updates; valid within capacity                     | booking-bva.spec   |
| TC-BOOK-06| Vehicle selection offered                | 1        | Search valid route + passengers                                           | Available vehicles (Sedan / Vito Van) offered            | booking-bva.spec   |
| TC-BOOK-07| Booking added to cart                    | 1        | Product page → set quantity → Add to cart                                 | Add-to-cart form present (form/quantity/button); cart-notice E2E gated until the live cart confirms | smoke.spec (E2E gated) |
| TC-BOOK-08| Cart → checkout navigation               | 1        | Cart drawer → Proceed to checkout                                         | Navigates to checkout                                    | payment.spec       |
| TC-BOOK-09| Tour package details reachable           | 2        | Homepage → View Details                                                   | Loads `/tour-package-details/?package_id=…`              | smoke.spec         |
| TC-BOOK-10| 10% round-trip discount applied          | 2        | Round-trip booking → view cart/checkout totals                            | Discount line shown, total reduced by 10%                | payment.spec       |

### 9.2 Passenger & Luggage Capacity — BVA (TC-BVA)

| ID      | Title                                | Priority | Steps                                  | Expected Result                          | Automation       |
| ------- | ------------------------------------ | -------- | -------------------------------------- | ---------------------------------------- | ---------------- |
| TC-BVA-01| Sedan below minimum (0) rejected     | 1        | Set 0 passengers on a Sedan booking    | Validation error; cannot proceed         | booking-bva.spec |
| TC-BVA-02| Sedan minimum (1) accepted           | 1        | Set 1 passenger                        | Proceeds to vehicle selection            | booking-bva.spec |
| TC-BVA-03| Sedan maximum (4) accepted           | 1        | Set 4 passengers                       | Proceeds to vehicle selection            | booking-bva.spec |
| TC-BVA-04| Sedan above max (5) rejected/reroute| 1        | Set 5 passengers                       | Rejected OR larger vehicle (Vito Van) suggested | booking-bva.spec |
| TC-BVA-05| Vito Van high-valid (7) accepted     | 1        | Set 7 passengers, choose Vito Van      | Accepted                                  | booking-bva.spec |
| TC-BVA-06| Vito Van maximum (8) accepted        | 1        | Set 8 passengers, choose Vito Van      | Accepted                                  | booking-bva.spec |
| TC-BVA-07| Vito Van above max (9) rejected      | 1        | Set 9 passengers                       | Rejected; no vehicle available            | booking-bva.spec |

### 9.3 Payment Processing (TC-PAY)

| ID        | Title                                    | Priority | Steps (condensed)                                                              | Expected Result                                           | Automation         |
| --------- | ---------------------------------------- | -------- | ------------------------------------------------------------------------------ | --------------------------------------------------------- | ------------------ |
| TC-PAY-01 | Payment methods advertised               | 1        | Homepage FAQ → "What payment methods do you accept?"                           | Visa, MasterCard, Amex, PayPal, bank transfer listed      | smoke + payment.spec |
| TC-PAY-02 | Checkout loads with billing fields       | 1        | Cart → Proceed to checkout                                                     | Billing form rendered                                     | payment.spec (gated) |
| TC-PAY-03 | Place order with credit card (sandbox)   | 1        | Fill billing → select Credit Card → enter sandbox card → Place order           | Order received confirmation, order number shown           | payment.spec (gated) |
| TC-PAY-04 | Place order with PayPal                  | 1        | Fill billing → select PayPal → Place order                                     | Redirect to PayPal sandbox / order confirmation           | payment.spec (gated) |
| TC-PAY-05 | Place order with bank transfer           | 2        | Fill billing → select Direct bank transfer → Place order                       | Order confirmation with bank transfer instructions        | payment.spec (gated) |
| TC-PAY-06 | Invalid card rejected                    | 2        | Enter invalid card number → Place order                                        | Clear inline error; order not placed                      | payment.spec (gated) |
| TC-PAY-07 | Billing required-field validation        | 2        | Leave email/phone empty → Place order                                          | Inline validation errors, no submission                  | payment.spec (gated) |
| TC-PAY-08 | Order confirmation persists              | 1        | After payment → note order number → reload page                                | Confirmation / thank-you page re-accessible              | payment.spec (gated) |
| TC-PAY-09 | Order tracking happy path                | 1        | /order-tracking/ → enter valid order ID + billing email → Track                | Order status displayed                                   | payment.spec       |
| TC-PAY-10 | Order tracking unknown order             | 2        | Enter invalid order ID/email → Track                                           | Friendly "not found" message; page stays usable           | payment.spec       |

### 9.4 Account Management — Login (TC-LOG)

| ID      | Title                              | Priority | Steps (condensed)                        | Expected Result                                      | Automation      |
| ------- | ---------------------------------- | -------- | ---------------------------------------- | ---------------------------------------------------- | --------------- |
| TC-LOG-01| Login page loads                   | 1        | /my-account/                             | Login + register forms visible                        | smoke.spec      |
| TC-LOG-02| Empty fields validation            | 1        | Submit with empty fields                 | Error message, no navigation                          | smoke.spec      |
| TC-LOG-03| Invalid credentials rejected       | 1        | Submit unknown user + wrong password     | "Unknown username" / "Incorrect password" error      | smoke.spec      |
| TC-LOG-04| Valid credentials accepted         | 1        | Submit real credentials (`.env`)         | Dashboard shown, "Log out" link present               | smoke.spec (optional) |
| TC-LOG-05| Register with new email            | 2        | Enter throwaway email → Register         | Registration email sent / account created            | smoke.spec (optional) |
| TC-LOG-06| "Remember me" persists session     | 3        | Login with Remember me → reopen browser  | Session persists                                     | manual          |
| TC-LOG-07| Logout returns to login            | 2        | Click Log out                            | Redirected to login; dashboard no longer accessible  | manual          |
| TC-LOG-08| Password field is masked           | 3        | Inspect password input type              | `type="password"`                                    | manual          |

### 9.5 Order Tracking & Invoice Request (TC-TRK)


### 9.6 UX/UI Usability (TC-UX)

| ID      | Title                                | Priority | Steps (condensed)                                   | Expected Result                                   | Automation |
| ------- | ------------------------------------ | -------- | --------------------------------------------------- | ------------------------------------------------- | ---------- |
| TC-UX-01| Navigation is clear & consistent     | 1        | Visit every top-level nav item                      | Consistent menu across pages; active state shown  | smoke.spec |
| TC-UX-02| Forms have clear labels              | 1        | Inspect booking/login/tracking forms                | Visible labels / placeholders / aria-labels       | smoke.spec |
| TC-UX-03| Error messages are helpful           | 2        | Trigger invalid login + tracking                    | Human-readable, contextual messages               | smoke/payment.spec |
| TC-UX-04| Keyboard navigation (no mouse)       | 2        | Tab through booking + checkout forms                | All fields reachable, visible focus indicator     | manual     |
| TC-UX-05| Skip-link to main content            | 3        | Press Tab on page load                              | Skip link present and functional                  | manual     |
| TC-UX-06| Font sizes readable (≥16px body)     | 3        | Inspect body font-size on mobile                    | No sub-16px body text in primary content          | manual     |
| TC-UX-07| Touch targets ≥ 44×44 px             | 2        | Inspect primary CTAs (mobile)                       | Tap targets meet size guidance                    | manual     |
| TC-UX-08| No horizontal scroll on mobile       | 2        | Scroll horizontally on each page (mobile viewport)  | No overflow; content fits viewport                | manual     |
| TC-UX-09| Loading states for async actions     | 3        | Add to cart / place order                           | Spinner/disabled state while in flight            | manual     |

### 9.7 Mobile Responsiveness & Cross-Device (TC-MOB)

| ID      | Title                                | Priority | Steps (condensed)                                   | Expected Result                                   | Automation     |
| ------- | ------------------------------------ | -------- | --------------------------------------------------- | ------------------------------------------------- | -------------- |
| TC-MOB-01| Mobile menu toggles navigation       | 1        | Open homepage on mobile viewport → tap hamburger    | Menu expands (aria-expanded=true), links visible  | smoke.spec     |
| TC-MOB-02| Booking flow on mobile               | 1        | Complete booking flow at 390×844                    | No clipping; all steps reachable                  | full suite     |
| TC-MOB-03| Checkout on mobile                   | 1        | Complete checkout at 390×844                        | No clipping; fields usable                        | payment.spec (gated) |
| TC-MOB-04| Layout across phone sizes            | 2        | Compare 320/390/412 widths                          | No overflow or overlapping elements               | full suite     |
| TC-MOB-05| Layout on desktop (secondary)        | 2        | Repeat key flows at 1280×720                        | No regression vs. mobile                          | full suite     |
| TC-MOB-06| Rotated (landscape) layout           | 3        | Rotate to landscape on a phone                     | Layout reflows without breakage                   | manual         |

## 10. Defect Reporting Template

Use the following template for any defect found (manual or automated):

```text
Title:       [TC-ID] One-line summary
Environment: Device / browser / viewport + URL
Severity:    Blocker / Major / Minor / Trivial
Priority:    1 / 2 / 3 / 4

## 11. Traceability Matrix

Maps the business requirement areas to the covering test cases and automation.

| Business area                  | Manual cases                   | Automated spec              | Status        |
| ------------------------------ | ------------------------------ | --------------------------- | ------------- |
| Taxi booking flow              | TC-BOOK-01…10                  | smoke.spec                  | Active        |
| Passenger capacity (BVA)       | TC-BVA-01…07                   | booking-bva.spec            | Contract active; widget gated |
| Luggage capacity (BVA)         | TC-BVA-08…13                   | booking-bva.spec            | Contract active; widget gated |
| Payment methods / checkout     | TC-PAY-01…10                   | payment.spec                | Advertised active; checkout gated |
| Account management (login)     | TC-LOG-01…08                   | smoke.spec                  | Active        |
| Order tracking / invoice       | TC-TRK-01…04                   | smoke.spec, payment.spec    | Active        |
| UX/UI usability                | TC-UX-01…09                    | smoke.spec (partial)        | Active / manual |
| Mobile responsiveness          | TC-MOB-01…06                   | full suite (mobile-first)   | Active        |

## 12. Entry & Exit Criteria

### 12.1 Entry Criteria

- Smoke suite passes on Mobile Chrome, Mobile Safari and Desktop Chrome.
- Environment URL is reachable and stable.
- Test data (throwaway) generation is confirmed working.

### 12.2 Exit Criteria

- All Priority 1 (Critical) and Priority 2 (High) tests pass.
- Zero open Blocker/Severity-1 defects.
- BVA matrix fully executed on at least the primary mobile project.
- Known limitations (gated checkout/widget) are documented and signed off by the Product Owner.

## 13. Risks & Assumptions

| Risk / Assumption                                         | Impact | Mitigation                                             |
| --------------------------------------------------------- | ------ | ------------------------------------------------------ |
| `/checkout` page is not yet live (resolves to homepage)   | High   | Payment E2E auto-gated; selectors ready for go-live    |
| Booking widget is client-side rendered                     | Medium | Resilient selectors in `data/selectors.js`; BVA gate   |
| Production site changes can break selectors               | Medium | Centralised selector map; single-file updates          |
| No real credentials/cards available                       | Low    | Throwaway data + sandbox card only                     |
| Mobile Safari (WebKit) rendering differences              | Medium | WebKit project included in default run                  |

## 14. Automation Mapping

| Spec                    | Scope                                        | Runs on projects            |
| ----------------------- | -------------------------------------------- | --------------------------- |
| `tests/smoke.spec.js`   | Booking hub, nav, mobile menu, add-to-cart form (cart E2E gated), login validation, tracking, FAQ | All |
| `tests/booking-bva.spec.js` | Capacity contract + BVA widget boundaries   | All (widget block gated)    |
| `tests/payment.spec.js` | Payment methods, checkout E2E (gated), tracking | All                     |

## 15. Approval

| Role          | Name | Signature | Date       |
| ------------- | ---- | --------- | ---------- |
| QA Lead       |      |           |            |
| Product Owner |      |           |            |
| Dev Lead      |      |           |            |

---

*End of Korla.nl Master Test Plan (v1.0). Maintain in sync with `README.md` and the automated specs under `tests/`.*

Steps:       1. … 2. … 3. …
Expected:    What should have happened
Actual:      What actually happened
Evidence:    Screenshot / video / trace (test-results/)
Logs:        console errors, network status codes
Automation:  Related spec name (if any)
```

| ID      | Title                             | Priority | Steps (condensed)                            | Expected Result                                   | Automation   |
| ------- | --------------------------------- | -------- | -------------------------------------------- | ------------------------------------------------- | ------------ |
| TC-TRK-01| Tracking page reachable           | 1        | Nav → Order Tracking                         | Form with Order ID + billing email fields         | smoke.spec   |
| TC-TRK-02| Track valid order                 | 1        | Enter valid order ID + email                 | Order status + details displayed                  | payment.spec |
| TC-TRK-03| Track unknown order               | 2        | Enter invalid reference                      | Friendly not-found message                        | payment.spec |
| TC-TRK-04| Invoice request page reachable    | 2        | Nav → Invoice Request                        | Request form loads                                | smoke.spec   |

| TC-BVA-08| Luggage below min (0) rejected       | 2        | Set 0 luggage                          | Validation error                          | booking-bva.spec |
| TC-BVA-09| Luggage min (1) accepted             | 2        | Set 1 luggage                          | Accepted                                  | booking-bva.spec |
| TC-BVA-10| Luggage sedan max (3) accepted       | 2        | Set 3 luggage on Sedan                 | Accepted                                  | booking-bva.spec |
| TC-BVA-11| Luggage above sedan max (4)          | 2        | Set 4 luggage on Sedan                 | Rejected or rerouted                      | booking-bva.spec |
| TC-BVA-12| Luggage van max (10) accepted        | 2        | Set 10 luggage on Vito Van             | Accepted                                  | booking-bva.spec |
| TC-BVA-13| Luggage above van max (11) rejected  | 2        | Set 11 luggage                         | Rejected                                  | booking-bva.spec |

| BVA-P01 | Below minimum          | 0     | Sedan     | Rejected / validation message            | booking-bva.spec  |
| BVA-P02 | Minimum                | 1     | Sedan     | Accepted, vehicle offered                | booking-bva.spec  |
| BVA-P03 | Valid maximum          | 4     | Sedan     | Accepted, vehicle offered                | booking-bva.spec  |
| BVA-P04 | Above maximum          | 5     | Sedan     | Rejected / rerouted to Vito Van          | booking-bva.spec  |
| BVA-P05 | High-valid             | 7     | Vito Van  | Accepted                                 | booking-bva.spec  |
| BVA-P06 | Valid maximum          | 8     | Vito Van  | Accepted                                 | booking-bva.spec  |
| BVA-P07 | Above maximum          | 9     | Vito Van  | Rejected                                 | booking-bva.spec  |
| BVA-L01 | Below minimum          | 0     | Sedan     | Rejected                                 | booking-bva.spec  |
| BVA-L02 | Minimum                | 1     | Sedan     | Accepted                                 | booking-bva.spec  |
| BVA-L03 | Sedan max              | 3     | Sedan     | Accepted                                 | booking-bva.spec  |
| BVA-L04 | Above sedan max        | 4     | Sedan     | Rejected / rerouted                      | booking-bva.spec  |
| BVA-L05 | Van max                | 10    | Vito Van  | Accepted                                 | booking-bva.spec  |
| BVA-L06 | Above van max          | 11    | Vito Van  | Rejected                                 | booking-bva.spec  |


| Priority | Device / Browser              | Viewport            | Automation project   |
| -------- | ----------------------------- | ------------------- | -------------------- |
| Primary  | Google Pixel 7 · Chrome       | 412 × 915           | `Mobile Chrome`      |
| Primary  | iPhone 12 · Safari            | 390 × 844           | `Mobile Safari`      |
| Secondary| Desktop · Chrome              | 1280 × 720          | `Desktop Chrome`     |

### 6.2 Environment Matrix

| Environment | URL            | Used for                  | Data             |
| ----------- | -------------- | ------------------------- | ---------------- |
| Production  | `https://korla.nl` | Manual exploratory, automated smoke/regression (read-only) | Throwaway data only |

> ⚠️ **No real credit cards or personal data are ever used** on the production site.
> Automated payment tests auto-gate until a real checkout page is detected, and then
> run against sandbox/test-gateway selectors only.

| Products            | `/product/packages/`, `/product/tickets/`, `/product/dynamic-routes/` | WooCommerce products with Add to cart   |
| Tour packages       | `/tour-package-details/?package_id=2257/2258/2259`            | JS-rendered package pages               |
| My Account (login)  | `/my-account/`                                                | WooCommerce login + register            |
| Order Tracking      | `/order-tracking/`                                            | Order ID + billing email                |
| Invoice Request     | `/invoice-request/`                                           |                                          |
| Payment methods     | Site FAQ                                                      | Visa, MasterCard, Amex, PayPal, bank transfer |

The **core business flow** under test:

```
Route & address inputs → Date/time → Passenger & luggage selection → Vehicle selection
        → Booking submission (Add to cart) → Checkout → Payment → Confirmation
```
