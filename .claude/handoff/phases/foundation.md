# Phase: Foundation

## Status
- [x] Planning
- [x] In Review
- [x] Approved
- [x] Implementation
- [x] Implementation Review
- [x] Complete

## Roles
- Lead: Claude
- Reviewer: Codex
- Arbiter: Human

## Summary
**What:** Set up a Playwright test automation framework with TypeScript using data-driven design patterns
**Why:** Establish a scalable, maintainable test foundation that minimizes code duplication through JSON-driven test cases
**Depends on:** None (initial phase)

## Scope

### In Scope
- Project initialization (npm, TypeScript strict mode, Playwright)
- Environment configuration (.env, playwright.config.ts)
- Page Object Model with Playwright fixtures (`test.extend`)
- JSON test data structure with TypeScript interfaces
- Authentication automation with state persistence
- Data-driven test spec consuming JSON
- HTML test reporting

### Out of Scope
- CI/CD pipeline setup
- Cross-browser testing (Chromium only for now)
- Advanced reporting (Allure, etc.)
- API testing
- Visual regression testing

---

## Technical Approach

### Project Structure
```
demoapp/
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── .env
├── .env.example              # Template for other developers
├── .gitignore
├── src/
│   ├── pages/
│   │   ├── base.page.ts      # Abstract base with common utilities
│   │   ├── login.page.ts     # Login page interactions
│   │   └── project.page.ts   # Kanban board interactions
│   ├── fixtures/
│   │   └── test.fixture.ts   # Custom fixtures via test.extend
│   ├── types/
│   │   └── test-data.types.ts # TypeScript interfaces for test data
│   └── utils/
│       └── config.ts         # Environment config loader
├── data/
│   └── test-cases.json       # Data-driven test definitions
├── tests/
│   ├── auth.setup.ts         # Global authentication setup
│   └── task-verification.spec.ts
└── .auth/                    # Git-ignored auth state storage
    └── user.json
```

---

### Selector Strategy (Codex Feedback Incorporated)

**Priority Hierarchy** (in order of preference):
1. `data-testid` attributes - Most stable, if available in the app
2. `getByRole()` with accessible name - Semantic and resilient
3. `getByText()` within scoped containers - For text-based identification
4. CSS selectors - Last resort, scoped to parent containers

**Implementation Pattern:**
```typescript
// GOOD: Scoped, semantic selectors
const column = page.getByRole('region', { name: columnName });
const task = column.getByText(taskName);

// GOOD: data-testid if available
const task = page.getByTestId(`task-${taskId}`);

// AVOID: Brittle global CSS selectors
const task = page.locator('.card-item:nth-child(2)');
```

**Selector Encapsulation:**
- All selectors live in Page Objects, NEVER in test files
- Use descriptive getter methods: `getTaskCard(taskName)` not `locator('.task')`
- Support multiple selector strategies with fallbacks where needed

---

### Playwright Fixtures Design (Codex Feedback Incorporated)

Use `test.extend` for dependency injection of page objects:

```typescript
// src/fixtures/test.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ProjectPage } from '../pages/project.page';

type TestFixtures = {
  loginPage: LoginPage;
  projectPage: ProjectPage;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  projectPage: async ({ page }, use) => {
    const projectPage = new ProjectPage(page);
    // Lightweight sanity check - verify we're authenticated
    await projectPage.verifyPageLoaded();
    await use(projectPage);
  },
});

export { expect } from '@playwright/test';
```

**Benefits:**
- Automatic instantiation and cleanup
- Consistent page object lifecycle
- Cleaner test code
- Easy to add new fixtures without modifying tests

---

### Page Object Model Design

#### BasePage (Abstract)
```typescript
abstract class BasePage {
  constructor(protected page: Page) {}

  // Navigation
  abstract readonly path: string;
  async navigate(): Promise<void>;
  async waitForPageLoad(): Promise<void>;

  // Element interactions with built-in waiting
  protected async clickElement(locator: Locator): Promise<void>;
  protected async fillInput(locator: Locator, value: string): Promise<void>;
  protected async getText(locator: Locator): Promise<string>;

  // Assertions with clear error messages
  protected async assertVisible(locator: Locator, description: string): Promise<void>;
  protected async assertText(locator: Locator, expected: string, description: string): Promise<void>;
}
```

#### LoginPage
```typescript
class LoginPage extends BasePage {
  readonly path = '/';

  // Selectors (private, encapsulated)
  private readonly usernameInput = () => this.page.getByLabel('Username')
    .or(this.page.getByPlaceholder('Username'))
    .or(this.page.locator('input[name="username"]'));

  // Public methods
  async login(username: string, password: string): Promise<void>;
  async assertLoginSuccessful(): Promise<void>;
  async assertLoginError(message: string): Promise<void>;
}
```

