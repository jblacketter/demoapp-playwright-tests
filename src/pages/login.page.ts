import { Locator, expect } from '@playwright/test';
import { BasePage } from './base.page.js';

/**
 * Page object for the login page.
 * Handles authentication flow for the application.
 *
 * Selector Strategy (in order of preference):
 * 1. getByLabel - Accessible, semantic, resilient to UI changes
 * 2. getByPlaceholder - User-visible, relatively stable
 * 3. CSS attribute selectors - Fallback when semantic selectors unavailable
 * 4. CSS type selectors - Last resort
 */
export class LoginPage extends BasePage {
  public readonly path = '/';

  /**
   * Get the username input field.
   * Uses multiple selector strategies for resilience.
   */
  private get usernameInput(): Locator {
    return this.page
      .getByLabel('Username')
      .or(this.page.getByPlaceholder(/username/i))
      .or(this.page.locator('input[name="username"]'))
      .or(this.page.locator('input[type="text"]').first());
  }

  /**
   * Get the password input field.
   * Uses multiple selector strategies for resilience.
   */
  private get passwordInput(): Locator {
    return this.page
      .getByLabel('Password')
      .or(this.page.getByPlaceholder(/password/i))
      .or(this.page.locator('input[name="password"]'))
      .or(this.page.locator('input[type="password"]'));
  }

  /**
   * Get the login/submit button.
   * Matches common button patterns for login forms.
   */
  private get loginButton(): Locator {
    return this.page
      .getByRole('button', { name: /sign in|log in|login|submit/i })
      .or(this.page.locator('button[type="submit"]'))
      .or(this.page.locator('button').filter({ hasText: /sign in|log in|login/i }));
  }

  /**
   * Get the error message element.
   * Used to verify login failures.
   */
  private get errorMessage(): Locator {
    return this.page
      .getByRole('alert')
      .or(this.page.locator('[class*="error"]'))
      .or(this.page.locator('[class*="alert"]'));
  }

  /**
   * Perform login with provided credentials.
   *
   * @param username - The username to enter
   * @param password - The password to enter
   */
  public async login(username: string, password: string): Promise<void> {
    await this.fillInput(this.usernameInput, username, 'username input');
    await this.fillInput(this.passwordInput, password, 'password input');
    await this.clickElement(this.loginButton, 'login button');

    // Wait for navigation after login
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Verify login was successful by checking we're no longer on login page.
   * This is used after login to confirm authentication worked.
   */
  public async verifyLoginSuccessful(): Promise<void> {
    // Wait for URL to change from login page or for a dashboard element
    await expect(this.page).not.toHaveURL(/login/i, { timeout: 10000 });

    // Also verify login form is no longer visible
    await expect(this.loginButton).toBeHidden({ timeout: 5000 });
  }

  /**
   * Verify login error message is displayed.
   *
   * @param expectedMessage - The expected error message text
   */
  public async verifyLoginError(expectedMessage: string): Promise<void> {
    await expect(this.errorMessage).toContainText(expectedMessage);
  }
}
