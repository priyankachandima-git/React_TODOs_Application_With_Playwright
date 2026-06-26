---
name: testscript
description: Create new automated test scripts in the team's Playwright + TypeScript framework (the layered "I" actor / page-object architecture used in the React_TODOs_Application_With_Playwright repo). Use when the user asks to "add a test", "write a test script", "automate this scenario", "add a page object", "add a new actor verb/helper", or anything about extending the Playwright automation framework.
---

# Purpose

Write new automated test scripts **inside the team's existing Playwright + TypeScript framework**, following its layered architecture exactly. The goal is consistency: a new test should look like it was written by the same author as the rest of the suite.

This skill does NOT invent a new structure. It extends the established one:

```
tests/             Specs — declarative test bodies only (the "what")
helpers/           Business-level flows (mainScreenHelper.ts style) — the "how", per feature
testBase/          The "I" actor — a generic, reusable action DSL (testBase.ts)
support/           Playwright fixtures (exposes `I`) + data readers (xlsx, etc.)
pageObjects/       Selectors as JSON, grouped by page (todosFrontPages.json)
fixtures/          Test data (JSON + xlsx)
playwright.config.ts · tsconfig.json
```

# CRITICAL RULES

- **Reuse the layers — never collapse them.** Selectors live in `pageObjects/*.json`. Generic verbs live in the `Actor` (`testBase`). Feature flows live in `helpers/`. Specs only orchestrate. Never hardcode a selector in a spec or helper, and never put business logic in the spec.
- **Prefer existing Actor verbs.** Read `testBase/testBase.ts` first and reuse verbs (`Open`, `See`, `Click`, `Fill`, `FillAndPressEnter`, `DontSee`, `SeeText`, …). Only add a NEW verb when no existing one fits, and add it generically (selector-string based, `async`, page-bound).
- **Everything is `async/await`.** Playwright has no Cypress-style auto-chaining. Every Actor/helper call is awaited.
- **Do not invent selectors or app behavior.** If you don't know a selector or the expected result, inspect the running app (see "Discovering selectors") or ask — do not guess.
- **Always verify before finishing** — run `npm run typecheck` and `npm test` (or the single spec). A script that hasn't been run is not done.

# When to use

Trigger on requests like: "add a test for X", "automate this scenario", "write a Playwright test", "add a page object for the Y page", "add a helper for Z", "add an actor verb". If the user pastes manual steps / a test case, turn them into a spec in this framework.

# Flow

## 1. Locate and read the framework
- Confirm you're in a project using this framework: look for `testBase/testBase.ts` (the `Actor` class), `support/fixtures.ts` (the `I` fixture), `pageObjects/*.json`, and `playwright.config.ts`. If the repo isn't cloned, ask the user for the path / clone URL.
- **Read `testBase/testBase.ts`** to learn the available verbs and their signatures.
- **Read the relevant `pageObjects/*.json`** to see existing selectors and naming.
- Skim an existing spec + helper (e.g. `tests/testMainScreen.spec.ts`, `helpers/mainScreenHelper.ts`) to match style.
- See `reference.md` (next to this file) for the full Actor API and copy-paste templates.

## 2. Clarify the scenario (only what's missing)
Ask, in one message, for anything you can't derive:
- The **page / feature** under test and its **URL** (or page-object name if it already exists).
- The **steps and expected results** (or the Jira/manual test case to base them on).
- **Test data** — inline, an existing fixture, or a new xlsx/JSON fixture.

## 3. Build bottom-up, reusing layers
In this order, creating only what's missing:
1. **Page objects** — add/extend `pageObjects/<page>.json` with selectors (and a `Url`/`Identifier` if it's a new page). Add the page to `PagesUrlMapping`/`PagesIdentifierMapping` in `testBase.ts` if `Open()`/`AmOn()` will be used for it.
2. **Actor verbs** — only if a needed generic action is missing. Add it to the `Actor` class: `async`, selector-string param, JSDoc, web-first assertions (`expect(locator).…`).
3. **Helpers** — add feature flows to `helpers/<feature>Helper.ts`. Convention: exported `async function`, named `I_VerbDescription(...)` for actions and `I_Validate…` for assertions, taking the actor `I` as the first parameter.
4. **Spec** — create/extend `tests/<feature>.spec.ts`. Import `{ test, expect }` from `../support/fixtures`, get `{ I }` from the fixture, keep the body declarative (calls to Actor verbs + helpers). Use `test.describe` for the plan/suite and descriptive `test('As a user I should …')` titles.
5. **Fixtures/data** — if data comes from xlsx, regenerate it in `test.beforeAll` via `support/read-xlsx.ts` (mirror the existing pattern).

## 4. Discovering selectors (when unknown)
Never guess. Use the running app:
- Quick probe: a throwaway script in the project root using `chromium` from `@playwright/test` to `goto` the page and check `.count()` / `.innerText()` / `.isVisible()` of candidate selectors, then delete it. (See how this was done for the todomvc build.)
- Or `npx playwright codegen <url>` to record selectors.
- Prefer stable selectors (ids, `data-*`, role/text) over brittle CSS chains, but match the existing page-object style.

## 5. Verify
- `npm run typecheck` — must pass.
- `npm test` or `npx playwright test tests/<feature>.spec.ts --reporter=list` — run and confirm green.
- If a test fails because the **app** differs from the spec's expectation, surface it as a finding (selector drift, hidden-vs-removed elements, URL change) — don't silently weaken assertions. Fix selectors in the page-object layer; fix actionability (e.g. hover-before-click) in the helper/actor layer.

## 6. Report
Summarize what was added per layer, which existing verbs were reused vs. newly added, and the test run result. Offer to commit on a branch (don't commit unless asked).

# Naming & style conventions

- **Specs:** `tests/<feature>.spec.ts`; titles read as user stories ("As a user I should be able to …").
- **Helpers:** `helpers/<feature>Helper.ts`; functions `I_ActionName` / `I_ValidateX`, first param `I: Actor`.
- **Page objects:** `pageObjects/<page>.json`; keys are PascalCase semantic names (`AddNewTodoInput`, `ClearAllCompleted`), values are selectors.
- **Actor verbs:** PascalCase, imperative (`Click`, `SeeText`); generic and selector-driven, never feature-specific.
- TypeScript throughout; `strict` is on. Keep JSDoc on Actor verbs and helpers.

# Anti-patterns (do not do)

- ❌ `await page.locator('.new-todo')…` inside a spec — selectors belong in page objects, actions in the Actor.
- ❌ A feature-specific method on the `Actor` (e.g. `AddTodo`) — that's a helper, not a generic verb.
- ❌ Assertions hidden in helpers named like actions, or actions in `I_Validate…` — keep action vs. assertion clear.
- ❌ `waitForTimeout`/`Wait()` as the primary sync mechanism — rely on web-first assertions; use waits only as a last resort.
- ❌ Marking work done without running typecheck + the test.
