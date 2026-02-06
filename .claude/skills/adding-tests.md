# Skill: /adding-tests

Guide for adding new tests to the framework. Follow these steps to maintain consistency and quality.

## When to Use
- Adding a new test case for existing functionality
- Adding tests for a new feature/page
- Extending the test data set

## Adding a Data-Driven Test Case

For tests that follow the existing pattern (navigate to project, verify task in column, verify tags):

### Step 1: Add to test-cases.json

```json
{
  "testCases": [
    {
      "id": "TC007",
      "name": "Verify new task in Web Application",
      "project": "Web Application",
      "taskName": "New task name",
      "expectedColumn": "To Do",
      "expectedTags": ["Feature"]
    }
  ]
}
```

### Step 2: Verify Values Match the App

Ensure values match what exists in the demo app and the current dataset in `data/test-cases.json`.

### Step 3: Run Tests

```bash
npm test
```

That's it! The data-driven test loop automatically picks up new entries.

## Adding a New Page Object

When testing a new page/feature:

### Step 1: Create Page Class

```typescript
// src/pages/new-feature.page.ts
import { Locator, expect } from '@playwright/test';
import { BasePage } from './base.page.js';

/**
 * Page object for [feature name].
 * [Description of what this page handles]
 *
 * Selector Strategy:
 * - [Document your selector approach]
 */
export class NewFeaturePage extends BasePage {
  public readonly path = '/new-feature';

  /**
   * [Description]
   */
  private get someElement(): Locator {
    return this.page.getByRole('button', { name: 'Click me' });
  }

  /**
   * [Action description]
   */
  public async performAction(): Promise<void> {
    await this.someElement.click();
  }

  /**
   * [Verification description]
   */
  public async verifyState(expected: string): Promise<void> {
    await expect(
      this.someElement,
      `Expected state to be "${expected}"`
    ).toContainText(expected);
  }
}
```

### Step 2: Add Fixture

```typescript
// src/fixtures/test.fixture.ts
import { NewFeaturePage } from '../pages/new-feature.page.js';

interface TestFixtures {
  // ... existing fixtures ...
  newFeaturePage: NewFeaturePage;
}

export const test = base.extend<TestFixtures>({
  // ... existing fixtures ...

  newFeaturePage: async ({ page, baseURL }, use): Promise<void> => {
    const newFeaturePage = new NewFeaturePage(page);
    await page.goto(baseURL ?? '/');
    await use(newFeaturePage);
  },
});
```

### Step 3: Create Test File

```typescript
// tests/new-feature.spec.ts
import { test, expect } from '../src/fixtures/test.fixture.js';

/**
 * Test suite for [feature name].
 * [Description of what these tests verify]
 */
test.describe('New Feature', () => {
  test('should perform expected action', async ({ newFeaturePage }) => {
    await test.step('Navigate to feature', async () => {
      // Navigation is handled by fixture
    });

    await test.step('Perform action', async () => {
      await newFeaturePage.performAction();
    });

    await test.step('Verify result', async () => {
      await newFeaturePage.verifyState('expected');
    });
  });
});
```

## Checklist Before Committing

- [ ] Test IDs follow TC### format and are unique
- [ ] All public methods have JSDoc comments
- [ ] Selectors follow priority hierarchy (role > label > text > CSS)
- [ ] Error messages are descriptive and actionable
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] All tests pass (`npm test`)
- [ ] Code is formatted (`npm run format`)

## Common Mistakes to Avoid

1. **Hardcoding test data in spec files** - Use JSON data files
2. **Using brittle selectors** - Prefer semantic selectors
3. **Missing error messages** - Always include context in assertions
4. **Skipping the fixture** - Use fixtures for page object instantiation
5. **Not scoping selectors** - Search within containers, not globally
