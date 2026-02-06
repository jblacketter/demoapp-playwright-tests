import { test, expect } from '../src/fixtures/test.fixture.js';
import type { ProjectName } from '../src/types/test-data.types.js';

/**
 * Board structure verification tests.
 *
 * Purpose:
 * - Verifies the Kanban board renders all 4 columns for each project
 * - Verifies column task counts match expected values
 * - Verifies all 3 projects are listed in the sidebar
 *
 * These tests complement the data-driven task verification suite
 * by validating the board structure itself, not just individual tasks.
 */

const EXPECTED_COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'];

const EXPECTED_PROJECTS: ProjectName[] = [
  'Web Application',
  'Mobile Application',
  'Marketing Campaign',
];

/** Expected task counts per project per column */
const EXPECTED_COUNTS: Record<string, Record<string, number>> = {
  'Web Application': { 'To Do': 2, 'In Progress': 1, 'Review': 1, 'Done': 1 },
  'Mobile Application': { 'To Do': 1, 'In Progress': 1, 'Review': 0, 'Done': 1 },
  'Marketing Campaign': { 'To Do': 1, 'In Progress': 1, 'Review': 1, 'Done': 0 },
};

test.describe('Sidebar Navigation', () => {
  test('All projects are visible in sidebar', async ({ projectPage }): Promise<void> => {
    const projects = await projectPage.getVisibleProjects();

    for (const expected of EXPECTED_PROJECTS) {
      const found = projects.some(
        (p) => p.includes(expected) || expected.includes(p)
      );
      expect(
        found,
        `Project "${expected}" should be visible in sidebar. Found: [${projects.join(', ')}]`
      ).toBe(true);
    }
  });
});

test.describe('Board Structure', () => {
  for (const projectName of EXPECTED_PROJECTS) {
    test(`${projectName} - All 4 columns are visible`, async ({ projectPage }): Promise<void> => {
      await projectPage.navigateToProject(projectName);
      const columns = await projectPage.getColumnNames();

      expect(columns).toEqual(EXPECTED_COLUMNS);
    });

    test(`${projectName} - Column task counts are correct`, async ({ projectPage }): Promise<void> => {
      await projectPage.navigateToProject(projectName);

      for (const [colName, expectedCount] of Object.entries(EXPECTED_COUNTS[projectName])) {
        const actualCount = await projectPage.getColumnTaskCount(colName);
        expect(
          actualCount,
          `${projectName} > "${colName}" should have ${expectedCount} task(s)`
        ).toBe(expectedCount);
      }
    });
  }
});
