import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { SKILL } from "./helpers.mjs";
import {
  loadPlaywright,
  parseCaptureArgs,
  routeSlug,
  staticRoutes,
  uniqueSlugs,
  VIEWPORTS,
} from "../skills/phyll/scripts/capture.mjs";

test("routeSlug turns routes into file names", () => {
  assert.equal(routeSlug("/"), "home");
  assert.equal(routeSlug(""), "home");
  assert.equal(routeSlug("/flows/new"), "flows-new");
  assert.equal(routeSlug("/about.html"), "about");
  assert.equal(routeSlug("/docs/"), "docs");
  assert.equal(routeSlug("/Search?q=1#top"), "search-q-1");
  assert.equal(routeSlug("/?tab=new"), "tab-new");
});

test("uniqueSlugs keeps query strings apart and numbers repeats", () => {
  assert.deepEqual(uniqueSlugs(["/new", "/new?template=link", "/flows", "/flows/"]), [
    "new",
    "new-template-link",
    "flows",
    "flows-2",
  ]);
});

test("staticRoutes drops routes with parameters, wildcards and groups", () => {
  assert.deepEqual(
    staticRoutes(["/", "/flows/:id", "/blog/[slug]", "*", "/settings", "/(group)", "/settings"]),
    ["/", "/settings"],
  );
});

test("parseCaptureArgs has sensible defaults", () => {
  const args = parseCaptureArgs(["--url", "http://localhost:5173", "--routes", "/, /flows", "--viewports", "mobile"]);
  assert.equal(args.url, "http://localhost:5173");
  assert.deepEqual(args.routes, ["/", "/flows"]);
  assert.deepEqual(args.viewports, ["mobile"]);
  assert.equal(args.probe, true);
  assert.equal(args.fullPage, true);
  assert.equal(args.wait, 800);
  assert.equal(args.maxHeight, 5000);
});

test("parseCaptureArgs adds missing leading slashes and skips paths rewritten by Git Bash", () => {
  const args = parseCaptureArgs(["--url", "http://x", "--routes", "dashboard,C:/Program Files/Git/,/flows"]);
  assert.deepEqual(args.routes, ["/dashboard", "/flows"]);
});

test("parseCaptureArgs needs a URL and known viewports", () => {
  assert.throws(() => parseCaptureArgs([]), /--url/);
  assert.throws(() => parseCaptureArgs(["--url", "http://x", "--viewports", "watch"]), /watch/);
  assert.equal(parseCaptureArgs(["--url", "http://x", "--no-probe"]).probe, false);
});

test("viewports cover a laptop and a phone", () => {
  assert.equal(VIEWPORTS.desktop.viewport.width, 1440);
  assert.equal(VIEWPORTS.mobile.viewport.width, 390);
  assert.equal(VIEWPORTS.mobile.hasTouch, true);
});

test("probe.js compiles as a single script", () => {
  const source = readFileSync(join(SKILL, "scripts", "probe.js"), "utf8");
  assert.doesNotThrow(() => new vm.Script(source, { filename: "probe.js" }));
  assert.match(source.trim(), /^\/\/[\s\S]*\(\(\) => \{[\s\S]*\}\)\(\)$/);
});

test("loadPlaywright returns a module with chromium or null, and never throws", async () => {
  const pw = await loadPlaywright(process.cwd());
  assert.ok(pw === null || typeof pw.chromium?.launch === "function");
});
