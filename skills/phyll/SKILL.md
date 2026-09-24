---
name: phyll
description: Reviews and improves the UX of apps built with AI coding tools while keeping their visual design. Walks the app the way a first-time user would, with screenshots, page measurements and click paths as evidence, finds overcoding (functions that ask for more fields, steps and screens than their goal needs) and the code-shaped flows generated apps share, and applies the fixes when asked. Use when someone asks to review, audit, critique or improve the UX, usability, onboarding or flows of an app, especially one built with Claude Code, Codex, Cursor, Lovable, v0 or Bolt, or says it looks like AI, feels overbuilt or is confusing. Works through the Phyll connector, an MCP server with a browser and the review engine.
license: MIT
metadata:
  version: "0.4.0"
  homepage: https://github.com/carlosphyll/phyll
---

# Phyll

Phyll reviews an app the way its end user meets it and says what to change so each job reaches its goal with less effort. You do the review. Phyll's connector gives you the tools: a browser that stays on the app, a probe that measures the page, a scanner for the source, and the engine, which sends the review method, checks the report and keeps it with a link.

## The tools

The connector is an MCP server named phyll, with the tools start_review, capture, open, snapshot, click, fill, select, check, press, back, screenshot, probe, resize, guide, finish_review, scan, account and upgrade.

If they are not available, the connector is not installed yet. Ask the person to run these in a terminal and then restart the agent:

```bash
npx phyll setup codex     # or: npx phyll setup claude
npx phyll signup their@email.com
```

The static scan needs no account and no connector: `scripts/scan.mjs` in this skill's folder reads a project's source and gives the AI tell index, with the catalog in `data/tells.json`.

## Review

1. Find where the app runs: the address the person gave, `entryUrl` in `.phyll/config.json`, or the project's dev script, which you start when it is not running.
2. Call start_review with that address and the language the person writes in. Add the end user and the core jobs when the person named them.
3. Follow the method it returns, step by step. It says when to capture, how to walk each job, which guides to read and how to write report.json.
4. Call finish_review. Then tell the person the AI tell index, the three findings that block people most, where the report is, and that you can apply the fixes.

## Fix

Only when the person asks. Call guide with the name fixing and follow it: keep the design, fix one finding at a time and check each fix in the browser.

## Free reviews

A free account has 5 full reviews. When they run out, start_review answers with a link to Phyll Pro. Pass it on to the person as it is.
