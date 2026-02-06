# Demo App Playwright Test Suite

A professional, data-driven Playwright test framework built with TypeScript. Designed for scalability, maintainability, and ease of use.

> **New here?** See [QUICKSTART.md](docs/QUICKSTART.md) for a 5-minute practical guide.
>
> **Want the full picture?** See [FRAMEWORK_OVERVIEW.md](docs/FRAMEWORK_OVERVIEW.md) for architecture and diagrams.

## Quick Start

```bash
# Install dependencies
npm install

# Create environment file and set credentials
cp .env.example .env

# Run tests (headless)
npm test

# Run tests with browser visible
npm run test:headed

# Run with Playwright UI
npm run test:ui
```

**Note:** Set `USERNAME` and `PASSWORD` in `.env` before running tests. For the demo app, use `admin` / `password123`.

## Features

- **Data-Driven Testing** - Test cases defined in JSON, no code changes needed
- **Page Object Model** - Clean separation of selectors and test logic
- **TypeScript Strict Mode** - Type safety catches bugs at compile time
- **Parallel Execution** - Tests run concurrently for fast feedback
- **Auth State Persistence** - Login once, reuse session across tests
- **Auto-Retry on Failure** - Built-in resilience for flaky networks
- **HTML Reports** - Clear test results with screenshots on failure

## Project Structure

```
├── src/
│   ├── pages/                # Page Object Model classes
│   │   ├── base.page.ts          # Abstract base class
│   │   ├── login.page.ts         # Login page interactions
│   │   └── project.page.ts       # Kanban board interactions
│   ├── fixtures/             # Playwright test fixtures
│   │   └── test.fixture.ts       # Page object dependency injection
│   ├── types/                # TypeScript type definitions
│   │   └── test-data.types.ts
│   └── utils/                # Utilities
│       └── config.ts             # Centralized configuration
├── data/
│   └── test-cases.json       # Test case definitions (11 cases)
├── tests/
│   ├── auth.setup.ts             # Authentication setup
│   ├── auth-negative.spec.ts     # Negative auth tests (3)
│   ├── board-structure.spec.ts   # Board structure tests (7)
│   ├── navigation.spec.ts        # Navigation tests (3)
│   ├── task-verification.spec.ts # Data-driven task tests (11)
│   └── demo-failures.spec.ts     # Demo failures (skipped)
├── docs/                     # Documentation
│   ├── FRAMEWORK_OVERVIEW.md     # Architecture & diagrams
│   ├── QA_PLAN.md                # QA plan & coverage
│   ├── QUICKSTART.md             # 5-minute guide
│   └── project_requirement.md    # Original requirements
├── playwright.config.ts      # Playwright configuration
├── Dockerfile                # CI/CD container
└── package.json
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run tests on Chromium (default) |
| `npm run test:all` | Run all tests including setup and no-auth |
| `npm run test:headed` | Run with browser visible |
| `npm run test:ui` | Open Playwright UI mode |
| `npm run test:debug` | Run in debug mode |
| `npm run test:firefox` | Run tests on Firefox |
| `npm run test:webkit` | Run tests on WebKit (Safari) |
| `npm run test:browsers` | Run tests on all browsers |
| `npm run test:timestamp` | Run with timestamped report |
| `npm run report` | Open HTML test report |
| `npm run lint` | Check code for issues |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Check TypeScript types |

### Cross-Browser Testing

By default, tests run on Chromium only for fast feedback. To run on other browsers:

```bash
# Individual browsers
npm run test:firefox
npm run test:webkit

