import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { test } from '../src/fixtures/test.fixture.js';
import type { TestCase, TestDataFile } from '../src/types/test-data.types.js';

// Load test data from JSON file (avoids ESM import attribute compatibility issues)
const __dirname = dirname(fileURLToPath(import.meta.url));
const testDataPath = join(__dirname, '..', 'data', 'test-cases.json');
const testData = JSON.parse(readFileSync(testDataPath, 'utf-8')) as TestDataFile;

/**
 * Data-driven test suite for task verification.
 *
 * Purpose:
 * - Verifies tasks appear in the correct Kanban columns
 * - Verifies tasks have the expected tags
 * - Tests are generated dynamically from test-cases.json
 *
 * Test Isolation:
 * - Each test runs independently (can run in parallel)
 * - No test modifies data (read-only verification)
 * - Shared auth state is acceptable for read-only tests
 *
 * Data Source:
 * - Test cases defined in data/test-cases.json
 * - Each test case generates one Playwright test
 */

const testCases: TestCase[] = testData.testCases;

for (const tc of testCases) {
  test(`${tc.id}: ${tc.name}`, async ({ projectPage }): Promise<void> => {
    await test.step(`Navigate to project "${tc.project}"`, async (): Promise<void> => {
      await projectPage.navigateToProject(tc.project);
    });

    await test.step(`Verify task "${tc.taskName}" is in column "${tc.expectedColumn}"`, async (): Promise<void> => {
      await projectPage.verifyTaskInColumn(tc.taskName, tc.expectedColumn);
    });

    await test.step(`Verify task has tags: ${tc.expectedTags.join(', ')}`, async (): Promise<void> => {
      await projectPage.verifyTaskTags(tc.taskName, tc.expectedTags, tc.expectedColumn);
    });
  });
}
