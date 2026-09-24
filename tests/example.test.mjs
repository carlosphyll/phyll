import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { loadAjv, readJson, ROOT } from "./helpers.mjs";
import { scan } from "../skills/phyll/scripts/scan.mjs";

// The report contract ships with the engine; the public repository checks only the evidence.
const VALIDATE = join(ROOT, "skills", "phyll", "scripts", "lib", "validate.mjs");
const SCHEMA = join(ROOT, "skills", "phyll", "schema", "report.schema.json");
const { validateReport } = existsSync(VALIDATE) ? await import(pathToFileURL(VALIDATE).href) : {};

const EXAMPLES = join(ROOT, "examples");
const catalog = readJson("skills/phyll/data/tells.json").tells;
const catalogIds = new Set(catalog.map((t) => t.id));
const sourceTells = catalog.filter((t) => t.detection !== "dynamic").map((t) => t.id);
const examples = readdirSync(EXAMPLES, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(EXAMPLES, d.name, "before")))
  .map((d) => d.name);

// Tells a fixed app must not keep: the overcoding, dead ends and broken states the review targets.
const MUST_GO = ["P05", "F01", "F02", "F05", "F06", "F07", "F11", "F12", "A05", "A07", "C02", "C05", "C06", "C07", "S01", "S03", "S04", "S05", "S06"];

test("there are several examples to learn from", () => {
  assert.ok(examples.length >= 1);
});

test("together, the before apps show every tell the scanner can detect", () => {
  const seen = new Set();
  for (const name of examples) {
    for (const t of scan(join(EXAMPLES, name, "before")).tells) if (t.hits > 0) seen.add(t.id);
  }
  const missing = sourceTells.filter((id) => !seen.has(id));
  assert.deepEqual(missing, [], "the before apps are the catalog's test bed; seed the missing tells in one of them");
});

for (const name of examples) {
  const beforeDir = join(EXAMPLES, name, "before");
  const afterDir = join(EXAMPLES, name, "after");

  test(`${name}: the after app keeps the design and cuts the function tells`, { skip: !existsSync(afterDir) }, () => {
    const before = scan(beforeDir);
    const after = scan(afterDir);
    assert.ok(before.staticIndex >= 40, `before static index ${before.staticIndex} should be 40 or more`);
    assert.ok(after.staticIndex <= 25, `after static index ${after.staticIndex} should be 25 or less`);
    // Keep the design: most visual traits of the before survive, and the style index barely moves.
    // Deleting screens that should not exist lowers hit counts, so the index gets some slack.
    const styleTraits = (result) => new Set(result.tells.filter((t) => t.kind === "style" && t.hits > 0).map((t) => t.id));
    const was = styleTraits(before);
    const still = [...was].filter((id) => styleTraits(after).has(id));
    assert.ok(still.length >= 0.8 * was.size, `only ${still.length} of ${was.size} style traits survived; the after app should keep the design`);
    assert.ok(Math.abs(before.styleIndex - after.styleIndex) <= 20, `style index moved from ${before.styleIndex} to ${after.styleIndex}; the after app should keep the design`);
    const kept = after.tells
      .filter((t) => t.hits > 0 && MUST_GO.includes(t.id))
      .map((t) => `${t.id} ${t.locations[0]?.file}:${t.locations[0]?.line}`);
    assert.deepEqual(kept, []);
  });

  const reportPath = join(EXAMPLES, name, "review", "report.json");
  test(`${name}: the review is a valid, built report whose evidence files exist`, { skip: !existsSync(reportPath) }, () => {
    const report = readJson(`examples/${name}/review/report.json`);
    if (existsSync(SCHEMA)) {
      const validate = loadAjv().compile(readJson("skills/phyll/schema/report.schema.json"));
      assert.ok(validate(report), JSON.stringify(validate.errors, null, 2));
    }
    if (validateReport) assert.deepEqual(validateReport(report, catalogIds).errors, []);
    assert.equal(typeof report.summary?.aiTellIndex, "number", "run report.mjs after editing the review");

    const dir = join(EXAMPLES, name, "review");
    const paths = new Set();
    for (const s of report.screens ?? []) for (const group of [s.screenshots, s.probe]) for (const p of Object.values(group ?? {})) paths.add(p);
    for (const f of report.findings) for (const e of f.evidence) for (const p of [e.screenshot, e.probe]) if (p) paths.add(p);
    for (const p of paths) assert.ok(existsSync(join(dir, ...p.split("/"))), `${p} is referenced but missing`);
    assert.ok(existsSync(join(dir, "report.md")));
  });
}
