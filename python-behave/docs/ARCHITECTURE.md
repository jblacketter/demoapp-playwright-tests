# Framework Architecture

This document describes the design patterns and architecture of the Python Behave test framework.

## Design Principles

1. **Behavior-Driven Development (BDD)** - Tests written in Gherkin for readability
2. **Page Object Model** - UI interactions encapsulated in page classes
3. **Singleton Pattern** - Shared resources (config, browser) managed efficiently
4. **Data-Driven Testing** - Scenario Outlines with Examples tables
5. **Separation of Concerns** - Features, steps, and pages are decoupled

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Feature Files                          │
│  (Gherkin scenarios in features/*.feature)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Step Definitions                         │
│  (Python functions in steps/*.py)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Page Objects                            │
│  (BasePage, LoginPage, ProjectPage in pages/*.py)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Core Framework                           │
│  ┌─────────────┐  ┌────────────────┐  ┌─────────────────┐   │
│  │   Config    │  │ BrowserFactory │  │     Logger      │   │
│  │ (singleton) │  │  (singleton)   │  │  (with masking) │   │
│  └─────────────┘  └────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Playwright                             │
│  (Browser automation - sync API)                            │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Core Components

#### Config (Singleton)
- Loads environment variables from `.env`
- Provides typed accessors (`get_bool`, `get_int`)
- Properties for common values (`base_url`, `headless`)
- Falls back to `.env.example` for CI/CD

#### BrowserFactory (Singleton)
- Manages Playwright lifecycle
- One browser per feature (efficiency)
- Fresh context per scenario (isolation)
- Handles cleanup on failure

#### Logger
- Consistent log format with timestamps
- Sensitive data masking (passwords, tokens)
- Module-level loggers via `get_logger(__name__)`

### Page Objects

#### BasePage (Abstract)
- Common methods: `click()`, `fill()`, `get_text()`
- Wait helpers: `wait_for_element()`, `wait_for_text()`
- Assertions: `assert_visible()`, `assert_url_contains()`
- Navigation: `navigate()` using `url_path` property

#### LoginPage
- Login form interactions
- Error detection
- Login state verification

#### ProjectPage
- Sidebar navigation (button-based project selection)
- Column operations (header-based task counting)
- Task verification with tag extraction (Tailwind `bg-*` class detection)
- Column-scoped card selection via `filter(has=...)` pattern

### Behave Hooks (environment.py)

| Hook | Purpose |
|------|---------|
| `before_all` | Initialize config, create directories |
| `before_feature` | Launch browser |
| `before_scenario` | Create context, handle auth |
| `after_scenario` | Screenshot on failure, cleanup |
| `after_feature` | Close browser |

### Data-Driven Testing

Uses Scenario Outline with Examples:

```gherkin
Scenario Outline: Verify task
  When I navigate to the "<project>" project
  Then I should see task "<task_name>" in the "<column>" column

Examples:
  | project         | task_name    | column |
  | Web Application | Fix bug      | To Do  |
  | Mobile App      | Add feature  | Done   |
```

Each row generates a separate test case in reports.

## Authentication Strategy

1. **Default:** Login in `before_scenario` hook
2. **No-auth tests:** Tag with `@no_auth` to skip login
3. **Future enhancement:** StorageState persistence for speed

## Error Handling

- Screenshots captured automatically on scenario failure
- Failure URL logged for debugging
- Browser context cleaned up even on errors
- Graceful fallbacks in page objects

## Dependencies

| Package | Purpose |
|---------|---------|
| behave | BDD test runner |
| playwright | Browser automation |
| python-dotenv | Environment config |
| assertpy | Fluent assertions |
| behave-html-formatter | HTML reports |