# All browsers (Chromium + Firefox + WebKit)
npm run test:browsers
```

**Browser Installation:** Cross-browser runs require browser binaries. Install them with:
```bash
npx playwright install --with-deps
```

**Note:** Authentication runs once in Chromium and the session is shared across all browsers. If a browser fails to authenticate, check that cookies/localStorage are compatible.

## Adding New Tests

### Option 1: Add to Existing Test Data

For tests that follow the existing pattern (verify task in column with tags):

1. Edit `data/test-cases.json`:
```json
{
  "testCases": [
    {
      "id": "TC007",
      "name": "Verify new task",
      "project": "Web Application",
      "taskName": "New task name",
      "expectedColumn": "To Do",
      "expectedTags": ["Feature"]
    }
  ]
}
```

2. Run `npm test` - the new test is automatically included.

### Option 2: Create New Test File

For different test scenarios:

1. Create a new spec file in `tests/`
2. Import fixtures from `src/fixtures/test.fixture.ts`
3. Use existing page objects or create new ones

See `.claude/skills/adding-tests.md` for detailed guide.

## Configuration

### Environment Variables

Create a `.env` file to set credentials and override defaults:

```bash
# Application URL (optional - defaults to demo app)
BASE_URL=https://your-app.com

# Credentials (required)
USERNAME=your-username
PASSWORD=your-password

# Playwright settings
HEADLESS=true
DEFAULT_TIMEOUT=30000
```

### Playwright Config

Edit `playwright.config.ts` for:
- Browser selection
- Parallel workers
- Retry settings
- Screenshot/video options

## Test Results

After running tests:

- **Console** - Summary of pass/fail
- **HTML Report** - Run `npm run report` to view detailed results
- **Screenshots** - Captured on failure in `test-results/`
- **Traces** - Available on retry for debugging

### Timestamped Reports

Use `npm run test:timestamp` to save reports with unique date/time names:

```
playwright-report/
├── report-2024-01-15_14-30-45/
├── report-2024-01-15_16-22-10/
└── report-2024-01-16_09-15-33/
```

To view a specific timestamped report:
```bash
npx playwright show-report playwright-report/report-2024-01-15_14-30-45
```

## Code Quality

This framework enforces quality through:

- **ESLint** - Static code analysis with TypeScript and Playwright rules
- **Prettier** - Consistent code formatting
- **TypeScript Strict Mode** - Type safety
- **JSDoc** - Documentation on all public methods

Run all checks:
```bash
npm run lint && npm run typecheck && npm run format:check
```

## Architecture

### Page Object Model

All UI interactions are encapsulated in page objects:

```typescript
// Page objects handle selectors and interactions
await projectPage.navigateToProject('Web Application');
await projectPage.verifyTaskInColumn('Task name', 'To Do');

// Tests focus on business logic
for (const tc of testCases) {
  test(tc.name, async ({ projectPage }) => {
    await projectPage.navigateToProject(tc.project);
    await projectPage.verifyTaskInColumn(tc.taskName, tc.expectedColumn);
  });
}
```

### Fixtures

Page objects are injected via Playwright fixtures:

```typescript
test('example', async ({ projectPage }) => {
  // projectPage is automatically instantiated and ready
  await projectPage.verifyTaskInColumn('Task', 'Done');
});
```

### Authentication

Auth is handled once in setup, then reused:

1. `auth.setup.ts` logs in and saves state to `.auth/user.json`
2. All tests automatically use the saved auth state
3. No repeated login = faster tests

## Troubleshooting

### Tests fail to find elements

1. Check if selectors changed in the app
2. Use Playwright UI mode (`npm run test:ui`) to inspect elements
3. Update selectors in page objects (not in tests)

### Authentication fails

1. Verify credentials in `.env`
2. Check if the app login flow changed
3. Delete `.auth/user.json` and re-run

### Tests are flaky

1. Avoid fixed waits - use Playwright's auto-waiting
2. Scope selectors to containers
3. Check for race conditions in the app

## Docker & CI/CD

Run tests in a container for consistent CI/CD execution:

```bash
# Build image
docker build -t playwright-tests .

# Run tests
docker run --rm playwright-tests

# Extract reports
docker run --rm -v $(pwd)/reports:/app/playwright-report playwright-tests
```

See `docs/FRAMEWORK_OVERVIEW.md` for CI pipeline examples (GitHub Actions, GitLab CI, Jenkins).

## Contributing

1. Follow the coding standards in `CLAUDE.md`
2. Use the SDET review checklist in `.claude/skills/sdet-review.md`
3. Ensure all checks pass before committing
4. Add tests for new functionality

## License

ISC
