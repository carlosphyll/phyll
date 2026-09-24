import { test } from "node:test";
import assert from "node:assert/strict";
import { extname } from "node:path";
import { readJson, loadAjv } from "./helpers.mjs";
import { VERSION } from "../skills/phyll/scripts/lib/version.mjs";
import { runTells } from "../skills/phyll/scripts/lib/detectors.mjs";
import { CATEGORY_BY_EXT } from "../skills/phyll/scripts/lib/files.mjs";

const data = readJson("skills/phyll/data/tells.json");
const schema = readJson("skills/phyll/schema/tells.schema.json");
const PREFIX = { purpose: "P", flow: "F", actions: "A", look: "L", copy: "C", states: "S" };

test("tells.json validates against its schema", () => {
  const validate = loadAjv().compile(schema);
  assert.ok(validate(data), JSON.stringify(validate.errors, null, 2));
});

test("tell ids are unique and their letter matches the dimension", () => {
  const seen = new Set();
  for (const t of data.tells) {
    assert.ok(!seen.has(t.id), `duplicate id ${t.id}`);
    seen.add(t.id);
    assert.equal(t.id[0], PREFIX[t.dimension], `${t.id} is filed under ${t.dimension}`);
  }
});

test("detectors match the detection method", () => {
  for (const t of data.tells) {
    const n = (t.detectors ?? []).length;
    if (t.detection === "dynamic") assert.equal(n, 0, `${t.id} is dynamic but has detectors`);
    else assert.ok(n > 0, `${t.id} is ${t.detection} but has no detectors`);
  }
});

test("every detector pattern compiles as a Unicode regular expression", () => {
  for (const t of data.tells) {
    for (const d of t.detectors ?? []) {
      const patterns = d.kind === "regex" ? [d.pattern]
        : d.kind === "classCombo" ? [...d.all, ...(d.none ?? [])]
        : [];
      for (const p of patterns) assert.doesNotThrow(() => new RegExp(p, "u"), `${t.id}: ${p}`);
    }
  }
});

test("tells.json version matches the tool version", () => {
  assert.equal(data.version, VERSION);
});

const hasSourceDetector = (t) => (t.detectors ?? []).some((d) => d.kind !== "metric");

function hitsFor(tell, example) {
  const { code, file } = typeof example === "string" ? { code: example, file: "example.jsx" } : example;
  const category = CATEGORY_BY_EXT[extname(file)];
  const [result] = runTells([tell], [{ rel: file, category }], () => code);
  return result.hits;
}

test("every tell with a source detector ships examples", () => {
  for (const t of data.tells.filter(hasSourceDetector)) {
    assert.ok(t.examples, `${t.id} needs examples.hit and examples.miss`);
  }
});

for (const tell of data.tells.filter((t) => t.examples)) {
  test(`${tell.id} detectors catch their hit examples and skip their miss examples`, () => {
    for (const example of tell.examples.hit) {
      assert.ok(hitsFor(tell, example) > 0, `${tell.id} should match: ${JSON.stringify(example)}`);
    }
    for (const example of tell.examples.miss) {
      assert.equal(hitsFor(tell, example), 0, `${tell.id} should not match: ${JSON.stringify(example)}`);
    }
  });
}
