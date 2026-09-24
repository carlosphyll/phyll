// The GitHub Action: a scan in CI with the index in the job summary and an optional limit.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readText, ROOT } from "./helpers.mjs";
import { run, summaryMarkdown } from "../scripts/github-action.mjs";

function runIn(path, failAbove = "") {
  const dir = mkdtempSync(join(tmpdir(), "phyll-action-"));
  const env = { PHYLL_PATH: join(ROOT, path), PHYLL_FAIL_ABOVE: failAbove, GITHUB_STEP_SUMMARY: join(dir, "summary.md"), GITHUB_OUTPUT: join(dir, "output") };
  writeFileSync(env.GITHUB_STEP_SUMMARY, "");
  writeFileSync(env.GITHUB_OUTPUT, "");
  const printed = [];
  const code = run({ env, write: (s) => printed.push(s) });
  return { code, printed: printed.join(""), summary: readFileSync(env.GITHUB_STEP_SUMMARY, "utf8"), output: readFileSync(env.GITHUB_OUTPUT, "utf8") };
}

test("the summary gives the index and the tells that get in the way, heaviest first", () => {
  const { code, summary, output } = runIn("examples/booking/before");
  assert.equal(code, 0);
  assert.match(summary, /AI tell index: \*\*\d+\/100\*\*/);
  assert.match(summary, /\| Tell \| Hits \| First place \|/);
  assert.match(summary, /\| F05 Sign-up or setup before the first result \| \d+ \| `src\/pages\/Signup\.jsx:\d+` \|/);
  assert.match(summary, /Style notes, left as they are: .*L0/);
  assert.match(output, /^index=\d+\nstyle-index=\d+\n$/);
});

test("the job fails above the limit and passes below it", () => {
  const before = runIn("examples/booking/before", "40");
  assert.equal(before.code, 1);
  assert.match(before.printed, /::error::The AI tell index is \d+, above the limit of 40\./);
  assert.equal(runIn("examples/booking/after", "40").code, 0);
  assert.equal(runIn("examples/booking/before", "many").code, 2);
});

test("a clean source says so instead of printing an empty table", () => {
  const text = summaryMarkdown({ staticIndex: 0, styleIndex: 0, tells: [] }, { path: ".", failAbove: null });
  assert.match(text, /found no tell that gets in the way of use/);
  assert.doesNotMatch(text, /\| Tell \|/);
});

test("the action passes its inputs through the environment, never into the shell command", () => {
  const yaml = readText("action.yml");
  assert.match(yaml, /PHYLL_PATH: \$\{\{ inputs\.path \}\}/);
  assert.match(yaml, /run: node "\$GITHUB_ACTION_PATH\/scripts\/github-action\.mjs"/);
  assert.doesNotMatch(yaml.split("run:")[1], /\$\{\{/);
});
