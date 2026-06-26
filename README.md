[![Playwright Tests](https://github.com/priyankachandima-git/React_TODOs_Application_With_Playwright/actions/workflows/playwright.yml/badge.svg)](https://github.com/priyankachandima-git/React_TODOs_Application_With_Playwright/actions/workflows/playwright.yml)

# React TODOs — Playwright + TypeScript test framework

End-to-end UI test automation for the [React TodoMVC](https://todomvc.com/examples/react/dist/)
application, built on **Playwright** and **TypeScript**.

The suite is organised as a small, layered framework (a CodeceptJS-style **"I" actor**
on top of Playwright) so that test specs stay short and readable, selectors live in one
place, and reusable actions are shared across tests. It was migrated from an earlier
Cypress + JavaScript implementation while preserving that layered architecture.

# Manual test cases
Open [`TestCases.md`](TestCases.md) to see the manual test cases that assure full
test coverage of the TODOs application.

# Quick start
```bash
# 1. Install Node dependencies
npm install

# 2. Install the Playwright browser (first time only)
npx playwright install chromium

# 3. Run all tests in headless mode
npm test
```

Other useful commands:

| Command | What it does |
|---|---|
| `npm test` | Run all tests headless |
| `npm run test:headed` | Run with a visible browser |
| `npm run test:ui` | Open the interactive Playwright UI runner |
| `npm run test:debug` | Step-through debugging (Playwright Inspector) |
| `npm run report` | Open the last HTML report |
| `npm run typecheck` | TypeScript type-check only (no run) |

Run a single spec: `npx playwright test tests/testEditTodo.spec.ts --reporter=list`

# Framework architecture

The framework is split into layers, each with a single responsibility. Data flows
top-down (a spec calls helpers, which call the actor, which uses page-object selectors),
and **each layer only knows about the one below it**:

```
tests/        Specs — the "what". Declarative test bodies; only orchestration.
   │
helpers/      Business flows — the "how" for a feature (e.g. add/edit/delete a todo).
   │
testBase/     The "I" actor — a generic, reusable action DSL (Open, Click, See, Fill…).
   │
pageObjects/  Selectors as JSON, grouped by page. The single source of truth for locators.

support/      Playwright fixtures (exposes `I`) + data readers (xlsx → JSON).
fixtures/     Test data (JSON + the xlsx source).
```

| Folder | Role | Example |
|---|---|---|
| `tests/` | Test specs — declarative, no selectors, no logic | `testMainScreen.spec.ts`, `testEditTodo.spec.ts` |
| `helpers/` | Feature-level flows + validations | `mainScreenHelper.ts` (`I_AddTodoItems`, `I_EditTodoItemByTitle`, …) |
| `testBase/` | The `Actor` class — generic verbs, exposed as `I` | `testBase.ts` |
| `support/` | Playwright fixtures + xlsx reader | `fixtures.ts`, `read-xlsx.ts` |
| `pageObjects/` | Selectors as JSON | `todosFrontPages.json` |
| `fixtures/` | Test data | `mainScreen.json`, `mainScreenData.xlsx` |
| `playwright.config.ts` | Base URL, viewport, timeouts, reporter | — |

### The "I" actor

`testBase/testBase.ts` defines an `Actor` class bound to a Playwright `page`. It provides
generic, selector-driven verbs so tests read like user actions:

```ts
await I.Open(MainScreen);                       // navigate via the page-object URL
await I.See(pages.MainScreen.AddNewTodoInput);  // assert visible
await I.Click(pages.MainScreen.CompleteAll);    // click
```

Common verbs: `Open`, `AmOn`, `See`, `DontSee`, `Click`, `Fill`, `FillAndPressEnter`,
`ClearAndFill`, `SeeText`, `SeeValue`, `SeeAttributeValue`, `MouseHover`, `Check`, `Wait`,
and `loc(selector)` (an escape hatch returning a raw Playwright `Locator` for index-based
operations like `.nth()` / `.count()`). The actor is injected into every test as the `I`
fixture (see `support/fixtures.ts`), so specs never touch `page` directly.

### Page objects

Selectors are **never hardcoded** in specs or helpers — they live in `pageObjects/*.json`,
keyed by semantic name:

```json
{
  "MainScreen": {
    "Url": "/examples/react/dist/",
    "AddNewTodoInput": ".new-todo",
    "TodoItems": ".todo-list li",
    "ClearAllCompleted": ".clear-completed"
  }
}
```

### Test data

Data lives in `fixtures/`. The xlsx source (`mainScreenData.xlsx`) is read by
`support/read-xlsx.ts` and written to `mainScreen.json` in a `test.beforeAll` hook, which
specs then import. This keeps test data editable in a spreadsheet while staying type-safe
in code.

# How to write a new test

Build **bottom-up**, creating only what's missing and reusing existing layers:

1. **Page object** — add any new selectors to `pageObjects/<page>.json`.
2. **Actor verb** — only if no existing verb fits, add a generic one to the `Actor` class
   in `testBase.ts` (async, selector-string param, JSDoc).
3. **Helper** — add the feature flow to `helpers/<feature>Helper.ts`. Convention: exported
   `async function`, named `I_ActionName` (actions) or `I_ValidateX` (assertions), with the
   actor `I` as the first parameter.
4. **Spec** — create/extend `tests/<feature>.spec.ts`. Import `{ test, expect }` from
   `../support/fixtures`, get `{ I }` from the fixture, and keep the body to actor verbs +
   helper calls only.
5. **Verify** — `npm run typecheck`, then run the spec.

Minimal example:

```ts
// tests/testExample.spec.ts
import { test } from '../support/fixtures';
import { MainScreen } from '../testBase/testBase';
import { I_AddTodoItems } from '../helpers/mainScreenHelper';
import data from '../fixtures/mainScreen.json';

test.describe('Test Plan of TODOS Application', () => {
  test('As a user I should be able to add a TODO item', async ({ I }) => {
    await I.Open(MainScreen);
    await I_AddTodoItems(I, data.todoItems, 1);
  });
});
```

**Conventions**
- Specs are declarative — no selectors, no business logic.
- Selectors belong in page objects; generic actions in the actor; feature flows in helpers.
- Everything is `async/await`; prefer web-first assertions over `Wait()`.
- Don't guess selectors or behaviour — inspect the running app (e.g. `npx playwright codegen <url>`).

# Adding new tests with Claude Code

This repo ships a project-scoped [Claude Code](https://claude.com/claude-code) skill at
`.claude/skills/testscript/` that automates the workflow above. Open the repo in Claude
Code and either run `/testscript` or just ask in plain language
("add a test for …", "automate this scenario", "add a page object for …"). It reads the
existing layers, reuses actor verbs where possible, builds the test bottom-up, and verifies
with `npm run typecheck` + the test run. See `.claude/skills/testscript/SKILL.md` (workflow
& conventions) and `reference.md` (full Actor API + templates).

# Continuous integration

GitHub Actions runs the type-check and the full Playwright suite on every push/PR to `main`
(`.github/workflows/playwright.yml`) and uploads the HTML report as a build artifact. Status
is shown by the badge at the top of this file.

# Author
* Priyanka Chandima Somapala - priyankachandimas@gmail.com
