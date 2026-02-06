import { test as setup } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page.js';
import { config, validateConfig } from '../src/utils/config.js';

/**
 * Authentication setup script.
 *
 * Purpose:
 * - Runs ONCE before all test projects (not before each test)
 * - Performs full login validation
 * - Saves authentication state to .auth/user.json
 *
 * Design Notes:
 * - If this fails, no tests will run (fail fast principle)
 * - Credentials are never logged (security)
 * - Auth state is reused by all tests in the chromium project
 */
setup('authenticate', async ({ page }): Promise<void> => {
  // Validate configuration before attempting login
  validateConfig();

  const loginPage = new LoginPage(page);

  await setup.step('Navigate to login page', async (): Promise<void> => {
    await loginPage.navigate();
  });

  await setup.step('Enter credentials and submit', async (): Promise<void> => {
    await loginPage.login(config.credentials.username, config.credentials.password);
  });

  await setup.step('Verify login successful', async (): Promise<void> => {
    await loginPage.verifyLoginSuccessful();
  });

  await setup.step('Save authentication state', async (): Promise<void> => {
    await page.context().storageState({ path: '.auth/user.json' });
  });
});
