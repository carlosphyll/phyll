import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { makeTree, SKILL } from "./helpers.mjs";
import { displayRoot, scan } from "../skills/phyll/scripts/scan.mjs";

const SCAN = join(SKILL, "scripts", "scan.mjs");

const base = { severity: "minor", summary: "test tell" };
const tells = [
  { ...base, id: "L01", name: "Purple", dimension: "look", weight: 2, cap: 3, detection: "static", detectors: [{ kind: "classCombo", all: ["(^|:)from-purple-\\d+$", "(^|:)to-blue-\\d+$"] }] },
  { ...base, id: "C01", name: "Phrases", dimension: "copy", weight: 2, cap: 3, detection: "static", detectors: [{ kind: "phrase", phrases: ["supercharge"] }] },
  { ...base, id: "F01", name: "Dead links", dimension: "flow", weight: 3, cap: 3, detection: "static", detectors: [{ kind: "regex", pattern: 'href="#"' }] },
  { ...base, id: "S05", name: "Fixed widths", dimension: "states", weight: 2, cap: 1, detection: "both", detectors: [{ kind: "regex", pattern: "min-w-\\[\\d{3,}px\\]" }] },
  { ...base, id: "P01", name: "First screen", dimension: "purpose", weight: 3, cap: 1, detection: "dynamic" },
];

const root = makeTree({
  "package.json": JSON.stringify({ dependencies: { react: "19.0.0", "react-router-dom": "7.0.0" } }),
  "src/Hero.jsx": [
    '<section className="bg-gradient-to-r from-purple-600 to-blue-500">',
    "  <h1>Supercharge your sales</h1>",
    '  <a href="#">Learn more</a>',
    "</section>",
  ].join("\n"),
  "src/components/ui/card.tsx": '<div className="from-purple-600 to-blue-500" />',
  "node_modules/x/index.jsx": '<div className="from-purple-600 to-blue-500" />',
  "src/App.jsx": 'import { Route } from "react-router-dom";\n<Route path="/" element={<Hero />} />',
});

test("scan reports hits, structure and a static index", () => {
  const result = scan(root, { tells });
  const hits = Object.fromEntries(result.tells.map((t) => [t.id, t.hits]));
  assert.deepEqual(hits, { L01: 1, C01: 1, F01: 1, S05: 0 });
  // (2/3 * 2 + 1/3 * 2 + 1/3 * 3 + 0) / (2 + 2 + 3 + 2) = 0.259
  assert.equal(result.staticIndex, 26);
  assert.deepEqual(result.files, { scanned: 2, ignored: 1 });
  assert.deepEqual(result.structure.routes.map((r) => r.path), ["/"]);
  assert.equal(result.tool.name, "phyll");
  assert.deepEqual(result.tells.find((t) => t.id === "F01").locations[0], {
    file: "src/Hero.jsx",
    line: 3,
    match: 'href="#"',
  });
});

test("scan output never carries the absolute path of the scanned folder", () => {
  assert.equal(displayRoot(join(root, "src"), root), "src");
  assert.equal(displayRoot(root, root), ".");
  assert.equal(displayRoot(join(root, "src"), join(root, "elsewhere")), "src");
  assert.ok(!scan(root, { tells }).root.includes(root));
});

test("the CLI prints a text summary", () => {
  const run = spawnSync(process.execPath, [SCAN, root, "--format", "text"], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /Static AI tell index: \d+\/100/);
  assert.match(run.stdout, /Routes: \//);
});

test("the CLI writes JSON with --out", () => {
  const out = join(root, ".phyll", "scan.json");
  const run = spawnSync(process.execPath, [SCAN, root, "--out", out], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const json = JSON.parse(readFileSync(out, "utf8"));
  assert.equal(typeof json.staticIndex, "number");
  assert.ok(Array.isArray(json.tells));
  assert.match(run.stdout, /Wrote/);
});

test("the CLI reads ignore globs from .phyll/config.json", () => {
  const project = makeTree({
    ".phyll/config.json": JSON.stringify({ ignore: ["src/legacy/**"] }),
    "src/legacy/Old.jsx": "<a href=\"#\">old</a>",
    "src/New.jsx": "<main />",
  });
  const run = spawnSync(process.execPath, [SCAN, project], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  const json = JSON.parse(run.stdout);
  assert.deepEqual(json.files, { scanned: 1, ignored: 1 });
});

test("the CLI fails clearly on a missing folder", () => {
  const run = spawnSync(process.execPath, [SCAN, join(root, "nope")], { encoding: "utf8" });
  assert.equal(run.status, 2);
  assert.match(run.stderr, /not a folder/);
});
