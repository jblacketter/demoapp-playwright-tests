# Phase: Cross-Browser Testing

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
**What:** Add cross-browser testing support (Firefox, WebKit) with opt-in execution
**Why:** Ensure application works across browser engines while keeping default execution fast
**Depends on:** Foundation phase (complete)

## Scope

### In Scope
- Add Firefox and WebKit browser projects to Playwright config
- Shared authentication state across browsers
- NPM scripts for individual browser and multi-browser execution
- Documentation updates

### Out of Scope
- Mobile viewport testing (future phase - pending app compatibility check)
- Per-browser authentication setup (only if shared auth fails)
- Firefox in CI environments (Docker compatibility issues)
- Browser-specific test cases

---

## Technical Approach

### Configuration Structure

**Playwright Projects:**
```
setup          → Runs once, saves auth to .auth/user.json
chromium       → Default browser, depends on setup
firefox        → Opt-in, depends on setup, shares auth state
webkit         → Opt-in, depends on setup, shares auth state
```

**Key Decision:** All browsers share the single `.auth/user.json` from setup. This assumes the auth mechanism (cookies/localStorage) is browser-agnostic. If a specific browser fails auth, we can add per-browser setup later.

### NPM Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `test` | `playwright test` | Chromium only (unchanged default) |
| `test:firefox` | `playwright test --project=firefox` | Firefox only |
| `test:webkit` | `playwright test --project=webkit` | WebKit only |
| `test:browsers` | `playwright test --project=chromium --project=firefox --project=webkit` | All desktop browsers |

### Playwright Config Changes

```typescript
// playwright.config.ts - projects section
projects: [
  // Setup project runs first, authenticates once
  {
    name: 'setup',
    testMatch: /.*\.setup\.ts/,
  },
  // Default browser - always runs with `npm test`
  {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      storageState: '.auth/user.json',
    },
    dependencies: ['setup'],
  },
  // Opt-in browsers - run with specific scripts
  {
    name: 'firefox',
    use: {
      ...devices['Desktop Firefox'],
      storageState: '.auth/user.json',
    },
    dependencies: ['setup'],
  },
  {
    name: 'webkit',
    use: {
      ...devices['Desktop Safari'],
      storageState: '.auth/user.json',
    },
    dependencies: ['setup'],
  },
],
```

### Default Project Filtering

To ensure `npm test` only runs Chromium by default:

**Option A:** Use `grep` in config to filter by default
```typescript
// Only run chromium unless specific project requested
grep: process.env.PROJECT ? undefined : /@chromium/,
```

**Option B:** Rely on CLI `--project` flag (simpler)
- `npm test` runs all projects by default
- Change script to: `"test": "playwright test --project=chromium"`

**Recommendation:** Option B is simpler and more explicit.

---

## Files to Modify

| File | Change |
|------|--------|
| `playwright.config.ts` | Add Firefox and WebKit projects |
| `package.json` | Add new npm scripts |
| `README.md` | Document new commands |
| `CLAUDE.md` | Add cross-browser section to quick reference |

## Files to Create

None - all changes are modifications to existing files.

---

## Success Criteria

1. `npm test` runs Chromium only (backward compatible)
2. `npm run test:firefox` runs Firefox only
3. `npm run test:webkit` runs WebKit only
4. `npm run test:browsers` runs all three browsers
5. All browsers use shared auth state from setup
6. All existing tests pass on all browsers
7. Documentation updated with new commands

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Shared auth fails for WebKit | Low | Medium | Add per-browser setup if needed |
| Tests flaky on Firefox | Medium | Low | Firefox is opt-in, not default |
| Browser-specific element behavior | Low | Medium | Use stable selectors (role, testid) |

---

## CI Considerations

- **Default CI:** Runs Chromium only (no change needed)
- **Multi-browser CI:** Opt-in via `npm run test:browsers`
- **Firefox in Docker:** Known issues - recommend excluding or using specific Docker images
- **Future:** Could add GitHub Actions matrix for parallel browser runs

---

## Future Enhancements (Out of Scope)

1. **Mobile Viewports** - Add after confirming app responsive design support
   - `Mobile Chrome`
   - `Mobile Safari`
2. **Per-browser auth** - Only if shared auth causes issues
3. **Browser-specific test tags** - Skip tests on certain browsers if needed
