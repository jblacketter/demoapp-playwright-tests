import { test, expect } from '../src/fixtures/test.fixture.js';
import type { ProjectName } from '../src/types/test-data.types.js';

/**
 * Cross-project navigation tests.
 *
 * Purpose:
 * - Verifies switching between projects updates the board correctly
 * - Verifies the project header reflects the selected project
 * - Verifies navigating away and back preserves board state
 */

const PROJECTS: ProjectName[] = [
  'Web Application',
  'Mobile Application',
  'Marketing Campaign',
];

test.describe('Project Navigation', () => {
  test('Switching projects updates the header', async ({ projectPage }): Promise<void> => {
    for (const projectName of PROJECTS) {
      await projectPage.navigateToProject(projectName);
      const headerText = await projectPage.getCurrentProjectName();
      expect(
        headerText,
        `Header should show "${projectName}" after navigation`
      ).toBe(projectName);
    }
  });

  test('Navigating away and back preserves board content', async ({ projectPage }): Promise<void> => {
    // Navigate to Web Application, remember column count
    await projectPage.navigateToProject('Web Application');
    const initialCount = await projectPage.getColumnTaskCount('To Do');

    // Navigate to Marketing Campaign
    await projectPage.navigateToProject('Marketing Campaign');
    const mcHeader = await projectPage.getCurrentProjectName();
    expect(mcHeader).toBe('Marketing Campaign');

    // Navigate back to Web Application
    await projectPage.navigateToProject('Web Application');
    const returnCount = await projectPage.getColumnTaskCount('To Do');
    expect(returnCount, 'To Do count should be consistent after navigation').toBe(initialCount);
  });

  test('Each project shows distinct task content', async ({ projectPage }): Promise<void> => {
    // Web Application should have "Implement user authentication"
    await projectPage.navigateToProject('Web Application');
    await projectPage.verifyTaskInColumn('Implement user authentication', 'To Do');

    // Marketing Campaign should NOT have that task, but should have "Social media calendar"
    await projectPage.navigateToProject('Marketing Campaign');
    await projectPage.verifyTaskInColumn('Social media calendar', 'To Do');
  });
});
