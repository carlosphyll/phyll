#!/usr/bin/env node
// Phyll capture: screenshots and probe measurements for each route, at desktop and phone sizes.
// Optional. Use it when the host agent has no browser tool, or to capture many screens at once.
// Needs Playwright in the reviewed project (npm i -D playwright && npx playwright install chromium).
//
//   node capture.mjs --url http://localhost:5173 [--routes "/,/flows"] [--scan scan.json]
//                    [--out dir] [--viewports desktop,mobile] [--no-probe] [--wait 800]
//                    [--max-height 5000] [--no-full-page]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { fail, isMain } from "./lib/cli.mjs";
import { NAME, VERSION } from "./lib/version.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

export const VIEWPORTS = Object.freeze({
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
});

// File name for a route. The query string stays in, so /new and /new?template=link do not collide.
export function routeSlug(route) {
  const [pathAndQuery] = String(route ?? "").split("#");
  const [path, query = ""] = pathAndQuery.split("?");
  const base = path.replace(/^\/+|\/+$/g, "").replace(/\.html?$/i, "");
  const slug = [base, query].filter(Boolean).join("-").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
  return slug || "home";
}

// Gives each route a unique slug, numbering repeats: flows, flows-2.
export function uniqueSlugs(routes) {
  const seen = new Map();
  return routes.map((route) => {
    const slug = routeSlug(route);
    const count = (seen.get(slug) ?? 0) + 1;
    seen.set(slug, count);
    return count === 1 ? slug : `${slug}-${count}`;
  });
}

// Routes the browser can open as they are: no :params, [params], wildcards or (groups).
export function staticRoutes(routes) {
  return [...new Set(routes.filter((r) => typeof r === "string" && r.startsWith("/") && !/[:*[\]()]/.test(r)))];
}

export function parseCaptureArgs(argv) {
  const { values } = parseArgs({
    args: argv,
    allowPositionals: false,
    options: {
      url: { type: "string" },
      routes: { type: "string" },
      scan: { type: "string" },
      out: { type: "string" },
      viewports: { type: "string", default: "desktop,mobile" },
      "no-probe": { type: "boolean", default: false },
      "no-full-page": { type: "boolean", default: false },
      wait: { type: "string", default: "800" },
      "max-height": { type: "string", default: "5000" },
    },
  });
  if (!values.url) throw new Error("--url is required, for example --url http://localhost:5173");
  const viewports = values.viewports.split(",").map((v) => v.trim()).filter(Boolean);
  for (const v of viewports) {
    if (!VIEWPORTS[v]) throw new Error(`unknown viewport ${v}; use ${Object.keys(VIEWPORTS).join(" or ")}`);
  }
  let routes = null;
  if (values.routes) {
    routes = [];
    for (const raw of values.routes.split(",").map((r) => r.trim()).filter(Boolean)) {
      // Git Bash on Windows rewrites arguments that start with "/" into Windows paths.
      if (/^[A-Za-z]:[\\/]/.test(raw)) {
        process.stderr.write(
          `phyll: skipped route "${raw}", which looks like a path rewritten by Git Bash. ` +
            "Run with MSYS_NO_PATHCONV=1, or write routes without the leading slash (dashboard instead of /dashboard).\n",
        );
        continue;
      }
      routes.push(raw.startsWith("/") ? raw : `/${raw}`);
    }
  }
  return {
    url: values.url,
    routes,
    scan: values.scan ?? null,
    out: values.out ?? null,
    viewports,
    probe: !values["no-probe"],
    fullPage: !values["no-full-page"],
    wait: Number(values.wait) || 0,
    maxHeight: Number(values["max-height"]) || 5000,
  };
}

// Looks for Playwright in the reviewed project first, then next to this script.
export async function loadPlaywright(cwd = process.cwd()) {
  const requires = [createRequire(join(cwd, "package.json")), createRequire(import.meta.url)];
  for (const req of requires) {
    for (const name of ["playwright", "@playwright/test", "playwright-core"]) {
      try {
        const mod = await import(pathToFileURL(req.resolve(name)).href);
        const api = mod.chromium ? mod : mod.default;
        if (api?.chromium) return api;
      } catch {
        // try the next candidate
      }
    }
  }
  return null;
}

