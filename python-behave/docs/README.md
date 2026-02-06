# Python Behave Test Framework

A BDD test automation framework using Python Behave with Gherkin syntax. This is an alternate implementation of the Playwright TypeScript framework, demonstrating the same test coverage using behavior-driven development patterns.

## Quick Start

```bash
# Navigate to python-behave directory
cd python-behave

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium

# Create .env file
cp .env.example .env

# Run all tests
behave

# Run all tests (HTML report generated automatically via behave.ini)
behave
```

## Project Structure

```
python-behave/
├── features/              # Gherkin feature files
│   ├── auth/             # Authentication tests
│   ├── board/            # Board structure & navigation
│   └── tasks/            # Task verification (data-driven)
├── steps/                 # Step definitions
├── pages/                 # Page Object Model
├── core/                  # Framework core (config, browser, logger)
├── environment.py         # Behave hooks
├── behave.ini            # Configuration
└── docs/                  # Documentation
```

## Running Tests

| Command | Description |
|---------|-------------|
| `behave` | Run all tests |
| `behave --tags=@smoke` | Run smoke tests only |
| `behave --tags=@tasks` | Run task verification tests |
| `behave --tags="not @negative"` | Skip negative tests |
| `behave features/tasks/` | Run specific feature folder |
| `HEADLESS=false behave` | Run with visible browser |

### HTML Reports

HTML reports are generated automatically to `reports/report.html` via `behave.ini` configuration. No extra flags needed.

## Test Coverage

| Suite | Scenarios | Tags |
|-------|-----------|------|
| Authentication | 1 | `@auth @smoke` |
| Negative Auth | 3 | `@auth @negative @no_auth` |
| Board Structure | 7 | `@board @structure` |
| Navigation | 3 | `@board @navigation` |
| Task Verification | 11 | `@tasks @verification @data-driven` |
| **Total** | **25** | |

## Configuration

Copy `.env.example` to `.env` and customize:

```bash
BASE_URL=https://animated-gingersnap-8cf7f2.netlify.app
USERNAME=admin
PASSWORD=password123
BROWSER=chromium
HEADLESS=true
```

**Security Note:** Never commit `.env` files with real credentials. The `.env` file is gitignored.

## Adding Tests

### Add to Existing Feature (Data-Driven)

Edit `features/tasks/verification.feature` and add a new row to the Examples table:

```gherkin
| TC012 | Web Application | New task name | To Do | Feature |
```

### Create New Scenario

1. Add scenario to appropriate feature file
2. Implement any new steps in `steps/`
3. Run `behave --dry-run` to verify step bindings

## Comparison with TypeScript Implementation

| Aspect | TypeScript (Playwright) | Python (Behave) |
|--------|------------------------|-----------------|
| Syntax | TypeScript | Gherkin + Python |
| Test runner | Playwright Test | Behave |
| Data-driven | JSON file | Scenario Outline |
| Parallel | Native support | Sequential |
| Reports | HTML (native) | HTML (formatter) |

Both implementations test the same application with equivalent coverage.

## Troubleshooting

### Tests fail to start
```bash
# Reinstall Playwright
playwright install --with-deps chromium
```

### Import errors
```bash
# Ensure you're in the python-behave directory
cd python-behave

# Activate virtual environment
source venv/bin/activate
```

### Screenshots on failure
Screenshots are automatically captured to `reports/screenshots/` when a scenario fails.
