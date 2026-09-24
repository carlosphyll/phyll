# phyll

UX review for apps built with AI, inside the agent you already use.

Phyll plugs into Codex, Claude Code or any agent that speaks MCP. Your agent opens your app the way a first-time user would, walks the core jobs in a real browser, and writes a report of what gets in the way: forms that ask for more than the job needs, sign-up walls, dead buttons, text too faint to read. The fixes keep your design.

The AI work runs in your agent, on your own plan. This package adds the browser, the page probe, the source scanner and the link to Phyll's engine, which sends the review method, checks the report and keeps it with a link.

## Start

```bash
npx phyll signup you@example.com
npx phyll setup codex        # or: npx phyll setup claude
```

Then ask your agent: "review my app at http://localhost:3000".

`setup` registers the connector in Codex's `config.toml` or with `claude mcp add`, and installs the Chromium build it uses. You need Node 20 or newer.

Your reports, keys and plan are also on the site: `npx phyll account` opens your account there, already signed in. If you lose the key, sign in at [agentphyll.com/login](https://agentphyll.com/login) with your email and create a new one.

## Commands

| Command | What it does |
| --- | --- |
| `signup <email>` | Create a free account, with 5 full reviews. The key is saved in `~/.phyll` |
| `login <key>` | Use an account you already have on this computer |
| `setup codex` or `setup claude` | Connect Phyll to your agent and install the browser |
| `status` | Your plan and the reviews left |
| `account` | Open your account on agentphyll.com, already signed in: reports, usage, keys and plan |
| `pro` | Subscribe to Phyll Pro, R$ 9 a month, with unlimited reviews |
| `billing` | Change the card or cancel Phyll Pro |
| `scan [folder]` | Scan the source for AI tells, with no account and no AI |
| `mcp` | Run the connector for your agent; `setup` registers it for you |
| `logout` | Forget the key on this computer |

## The tools your agent gets

`start_review` scans the project, creates the report folder and returns the method. `capture` saves a screenshot and the page probe of each route at laptop and phone size. `open`, `snapshot`, `click`, `fill`, `select`, `check`, `press`, `back`, `screenshot`, `probe` and `resize` drive the browser, which stays on your app. `guide` returns a part of the method, `finish_review` sends the report to the engine and writes `report.md`, and `scan`, `account` and `upgrade` do what their names say.

## What leaves your computer

Your source code, your screenshots and your agent's conversation stay on your computer. When a review starts, the connector sends the app's address, the project name and a summary of the scan: which tells it found, how many times, and the paths of routes and forms. When it ends, it sends the report your agent wrote, which the engine keeps so the link works.

## More

The scanner, the plugin and four example apps are in the [repository](https://github.com/carlosphyll/phyll). MIT license.
