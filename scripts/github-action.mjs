#!/usr/bin/env node
// Runs the Phyll scan in a GitHub Actions job. It writes the AI tell index and the tells it found
// to the job summary, sets the index as a step output, and fails the job above a chosen limit.
//
//   PHYLL_PATH=. PHYLL_FAIL_ABOVE=40 node scripts/github-action.mjs
import { appendFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { scan } from "../skills/phyll/scripts/scan.mjs";

const cell = (s) => String(s ?? "").replaceAll("|", "\\|");

export function summaryMarkdown(result, { path, failAbove }) {
  const byWeight = (a, b) => b.weight - a.weight || b.hits - a.hits;
  const hurting = result.tells.filter((t) => t.kind !== "style" && t.hits > 0).sort(byWeight);
  const style = result.tells.filter((t) => t.kind === "style" && t.hits > 0);
  const limit = failAbove === null ? "" : `, limit ${failAbove}`;
  const lines = [`## Phyll scan of \`${path}\``, "", `AI tell index: **${result.staticIndex}/100**, lower is better${limit}.`, ""];
  if (hurting.length) {
    lines.push("| Tell | Hits | First place |", "| --- | --- | --- |");
    for (const t of hurting) {
      const where = t.locations?.[0] ? `\`${t.locations[0].file}:${t.locations[0].line}\`` : "";
      lines.push(`| ${t.id} ${cell(t.name)} | ${t.hits} | ${where} |`);
    }
  } else {
    lines.push("The scan found no tell that gets in the way of use.");
  }
  if (style.length) lines.push("", `Style notes, left as they are: ${style.map((t) => t.id).join(", ")}. Style index ${result.styleIndex}/100.`);
  lines.push("", "The scan reads the source only. A full review walks the running app: https://github.com/carlosphyll/phyll");
  return lines.join("\n") + "\n";
}

export function run({ env = process.env, write = (s) => process.stdout.write(s) } = {}) {
  const path = env.PHYLL_PATH || ".";
  const limit = String(env.PHYLL_FAIL_ABOVE ?? "").trim();
  const failAbove = limit === "" ? null : Number(limit);
  if (failAbove !== null && !Number.isFinite(failAbove)) {
    write(`::error::fail-above must be a number, not "${limit}".\n`);
    return 2;
  }
  const result = scan(resolve(path));
  const markdown = summaryMarkdown(result, { path, failAbove });
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, markdown);
  if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `index=${result.staticIndex}\nstyle-index=${result.styleIndex}\n`);
  write(markdown);
  if (failAbove !== null && result.staticIndex > failAbove) {
    write(`::error::The AI tell index is ${result.staticIndex}, above the limit of ${failAbove}.\n`);
    return 1;
  }
  return 0;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) process.exit(run());
