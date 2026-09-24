# Guide for agents working on Phyll

This repository holds the open parts of Phyll: the connector (the `phyll` package on npm), the scanner and its catalog data, the Claude Code plugin, the GitHub Action and the example apps. The review method and the engine run on Phyll's server and are not here.

## Layout

- `packages/connector/` is the `phyll` package. `src/cli.mjs` has the commands, `src/mcp.mjs` the MCP tools, `src/review.mjs` what the tools do and `src/browser.mjs` the browser session. It depends on the MCP SDK, Playwright and zod, and packs a copy of the scanner made by `scripts/copy-scanner.mjs`.
- `skills/phyll/` is the skill agents load (`SKILL.md`), the scanner (`scripts/scan.mjs` and `scripts/lib/`), the probe (`scripts/probe.js`), the capture helpers and the catalog as data (`data/tells.json`).
- `.claude-plugin/`, `.mcp.json`, `agents/` and `commands/` make the repository a Claude Code plugin and marketplace.
- `action.yml` and `scripts/github-action.mjs` make the repository a GitHub Action that runs the scan in CI.
- `examples/` holds four example apps. Each has a `before/` and an `after/` version, a committed review of the before version and side-by-side screenshots. They share one package, `examples/package.json`.
- `tests/` runs with `node --test`. The connector tests talk to a small fake engine in `tests/engine-for-tests.mjs`.

## Commands

```bash
npm install && npm test                    # Node 22 or newer
(cd packages/connector && npm install)     # once, for the connector's dependencies
node skills/phyll/scripts/scan.mjs <dir> --format text
node packages/connector/bin/phyll.mjs --help
(cd examples && npm install)               # once, for the example apps
npm --prefix examples run dev:booking-before   # dev:<dm|booking|quote|menu>-<before|after>
```

Install inside `examples/` and `packages/connector/`. Run from the root, `npm install --prefix <folder>` adds the root package to that folder's dependencies.

## Rules

- Every tell with a source detector has `examples.hit` and `examples.miss`, and the tests run them.
- Together, the example `before/` apps must show every source tell. When you add one, seed it in one of them.
- An example `after/` app keeps the design of its `before/` app: at least 80% of the style tells stay, and the style index moves by 20 points or less. Tests enforce both numbers.
- Scripts in `skills/phyll/scripts` use only Node built-ins.
- While the connector runs as an MCP server, nothing may write to stdout: that stream belongs to the protocol.
- The version lives in `skills/phyll/scripts/lib/version.mjs`, `package.json`, `packages/connector/package.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `skills/phyll/data/tells.json` and the `SKILL.md` metadata. A test fails if they differ.
- A tag such as `v0.4.2` that matches the version publishes the `phyll` package: `.github/workflows/publish.yml` runs the tests and publishes with npm trusted publishing, so no token is kept anywhere.
- Markdown prose never uses em or en dashes as punctuation; a test enforces it. Follow the writing rules in `CONTRIBUTING.md`.
