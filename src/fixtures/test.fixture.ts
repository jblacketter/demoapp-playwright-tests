import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';
import { ProjectPage } from '../pages/project.page.js';

/**
 * Custom test fixture types.
 * Defines the page objects available in tests via dependency injection.
 */
interface TestFixtures {
  /** Login page object for authentication flows */
  loginPage: LoginPage;
  /** Project board page object for task verification */
  projectPage: ProjectPage;
}

/**
 * Extended test instance with custom fixtures.
 *
 * Usage in tests:
 * ```typescript
 * import { test, expect } from '../src/fixtures/test.fixture.js';
 *
 * test('example', async ({ projectPage }) => {
 *   await projectPage.navigateToProject('Web Application');
 * });
 * ```
 *
 * Design Notes:
 * - Fixtures are lazily instantiated when first used in a test
 * - Each test gets its own page instance (test isolation)
 * - Auth state is restored from storageState before fixture runs
 * - projectPage fixture navigates to baseURL and verifies auth
 */
export const test = base.extend<TestFixtures>({
  /**
   * Login page fixture.
   * Use this for tests that need to interact with the login page directly.
   */
  loginPage: async ({ page }, use): Promise<void> => {
    await use(new LoginPage(page));
  },

  /**
   * Project page fixture.
   * Automatically navigates to the app and verifies authentication.
   * Use this for tests that verify tasks on the Kanban board.
   */
  projectPage: async ({ page, baseURL }, use): Promise<void> => {
    const projectPage = new ProjectPage(page);

    // Navigate to app (auth state is automatically restored from storageState)
    await page.goto(baseURL ?? '/');

    // Sanity check: verify we're authenticated before running test
    // This catches session issues early without full re-validation
    await projectPage.verifyPageLoaded();

    await use(projectPage);
  },
});

// Re-export expect for convenience
export { expect } from '@playwright/test';
