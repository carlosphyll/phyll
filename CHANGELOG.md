# Changelog

## 0.4.2 (2026-09-24)

- `npx phyll account` opens your account on agentphyll.com, already signed in, with your reports, keys and plan. `npx phyll status` points to it.
- The README says what to do after losing a key: sign in on the site with your email and create a new one.

## 0.4.1 (2026-09-24)

- The connector's MCP server ends cleanly when your agent closes it. On Windows it used to stop with a libuv assertion.
- The `phyll` package carries the MIT license text.

## 0.4.0 (2026-09-24)

First public release.

- The `phyll` package: a connector that plugs Phyll into Codex, Claude Code or any agent that speaks MCP. The review runs in your agent, on your own plan, with Phyll's browser, probe and scanner, and Phyll's engine sends the method, checks the report and keeps it with a link.
- Commands to sign up, connect Codex or Claude Code, check the plan and subscribe to Phyll Pro.
- A scanner of AI tells in source code, with the catalog of 53 tells as data and tested detectors, as a command and as a GitHub Action.
- The Claude Code plugin, with `/phyll:review`, `/phyll:fix` and `/phyll:scan`.
- Four example apps in two versions each, with their reviews and side-by-side screenshots.
