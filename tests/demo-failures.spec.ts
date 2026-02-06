/**
 * DEMO: Intentional failures for report demonstration.
 *
 * This file creates tests that INTENTIONALLY FAIL to demonstrate:
 * - Screenshot capture on failure
 * - HTML report with embedded screenshots
 * - Error message formatting
 *
 * To run: npx playwright test demo-failures.spec.ts --project=chromium
 * To view report: npm run report
 *
 * NOTE: Delete this file before production use.
 */

import { test } from '../src/fixtures/test.fixture.js';

test.describe.skip('Demo: Intentional Failures', () => {
  test('DEMO FAIL: Wrong column expectation', async ({ projectPage }) => {
    await projectPage.navigateToProject('Web Application');
    // This will FAIL - task is in "To Do", not "Done"
    await projectPage.verifyTaskInColumn('Implement user authentication', 'Done');
  });

  test('DEMO FAIL: Wrong tag expectation', async ({ projectPage }) => {
    await projectPage.navigateToProject('Web Application');
    await projectPage.verifyTaskInColumn('Implement user authentication', 'To Do');
    // This will FAIL - task has [Feature, High Priority], not [Bug, Critical]
    await projectPage.verifyTaskTags('Implement user authentication', ['Bug', 'Critical'], 'To Do');
  });

  test('DEMO FAIL: Non-existent task', async ({ projectPage }) => {
    await projectPage.navigateToProject('Web Application');
    // This will FAIL - task doesn't exist
    await projectPage.verifyTaskInColumn('This task does not exist', 'To Do');
  });
});
