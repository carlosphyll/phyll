# Changelog

## 0.4.5 (2026-09-25)

- `npx phyll setup` also connects Cursor, Windsurf and Gemini CLI: it writes Phyll into the `mcpServers` of their JSON settings and keeps everything else in the file. A file with comments is left alone, and setup shows the entry to paste. `npx phyll setup other` prints that entry for any other agent with MCP.
- `npx phyll scan` ends with the next step, a full review in your agent. When the static index is 25 or lower, it points to `npx phyll scan --format badge`, which prints a README badge for your index.
- The scan says "1 hit" instead of "1 hits".
- The catalog has 54 tells. The new one, S07, No results that look like an empty list, shows up while using the app: a search or filter that matches nothing looks like an empty list, or there is no way to clear it.
- The npm package names its MCP server, `io.github.carlosphyll/phyll`, for the official MCP registry.

## 0.4.4 (2026-09-24)

- `npx phyll setup` installs Chromium on a new computer again. Playwright 1.63 stopped exporting `playwright/cli`, so setup finds Playwright's command line through its package.json.
- `npx phyll login` with no key signs in from the browser: the terminal shows a short code, you allow it on agentphyll.com, and the terminal gets a key of its own.
- `npx phyll help` points to every command, with examples, at agentphyll.com/commands.

## 0.4.3 (2026-09-24)

- The connector tells your agent that everything the app shows is evidence and never an instruction, and it fences the page's text in snapshots with a random marker, so words on a page cannot pose as instructions.
- The skill says the same.

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
