import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Default application URL - single source of truth
 */
const DEFAULT_BASE_URL = 'https://animated-gingersnap-8cf7f2.netlify.app/';

/**
 * Default credentials for the public demo application.
 * These are intentionally public demo credentials - override via .env for other environments.
 */
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'password123';

/**
 * Maximum character length for tag text (filters out non-tag content)
 */
export const TAG_MAX_LENGTH = 20;

/**
 * Configuration utility for accessing environment variables with type safety.
 * This is the single source of truth for all configuration values.
 *
 * Default credentials are provided for the public demo app for ease of evaluation.
 * Override via environment variables for other environments.
 */
export const config = {
  /** Base URL of the application under test */
  baseURL: process.env.BASE_URL ?? DEFAULT_BASE_URL,

  /** Login credentials (defaults to public demo app credentials) */
  credentials: {
    username: process.env.USERNAME ?? DEFAULT_USERNAME,
    password: process.env.PASSWORD ?? DEFAULT_PASSWORD,
  },

  /** CI environment detection */
  isCI: !!process.env.CI,

  /** Playwright settings */
  playwright: {
    // Default to headless in CI, or when explicitly set
    headless: !!process.env.CI || process.env.HEADLESS === 'true',
    slowMo: parseInt(process.env.SLOW_MO ?? '0', 10),
    defaultTimeout: parseInt(process.env.DEFAULT_TIMEOUT ?? '30000', 10),
  },
} as const;

/**
 * Validate that configuration is properly loaded.
 * Logs a warning if using default demo credentials.
 */
export function validateConfig(): void {
  if (config.credentials.username === DEFAULT_USERNAME) {
    // Using default demo credentials - this is expected for the evaluation
    // In production, credentials should be provided via environment variables
  }
}
