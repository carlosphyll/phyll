import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { makeTree } from "./helpers.mjs";
import { walk } from "../skills/phyll/scripts/lib/files.mjs";
import {
  analyzeStructure,
  detectFramework,
  detectTheme,
  findForms,
  findModals,
  findRoutes,
} from "../skills/phyll/scripts/lib/structure.mjs";

const read = (f) => readFileSync(f.abs, "utf8");
const pkg = (deps) => JSON.stringify({ dependencies: deps });

function routesOf(root) {
  const { files } = walk(root);
  return findRoutes(files, detectFramework(root), read).map((r) => r.path);
}

test("Next.js app and pages routers", () => {
  const root = makeTree({
    "package.json": pkg({ next: "15.0.0", react: "19.0.0" }),
    "app/page.tsx": "export default function Page() {}",
    "app/(marketing)/about/page.tsx": "x",
    "app/flows/[id]/page.tsx": "x",
    "app/api/users/route.ts": "x",
    "pages/legacy.tsx": "x",
    "pages/_app.tsx": "x",
    "pages/api/hello.ts": "x",
  });
  assert.equal(detectFramework(root), "next");
  assert.deepEqual(routesOf(root), ["/", "/about", "/flows/[id]", "/legacy"]);
});

test("React Router in JSX and in route objects", () => {
  const root = makeTree({
    "package.json": pkg({ react: "19.0.0", "react-router-dom": "7.0.0" }),
    "src/App.jsx": [
      'import { Routes, Route } from "react-router-dom";',
      "export default function App() {",
      "  return (<Routes>",
      '    <Route path="/" element={<Home />} />',
      '    <Route path="/flows" element={<Flows />} />',
      '    <Route path="settings" element={<Settings />} />',
      '    <Route path="*" element={<NotFound />} />',
      "  </Routes>);",
      "}",
    ].join("\n"),
    "src/router.js": 'import { createBrowserRouter } from "react-router-dom";\nexport const router = createBrowserRouter([{ path: "/contacts", element: null }]);',
  });
  assert.equal(detectFramework(root), "react-router");
  assert.deepEqual(routesOf(root), ["*", "/", "/contacts", "/flows", "/settings"]);

  const { files } = walk(root);
  const structure = analyzeStructure(root, files, read);
  assert.equal(structure.routes.find((r) => r.path === "/settings").relative, true);
  assert.equal(structure.routes.find((r) => r.path === "/flows").relative, undefined);
  assert.ok(structure.notes.some((n) => n.includes("relative to a parent route")));
});

test("absolute route paths do not trigger the relative-path note", () => {
  const root = makeTree({
    "package.json": pkg({ react: "19.0.0", "react-router-dom": "7.0.0" }),
    "src/App.jsx": 'import { Route } from "react-router-dom";\n<Route path="/" />\n<Route path="/flows" />',
  });
  const { files } = walk(root);
  assert.deepEqual(analyzeStructure(root, files, read).notes, []);
});

test("Vue Router", () => {
  const root = makeTree({
    "package.json": pkg({ vue: "3.5.0", "vue-router": "4.4.0" }),
    "src/router/index.js": "import { createRouter } from 'vue-router';\nconst routes = [{ path: '/', component: Home }, { path: '/about', component: About }];",
  });
  assert.equal(detectFramework(root), "vue");
  assert.deepEqual(routesOf(root), ["/", "/about"]);
});

test("SvelteKit, Astro and Nuxt file routes", () => {
  const svelte = makeTree({
    "package.json": pkg({ "@sveltejs/kit": "2.0.0" }),
    "src/routes/+page.svelte": "<h1>Home</h1>",
    "src/routes/blog/[slug]/+page.svelte": "x",
    "src/routes/(app)/settings/+page.svelte": "x",
  });
  assert.equal(detectFramework(svelte), "sveltekit");
  assert.deepEqual(routesOf(svelte), ["/", "/blog/[slug]", "/settings"]);

  const astro = makeTree({
    "package.json": pkg({ astro: "5.0.0" }),
    "src/pages/index.astro": "x",
    "src/pages/blog.mdx": "x",
    "src/pages/docs/intro.mdx": "x",
  });
  assert.equal(detectFramework(astro), "astro");
  assert.deepEqual(routesOf(astro), ["/", "/blog", "/docs/intro"]);

  const nuxt = makeTree({
    "package.json": pkg({ nuxt: "3.0.0" }),
    "pages/index.vue": "x",
    "pages/users/[id].vue": "x",
  });
  assert.equal(detectFramework(nuxt), "nuxt");
  assert.deepEqual(routesOf(nuxt), ["/", "/users/[id]"]);
});

test("plain HTML sites use their file paths as routes", () => {
  const root = makeTree({
    "index.html": "<h1>Home</h1>",
    "about.html": "x",
    "docs/index.html": "x",
  });
  assert.equal(detectFramework(root), "html");
  assert.deepEqual(routesOf(root), ["/", "/about.html", "/docs/"]);
});

test("the nearest package.json above the scanned folder is used", () => {
  const root = makeTree({
    "package.json": pkg({ react: "19.0.0", "react-router-dom": "7.0.0" }),
    "before/src/App.jsx": 'import { Route } from "react-router-dom";\n<Route path="/x" />',
  });
  assert.equal(detectFramework(join(root, "before")), "react-router");
});

