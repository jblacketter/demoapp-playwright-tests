# Decision Log

This log tracks important decisions made during the project.

<!-- Add new decisions at the top in reverse chronological order -->

---

## 2025-02-05: Selector Strategy Hierarchy

**Decision:** Establish a strict selector priority: data-testid > getByRole > getByText (scoped) > CSS selectors

**Context:** Codex raised concern about fragile CSS selectors; need a consistent strategy before implementation

**Alternatives Considered:**
- CSS-first: Familiar but brittle, breaks with UI changes
- data-testid only: Most stable but may not exist in app
- Role-based only: Semantic but not always sufficient

**Rationale:** Hierarchical approach provides resilience - use the most stable option available, fall back gracefully. All selectors encapsulated in Page Objects for single point of maintenance.

**Decided By:** Consensus (Codex suggested, Claude agreed)

**Phase:** foundation

**Follow-ups:**
- Inspect demo app during implementation to determine available selectors
- Document actual selectors used in each Page Object

---

## 2025-02-05: Page Object Fixtures via test.extend

**Decision:** Use Playwright's `test.extend` for Page Object instantiation instead of manual instantiation in tests

**Context:** Codex recommended this pattern; evaluated against manual instantiation

**Alternatives Considered:**
- Manual instantiation in each test: Simple but repetitive, no lifecycle management
- beforeEach hooks: Works but clutters test files
- Custom fixture via test.extend: Clean DI, automatic lifecycle, Playwright-native

**Rationale:** `test.extend` is the Playwright-recommended pattern. Provides dependency injection, automatic cleanup, and keeps test files clean. Also allows adding sanity checks (e.g., verify authenticated state) without modifying tests.

**Decided By:** Consensus (Codex suggested, Claude agreed)

**Phase:** foundation

**Follow-ups:**
- Create src/fixtures/test.fixture.ts with loginPage and projectPage fixtures

---

## 2025-02-05: Two-Layer Authentication Validation

**Decision:** Full login validation in setup script + lightweight sanity check in fixture

**Context:** Codex asked whether to assert login in each test or only in setup

**Alternatives Considered:**
- Setup only: Fast but won't catch session issues during test run
- Each test validates: Redundant, slow
- Two-layer: Best of both - thorough gate + lightweight ongoing check

**Rationale:** Setup script is the gate - if it fails, no tests run (fail fast). Fixture performs a quick page state check to catch any session drift without full re-validation overhead.

**Decided By:** Claude (Lead), addressing Codex question

**Phase:** foundation

**Follow-ups:**
- Implement verifyPageLoaded() in ProjectPage for fixture sanity check

---

## 2025-02-05: Data-Driven Test Pattern with JSON

**Decision:** Use JSON file to store test case definitions, with tests looping through the data dynamically

**Context:** Need to minimize code duplication for 6 similar test cases that verify task cards in columns with tags

**Alternatives Considered:**
- Parameterized tests with inline data: Simpler but less maintainable
- CSV/Excel data files: More familiar to QA but harder to type in TypeScript
- Database-driven: Overkill for this scope

**Rationale:** JSON is native to TypeScript, provides strong typing with interfaces, easy to read/edit, and scales well for additional test cases

**Decided By:** Claude (Lead)

**Phase:** foundation

**Follow-ups:**
- Define TypeScript interfaces for test case structure

---

## 2025-02-05: Authentication Strategy - Playwright storageState

**Decision:** Use Playwright's `storageState` feature to persist login session across tests

**Context:** All 6 test cases require login first; repeating login is slow and flaky

**Alternatives Considered:**
- Login in beforeEach: Simple but slow, repeated auth calls
- API token injection: Faster but requires API knowledge of the app
- Cookie manipulation: Works but less portable

**Rationale:** Playwright's built-in storageState is the recommended approach, handles cookies/localStorage automatically, and is well-documented

**Decided By:** Claude (Lead)

**Phase:** foundation

**Follow-ups:**
- Create auth.setup.ts global setup script
- Configure playwright.config.ts with setup project

---

## [YYYY-MM-DD]: [Decision Title]

**Decision:** [Clear statement of what was decided]

**Context:** [Why this decision was needed]

**Alternatives Considered:**
- [Option 1]: [Pros/cons]
- [Option 2]: [Pros/cons]

**Rationale:** [Why this option was chosen]

**Decided By:** [{{lead}} / {{reviewer}} / Human / Consensus]

**Phase:** [Which phase this relates to]

**Follow-ups:**
- [Any actions triggered by this decision]
