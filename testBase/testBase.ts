import { expect, Page, Locator } from '@playwright/test';
import todosFrontPages from '../pageObjects/todosFrontPages.json';

/**
 * Page object name constant — kept identical to the original Cypress DSL
 * so specs can keep calling `I.Open(MainScreen)`.
 */
export const MainScreen = 'MainScreen';

/**
 * The "I" actor — the Playwright equivalent of the original `testBase.js`.
 *
 * In Cypress every verb used the global `cy`. Playwright has no global, so the
 * actor is bound to a single `page` instance (provided via the `I` fixture).
 * The verb names and responsibilities are preserved 1:1; only the mechanics
 * change (Cypress auto-retry chains -> Playwright async/await + web-first
 * assertions).
 */
export class Actor {
  readonly page: Page;
  /** Default timeout mirroring Cypress `defaultCommandTimeout`. */
  private readonly defaultTimeout = 9000;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Resolve a selector to a Playwright Locator. Playwright auto-detects XPath
   * when the string starts with `//` or `..`, so the original CSS/XPath
   * branching collapses into a single call while keeping behaviour identical.
   */
  loc(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * @param pageName page object name
   * @param url optional absolute URL of the page
   * @summary Open a page using its mapped relative URL (or an absolute URL).
   */
  async Open(pageName: string, url?: string): Promise<void> {
    if (url && url.includes('https://')) {
      await this.page.goto(url);
    } else {
      // baseURL is configured in playwright.config.ts
      await this.page.goto(PagesUrlMapping(pageName));
    }
  }

  /**
   * @param pageName page object name
   * @summary Verify the user landed on the expected page via its identifier.
   */
  async AmOn(pageName: string): Promise<void> {
    await expect(this.loc(PagesIdentifierMapping(pageName))).toBeVisible({
      timeout: this.defaultTimeout,
    });
  }

  /**
   * @param locator string element selector
   * @summary Verify a web element is visible.
   */
  async See(locator: string): Promise<void> {
    await expect(this.loc(locator)).toBeVisible({ timeout: 20000 });
  }

  /**
   * @param locator string element selector
   * @summary Verify a web element is not seen by the user.
   *
   * `toBeHidden()` passes when the element is either detached from the DOM or
   * present-but-hidden. This is a faithful superset of the original Cypress
   * `should('not.exist')` and matches the verb's intent ("DontSee"), so it also
   * covers apps (like the current todomvc React build) that hide rather than
   * remove elements.
   */
  async DontSee(locator: string): Promise<void> {
    await expect(this.loc(locator)).toBeHidden();
  }

  /**
   * @param locator string web element selector
   * @param attribute html attribute
   * @param value expected attribute value
   * @summary Verify a web element's attribute has the given value.
   */
  async SeeAttributeValue(
    locator: string,
    attribute: string,
    value: string,
  ): Promise<void> {
    await expect(this.loc(locator)).toHaveAttribute(attribute, value, {
      timeout: 20000,
    });
  }

  /**
   * @param locator web element selector
   * @param text input text
   * @summary Type the given value and press the Enter key.
   */
  async FillAndPressEnter(locator: string, text: string): Promise<void> {
    const element = this.loc(locator);
    await element.fill(text);
    await element.press('Enter');
  }

  /**
   * @param locator string element selector
   * @summary Click on the given web element.
   */
  async Click(locator: string): Promise<void> {
    const element = this.loc(locator);
    if (await element.isVisible()) {
      await element.click();
    } else {
      await element.click({ force: true });
    }
  }

  /**
   * @param milliSeconds number of milliseconds to wait
   * @summary Pause execution for the given time.
   */
  async Wait(milliSeconds: number): Promise<void> {
    await this.page.waitForTimeout(milliSeconds);
  }

  /**
   * @param locator web element selector
   * @param text input text
   * @summary Insert text into the given web element.
   */
  async Fill(locator: string, text: string): Promise<void> {
    const element = this.loc(locator);
    if (await element.isVisible()) {
      await element.type(text);
    } else {
      await element.type(text, { force: true } as any);
    }
  }

  /**
   * @param locator web element selector
   * @param text input text
   * @summary Clear the field then insert the given text.
   */
  async ClearAndFill(locator: string, text: string): Promise<void> {
    const element = this.loc(locator);
    await element.clear({ force: true });
    await element.fill(text);
  }

  /**
   * @param locator web element selector
   * @summary Hover the mouse over the given web element.
   */
  async MouseHover(locator: string): Promise<void> {
    await this.loc(locator).hover();
  }

  /**
   * @param locator web element selector
   * @param expectedText expected text
   * @summary Verify the first matching element has the expected text.
   */
  async SeeText(locator: string, expectedText: string): Promise<void> {
    await expect(this.loc(locator).first()).toHaveText(expectedText);
  }

  /**
   * @param locator web element selector
   * @param expectedValue expected value
   * @summary Verify the element's value attribute contains the expected value.
   */
  async SeeValue(locator: string, expectedValue: string): Promise<void> {
    await expect(this.loc(locator)).toHaveValue(new RegExp(expectedValue));
  }

  /**
   * @param locator web element selector
   * @param expectedText text that should not be present
   * @summary Verify the first matching element does not have the given text.
   */
  async DontSeeText(locator: string, expectedText: string): Promise<void> {
    await expect(this.loc(locator).first()).not.toHaveText(expectedText);
  }

  /**
   * @param locator web element selector
   * @summary Check the given checkbox element.
   */
  async Check(locator: string): Promise<void> {
    await this.loc(locator).check({ force: true });
  }
}

/**
 * @param pageName page object name
 * @summary Map a page name to its relative URL.
 */
export function PagesUrlMapping(pageName: string): string {
  switch (pageName) {
    case 'MainScreen':
      return todosFrontPages.MainScreen.Url;
    default:
      throw new Error(`No URL mapping for page: ${pageName}`);
  }
}

/**
 * @param pageName page object name
 * @summary Map a page name to its identifier selector.
 */
export function PagesIdentifierMapping(pageName: string): string {
  switch (pageName) {
    case 'MainScreen':
      return todosFrontPages.MainScreen.Identifier;
    default:
      throw new Error(`No identifier mapping for page: ${pageName}`);
  }
}