#### ProjectPage
```typescript
class ProjectPage extends BasePage {
  readonly path = '/projects';

  // Navigation
  async navigateToProject(projectName: string): Promise<void>;

  // Column operations
  async getColumn(columnName: string): Promise<Locator>;
  async getTasksInColumn(columnName: string): Promise<string[]>;

  // Task verification
  async verifyTaskInColumn(taskName: string, columnName: string): Promise<void>;
  async getTaskTags(taskName: string, columnName: string): Promise<string[]>;
  async verifyTaskTags(taskName: string, expectedTags: string[], columnName: string): Promise<void>;

  // Sanity check for fixture
  async verifyPageLoaded(): Promise<void>;
}
```

---

### Data-Driven Design

#### TypeScript Interface
```typescript
// src/types/test-data.types.ts
export interface TestCase {
  id: string;
  name: string;
  project: string;
  taskName: string;
  expectedColumn: string;
  expectedTags: string[];
}

export interface TestDataFile {
  testCases: TestCase[];
}
```

#### JSON Test Data
```json
{
  "testCases": [
    {
      "id": "TC001",
      "name": "Verify user authentication task in Web Application",
      "project": "Web Application",
      "taskName": "Implement user authentication",
      "expectedColumn": "To Do",
      "expectedTags": ["Feature", "High Priority"]
    }
  ]
}
```

#### Test Implementation
```typescript
// tests/task-verification.spec.ts
import { test, expect } from '../src/fixtures/test.fixture';
import testData from '../data/test-cases.json';
import type { TestCase } from '../src/types/test-data.types';

const testCases: TestCase[] = testData.testCases;

for (const tc of testCases) {
  test(`${tc.id}: ${tc.name}`, async ({ projectPage }) => {
    await test.step('Navigate to project', async () => {
      await projectPage.navigateToProject(tc.project);
    });

    await test.step(`Verify task "${tc.taskName}" is in "${tc.expectedColumn}"`, async () => {
      await projectPage.verifyTaskInColumn(tc.taskName, tc.expectedColumn);
    });

    await test.step('Verify task tags', async () => {
      await projectPage.verifyTaskTags(tc.taskName, tc.expectedTags, tc.expectedColumn);
    });
  });
}
```

**Design Principles:**
- `test.step()` for clear reporting and debugging
- Descriptive step names that appear in HTML report
- No hardcoded test data in spec files
- Type safety via TypeScript interfaces

---

### Authentication Strategy (Codex Feedback Incorporated)

**Two-Layer Approach:**
1. **Setup Script** (`auth.setup.ts`) - Full login validation, runs once
2. **Fixture Sanity Check** - Lightweight page state verification

```typescript
// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/login.page';

setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.navigate();
  await loginPage.login(
    process.env.USERNAME!,
    process.env.PASSWORD!
  );

  // Full validation - this is the gate for all tests
  await loginPage.assertLoginSuccessful();

  // Persist auth state
  await page.context().storageState({ path: '.auth/user.json' });
});
```

**Playwright Config Setup:**
```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    // Setup project runs first, authenticates once
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // Main tests use stored auth state
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```

**Key Points:**
- `auth.setup.ts` runs ONCE before all tests (not before each test)
- Auth state persisted to `.auth/user.json`
- All test projects depend on setup project
- If setup fails, no tests run (fail fast)

---

### Configuration Management

#### Environment Variables (.env)
```env
# Application
BASE_URL=https://animated-gingersnap-8cf7f2.netlify.app/

# Credentials (never commit real credentials)
USERNAME=admin
PASSWORD=password123

# Playwright settings
HEADLESS=true
SLOW_MO=0
DEFAULT_TIMEOUT=30000
```

