import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for STEM Lab Assistant E2E tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Maximum time one test can run for
  timeout: 30 * 1000,

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ...(process.env.CI ? [['github'] as const] : []),
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'http://localhost:5173',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot settings
    screenshot: 'only-on-failure',

    // Video settings
    video: 'retain-on-failure',

    // Maximum time each action can take
    actionTimeout: 10 * 1000,

    // Navigation timeout
    navigationTimeout: 15 * 1000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1000 }, // Style guide requirement
      },
    },

    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1000 },
      },
    },

    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1000 },
      },
    },

    // Test on scaled viewport
    {
      name: 'chromium-scaled',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1600, height: 900 },
      },
    },

    // Test on mobile viewport for touch interactions
    {
      name: 'mobile-touch',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 768, height: 1024 },
        hasTouch: true,
      },
    },

    // Additional mobile testing for younger students (K-2)
    {
      name: 'mobile-portrait',
      use: {
        ...devices['iPad Mini'],
        viewport: { width: 768, height: 1024 },
        hasTouch: true,
      },
    },
  ],

  // For local development, you can start services manually or use Docker Compose
  // In CI, Docker Compose starts all services before tests
  // Set PLAYWRIGHT_SKIP_SERVER=true to skip auto-starting services
  webServer: process.env.PLAYWRIGHT_SKIP_SERVER ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Output folder for test artifacts
  outputDir: 'test-results/',
});
