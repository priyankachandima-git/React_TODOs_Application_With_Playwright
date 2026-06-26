This repository contains :
Manual and automated test cases (Playwright + TypeScript) for the React: TODOs sample application. [https://todomvc.com/examples/react/dist/](https://todomvc.com/examples/react/dist/)

# Manual test cases
Open "TestCases.md" file to see the test cases that assure the 100% test coverage of TODOS application.

# Setup and run automation test scripts
To run the automated test cases, follow the steps below.

```bash
# 1. Install Node dependencies
npm install

# 2. Install the Playwright browser (first time only)
npx playwright install chromium

# 3. Run all tests in headless mode
npm test

# Other useful commands
npm run test:headed   # run with a visible browser
npm run test:ui       # open the Playwright UI runner
npm run test:debug    # step-through debugging
npm run report        # open the last HTML report
npm run typecheck     # TypeScript type-check only
```

# Project structure
```
tests/             Test specs (testMainScreen.spec.ts)
helpers/           Business-level flows (mainScreenHelper.ts)
testBase/          The "I" actor — generic action DSL (testBase.ts)
support/           Playwright fixtures + xlsx data reader
pageObjects/       Selectors as JSON (todosFrontPages.json)
fixtures/          Test data (mainScreen.json, mainScreenData.xlsx)
playwright.config.ts
```

# Adding new tests (Claude Code skill)
This repo ships a project-scoped [Claude Code](https://claude.com/claude-code) skill
at `.claude/skills/testscript/` to help you add new test scripts that follow this
framework's layered architecture (spec → helpers → "I" actor → page-object JSON).

Open the repo in Claude Code and either run `/testscript` or just ask
("add a test for …", "automate this scenario", "add a page object for …").
It reads the existing layers, reuses Actor verbs where possible, builds the new
test bottom-up, and verifies with `npm run typecheck` + the test run.
See `.claude/skills/testscript/SKILL.md` (workflow & conventions) and
`reference.md` (Actor API + templates).

# Author
* Priyanka Chandima Somapala - priyankachandimas@gmail.com
