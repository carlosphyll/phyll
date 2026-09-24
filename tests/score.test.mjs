import { test } from "node:test";
import assert from "node:assert/strict";
import { computeIndex, kindOf, mergeEntries, staticEntries, strengthOf } from "../skills/phyll/scripts/lib/score.mjs";

const tells = new Map([
  ["A", { id: "A", weight: 2, cap: 4, detection: "static" }],
  ["B", { id: "B", weight: 1, cap: 1, detection: "static" }],
  ["C", { id: "C", weight: 3, cap: 2, detection: "both" }],
]);

test("an app with no tells scores 0", () => {
  const entries = [...tells.keys()].map((id) => ({ id, status: "absent" }));
  assert.equal(computeIndex(tells, entries), 0);
});

test("hits below the cap count in proportion", () => {
  const entries = [
    { id: "A", status: "present", hits: 2 },
    { id: "B", status: "absent" },
    { id: "C", status: "absent" },
  ];
  // 2 * (2/4) / (2 + 1 + 3) = 1/6
  assert.equal(computeIndex(tells, entries), 17);
});

test("hits above the cap saturate", () => {
  const entries = [
    { id: "A", status: "present", hits: 40 },
    { id: "B", status: "absent" },
    { id: "C", status: "absent" },
  ];
  assert.equal(computeIndex(tells, entries), 33);
});

test("unverified tells leave the index", () => {
  const entries = [
    { id: "A", status: "present", hits: 4 },
    { id: "B", status: "unverified" },
    { id: "C", status: "absent" },
  ];
  assert.equal(computeIndex(tells, entries), 40);
});

test("an explicit strength wins, and present without hits counts in full", () => {
  assert.equal(strengthOf(tells.get("C"), { id: "C", status: "present", strength: 0.25, hits: 9 }), 0.25);
  assert.equal(strengthOf(tells.get("C"), { id: "C", status: "present" }), 1);
  assert.equal(strengthOf(tells.get("C"), { id: "C", status: "absent", hits: 3 }), 0);
});

test("the kind filter scores function and style tells apart", () => {
  const byKind = new Map([
    ["F", { id: "F", weight: 2, cap: 1, kind: "function" }],
    ["S", { id: "S", weight: 1, cap: 1, kind: "style" }],
    ["D", { id: "D", weight: 2, cap: 1 }],
  ]);
  const entries = [
    { id: "F", status: "absent" },
    { id: "S", status: "present" },
    { id: "D", status: "present" },
  ];
  assert.equal(computeIndex(byKind, entries, "function"), 50, "a tell with no kind counts as function");
  assert.equal(computeIndex(byKind, entries, "style"), 100);
  assert.equal(computeIndex(byKind, entries), 60);
  assert.equal(kindOf({}), "function");
});

test("nothing to score gives null", () => {
  assert.equal(computeIndex(tells, []), null);
  assert.equal(computeIndex(tells, [{ id: "A", status: "unverified" }]), null);
});

test("staticEntries marks static and both tells present or absent from scan hits", () => {
  const list = [...tells.values(), { id: "D", weight: 2, cap: 1, detection: "dynamic" }];
  const entries = staticEntries(list, [
    { id: "A", hits: 3 },
    { id: "C", hits: 0 },
  ]);
  assert.deepEqual(entries, [
    { id: "A", status: "present", hits: 3, source: "static" },
    { id: "B", status: "absent", hits: 0, source: "static" },
    { id: "C", status: "absent", hits: 0, source: "static" },
  ]);
});

test("mergeEntries lets the reviewer override the scan by id", () => {
  const merged = mergeEntries(
    [
      { id: "A", status: "present", hits: 3, source: "static" },
      { id: "B", status: "absent", hits: 0, source: "static" },
    ],
    [
      { id: "A", status: "absent", note: "false positive: marketing site" },
      { id: "D", status: "present", evidence: ["S1"] },
    ],
  );
  assert.deepEqual(merged, [
    { id: "A", status: "absent", note: "false positive: marketing site" },
    { id: "B", status: "absent", hits: 0, source: "static" },
    { id: "D", status: "present", evidence: ["S1"] },
  ]);
});
