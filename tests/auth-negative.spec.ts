import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page.js';

/**
 * Negative authentication tests.
 *
 * Purpose:
 * - Verifies invalid credentials are rejected
 * - Verifies empty field handling
 * - These tests do NOT use stored auth state (no storageState dependency)
 *
 * Design Notes:
 * - Uses base Playwright test (not custom fixture) since we need unauthenticated state
 * - Each test starts fresh on the login page
 */

base.describe('Negative Authentication', () => {
  let loginPage: LoginPage;

  base.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate();
  });

  base('Invalid password is rejected', async ({ page }): Promise<void> => {
    await loginPage.login('admin', 'wrongpassword');

    // Should remain on login page — login button should still be visible
    // or an error message should appear
    const loginButton = page
      .getByRole('button', { name: /sign in|log in|login|submit/i })
      .or(page.locator('button[type="submit"]'));

    const errorMessage = page
      .getByRole('alert')
      .or(page.locator('[class*="error"]'))
      .or(page.locator('[class*="alert"]'));

    // Either the login button is still visible (stayed on page) or an error shows
    const stillOnLogin = await loginButton.isVisible().catch(() => false);
    const hasError = await errorMessage.isVisible().catch(() => false);

    expect(
      stillOnLogin || hasError,
      'Invalid password should either show error or keep user on login page'
    ).toBe(true);
  });

  base('Invalid username is rejected', async ({ page }): Promise<void> => {
    await loginPage.login('nonexistentuser', 'password123');

    const loginButton = page
      .getByRole('button', { name: /sign in|log in|login|submit/i })
      .or(page.locator('button[type="submit"]'));

    const errorMessage = page
      .getByRole('alert')
      .or(page.locator('[class*="error"]'))
      .or(page.locator('[class*="alert"]'));

    const stillOnLogin = await loginButton.isVisible().catch(() => false);
    const hasError = await errorMessage.isVisible().catch(() => false);

    expect(
      stillOnLogin || hasError,
      'Invalid username should either show error or keep user on login page'
    ).toBe(true);
  });

  base('Empty credentials are handled', async ({ page }): Promise<void> => {
    await loginPage.login('', '');

    // Should stay on login page
    const loginButton = page
      .getByRole('button', { name: /sign in|log in|login|submit/i })
      .or(page.locator('button[type="submit"]'));

    await expect(
      loginButton,
      'Should remain on login page with empty credentials'
    ).toBeVisible({ timeout: 5000 });
  });
});
