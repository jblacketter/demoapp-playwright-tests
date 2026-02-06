# Skill: /sdet-review

Senior SDET code review checklist. Use this when reviewing test automation code.

## When to Use
- Reviewing PRs for test code
- Self-review before committing
- Evaluating framework changes
- Onboarding new team members

## Review Checklist

### 1. Test Quality

**Reliability**
- [ ] Tests are deterministic (same result every run)
- [ ] No race conditions or timing-dependent assertions
- [ ] Proper waits using Playwright's auto-waiting, not arbitrary sleeps
- [ ] Flaky tests are identified and fixed, not skipped

**Isolation**
- [ ] Tests can run independently in any order
- [ ] No shared mutable state between tests
- [ ] Each test cleans up after itself if it creates data
- [ ] Parallel execution is safe

**Assertions**
- [ ] Each test has clear, meaningful assertions
- [ ] Assertion messages explain what failed and why
- [ ] Testing behavior, not implementation details
- [ ] Edge cases are covered

### 2. Code Quality

**Readability**
- [ ] Code is self-documenting with clear names
- [ ] Complex logic has explanatory comments
- [ ] Methods do one thing well (SRP)
- [ ] No magic numbers - use named constants

**Maintainability**
- [ ] DRY - no copy-paste code
- [ ] Selectors are centralized in page objects
- [ ] Configuration is externalized
- [ ] Changes are localized (low coupling)

**Consistency**
- [ ] Follows project naming conventions
- [ ] Consistent error handling patterns
- [ ] Consistent assertion style
- [ ] Matches existing code patterns

### 3. Security

**Credentials**
- [ ] No hardcoded secrets in code
- [ ] Credentials loaded from environment
- [ ] .env files are gitignored
- [ ] Sensitive data not logged

**Data Handling**
- [ ] Test data doesn't contain real PII
- [ ] API responses are validated
- [ ] No SQL/command injection vulnerabilities
- [ ] Input validation where appropriate

### 4. Performance

**Efficiency**
- [ ] No unnecessary waits or delays
- [ ] Efficient selector strategies
- [ ] Minimal network calls
- [ ] Appropriate use of parallelization

**Scalability**
- [ ] Pattern works for N tests, not just current count
- [ ] Memory usage is reasonable
- [ ] No resource leaks (browsers, connections)
- [ ] Test data approach scales

### 5. Documentation

**Code Documentation**
- [ ] Public methods have JSDoc
- [ ] Complex algorithms are explained
- [ ] Non-obvious decisions are commented
- [ ] Type definitions are complete

**User Documentation**
- [ ] README is up-to-date
- [ ] Setup instructions are clear
- [ ] Examples are provided
- [ ] Troubleshooting guide exists

## Red Flags

Immediately flag these issues:

| Issue | Why It's Bad |
|-------|--------------|
| `sleep()` or fixed waits | Causes flakiness, slows tests |
| Global selectors without scoping | Wrong element can be found |
| Commented-out tests | Dead code, maintenance burden |
| `.only` or `.skip` committed | Breaks CI, hides failures |
| Catching and ignoring errors | Hides real failures |
| Hardcoded test data in specs | Hard to maintain, not scalable |
| Screenshot/video always on | Wastes resources, slows CI |
| No assertion in test | Test always passes |

## Questions to Ask

When reviewing, consider:

1. **"What happens when this test fails?"**
   - Is the error message helpful?
   - Can you identify the issue without debugging?

2. **"Will this work in 6 months?"**
   - Are selectors stable?
   - Is it clear what the test does?

3. **"Can a junior engineer add a similar test?"**
   - Is the pattern clear?
   - Is there documentation?

4. **"What if the UI changes slightly?"**
   - Are selectors resilient?
   - Is the test testing behavior or pixels?

5. **"Does this protect the customer?"**
   - Is the scenario realistic?
   - Does it catch bugs that matter?
