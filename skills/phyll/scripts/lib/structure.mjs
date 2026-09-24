// Best-effort map of an app's structure from its source: framework, routes, forms and modals.
// The reviewer uses it to plan the browser walk; nothing here needs to be exact.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { extractClassLists, makeLineIndex } from "./detectors.mjs";

// ---------- framework ----------

function findPackageJson(root, levels = 3) {
  let dir = root;
  for (let i = 0; i <= levels; i++) {
    const candidate = join(dir, "package.json");
    if (existsSync(candidate)) {
      try {
        return JSON.parse(readFileSync(candidate, "utf8"));
      } catch {
        return null;
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

export function detectFramework(root) {
  const pkg = findPackageJson(root);
  if (!pkg) return "html";
  const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  if (deps.next) return "next";
  if (deps.nuxt) return "nuxt";
  if (deps["@sveltejs/kit"]) return "sveltekit";
  if (deps.astro) return "astro";
  if (deps["@angular/core"]) return "angular";
  if (deps["vue-router"]) return "vue";
  if (deps["react-router"] || deps["react-router-dom"] || deps["@tanstack/react-router"]) return "react-router";
  if (deps.react) return "react";
  if (deps.vue) return "vue";
  if (deps.svelte) return "svelte";
  return "unknown";
}

// ---------- routes ----------

const dropGroups = (segments) => segments.filter((s) => s && !/^\(.*\)$/.test(s) && !s.startsWith("@"));
const toPath = (segments) => "/" + dropGroups(segments).join("/");

const NEXT_APP = /^(?:.*\/)?app\/((?:[^/]+\/)*)page\.(?:jsx|tsx|js|ts|mdx)$/;
const NEXT_PAGES = /^(?:.*\/)?pages\/(.+)\.(?:jsx|tsx|js|ts|mdx)$/;
const NUXT_PAGES = /^(?:.*\/)?pages\/(.+)\.vue$/;
const SVELTEKIT = /^(?:.*\/)?routes\/((?:[^/]+\/)*)\+page\.svelte$/;
const ASTRO_PAGES = /^(?:.*\/)?pages\/(.+)\.(?:astro|md|mdx|html)$/;

function fileRoute(rel, pattern, { skip } = {}) {
  const m = rel.match(pattern);
  if (!m) return null;
  const segments = m[1].split("/").filter(Boolean);
  if (skip && skip(segments)) return null;
  if (segments.at(-1) === "index") segments.pop();
  return toPath(segments);
}

const skipNextPages = (segments) => segments[0] === "api" || segments.some((s) => s.startsWith("_"));

const JSX_ROUTE = /<Route\b[^>]*?\bpath\s*=\s*(?:\{\s*)?["'`]([^"'`]+)["'`]/g;
const OBJECT_ROUTE = /\bpath\s*:\s*["'`]([^"'`]+)["'`]/g;
const FILE_ROUTE = /createFileRoute\(\s*["'`]([^"'`]+)["'`]\s*\)/g;
const ROUTER_IMPORT = /from\s+["'](?:react-router(?:-dom)?|vue-router|@tanstack\/react-router)["']|createBrowserRouter|createRouter\s*\(/;

// Paths written without a leading slash are relative to a parent route; they get one here
// and are marked so the scan can warn that the full path may be longer.
function codeRoute(raw, file, line) {
  if (raw === "*" || raw.startsWith("/")) return { path: raw, file, line };
  return { path: "/" + raw, file, line, relative: true };
}

function codeRoutes(files, readText) {
  const out = [];
  for (const file of files) {
    if (file.category === "style") continue;
    const text = readText(file);
    if (!text.includes("path") && !text.includes("createFileRoute")) continue;
    const lineOf = makeLineIndex(text);
    const patterns = ROUTER_IMPORT.test(text) ? [JSX_ROUTE, FILE_ROUTE, OBJECT_ROUTE] : [JSX_ROUTE, FILE_ROUTE];
    for (const pattern of patterns) {
      for (const m of text.matchAll(pattern)) out.push(codeRoute(m[1], file.rel, lineOf(m.index)));
    }
  }
  return out;
}

function htmlRoutes(files) {
  return files
    .filter((f) => f.ext === ".html" || f.ext === ".htm")
    .map((f) => {
      const path = "/" + f.rel.replace(/(^|\/)index\.html?$/, "$1");
      return { path, file: f.rel, line: 1 };
    });
}

export function findRoutes(files, framework, readText) {
  let routes = [];
  const add = (path, file) => {
    if (path) routes.push({ path, file: file.rel, line: 1 });
  };
  for (const file of files) {
    if (framework === "next") {
      add(fileRoute(file.rel, NEXT_APP), file);
      add(fileRoute(file.rel, NEXT_PAGES, { skip: skipNextPages }), file);
    } else if (framework === "nuxt") {
      add(fileRoute(file.rel, NUXT_PAGES), file);
    } else if (framework === "sveltekit") {
      add(fileRoute(file.rel, SVELTEKIT), file);
    } else if (framework === "astro") {
      add(fileRoute(file.rel, ASTRO_PAGES), file);
    }
  }
  if (["react-router", "react", "vue", "angular", "svelte", "unknown"].includes(framework)) {
    routes.push(...codeRoutes(files, readText));
  }
  if (routes.length === 0) routes = htmlRoutes(files);

  const seen = new Map();
  for (const r of routes) if (!seen.has(r.path)) seen.set(r.path, r);
  return [...seen.values()].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

// ---------- forms ----------

const FORM_OPEN = /<(form|Form)\b[^>]*>/g;
const FIELD = /<(input|select|textarea|Input|Select|Textarea|Checkbox|Switch|RadioGroup|Combobox|DatePicker|Slider)\b([^>]*)>/g;
const NON_FIELD_TYPE = /\btype\s*=\s*["'{]?\s*["']?(hidden|submit|button|reset|image)\b/;

// Fields inside a closed <details> wait until the person opens it, so they are not asked up front.
const CLOSED_DETAILS = /<details\b(?![^>]*\bopen\b)[^>]*>[\s\S]*?<\/details>/g;

const RADIO = /\btype\s*=\s*["']radio["']/;
const NAME = /\bname\s*=\s*["']([^"']+)["']/;
// A label that says the field can stay empty: "Complemento (opcional)".
const OPTIONAL_MARK = /\((?:opcional|optional|opcionales)\)/gi;

// Counts questions, not tags: the radio buttons of one group are one question.
function countAll(chunk) {
  let n = 0;
  const groups = new Set();
  for (const m of chunk.matchAll(FIELD)) {
    if ((m[1] === "input" || m[1] === "Input") && NON_FIELD_TYPE.test(m[2])) continue;
    const group = RADIO.test(m[2]) ? m[2].match(NAME)?.[1] : null;
    if (group && groups.has(group)) continue;
    if (group) groups.add(group);
    n++;
  }
  return n;
}

// fields: asked up front and not marked optional. deferred: behind a closed <details>.
// optional: on screen, with a label that says so. Both only appear when there are some.
function formEntry(file, line, chunk, implicit) {
  const visible = chunk.replace(CLOSED_DETAILS, "");
  const shown = countAll(visible);
  const optional = Math.min(shown, (visible.match(OPTIONAL_MARK) ?? []).length);
  const deferred = countAll(chunk) - shown;
  const entry = { file, line, fields: shown - optional };
  if (deferred > 0) entry.deferred = deferred;
  if (optional > 0) entry.optional = optional;
  entry.implicit = implicit;
  return entry;
}

export function findForms(files, readText) {
  const forms = [];
  for (const file of files) {
    if (file.category === "style") continue;
    const text = readText(file);
    if (!/<(form|Form|input|Input|select|Select|textarea|Textarea)\b/.test(text)) continue;
    const lineOf = makeLineIndex(text);
    let found = false;
    for (const m of text.matchAll(FORM_OPEN)) {
      found = true;
      const close = text.indexOf(`</${m[1]}>`, m.index);
      const chunk = text.slice(m.index, close === -1 ? text.length : close);
      forms.push(formEntry(file.rel, lineOf(m.index), chunk, false));
    }
    if (!found) {
      const first = text.search(/<(input|select|textarea|Input|Select|Textarea)\b/);
      const entry = formEntry(file.rel, lineOf(Math.max(first, 0)), text, true);
      if (entry.fields + (entry.deferred ?? 0) + (entry.optional ?? 0) >= 5) forms.push(entry);
    }
  }
  return forms;
}

// ---------- modals ----------

const MODAL = /<(?:Dialog|AlertDialog|Modal|Sheet|Drawer)(?:\.Root)?(?=[\s>/])|<dialog\b|\.showModal\(|\brole\s*=\s*["']dialog["']/g;
// A hand-made modal: a full-screen layer with a dark, see-through backdrop, in any class order.
const OVERLAY =
  /\bclass(?:Name)?\s*=\s*\{?\s*["'`](?=[^"'`]*(?<![\w:-])fixed\b)(?=[^"'`]*(?<![\w:-])inset-0\b)(?=[^"'`]*(?<![\w:-])bg-(?:black|(?:zinc|gray|slate|neutral|stone)-9[05]0)\/\d{1,3}\b)/g;

const DIALOG_MARK = /\brole\s*=\s*["']dialog["']|\baria-modal\b|<dialog\b|<(?:Dialog|AlertDialog|Modal|Sheet|Drawer)(?:\.\w+)?[\s>/]/;

// Index of the ">" that closes the tag opening at `start`, skipping quotes and JSX braces,
// so onClick={() => close()} does not end the tag early.
function tagEnd(text, start) {
  let depth = 0;
  let quote = null;
  for (let i = start + 1; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) return i;
  }
  return text.length - 1;
}

export function findModals(files, readText) {
  const locations = [];
  for (const file of files) {
    if (file.category === "style") continue;
    const text = readText(file);
    if (!/Dialog|Modal|Sheet|Drawer|dialog|inset-0/.test(text)) continue;
    const lineOf = makeLineIndex(text);
    const found = [];
    for (const m of text.matchAll(MODAL)) found.push({ index: m.index, match: m[0].replace(/\.Root$/, "") });
    for (const m of text.matchAll(OVERLAY)) {
      // A dialog marked on the overlay itself, or on its first child, was already counted above.
      const start = text.lastIndexOf("<", m.index);
      const end = tagEnd(text, start);
      const child = text.indexOf("<", end);
      const scope = text.slice(start, (child === -1 ? end : tagEnd(text, child)) + 1);
      if (!DIALOG_MARK.test(scope)) found.push({ index: m.index, match: "fixed inset-0 overlay" });
    }
    found.sort((a, b) => a.index - b.index);
    for (const f of found) locations.push({ file: file.rel, line: lineOf(f.index), match: f.match });
  }
  return { count: locations.length, locations: locations.slice(0, 20) };
}

// ---------- theme ----------

const NEUTRALS = "(?:zinc|gray|slate|neutral|stone)";
const DARK_BG = new RegExp(`^bg-(?:${NEUTRALS}-(?:800|900|950)|black)$`);
const LIGHT_BG = /^bg-(?:white|[a-z]+-(?:50|100))$/;

// "dark" when opaque dark backgrounds outnumber light ones in the class lists, "light" when the
// reverse is true, "unknown" otherwise. Variants and translucent colors (bg-white/5) do not count.
export function detectTheme(files, readText) {
  let dark = 0;
  let light = 0;
  for (const file of files) {
    if (file.category === "style") continue;
    const text = readText(file);
    if (/<html[^>]*class\s*=\s*["'][^"']*\bdark\b/.test(text)) dark += 5;
    for (const { classes } of extractClassLists(text, file.category)) {
      for (const token of classes) {
        if (DARK_BG.test(token)) dark++;
        else if (LIGHT_BG.test(token)) light++;
      }
    }
  }
  if (dark === 0 && light === 0) return "unknown";
  if (dark > light) return "dark";
  return light > dark ? "light" : "unknown";
}

// ---------- all together ----------

export function analyzeStructure(root, files, readText) {
  const framework = detectFramework(root);
  const routes = findRoutes(files, framework, readText);
  const forms = findForms(files, readText);
  const modals = findModals(files, readText);
  const theme = detectTheme(files, readText);
  const notes = [];
  if (routes.length === 0) notes.push("No routes found in the source. Map the screens from the browser instead.");
  if (routes.some((r) => r.relative)) {
    notes.push("Some route paths are relative to a parent route, so the full URL may be longer than shown.");
  }
  if (theme === "dark") {
    notes.push("The interface looks dark, so light gray text is not flagged from the source. The probe measures real contrast.");
  }
  return { framework, theme, routes, forms, modals, notes };
}
