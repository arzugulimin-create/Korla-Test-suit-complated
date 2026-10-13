// @ts-check
import { defineConfig, devices } from '@playwright/test';

// Load `.env` when present (Node >= 20.12) so credentials / feature gates can
// live in a local `.env` file (see .env.example). Missing file is a no-op —
// the ambient shell/CI environment is used instead.
try {
  process.loadEnvFile();
} catch {
  // .env not present — rely on the ambient environment.
}

/**
 * Korla.nl — End-to-End QA Testing Framework (Manual & Automated).
 *
 * Mobile-First execution strategy:
 *   PRIMARY   -> Mobile Chrome (Android) + Mobile Safari (iOS)
 *   SECONDARY -> Desktop Chrome
 */
export default defineConfig({
  testDir: './tests',

  // Run each spec in its own file in parallel.
  fullyParallel: true,

  // Fail the build on CI if any test is accidentally marked with .only.
  forbidOnly: !!process.env.CI,

  // Retry once on CI; keep local runs fast and deterministic.
  retries: process.env.CI ? 2 : 0,

  // One worker per CI job to keep results deterministic.
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  // Global per-test timeout.
  timeout: 60_000,

  expect: {
    timeout: 15_000,
  },

  use: {
    // Target environment (override via BASE_URL env var / .env).
    baseURL: process.env.BASE_URL || 'https://korla.nl',
    locale: 'en-US',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // ── PRIMARY TARGET: Mobile browsers (mobile-first) ──────────────────────
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // ── SECONDARY TARGET: Desktop browsers ──────────────────────────────────
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
