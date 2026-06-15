# Code Review: Terminos y Condiciones Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) for syntax tracking.

**Goal:** Review the completed Terms & Conditions implementation against plan requirements, code quality, and production readiness before merging to main.

**Architecture:** Single code-review task that dispatches a reviewer subagent using the `requesting-code-review` skill template, then acts on the feedback.

**Tech Stack:** React 19, react-router-dom 7, Vitest + Testing Library, JSX, vanilla CSS

**Review range:** `0b7172d..5970129` (4 commits: page, route, styles, registration link)

---

## File Structure

No files to create/modify — this plan produces a review artifact. The implementation under review spans:

- `FRONTEND-REACT/src/pages/TermsPage.jsx` — Terms & Conditions page component
- `FRONTEND-REACT/src/App.jsx` — Route registration for `/terms`
- `FRONTEND-REACT/src/index.css` — `.terminos` block styles + `.formulario__texto--small`
- `FRONTEND-REACT/src/pages/RegisterPage.jsx` — Terms link in registration form
- `FRONTEND-REACT/src/tests/TermsPage.test.jsx` — 9 tests covering content + routing

### Task 1: Dispatch code reviewer and act on feedback

**Files:** None (review-only)

**Prerequisites:**
- Implementation plan: `docs/superpowers/plans/2026-06-15-terminos-y-condiciones.md`
- Git range: `0b7172d..5970129`

- [ ] **Step 1: Get git SHAs**

Run:
```bash
BASE_SHA=$(git rev-parse 0b7172d)
HEAD_SHA=$(git rev-parse HEAD)
echo "Base: $BASE_SHA"
echo "Head: $HEAD_SHA"
```

Expected:
```
Base: 0b7172d1ffde22a9eb14b6dd5bc88be4db5e7c2b
Head: 5970129e4ccbd300ed1b60afce6358a44139f3e7
```

- [ ] **Step 2: Dispatch code reviewer subagent**

Use the Task tool with `general-purpose` type and the following prompt (fill placeholders with actual SHAs from Step 1):

```
You are a Senior Code Reviewer with expertise in software architecture,
design patterns, and best practices. Your job is to review completed work
against its plan or requirements and identify issues before they cascade.

## What Was Implemented

A public Terms & Conditions page at `/terms` route in a Pinterest clone app.
The page displays 3 sections derived from an ethics report ("Normas derivadas
del sistema"): Reglas de Uso (3 sub-sections), Políticas de Contenido (3
sub-sections), Responsabilidades del Usuario (3 sub-sections).
A link to the terms page was added to the registration form ("Al registrarte,
aceptas nuestros Términos y Condiciones").

4 commits implementing this:
1. TermsPage component + 9 tests
2. Route registration in App.jsx (lazy import + /terms route)
3. CSS styles (terminos block + formulario__texto--small)
4. Terms link in RegisterPage

## Requirements / Plan

The implementation followed `docs/superpowers/plans/2026-06-15-terminos-y-condiciones.md`.
Key requirements:
- Public page at /terms, no auth required
- Standalone layout (no Header), centered content, max-width 720px
- Content sourced from ethics report "Normas derivadas del sistema" sections
- Link to terms from RegisterPage submission form
- 8+ tests verifying content rendering and routing
- All existing tests must pass (56 tests total)
- No new lint errors
- Production build must succeed

## Git Range to Review

**Base:** 0b7172d
**Head:** 5970129

```bash
git diff --stat 0b7172d..5970129
git diff 0b7172d..5970129
```

## What to Check

**Plan alignment:**
- Does the implementation match the plan / requirements?
- Are deviations justified improvements, or problematic departures?
- Is all planned functionality present?

**Code quality:**
- Clean separation of concerns?
- Proper error handling?
- Type safety where applicable?
- DRY without premature abstraction?
- Edge cases handled?

**Architecture:**
- Sound design decisions?
- Reasonable scalability and performance?
- Security concerns?
- Integrates cleanly with surrounding code?

**Testing:**
- Tests verify real behavior, not mocks?
- Edge cases covered?
- Integration tests where they matter?
- All tests passing?

**Production readiness:**
- Migration strategy if schema changed?
- Backward compatibility considered?
- Documentation complete?
- No obvious bugs?

## Calibration

Categorize issues by actual severity. Not everything is Critical.
Acknowledge what was done well before listing issues — accurate praise
helps the implementer trust the rest of the feedback.

If you find significant deviations from the plan, flag them specifically
so the implementer can confirm whether the deviation was intentional.

## Output Format

### Strengths
[What's well done? Be specific.]

### Issues

#### Critical (Must Fix)
[Bugs, security issues, data loss risks, broken functionality]

#### Important (Should Fix)
[Architecture problems, missing features, poor error handling, test gaps]

#### Minor (Nice to Have)
[Code style, optimization opportunities, documentation polish]

For each issue:
- File:line reference
- What's wrong
- Why it matters
- How to fix (if not obvious)

### Recommendations
[Improvements for code quality, architecture, or process]

### Assessment

**Ready to merge?** [Yes | No | With fixes]

**Reasoning:** [1-2 sentence technical assessment]

## Critical Rules

**DO:**
- Categorize by actual severity
- Be specific (file:line, not vague)
- Explain WHY each issue matters
- Acknowledge strengths
- Give a clear verdict

**DON'T:**
- Say "looks good" without checking
- Mark nitpicks as Critical
- Give feedback on code you didn't actually read
- Be vague ("improve error handling")
- Avoid giving a clear verdict
```

- [ ] **Step 3: Act on reviewer feedback**

Review the subagent's output. For each issue category:

**Critical issues:** Fix immediately before proceeding. Create a follow-up task with exact fix steps.
**Important issues:** Fix before merge. Create a follow-up task or fix inline.
**Minor issues:** Log as technical debt. Optionally fix if quick.

For each fix needed, follow TDD:
1. Write/modify the failing test
2. Run to confirm failure
3. Write the fix
4. Run to confirm pass
5. Commit with message referencing the review

- [ ] **Step 4: Re-run full test suite after fixes**

Run:
```bash
npx vitest run --reporter=verbose
```

Expected: All 56+ tests PASS. If new tests were added, the count should be higher.

- [ ] **Step 5: Rebuild to verify**

Run:
```bash
npx vite build
```

Expected: Build succeeds with no errors.

- [ ] **Step 6: Final commit (if any fixes were made)**

```bash
git add -A
git commit -m "fix: address code review feedback"
git log --oneline -6
```
