import { test } from "node:test";
import assert from "node:assert/strict";
import { makeTree } from "./helpers.mjs";
import { CATEGORY_BY_EXT, globToRegExp, walk } from "../skills/phyll/scripts/lib/files.mjs";

const tree = makeTree({
  "src/App.jsx": "export default function App() { return <main /> }",
  "src/util.ts": "export const x = 1;",
  "src/styles.css": "body { margin: 0 }",
  "src/logo.png": "not an image",
  "src/components/ui/button.tsx": "shadcn primitive",
  "src/App.test.jsx": "test file",
  "node_modules/pkg/index.jsx": "dependency",
  "dist/bundle.js": "build output",
  ".next/page.js": "framework output",
  "legacy/Old.jsx": "old code",
  "src/big.js": "x".repeat(300),
});

test("walk returns UI source files with categories and forward-slash paths", () => {
  const { files } = walk(tree, { maxBytes: 200 });
  assert.deepEqual(
    files.map((f) => [f.rel, f.category]),
    [
      ["legacy/Old.jsx", "markup"],
      ["src/App.jsx", "markup"],
      ["src/styles.css", "style"],
      ["src/util.ts", "script"],
    ],
  );
  for (const f of files) assert.ok(!f.rel.includes("\\"), `${f.rel} should use forward slashes`);
});

test("user globs, default globs and the size limit count as ignored files", () => {
  const { files, ignored } = walk(tree, { ignore: ["legacy/**"], maxBytes: 200 });
  assert.ok(!files.some((f) => f.rel.startsWith("legacy/")));
  // components/ui/button.tsx, App.test.jsx, legacy/Old.jsx and big.js
  assert.equal(ignored, 4);
});

test("a plain folder name works as an ignore pattern", () => {
  const { files } = walk(tree, { ignore: ["legacy"] });
  assert.ok(!files.some((f) => f.rel.startsWith("legacy/")));
  assert.ok(files.some((f) => f.rel === "src/App.jsx"));
});

test("dependency and build folders are never entered", () => {
  const { files } = walk(tree);
  assert.ok(!files.some((f) => /node_modules|dist\/|\.next/.test(f.rel)));
});

test("globToRegExp handles **, * and ?", () => {
  assert.ok(globToRegExp("**/components/ui/**").test("src/components/ui/button.tsx"));
  assert.ok(globToRegExp("**/components/ui/**").test("components/ui/button.tsx"));
  assert.ok(globToRegExp("**/*.test.*").test("App.test.jsx"));
  assert.ok(globToRegExp("src/*.jsx").test("src/App.jsx"));
  assert.ok(!globToRegExp("src/*.jsx").test("src/pages/App.jsx"));
  assert.ok(globToRegExp("src/?.js").test("src/a.js"));
  assert.ok(!globToRegExp("src/?.js").test("src/ab.js"));
});

test("extensions map to markup, script and style", () => {
  assert.equal(CATEGORY_BY_EXT[".vue"], "markup");
  assert.equal(CATEGORY_BY_EXT[".tsx"], "markup");
  assert.equal(CATEGORY_BY_EXT[".mjs"], "script");
  assert.equal(CATEGORY_BY_EXT[".scss"], "style");
  assert.equal(CATEGORY_BY_EXT[".png"], undefined);
});
