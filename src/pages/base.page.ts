import { Page, Locator, expect } from '@playwright/test';

/**
 * Abstract base page class providing common utilities for all page objects.
 *
 * Design principles:
 * - All selectors are encapsulated in page objects, never in test files
 * - Selectors use priority hierarchy: data-testid > role > label > text > CSS
 * - All interactions include descriptive error messages for debugging
 * - Methods are async and properly typed for TypeScript strict mode
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * The URL path for this page (relative to baseURL).
   * Must be implemented by all concrete page classes.
   */
  public abstract readonly path: string;

  /**
   * Navigate to this page using the configured baseURL.
   */
  public async navigate(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to be fully loaded (network idle).
   * Override in subclasses for pages with specific loading indicators.
   */
  public async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Click an element with descriptive error message.
   *
   * @param locator - The element locator to click
   * @param description - Human-readable description for error messages
   */
  protected async clickElement(locator: Locator, description: string): Promise<void> {
    await expect(
      locator,
      `Element "${description}" should be visible before clicking`
    ).toBeVisible();
    await locator.click();
  }

  /**
   * Fill an input field with a value.
   *
   * @param locator - The input element locator
   * @param value - The value to enter
   * @param description - Human-readable description for error messages
   */
  protected async fillInput(locator: Locator, value: string, description: string): Promise<void> {
    await expect(locator, `Input "${description}" should be visible before filling`).toBeVisible();
    await locator.fill(value);
  }

  /**
   * Get text content of an element.
   *
   * @param locator - The element locator
   * @returns The text content or empty string if null
   */
  protected async getText(locator: Locator): Promise<string> {
    return (await locator.textContent()) ?? '';
  }

  /**
   * Assert element is visible with descriptive message.
   *
   * @param locator - The element locator
   * @param description - Human-readable description for error messages
   */
  protected async assertVisible(locator: Locator, description: string): Promise<void> {
    await expect(locator, `"${description}" should be visible`).toBeVisible();
  }

  /**
   * Assert element contains expected text.
   *
   * @param locator - The element locator
   * @param expected - The expected text content
   * @param description - Human-readable description for error messages
   */
  protected async assertContainsText(
    locator: Locator,
    expected: string,
    description: string
  ): Promise<void> {
    await expect(locator, `"${description}" should contain text "${expected}"`).toContainText(
      expected
    );
  }
}