#### Playwright Config
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 5000 },

  // Fail fast in CI, retry locally
  retries: process.env.CI ? 0 : 1,

  // Parallel execution - tests must be independent
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,

  // Reporting
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.BASE_URL,
    headless: process.env.HEADLESS === 'true',

    // Debugging aids
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'on-first-retry',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```

---

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,                    // Catch bugs early
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,         // Import JSON files
    "declaration": false,
    "outDir": "./dist",
    "rootDir": ".",
    "baseUrl": ".",
    "paths": {
      "@pages/*": ["src/pages/*"],
      "@fixtures/*": ["src/fixtures/*"],
      "@data/*": ["data/*"]
    }
  },
  "include": ["src/**/*", "tests/**/*", "data/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Test Design Principles

### Test Independence
- Each test must be able to run in isolation
- No test should depend on another test's outcome
- Parallel execution must be safe

### Assertion Strategy
- Use Playwright's `expect()` with auto-waiting
- Provide clear, descriptive assertion messages
- Fail fast - first failure stops the test

### Error Messages
Custom error messages for debugging:
```typescript
await expect(taskCard,
  `Task "${taskName}" should be visible in column "${columnName}"`
).toBeVisible();
```

### Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Test files | `*.spec.ts` | `task-verification.spec.ts` |
| Page objects | `*.page.ts` | `login.page.ts` |
| Fixtures | `*.fixture.ts` | `test.fixture.ts` |
| Test IDs | `TC###` | `TC001` |
| Methods | camelCase verbs | `verifyTaskInColumn()` |

---

## Files to Create/Modify

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, npm scripts |
| `tsconfig.json` | TypeScript strict mode config |
| `playwright.config.ts` | Playwright settings, projects, auth setup |
| `.env` | Environment variables |
| `.env.example` | Template for team members |
| `.gitignore` | Ignore node_modules, .auth, .env, etc. |
| `src/pages/base.page.ts` | Abstract base page class |
| `src/pages/login.page.ts` | Login page object |
| `src/pages/project.page.ts` | Project board page object |
| `src/fixtures/test.fixture.ts` | Custom Playwright fixtures |
| `src/types/test-data.types.ts` | TypeScript interfaces |
| `src/utils/config.ts` | Config loader utility |
| `data/test-cases.json` | All 6 test case definitions |
| `tests/auth.setup.ts` | Global login setup |
| `tests/task-verification.spec.ts` | Data-driven test spec |

---

## Test Cases

| ID | Project | Task Name | Column | Tags |
|----|---------|-----------|--------|------|
| TC001 | Web Application | Implement user authentication | To Do | Feature, High Priority |
| TC002 | Web Application | Fix navigation bug | To Do | Bug |
| TC003 | Web Application | Design system updates | In Progress | Design |
| TC004 | Mobile Application | Push notification system | To Do | Feature |
| TC005 | Mobile Application | Offline mode | In Progress | Feature, High Priority |
| TC006 | Mobile Application | App icon design | Done | Design |

---

## Success Criteria

- [x] Project initializes without errors (`npm install`)
- [x] TypeScript compiles with strict mode, no errors
- [x] Login automation successfully authenticates (auth.setup.ts passes)
- [x] All 6 test cases execute and pass
- [x] Test data is externalized in JSON (no hardcoded data in specs)
- [x] Page Objects use `test.extend` fixtures
- [x] Selectors follow priority hierarchy (data-testid > role > text > CSS)
- [x] Tests run in both headed and headless modes
- [x] HTML report generates with clear test steps
- [x] Tests can run in parallel without interference

---

## Resolved Questions

| Question | Resolution |
|----------|------------|
| Retry logic beyond auto-waiting? | No - Playwright's auto-waiting is sufficient. Use `retries: 1` in config for flaky network issues. |
| Selector strategy? | Priority: data-testid > getByRole > getByText (scoped) > CSS. Will refine after app inspection. |
| Assert login in each test? | No - Full validation in setup, lightweight sanity check in fixture. |
| Naming conventions? | See table above. Verbs for methods, `.spec.ts` for tests. |

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| App lacks data-testid attributes | Medium | Medium | Design selectors with fallback hierarchy |
| App structure differs from assumptions | Medium | High | Inspect app first during implementation, adjust page objects |
| Auth state expires mid-run | Low | Medium | Setup runs per project, state is fresh |
| Flaky selectors | Medium | High | Use scoped locators, avoid indexes, prefer semantic selectors |

---

## Dependencies

```json
{
  "devDependencies": {
    "@playwright/test": "^1.41.0",
    "typescript": "^5.3.0",
    "dotenv": "^16.4.0",
    "@types/node": "^20.11.0"
  },
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:ui": "playwright test --ui",
    "report": "playwright show-report"
  }
}
```

---

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2025-02-05 | Claude | Initial plan created |
| 2025-02-05 | Claude | Incorporated Codex feedback: fixtures via test.extend, selector strategy, auth documentation. Added senior SDET best practices: strict TypeScript, test.step(), error messages, parallel execution design. |

---

## Reference

- Codex review feedback: `docs/handoffs/foundation_plan_feedback.md`
- Patterns adapted from: `~/projects/automation-framework-example`
- Project requirements: `docs/project_requirement.md`
