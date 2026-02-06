# Skill: /framework-standards

Detailed standards for test framework design and architecture.

## When to Use
- Designing new framework components
- Evaluating architectural decisions
- Onboarding new SDETs
- Framework refactoring

## Architecture Principles

### 1. Separation of Concerns

```
┌─────────────────────────────────────────────────────────────┐
│                        Test Specs                           │
│  - Business logic only                                      │
│  - No selectors, no page interactions                       │
│  - Data-driven from JSON                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Fixtures                             │
│  - Page object instantiation                                │
│  - Setup/teardown logic                                     │
│  - Dependency injection                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Page Objects                           │
│  - All selectors encapsulated                               │
│  - UI interactions                                          │
│  - Assertions with context                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Configuration                            │
│  - Environment variables                                    │
│  - Shared constants                                         │
│  - Type definitions                                         │
└─────────────────────────────────────────────────────────────┘
```

### 2. Page Object Model (POM)

**Structure**
```typescript
export class ExamplePage extends BasePage {
  // 1. Path for navigation
  public readonly path = '/example';

  // 2. Private selectors (never exposed)
  private get element(): Locator { ... }

  // 3. Public actions (verbs)
  public async doSomething(): Promise<void> { ... }

  // 4. Public verifications (verify* prefix)
  public async verifySomething(): Promise<void> { ... }
}
```

**Rules**
- Selectors are ALWAYS private
- Methods are ALWAYS async
- Actions return `Promise<void>` or data
- Verifications include descriptive error messages
- One page object per logical page/component

### 3. Selector Hierarchy

Always use the most stable selector available:

| Priority | Method | Example | Stability |
|----------|--------|---------|-----------|
| 1 | data-testid | `getByTestId('submit')` | Excellent |
| 2 | Role + name | `getByRole('button', { name: 'Submit' })` | Excellent |
| 3 | Label | `getByLabel('Email')` | Good |
| 4 | Placeholder | `getByPlaceholder('Enter email')` | Good |
| 5 | Text (scoped) | `container.getByText('Submit')` | Fair |
| 6 | CSS (scoped) | `container.locator('.btn-primary')` | Poor |

**Avoid whenever possible:**
- Unscoped CSS selectors (`page.locator('.button')`)
- Index-based selectors (`:nth-child(2)`)
- Generated class names (`._abc123`)
- XPath for new code (use only if no stable alternative, and keep it scoped)

### 4. Data-Driven Testing

**Test Data Structure**
```typescript
// Types define the contract
interface TestCase {
  id: string;           // Unique identifier
  name: string;         // Human-readable description
  // ... test-specific fields
}

// JSON provides the data
{
  "testCases": [
    { "id": "TC001", "name": "...", ... }
  ]
}

// Tests consume the data
for (const tc of testCases) {
  test(`${tc.id}: ${tc.name}`, async () => { ... });
}
```

**Benefits**
- Tests are declarative
- Easy to add cases without code changes
- Data can be generated or imported
- Clear traceability (TC001, TC002, etc.)

### 5. Configuration Management

**Single Source of Truth**
```typescript
// config.ts - ALL configuration here
export const config = {
  baseURL: process.env.BASE_URL ?? DEFAULT_URL,
  credentials: { ... },
  timeouts: { ... },
};
```

**Environment Variables**
```bash
# Required for custom environments
BASE_URL=https://...
USERNAME=...
PASSWORD=...

# Optional with sensible defaults
HEADLESS=true
TIMEOUT=30000
```

### 6. Error Handling

**Assertion Messages**
```typescript
// BAD - no context
await expect(element).toBeVisible();

// GOOD - actionable context
await expect(
  element,
  `Task "${taskName}" should be visible in column "${columnName}"`
).toBeVisible();
```

**Fail Fast**
- Validate preconditions early
- Use setup scripts for auth/state
- Don't catch and ignore errors
- Let Playwright's auto-retry work

### 7. Scalability Patterns

**For 100+ Tests**
- Group by feature/page in separate spec files
- Use test.describe for logical grouping
- Parallel execution by default
- Shared fixtures for common setup

**For Multiple Environments**
```typescript
// playwright.config.ts
projects: [
  { name: 'dev', use: { baseURL: 'https://dev...' } },
  { name: 'staging', use: { baseURL: 'https://staging...' } },
  { name: 'prod', use: { baseURL: 'https://...' } },
]
```

**For Multiple Browsers**
```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
]
```

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| God Page Object | Too many responsibilities | Split by component |
| Selector in spec | Maintenance nightmare | Move to page object |
| Hardcoded waits | Flaky, slow | Use auto-waiting |
| Shared state | Test interference | Isolate tests |
| Screenshot spam | Slow CI, storage | Only on failure |
| Deep inheritance | Complex, fragile | Composition over inheritance |

## Framework Evolution

When extending the framework:

1. **Start small** - Prove the pattern with one test
2. **Refactor early** - Don't let debt accumulate
3. **Document decisions** - Future you will thank you
4. **Measure impact** - Track flakiness, speed, coverage
5. **Review with team** - Patterns should be agreed upon
