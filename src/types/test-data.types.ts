/**
 * TypeScript interfaces for test data structures.
 * Provides type safety for JSON test data files.
 */

/**
 * Valid project names in the application.
 * Used to navigate between different Kanban boards.
 */
export type ProjectName = 'Web Application' | 'Mobile Application' | 'Marketing Campaign';

/**
 * Valid column names in the Kanban board.
 * Tasks can be in one of these columns.
 */
export type ColumnName = 'To Do' | 'In Progress' | 'Review' | 'Done';

/**
 * Valid tag names that can appear on task cards.
 */
export type TagName = 'Feature' | 'Bug' | 'Design' | 'High Priority' | 'Marketing';

/**
 * Represents a single test case for task verification.
 *
 * @example
 * ```json
 * {
 *   "id": "TC001",
 *   "name": "Verify user authentication task",
 *   "project": "Web Application",
 *   "taskName": "Implement user authentication",
 *   "expectedColumn": "To Do",
 *   "expectedTags": ["Feature", "High Priority"]
 * }
 * ```
 */
export interface TestCase {
  /**
   * Unique test case identifier.
   * Format: TC followed by 3 digits (e.g., "TC001")
   */
  id: string;

  /**
   * Human-readable test name describing what is being verified.
   * Should be descriptive enough to understand the test at a glance.
   */
  name: string;

  /**
   * Project to navigate to before verifying the task.
   * Must match one of the project names in the sidebar.
   */
  project: ProjectName;

  /**
   * Exact name of the task card to find and verify.
   * Must match the task title text in the UI.
   */
  taskName: string;

  /**
   * The column where the task is expected to be located.
   * Verification will fail if task is found in a different column.
   */
  expectedColumn: ColumnName;

  /**
   * List of tags that should be present on the task card.
   * Verification checks that ALL specified tags are present.
   * Tag comparison is case-insensitive.
   */
  expectedTags: TagName[];
}

/**
 * Root structure of the test data JSON file.
 * Contains an array of test cases to be executed.
 */
export interface TestDataFile {
  /**
   * Array of test cases.
   * Each test case will generate one Playwright test.
   */
  testCases: TestCase[];
}
