import { expect } from '@playwright/test';
import selectors from '../data/selectors.js';
import testData from '../data/testData.js';

/**
 * BasePage — shared behaviour for every Korla page object.
 * Every page object inherits navigation, mobile-menu handling and the
 * centralised selector / test-data references.
 */
export class BasePage {
  constructor(page) {
    this.page = page;
    this.selectors = selectors;
    this.testData = testData;
  }

  /** Navigate to a site path (or absolute URL) and wait for the page to settle. */
  async goto(path = '/') {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('load').catch(() => {});
  }

  /** Current page <title>. */
  async title() {
    return this.page.title();
  }

  /**
   * Open the mobile hamburger menu when the desktop nav is hidden.
   * Safe to call on desktop viewports (no-op when the toggle is not shown).
   */
  async openMobileMenu() {
    const toggle = this.page.locator(this.selectors.nav.menuToggle).first();
    if (!(await toggle.isVisible().catch(() => false))) return;
    const expanded = await toggle.getAttribute('aria-expanded').catch(() => 'false');
    if (expanded !== 'true') {
      await toggle.click();
      await this.page.waitForTimeout(350);
    }
  }

  /** Click a top-level nav link by key, handling the mobile menu first. */
  async clickNavLink(name) {
    const selector = this.selectors.nav.links[name];
    if (!selector) throw new Error(`Unknown nav link key: "${name}"`);
    await this.openMobileMenu();
    // Only ever click a link that is actually on screen (avoids picking the
    // hidden desktop-nav duplicate when the hamburger menu is used on mobile).
    const link = this.page.locator(`${selector}:visible`).first();
    await expect(link).toBeVisible({ timeout: 10_000 });
    await link.click();
  }

  /** Capture a full-page screenshot into test-results/. */
  async pageScreenshot(name) {
    await this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
  }
}


