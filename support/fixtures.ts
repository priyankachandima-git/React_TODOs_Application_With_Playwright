import { test as base } from '@playwright/test';
import { Actor } from '../testBase/testBase';

/**
 * Custom Playwright fixtures.
 *
 * Exposes the `I` actor (built on the active `page`) so specs keep the original
 * Cypress-style calling convention — `await I.Open(MainScreen)` — instead of
 * threading `page` through every verb.
 */
type Fixtures = {
  I: Actor;
};

export const test = base.extend<Fixtures>({
  I: async ({ page }, use) => {
    await use(new Actor(page));
  },
});

export { expect } from '@playwright/test';