test("forms count real fields and ignore hidden and submit inputs", () => {
  const root = makeTree({
    "src/NewFlow.jsx": [
      "<form onSubmit={save}>",
      '  <input name="a" />',
      '  <input type="hidden" name="csrf" />',
      '  <Input name="b" />',
      '  <select name="c"></select>',
      '  <textarea name="d" />',
      "  <Select><SelectTrigger /></Select>",
      "  <Checkbox />",
      "  <Switch />",
      "  <RadioGroup />",
      '  <input type="submit" value="Save" />',
      "</form>",
    ].join("\n"),
    "src/Settings.jsx": Array.from({ length: 5 }, (_, i) => `<input name="f${i}" />`).join("\n"),
    "src/Small.jsx": '<input name="q" />\n<input name="r" />',
  });
  const { files } = walk(root);
  const forms = findForms(files, read);
  assert.deepEqual(forms, [
    { file: "src/NewFlow.jsx", line: 1, fields: 8, implicit: false },
    { file: "src/Settings.jsx", line: 1, fields: 5, implicit: true },
  ]);
});

test("fields behind a closed <details> are deferred, not asked up front", () => {
  const root = makeTree({
    "src/Quote.jsx": [
      "<form>",
      '  <input name="client" />',
      '  <input name="item" />',
      '  <input name="price" />',
      "  <details>",
      "    <summary>More options</summary>",
      '    <select name="valid"></select>',
      '    <input name="payment" />',
      '    <textarea name="notes" />',
      "  </details>",
      "  <details open>",
      '    <input name="shown" />',
      "  </details>",
      "</form>",
    ].join("\n"),
  });
  const { files } = walk(root);
  assert.deepEqual(findForms(files, read), [{ file: "src/Quote.jsx", line: 1, fields: 4, deferred: 3, implicit: false }]);
});

test("a radio group is one question, and fields labeled optional are offered, not asked", () => {
  const root = makeTree({
    "src/Order.jsx": [
      "<form>",
      '  <input type="radio" name="delivery" value="entrega" />',
      '  <input type="radio" name="delivery" value="retirada" />',
      '  <label htmlFor="address">Endereço</label> <input id="address" />',
      '  <label htmlFor="complement">Complemento (opcional)</label> <input id="complement" />',
      '  <input id="name" />',
      '  <input type="radio" name="payment" value="pix" />',
      '  <input type="radio" name="payment" value="cartao" />',
      "</form>",
    ].join("\n"),
  });
  assert.deepEqual(findForms(walk(root).files, read), [{ file: "src/Order.jsx", line: 1, fields: 4, optional: 1, implicit: false }]);
});

test("modals count dialog components, showModal and role=dialog, once per dialog root", () => {
  const root = makeTree({
    "src/A.jsx": [
      "<Dialog open={open}>",
      '  <DialogContent role="dialog">x</DialogContent>',
      "</Dialog>",
      "<Dialog.Root><Dialog.Portal><Dialog.Content /></Dialog.Portal></Dialog.Root>",
    ].join("\n"),
    "src/B.jsx": "ref.current.showModal();\n<Modal isOpen />",
  });
  const { files } = walk(root);
  const modals = findModals(files, read);
  assert.equal(modals.count, 5);
  assert.deepEqual(modals.locations[0], { file: "src/A.jsx", line: 1, match: "<Dialog" });
});

test("hand-made modals count once: a fixed full-screen layer with a dark see-through backdrop", () => {
  const root = makeTree({
    "src/Menu.jsx": [
      '<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">',
      '  <div className="rounded-3xl bg-white p-8">Personalize</div>',
      "</div>",
      '<div className="bg-zinc-900/60 fixed inset-0" role="dialog">counted once</div>',
      '<div className="fixed inset-0 bg-black/40" onClick={close}>',
      '  <div role="dialog" aria-modal="true" className="rounded-2xl bg-white p-6">also counted once</div>',
      "</div>",
      '<div className="fixed bottom-6 right-6 bg-black/80">a toast, not a modal</div>',
      '<div className="fixed inset-0 -z-10 bg-orange-50">a page background</div>',
    ].join("\n"),
  });
  const modals = findModals(walk(root).files, read);
  assert.equal(modals.count, 3);
  assert.deepEqual(modals.locations[0], { file: "src/Menu.jsx", line: 1, match: "fixed inset-0 overlay" });
});

test("detectTheme tells dark interfaces from light ones", () => {
  const theme = (files) => {
    const root = makeTree(files);
    return detectTheme(walk(root).files, read);
  };
  assert.equal(theme({ "src/A.jsx": '<main className="bg-zinc-950"><div className="bg-white/5" /><select className="bg-zinc-900" /></main>' }), "dark");
  assert.equal(theme({ "src/A.jsx": '<main className="bg-gray-50"><div className="bg-white shadow" /><p className="dark:bg-gray-900" /></main>' }), "light");
  assert.equal(theme({ "index.html": '<html class="dark"><body></body></html>' }), "dark");
  assert.equal(theme({ "src/A.jsx": "<main />" }), "unknown");
});

test("analyzeStructure adds a note when no routes are found", () => {
  const root = makeTree({ "package.json": pkg({ react: "19.0.0" }), "src/App.jsx": "<main />" });
  const { files } = walk(root);
  const structure = analyzeStructure(root, files, read);
  assert.equal(structure.framework, "react");
  assert.deepEqual(structure.routes, []);
  assert.ok(structure.notes.some((n) => n.includes("No routes")));
});
