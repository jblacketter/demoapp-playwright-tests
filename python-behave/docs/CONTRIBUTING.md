# Contributing Guide

How to add new tests and extend the framework.

## Adding a New Task Verification Test

The simplest way to add coverage is to add a row to the Scenario Outline:

1. Edit `features/tasks/verification.feature`
2. Add a new row to the appropriate Examples section:

```gherkin
Examples: Web Application Tasks
  | id    | project         | task_name    | column | tags    |
  | TC012 | Web Application | New feature  | To Do  | Feature |  # Add this line
```

3. Run `behave features/tasks/` to verify

## Adding a New Scenario

1. **Choose the right feature file** based on the test category:
   - `features/auth/` - Authentication tests
   - `features/board/` - Board structure and navigation
   - `features/tasks/` - Task verification

2. **Write the scenario in Gherkin:**

```gherkin
@regression @new-feature
Scenario: Verify new functionality
  Given I am logged in
  When I perform some action
  Then I should see the expected result
```

3. **Implement missing steps** in `steps/`:

```python
# steps/new_steps.py
from behave import when, then

@when("I perform some action")
def step_perform_action(context):
    # Implementation
    pass

@then("I should see the expected result")
def step_verify_result(context):
    # Assertion
    assert True
```

4. **Verify step bindings:**

```bash
behave --dry-run
```

## Adding a New Page Object

1. Create the page class in `pages/`:

```python
# pages/new_page.py
from .base_page import BasePage

class NewPage(BasePage):
    # Selectors
    SOME_ELEMENT = '[data-testid="element"]'

    @property
    def url_path(self) -> str:
        return "/new-page"

    def do_something(self) -> "NewPage":
        self.click(self.SOME_ELEMENT)
        return self
```

2. Export in `pages/__init__.py`:

```python
from .new_page import NewPage
```

3. Use in steps:

```python
from pages.new_page import NewPage

@given("I am on the new page")
def step_on_new_page(context):
    context.new_page = NewPage(context.page)
    context.new_page.navigate()
```

## Tagging Conventions

| Tag | Purpose |
|-----|---------|
| `@smoke` | Critical path tests |
| `@regression` | Full regression suite |
| `@negative` | Negative/error scenarios |
| `@no_auth` | Tests that don't need login |
| `@data-driven` | Scenario Outline tests |
| `@wip` | Work in progress (skipped in CI) |

## Best Practices

1. **Keep scenarios independent** - Each scenario should work in isolation
2. **Use descriptive step names** - Steps should read like documentation
3. **Reuse existing steps** - Check existing step files before creating new ones
4. **Page objects for UI logic** - Steps should be thin, pages do the work
5. **Assertions in then steps** - Keep assertions in Then steps only
6. **Test one thing per scenario** - Focused scenarios are easier to debug

## Running Specific Tests

```bash
# By tag
behave --tags=@smoke
behave --tags="@tasks and not @wip"

# By feature
behave features/auth/

# By scenario name
behave --name="Verify task"

# Dry run (check step bindings)
behave --dry-run
```

## Debugging

1. **Run with visible browser:**
   ```bash
   HEADLESS=false behave
   ```

2. **Add debug pause:**
   ```python
   context.page.pause()  # Opens Playwright inspector
   ```

3. **Check screenshots:**
   Screenshots are saved to `reports/screenshots/` on failure.
