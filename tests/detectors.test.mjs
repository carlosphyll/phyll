import { test } from "node:test";
import assert from "node:assert/strict";
import {
  compileDetector,
  extractClassLists,
  lineAt,
  runTells,
} from "../skills/phyll/scripts/lib/detectors.mjs";

test("lineAt counts lines from 1", () => {
  const text = "a\nb\nc";
  assert.equal(lineAt(text, 0), 1);
  assert.equal(lineAt(text, 2), 2);
  assert.equal(lineAt(text, 4), 3);
});

test("extractClassLists reads attributes, cn() calls, template literals and @apply", () => {
  const src = [
    '<div className="rounded-2xl shadow-lg p-4">',
    "<p class='text-center'>",
    '<a className={cn("px-2", active && "bg-violet-600")}>',
    '<b className={`flex ${open ? "gap-2" : ""} items-center`}>',
    'const card = clsx("rounded-xl", "shadow");',
    ".card { @apply border rounded-lg; }",
  ].join("\n");
  const lists = extractClassLists(src).map((l) => l.classes.join(" "));
  assert.deepEqual(lists, [
    "rounded-2xl shadow-lg p-4",
    "text-center",
    "px-2 bg-violet-600",
    "flex gap-2 items-center",
    "rounded-xl shadow",
    "border rounded-lg",
  ]);
});

test("a cn() call inside className is counted once", () => {
  const lists = extractClassLists('<a className={cn("rounded-xl shadow")} />');
  assert.equal(lists.length, 1);
});

test("loose string literals that look like utility classes are read", () => {
  const src = 'const card = "rounded-2xl shadow-lg border";\nconst label = "No data yet";';
  const lists = extractClassLists(src).map((l) => l.classes.join(" "));
  assert.deepEqual(lists, ["rounded-2xl shadow-lg border"]);
});

test("classCombo needs every pattern and rejects excluded tokens", () => {
  const det = compileDetector({
    kind: "classCombo",
    all: ["(^|:)outline-none$"],
    none: ["focus(-visible)?:ring"],
  });
  const src = '<input className="outline-none" /><input className="outline-none focus-visible:ring-2" />';
  assert.equal(det.run(src, extractClassLists(src)).length, 1);
});

test("classCombo patterns can allow responsive variants", () => {
  const det = compileDetector({ kind: "classCombo", all: ["(^|:)grid-cols-3$"] });
  const src = '<section className="grid md:grid-cols-3 gap-6">';
  assert.equal(det.run(src, extractClassLists(src)).length, 1);
});

test("phrase ignores case, spacing and typographic apostrophes, and respects Unicode word edges", () => {
  const det = compileDetector({ kind: "phrase", phrases: ["começar", "get started", "here's what's happening"] });
  assert.equal(det.run("<button>Começar agora</button> <b>GET   STARTED</b>").length, 2);
  const apostrophe = String.fromCharCode(0x2019);
  assert.equal(det.run(`Here${apostrophe}s what${apostrophe}s happening today`).length, 1);
  assert.equal(det.run("recomeçar").length, 0);
});

test("regex detectors always search globally", () => {
  const det = compileDetector({ kind: "regex", pattern: 'href="#"' });
  assert.equal(det.run('<a href="#">a</a><a href="#">b</a>').length, 2);
});

test("runTells counts every hit but keeps ten locations with line numbers", () => {
  const tells = [{ id: "L02", detectors: [{ kind: "regex", pattern: "bg-clip-text" }] }];
  const text = Array.from({ length: 12 }, () => '<h1 className="bg-clip-text">x</h1>').join("\n");
  const [result] = runTells(tells, [{ rel: "a.jsx", category: "markup" }], () => text);
  assert.equal(result.hits, 12);
  assert.equal(result.locations.length, 10);
  assert.deepEqual(result.locations[1], { file: "a.jsx", line: 2, match: "bg-clip-text" });
});

test("the in field limits a detector to some file categories", () => {
  const tells = [{ id: "L03", detectors: [{ kind: "regex", pattern: "backdrop-filter", in: ["style"] }] }];
  const files = [
    { rel: "a.jsx", category: "markup" },
    { rel: "a.css", category: "style" },
  ];
  const [result] = runTells(tells, files, () => "backdrop-filter: blur(8px);");
  assert.equal(result.hits, 1);
  assert.equal(result.locations[0].file, "a.css");
});

test("a detector marked skipIf darkTheme stays quiet on a dark interface", () => {
  const tells = [{ id: "L12", detectors: [{ kind: "regex", pattern: "text-zinc-400", skipIf: ["darkTheme"] }] }];
  const files = [{ rel: "a.jsx", category: "markup" }];
  const text = '<p className="text-zinc-400">Rua das Flores, 120</p>';
  assert.equal(runTells(tells, files, () => text, { theme: "dark" })[0].hits, 0);
  assert.equal(runTells(tells, files, () => text, { theme: "light" })[0].hits, 1);
  assert.equal(runTells(tells, files, () => text, null)[0].hits, 1);
});

test("metric detectors read forms and modals from the structure", () => {
  const tells = [
    { id: "F02", detectors: [{ kind: "metric", metric: "longForms", min: 7 }] },
    { id: "F03", detectors: [{ kind: "metric", metric: "modals" }] },
  ];
  const structure = {
    forms: [
      { file: "a.jsx", line: 3, fields: 9 },
      { file: "b.jsx", line: 1, fields: 2 },
    ],
    modals: {
      count: 2,
      locations: [
        { file: "a.jsx", line: 5, match: "<Dialog" },
        { file: "c.jsx", line: 9, match: "<Modal" },
      ],
    },
  };
  const results = runTells(tells, [], () => "", structure);
  assert.equal(results.find((r) => r.id === "F02").hits, 1);
  assert.equal(results.find((r) => r.id === "F02").locations[0].match, "form with 9 fields");
  assert.equal(results.find((r) => r.id === "F03").hits, 2);
});
