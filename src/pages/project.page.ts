import { Locator, expect } from '@playwright/test';
import { BasePage } from './base.page.js';
import { TAG_MAX_LENGTH } from '../utils/config.js';

/**
 * Regular expression pattern for matching column headers.
 * Columns display as "Column Name (count)" e.g., "To Do (2)"
 */
const COLUMN_HEADER_PATTERN = (columnName: string): RegExp =>
  new RegExp(`^${columnName}\\s*\\(\\d+\\)$`);

/**
 * Date pattern to exclude from tag detection.
 * Matches dates like "3/24/2024" or "12/31/2024"
 */
const DATE_PATTERN = /\d{1,2}\/\d{1,2}\/\d{4}/;

/**
 * Page object for the project board (Kanban) page.
 * Handles navigation between projects and task/tag verification.
 *
 * App Structure:
 * - Left sidebar: Dark background with project buttons
 * - Main content: Kanban columns (To Do, In Progress, Review, Done)
 * - Task cards: Title, description, colored tags, assignee, date
 *
 * Selector Strategy:
 * - Project buttons: Filter sidebar buttons by text content
 * - Columns: Match header text pattern, traverse to container
 * - Tasks: Filter cards by text content within column scope
 * - Tags: Colored spans within task cards, excluding dates
 */
export class ProjectPage extends BasePage {
  public readonly path = '/';

  /**
   * Get the sidebar element containing project navigation.
   */
  private get sidebar(): Locator {
    return this.page.locator('aside, [class*="sidebar"], nav').first();
  }

  /**
   * Get a project button from the sidebar.
   *
   * @param projectName - The name of the project to find
   * @returns Locator for the project button
   */
  private getProjectButton(projectName: string): Locator {
    return this.sidebar.locator('button').filter({ hasText: projectName }).first();
  }

  /**
   * Get the header element for a column.
   *
   * @param columnName - The name of the column (e.g., "To Do")
   * @returns Locator for the column header text
   */
  private getColumnHeader(columnName: string): Locator {
    return this.page.getByText(COLUMN_HEADER_PATTERN(columnName));
  }

  /**
   * Get the main content area (excludes sidebar).
   * This is where the Kanban columns are displayed.
   */
  private get mainContent(): Locator {
    return this.page.locator('main, [class*="content"], [class*="board"]').first();
  }

  /**
   * Get the container element for a column.
   * Finds a column container that has the matching header text.
   *
   * Approach: Look for div containers in the main content area
   * that contain the column header text. This is more robust than
   * XPath ancestor traversal as it uses Playwright's built-in filtering.
   *
   * @param columnName - The name of the column
   * @returns Locator for the column container
   */
  private getColumn(columnName: string): Locator {
    // Find a container div that has the column header
    // The column header pattern includes count like "To Do (2)"
    return this.mainContent
      .locator('div')
      .filter({ has: this.page.getByText(COLUMN_HEADER_PATTERN(columnName)) })
      .first();
  }

  /**
   * Get a task card within a specific column.
   * Uses the column container to scope the search.
   *
   * @param taskName - The name/title of the task
   * @param columnName - The column to search within
   * @returns Locator for the task card within the column
   */
  private getTaskInColumn(taskName: string, columnName: string): Locator {
    const column = this.getColumn(columnName);

    // Find the task title within the column, then locate its parent card
    // This ensures we get the exact card containing this specific task
    const taskTitle = column.getByText(taskName, { exact: true });

    // Navigate up to the card container (parent divs with card-like classes)
    return taskTitle.locator('xpath=ancestor::div[contains(@class, "bg-white") or contains(@class, "rounded")][1]');
  }

  /**
   * Get tag elements within a task card.
   * Tags are colored spans, excluding date elements.
   *
   * @param taskCard - The task card locator
   * @returns Locator for tag elements
   */
  private getTaskTags(taskCard: Locator): Locator {
    return taskCard
      .locator(
        'span[class*="bg-"], span[class*="badge"], span[class*="tag"], span[class*="rounded"]'
      )
      .filter({ hasNotText: DATE_PATTERN });
  }

  /**
   * Get all project names visible in the sidebar.
   *
   * @returns Array of project name strings
   */
  public async getVisibleProjects(): Promise<string[]> {
    const buttons = this.sidebar.locator('button');
    const count = await buttons.count();
    const projects: string[] = [];
    for (let i = 0; i < count; i++) {
      // Project buttons contain the name and a subtitle — extract the h2 text
      const nameEl = buttons.nth(i).locator('h2, span, div').first();
      const hasName = await nameEl.count();
      let text: string;
      if (hasName > 0) {
        text = (await nameEl.textContent()) ?? '';
      } else {
        text = (await buttons.nth(i).textContent()) ?? '';
      }
      if (text.trim()) {
        projects.push(text.trim());
      }
    }
    return projects;
  }

