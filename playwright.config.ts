import { defineConfig, devices } from '@playwright/test';
import { config } from './src/utils/config.js';

/**
 * Generates a timestamped folder name for reports.
 * Format: report-YYYY-MM-DD_HH-mm-ss
 */
function getTimestampedReportFolder(): string {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[T:]/g, '-')
    .replace(/\..+/, '')
    .replace(/-/g, (match, offset) => (offset === 4 || offset === 7 ? '-' : offset === 10 ? '_' : '-'));

  // Format: YYYY-MM-DD_HH-mm-ss
  const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;

  return `playwright-report/report-${formatted}`;
}

// Use timestamped folder if TIMESTAMP_REPORT env var is set
const useTimestampedReport = process.env.TIMESTAMP_REPORT === 'true';
const reportOutputFolder = useTimestampedReport ? getTimestampedReportFolder() : 'playwright-report';

/**
 * Playwright configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  timeout: config.playwright.defaultTimeout,
  expect: { timeout: 5000 },

  // Fail fast in CI, retry locally for flaky network issues
  retries: config.isCI ? 0 : 1,

  // Parallel execution - tests must be independent
  fullyParallel: true,
  workers: config.isCI ? 1 : undefined,

  // Reporting
  reporter: [
    ['html', { open: 'never', outputFolder: reportOutputFolder }],
    ['list'],
  ],

  use: {
    // Use centralized config for baseURL
    baseURL: config.baseURL,
    headless: config.playwright.headless,

    // Debugging aids
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'on-first-retry',
  },

  projects: [
    // Setup project runs first, authenticates once (uses Chromium)
    // Auth state is saved to .auth/user.json and shared across all browsers
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Unauthenticated tests (negative auth scenarios) - no storageState
    {
      name: 'no-auth',
      testMatch: /.*auth-negative.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // Default browser - runs with `npm test`
    {
      name: 'chromium',
      testIgnore: /.*auth-negative.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Opt-in browsers - run with `npm run test:firefox` or `npm run test:browsers`
    {
      name: 'firefox',
      testIgnore: /.*auth-negative.*\.spec\.ts/,
      use: {
        ...devices['Desktop Firefox'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      testIgnore: /.*auth-negative.*\.spec\.ts/,
      use: {
        ...devices['Desktop Safari'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
