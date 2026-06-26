# Framework reference — Playwright + TypeScript "I" actor architecture

Companion to `SKILL.md`. Always read the project's actual `testBase/testBase.ts`
first (it is the source of truth); this file is a quick reference + templates.

## The `I` actor — available verbs (testBase.ts)

The `Actor` class is bound to a Playwright `page` and exposed as the `I` fixture.
All verbs are `async`. Selectors are strings (CSS, or XPath starting with `//`).

| Verb | Signature | Purpose |
|---|---|---|
| `Open` | `Open(pageName, url?)` | Navigate to a page's mapped URL (or an absolute URL). |
| `AmOn` | `AmOn(pageName)` | Assert the page's identifier element is visible. |
| `See` | `See(locator)` | Assert element is visible. |
| `DontSee` | `DontSee(locator)` | Assert element is hidden or detached (`toBeHidden`). |
| `SeeAttributeValue` | `SeeAttributeValue(locator, attr, value)` | Assert attribute equals value. |
| `FillAndPressEnter` | `FillAndPressEnter(locator, text)` | Fill a field and press Enter. |
| `Click` | `Click(locator)` | Click (falls back to `force` if not visible). |
| `Fill` | `Fill(locator, text)` | Type text into a field. |
| `ClearAndFill` | `ClearAndFill(locator, text)` | Clear then type. |
| `MouseHover` | `MouseHover(locator)` | Hover over an element. |
| `SeeText` | `SeeText(locator, text)` | Assert first match has exact text. |
| `SeeValue` | `SeeValue(locator, value)` | Assert value contains. |
| `DontSeeText` | `DontSeeText(locator, text)` | Assert first match lacks text. |
| `Check` | `Check(locator)` | Check a checkbox. |
| `Wait` | `Wait(ms)` | Hard wait (last resort only). |
| `loc` | `loc(selector): Locator` | Escape hatch — raw Locator for helpers that need `.nth()`, `.count()`, etc. |

Page mapping helpers: `PagesUrlMapping(pageName)` and `PagesIdentifierMapping(pageName)`
(switch statements in `testBase.ts`) — extend them when adding a new page used by `Open`/`AmOn`.

## Adding a new Actor verb (only if no existing verb fits)

```ts
/**
 * @param locator web element selector
 * @summary <what it does>
 */
async DoubleClick(locator: string): Promise<void> {
  await this.loc(locator).dblclick();
}
```
Keep it generic (no feature names), selector-driven, async, with JSDoc.

## Page object template — `pageObjects/<page>.json`

```json
{
  "<PageName>": {
    "Url": "/path/to/page",
    "Identifier": ".unique-landing-element",
    "SomeInput": ".some-input",
    "SomeButton": "#some-button"
  }
}
```
If `Open`/`AmOn` are used for this page, add cases to `PagesUrlMapping` /
`PagesIdentifierMapping` in `testBase.ts`.

## Helper template — `helpers/<feature>Helper.ts`

```ts
import { expect } from '@playwright/test';
import { Actor } from '../testBase/testBase';
import pages from '../pageObjects/<page>.json';

/**
 * @param I the actor
 * @summary <business action>
 */
export async function I_DoSomething(I: Actor, value: string): Promise<void> {
  await I.Fill(pages.<PageName>.SomeInput, value);
  await I.Click(pages.<PageName>.SomeButton);
}

/**
 * @param I the actor
 * @summary <assertion about resulting state>
 */
export async function I_ValidateSomething(I: Actor, expected: string): Promise<void> {
  await expect(I.loc(pages.<PageName>.Result)).toContainText(expected);
}
```
Conventions: first param is `I: Actor`; actions are `I_Verb…`, assertions are
`I_Validate…`; use `I.loc(...)` only when you need raw Locator operations
(`.nth()`, `.count()`, `.filter()`).

## Spec template — `tests/<feature>.spec.ts`

```ts
import { test, expect } from '../support/fixtures';
import { <PageName> } from '../testBase/testBase';   // page-name constant
import { I_DoSomething, I_ValidateSomething } from '../helpers/<feature>Helper';
import pages from '../pageObjects/<page>.json';

test.describe('Test Plan of <Feature>', () => {
  test.describe('Test suite of <feature>', () => {
    test('As a user I should be able to <goal>', async ({ I }) => {
      await I.Open(<PageName>);
      await I_DoSomething(I, 'value');
      await I_ValidateSomething(I, 'expected');
    });
  });
});
```
Keep spec bodies declarative — only Actor verbs and helper calls. No selectors,
no `page` plumbing, no business logic.

## Data-driven from xlsx (mirror the existing pattern)

```ts
import * as fs from 'fs';
import { read } from '../support/read-xlsx';

test.beforeAll(() => {
  const rows = read({ file: 'fixtures/<data>.xlsx', sheet: '<Sheet>' });
  fs.writeFileSync('fixtures/<data>.json', JSON.stringify({ rows }, null, 2));
});
// then: import data from '../fixtures/<data>.json'  (resolveJsonModule is on)
```

## Adding a new page-name constant

In `testBase.ts`, export a constant and wire the mappings:
```ts
export const SettingsScreen = 'SettingsScreen';
// in PagesUrlMapping:        case 'SettingsScreen': return pages.SettingsScreen.Url;
// in PagesIdentifierMapping: case 'SettingsScreen': return pages.SettingsScreen.Identifier;
```

## Discovering selectors safely (throwaway probe, run from project root)

```js
// probe.mjs — delete after use
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('<url>');
console.log('count:', await p.locator('<candidate-selector>').count());
console.log('visible:', await p.locator('<candidate-selector>').isVisible());
await b.close();
```
Run with `node probe.mjs` from the project root (so `@playwright/test` resolves),
then `rm probe.mjs`. Or use `npx playwright codegen <url>`.

## Verify checklist
- `npm run typecheck` → clean
- `npx playwright test tests/<feature>.spec.ts --reporter=list` → green
- App drift → fix selectors in page objects, actionability (hover/scroll) in
  helpers/actor; never weaken an assertion just to make it pass.
