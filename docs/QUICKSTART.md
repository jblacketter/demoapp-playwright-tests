# Quick Start Guide

Get tests running in under 5 minutes.

---

## 1. Setup (One Time)

```bash
# Install dependencies
npm install

# Install browsers
npx playwright install --with-deps

# Verify setup
npm test
```

Expected: 25 tests pass in ~10 seconds.

---

## 2. Run Tests

| What you want | Command |
|---------------|---------|
| Run all tests | `npm test` |
| See the browser | `npm run test:headed` |
| Debug interactively | `npm run test:ui` |
| Test on Firefox | `npm run test:firefox` |
| Test on Safari | `npm run test:webkit` |
| Test all browsers | `npm run test:browsers` |

---

## 3. View Results

```bash
npm run report
```

Opens HTML report with pass/fail details, screenshots, and videos.

---

## 4. Add a Test (No Code Required)

Edit `data/test-cases.json`:

```json
{
  "id": "TC007",
  "name": "Verify checkout button",
  "project": "Web Application",
  "taskName": "Checkout feature",
  "expectedColumn": "Done",
  "expectedTags": ["Feature"]
}
```

Run `npm test` — your new test is included automatically.

---

## 5. Run in Docker (CI/CD)

```bash
# Build once
docker build -t playwright-tests .

# Run tests
docker run --rm playwright-tests

# Get reports
docker run --rm -v $(pwd)/reports:/app/playwright-report playwright-tests
```

---

## Common Tasks

### Change target URL

```bash
# Option 1: Environment variable
BASE_URL=https://staging.example.com npm test

# Option 2: Edit .env file
echo "BASE_URL=https://staging.example.com" >> .env
```

### Change credentials

```bash
# Option 1: Environment variable
USERNAME=testuser PASSWORD=testpass npm test

# Option 2: Edit .env file
cp .env.example .env
# Edit .env with your credentials
```

### Run specific test

```bash
# By test ID
npx playwright test -g "TC001"

# By name pattern
npx playwright test -g "authentication"
```

### Run tests in parallel

```bash
# Use 4 workers
npx playwright test --workers=4
```

### Generate trace for debugging

```bash
npx playwright test --trace on
```

---

## File Locations

| What | Where |
|------|-------|
| Test data | `data/test-cases.json` |
| Page objects | `src/pages/*.page.ts` |
| Test specs | `tests/*.spec.ts` |
| Config | `playwright.config.ts` |
| Reports | `playwright-report/` |
| Screenshots | `test-results/` |

---

## Troubleshooting

### Tests fail to start
```bash
# Reinstall browsers
npx playwright install --with-deps
```

### Authentication fails
```bash
# Clear saved auth state
rm -rf .auth/
npm test
```

### Element not found
```bash
# Debug with UI mode
npm run test:ui
```

### Docker: "headed browser" error
Headless mode is automatic when `CI=true`. If running locally in Docker:
```bash
docker run --rm -e HEADLESS=true playwright-tests
```

---

## Demo: Failure Reports

The framework includes intentional failure tests to demonstrate reporting with screenshots.

```bash
# 1. Remove .skip from tests/demo-failures.spec.ts
# 2. Run the demo
npx playwright test demo-failures.spec.ts --project=chromium

# 3. View the report with embedded screenshots
npm run report

# 4. Add .skip back to exclude from normal runs
```

The HTML report shows failed tests with:
- Error messages
- Screenshots (embedded)
- Video recordings
- Trace files for debugging

---

## Next Steps

- **Add more tests**: Edit `data/test-cases.json`
- **Test new pages**: Create page objects in `src/pages/`
- **Customize config**: Edit `playwright.config.ts`
- **Learn more**: See `FRAMEWORK_OVERVIEW.md` for architecture details

---

<div align="center">

**Need help?** Open an issue or check `docs/` for detailed guides.

</div>