const timestamp = () => new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const clip = (s) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, 300);

async function main() {
  let args;
  try {
    args = parseCaptureArgs(process.argv.slice(2));
  } catch (error) {
    fail(error.message, 2);
  }

  const pw = await loadPlaywright();
  if (!pw) {
    process.stderr.write(
      [
        "phyll: Playwright is not installed in this project.",
        "Install it with:",
        "  npm i -D playwright",
        "  npx playwright install chromium",
        "Or use your agent's browser tool and run probe.js in the page (see references/walkthrough.md).",
        "",
      ].join("\n"),
    );
    process.exit(3);
  }

  let routes = args.routes;
  if (!routes && args.scan) {
    const scan = JSON.parse(readFileSync(resolve(args.scan), "utf8"));
    routes = staticRoutes((scan.structure?.routes ?? []).map((r) => r.path));
  }
  routes = staticRoutes(routes?.length ? routes : ["/"]);

  const out = resolve(args.out ?? join(".phyll", "reports", timestamp()));
  mkdirSync(join(out, "screens"), { recursive: true });
  if (args.probe) mkdirSync(join(out, "probe"), { recursive: true });
  const probeSource = readFileSync(join(HERE, "probe.js"), "utf8");

  const slugs = uniqueSlugs(routes);
  const pages = [];
  const browser = await pw.chromium.launch();
  try {
    for (const name of args.viewports) {
      const context = await browser.newContext(VIEWPORTS[name]);
      const page = await context.newPage();
      const consoleErrors = [];
      page.on("console", (m) => {
        if (m.type() === "error") consoleErrors.push(clip(m.text()));
      });
      page.on("pageerror", (e) => consoleErrors.push(clip(e.message)));

      for (const [i, route] of routes.entries()) {
        const url = new URL(route, args.url).href;
        const slug = slugs[i];
        const entry = { route, viewport: name, url, status: null };
        try {
          let response;
          try {
            response = await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
          } catch {
            response = await page.goto(url, { waitUntil: "load", timeout: 20000 });
          }
          entry.status = response?.status() ?? null;
          if (args.wait) await page.waitForTimeout(args.wait);

          const shot = `screens/${name}-${slug}.png`;
          const height = await page.evaluate(() => document.documentElement.scrollHeight);
          const options = { path: join(out, shot), fullPage: args.fullPage };
          if (args.fullPage && height > args.maxHeight) {
            options.clip = { x: 0, y: 0, width: VIEWPORTS[name].viewport.width, height: args.maxHeight };
          }
          await page.screenshot(options);
          entry.screenshot = shot;

          if (args.probe) {
            const data = await page.evaluate(probeSource);
            const probePath = `probe/${name}-${slug}.json`;
            writeFileSync(join(out, probePath), JSON.stringify(data, null, 2) + "\n");
            entry.probe = probePath;
          }
        } catch (error) {
          entry.error = clip(error.message);
        }
        entry.consoleErrors = consoleErrors.splice(0);
        pages.push(entry);
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }

  const manifest = {
    tool: { name: NAME, version: VERSION },
    createdAt: new Date().toISOString(),
    baseUrl: args.url,
    viewports: args.viewports,
    pages,
  };
  writeFileSync(join(out, "capture.json"), JSON.stringify(manifest, null, 2) + "\n");

  const failed = pages.filter((p) => p.error);
  const noisy = pages.filter((p) => p.consoleErrors?.length);
  process.stdout.write(`Captured ${pages.length - failed.length} of ${pages.length} screens into ${out}\n`);
  for (const p of failed) process.stdout.write(`  could not capture ${p.viewport} ${p.route}: ${p.error}\n`);
  if (noisy.length) process.stdout.write(`  ${noisy.length} screens logged JavaScript errors; see capture.json\n`);
  if (!existsSync(join(out, "capture.json"))) process.exit(1);
}

if (isMain(import.meta.url)) main();
