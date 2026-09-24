# Contributing to Phyll

Thanks for helping. Phyll gets better every time someone adds a pattern they keep seeing in generated apps, or fixes a detector that gets something wrong.

## Setup

You need Node 22 or newer to run the tests.

```bash
npm install
(cd packages/connector && npm install)
npm test
```

`npx playwright install chromium` lets the browser tests run instead of skipping.

## Adding a tell

A tell is a default choice that makes a product harder to understand or use, and that generated apps make often. Before writing one, check that the pattern hurts the end user; looking generated is not enough on its own.

1. Pick the dimension (`purpose`, `flow`, `actions`, `look`, `copy` or `states`) and the next free id, such as `L13`.
2. Add the entry to `skills/phyll/data/tells.json`: name, dimension, severity, weight, cap, detection and a one-line summary.
   - `detection` is `static` when the source is enough, `dynamic` when only the running app shows it, and `both` when the source gives a hint the reviewer confirms.
   - `weight` is 1 when the tell is cosmetic, 2 when people notice it, 3 when it gets in the way of the job.
   - `cap` is the number of hits at which the tell counts in full. Use a higher cap for patterns that are fine once and a problem everywhere.
3. For `static` and `both` tells, add detectors (`regex`, `phrase`, `classCombo` or `metric`) and `examples`: at least one snippet the detectors must match (`hit`) and one they must not (`miss`). Keep false positives low; a detector that fires on good code teaches people to ignore Phyll.
4. In the pull request, say what to watch for, why it hurts the person using the product, how to fix it, and give a before and after. The review guidance lives in Phyll's engine, and the maintainers add it there.
5. Run `npm test`.

The tests check that every pattern compiles, that each detector catches its hit examples and skips its miss examples, and that the before apps in `examples/` still show every source tell between them. If you add a static tell, seed an instance of it in one of those apps.

## Adding an example

An example shows Phyll working on a realistic app. It has four parts in `examples/<name>/`:

1. `before/`: a small app written the way a code generator tends to write it, with a real job for a real kind of user.
2. `review/`: a Phyll review of the before app, the report folder that finish_review leaves.
3. `after/`: the same app with the review applied. Keep its design: reuse its classes, keep its colors, gradients and decoration, and change the flows, fields, copy and states the findings point to.
4. `screenshots/`: comparisons made by `scripts/example-screenshots.mjs`, with a moment for each finding worth showing.

Add the dev scripts to `examples/package.json` with the next free ports, and add the moments to `scripts/example-screenshots.mjs`. `tests/example.test.mjs` picks the example up on its own and checks that the after app cuts the function tells while keeping the style ones.

## Other contributions

- **Frameworks.** Route detection lives in `skills/phyll/scripts/lib/structure.mjs`, with tests in `tests/structure.test.mjs`.
- **The connector.** `packages/connector` holds the commands and the MCP server. Its tests talk to a small fake engine in `tests/engine-for-tests.mjs`.
- **Fix patterns and report languages.** They live in the engine. Open an issue with the pattern or the translation and an example.
- **Bugs.** Open an issue with the command you ran, your agent and operating system, and what you expected.

## Writing style

Phyll's prose follows the same rules it asks of reports: plain words, the end user as the subject, one idea per sentence, and no filler. Markdown in this repository does not use em or en dashes as punctuation, and a test checks it. Use a period, a comma, a colon or parentheses instead.

## Pull requests

- Keep each pull request to one change: a tell, a fix, a feature.
- Run `npm test` before you push.
- Say what the change does for people who use Phyll, with an example when you can.
- Be kind in issues and reviews. We are all here to make software easier to use.
