# Demo App Test Automation Framework

## Project Overview

Playwright-driven test suite using TypeScript with data-driven design patterns. This framework is designed by and for experienced SDETs who value quality, maintainability, and scalability.

> **Note:** An experimental Python Behave (BDD) implementation exists in `python-behave/`. The primary deliverable is this TypeScript Playwright framework.

## SDET Mindset

When working on this project, think like a **Senior SDET with 20+ years of experience**:

### Quality First
- Every line of code should be intentional and serve a purpose
- Tests are first-class citizens, not afterthoughts
- A flaky test is worse than no test - reliability is non-negotiable
- Test failures should be actionable with clear error messages

### Customer Focus
- Tests exist to protect the customer experience
- Think about edge cases that could impact real users
- Consider accessibility and usability in test coverage
- Tests should validate business value, not just code paths

### Security Consciousness
- Never commit credentials or secrets
- Validate inputs, even in test code
- Consider security implications of test data
- Follow the principle of least privilege

### Scalability Thinking
- Design for 1000 tests, not just the current 6
- Patterns established now will be repeated
- Make it easy for junior testers to add tests
- Optimize for maintainability over cleverness

## Code Standards

### Naming Conventions
```
Files:       *.page.ts, *.fixture.ts, *.spec.ts
Classes:     PascalCase (LoginPage, ProjectPage)
Methods:     camelCase verbs (navigateToProject, verifyTaskInColumn)
Constants:   SCREAMING_SNAKE_CASE (TAG_MAX_LENGTH, DATE_PATTERN)
Test IDs:    TC### format (TC001, TC002)
```

### Selector Strategy (Priority Order)
Use the most stable selector available in this order:
1. `data-testid` - Most stable, explicitly for testing (if present)
2. `getByRole()` - Semantic, accessible
3. `getByLabel()` / `getByPlaceholder()` - User-visible text
4. `getByText()` - Within scoped containers only
5. CSS selectors - Last resort, always scoped

### Documentation Requirements
- All public methods must have JSDoc comments
- Complex logic requires inline comments explaining "why"
- Test data structures need field documentation
- README must be kept up-to-date

## Quick Reference

### Run Tests
```bash
npm test              # Chromium (default)
npm run test:headed   # With browser visible
npm run test:ui       # Playwright UI mode
npm run test:debug    # Debug mode
```

### Cross-Browser
```bash
npm run test:firefox   # Firefox only
npm run test:webkit    # WebKit (Safari) only
npm run test:browsers  # All browsers
```
Auth runs once in Chromium, shared across all browsers.

### Docker (CI/CD)
```bash
docker build -t playwright-tests .           # Build image
docker run --rm playwright-tests             # Run tests
docker run --rm -v $(pwd)/reports:/app/playwright-report playwright-tests  # Extract reports
```

### Code Quality
```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
npm run format        # Format code
npm run typecheck     # TypeScript check
```

### Add New Tests
1. Add test case to `data/test-cases.json`
2. If new page needed, create in `src/pages/`
3. If new fixture needed, add to `src/fixtures/test.fixture.ts`
4. See `/adding-tests` skill for detailed guide

## Key Files

| File | Purpose |
|------|---------|
| `src/pages/base.page.ts` | Abstract base for all page objects |
| `src/fixtures/test.fixture.ts` | Playwright fixtures (DI for page objects) |
| `src/utils/config.ts` | Centralized configuration |
| `data/test-cases.json` | Test case definitions |
| `tests/task-verification.spec.ts` | Main test suite |

## Skills Available

- `/adding-tests` - How to add new tests to the framework
- `/sdet-review` - SDET-focused code review checklist
- `/framework-standards` - Detailed framework design standards