  /**
   * Get all visible column names on the current board.
   *
   * @returns Array of column name strings (without counts)
   */
  public async getColumnNames(): Promise<string[]> {
    const columns: string[] = [];
    for (const name of ['To Do', 'In Progress', 'Review', 'Done']) {
      const header = this.getColumnHeader(name);
      if ((await header.count()) > 0 && (await header.isVisible())) {
        columns.push(name);
      }
    }
    return columns;
  }

  /**
   * Get the task count displayed in a column header.
   * Column headers show format: "Column Name (N)"
   *
   * @param columnName - The column to check
   * @returns The numeric count from the header
   */
  public async getColumnTaskCount(columnName: string): Promise<number> {
    const header = this.getColumnHeader(columnName);
    await expect(header, `Column "${columnName}" header should be visible`).toBeVisible();
    const text = await header.textContent();
    const match = text?.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : -1;
  }

  /**
   * Get the current project name from the main content header.
   * The project header is an h1 with text-xl styling, distinct from sidebar headers.
   *
   * @returns The project name displayed in the header
   */
  public async getCurrentProjectName(): Promise<string> {
    const header = this.page.locator('h1[class*="text-xl"]').first();
    const text = await header.textContent();
    return text?.trim() ?? '';
  }

  /**
   * Verify page is loaded and user is authenticated.
   * Used by the fixture as a sanity check.
   *
   * @throws Error if user appears to not be authenticated
   */
  public async verifyPageLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');

    // Verify we see the Projects header in sidebar
    const projectsHeader = this.page.getByText('Projects');
    await expect(projectsHeader, 'Projects header should be visible').toBeVisible({
      timeout: 10000,
    });
  }

  /**
   * Navigate to a specific project by clicking its sidebar button.
   *
   * @param projectName - The name of the project to navigate to
   */
  public async navigateToProject(projectName: string): Promise<void> {
    const projectButton = this.getProjectButton(projectName);

    await expect(projectButton, `Project button "${projectName}" should be visible`).toBeVisible();
    await projectButton.click();

    await this.page.waitForLoadState('domcontentloaded');

    // Verify the project header shows the selected project
    const projectHeader = this.page.locator('h1, h2').filter({ hasText: projectName }).first();
    await expect(
      projectHeader,
      `Project "${projectName}" should be displayed as header`
    ).toBeVisible();
  }

  /**
   * Verify a task exists in the expected column.
   *
   * @param taskName - The name of the task to find
   * @param columnName - The expected column name
   */
  public async verifyTaskInColumn(taskName: string, columnName: string): Promise<void> {
    // First verify the column exists
    const columnHeader = this.getColumnHeader(columnName);
    await expect(columnHeader, `Column "${columnName}" should exist`).toBeVisible();

    // Verify task is in the correct column
    const taskInColumn = this.getTaskInColumn(taskName, columnName);
    await expect(
      taskInColumn,
      `Task "${taskName}" should be in column "${columnName}"`
    ).toBeVisible({ timeout: 10000 });
  }

  /**
   * Get all visible tag names from a task card.
   *
   * @param taskName - The name of the task
   * @param columnName - The column containing the task
   * @returns Array of tag text values
   */
  public async getTaskTagNames(taskName: string, columnName: string): Promise<string[]> {
    const taskCard = this.getTaskInColumn(taskName, columnName);
    await expect(taskCard, `Task card "${taskName}" should be visible`).toBeVisible();

    const tags = this.getTaskTags(taskCard);
    const tagCount = await tags.count();

    const tagNames: string[] = [];
    for (let i = 0; i < tagCount; i++) {
      const tagText = await tags.nth(i).textContent();
      if (tagText?.trim()) {
        const trimmed = tagText.trim();
        // Filter: tags are short text without date separators
        if (trimmed.length < TAG_MAX_LENGTH && !trimmed.includes('/')) {
          tagNames.push(trimmed);
        }
      }
    }

    return tagNames;
  }

  /**
   * Verify a task has all expected tags.
   * Tag comparison is case-insensitive.
   *
   * @param taskName - The name of the task
   * @param expectedTags - Array of expected tag names
   * @param columnName - The column containing the task
   */
  public async verifyTaskTags(
    taskName: string,
    expectedTags: string[],
    columnName: string
  ): Promise<void> {
    const actualTags = await this.getTaskTagNames(taskName, columnName);

    const normalize = (value: string): string => value.trim().toLowerCase();
    const actualSet = new Set(actualTags.map(normalize));
    const expectedSet = new Set(expectedTags.map(normalize));

    for (const expectedTag of expectedSet) {
      const hasTag = actualSet.has(expectedTag);

      expect(
        hasTag,
        `Task "${taskName}" should have tag "${expectedTag}". Actual tags found: [${actualTags.join(', ')}]`
      ).toBe(true);
    }

    expect(
      actualSet.size,
      `Task "${taskName}" should have only expected tags. Actual tags: [${actualTags.join(', ')}], Expected tags: [${expectedTags.join(', ')}]`
    ).toBe(expectedSet.size);
  }
}
