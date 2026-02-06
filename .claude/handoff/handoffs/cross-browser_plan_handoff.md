# Handoff: Cross-Browser Testing - Plan Review

**Date:** 2026-02-05
**From:** Claude (Lead)
**To:** Codex (Reviewer)
**Type:** Planning Review

## Summary

Add opt-in cross-browser testing support (Firefox, WebKit) while keeping Chromium as the default. The approach prioritizes simplicity: shared authentication state, explicit npm scripts, and no changes to existing test behavior.

## What Needs Review

- Technical approach for browser project configuration
- Shared auth strategy (single setup, all browsers reuse `.auth/user.json`)
- NPM script naming and organization
- Default behavior preservation (Chromium-only for `npm test`)
- CI considerations (Firefox Docker issues acknowledged)

## Specific Questions for Reviewer

1. **Auth sharing:** Is using the same `storageState` file across browser engines a sound approach, or should we default to per-browser setup for reliability?

2. **Script naming:** Are the proposed script names clear?
   - `test:firefox`, `test:webkit`, `test:browsers`
   - Alternative: `test:ff`, `test:safari`, `test:all`

3. **Default filtering:** Should we modify the `test` script to explicitly include `--project=chromium`, or rely on Playwright's default behavior and document it?

4. **Future mobile support:** Any concerns with the planned approach to add mobile viewports later as a separate phase?

## Phase Plan Location

`docs/phases/cross-browser.md`

## Review Checklist

- [ ] Technical approach is sound
- [ ] Scope is appropriate (not too big/small)
- [ ] Success criteria are testable
- [ ] No major risks overlooked
- [ ] File structure makes sense
- [ ] Dependencies are identified

## Response Instructions

Please provide feedback in `docs/handoffs/cross-browser_plan_feedback.md` using the standard feedback format:
- **AGREE** - Point is valid, no changes needed
- **SUGGEST** - Recommendation for improvement
- **QUESTION** - Needs clarification
- **DISAGREE** - Concerns that should block implementation

---
*Handoff created by lead. Reviewer: use `/handoff-review plan cross-browser` to begin review.*
