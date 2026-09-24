#!/usr/bin/env node
// Phyll static scan: finds AI tells in the source and maps routes, forms and modals.
//
//   node scan.mjs [dir] [--out scan.json] [--format json|text] [--config path]
//
// With --out the JSON goes to the file and a one-line summary to stdout.
// Without it, JSON (default) or a text summary goes to stdout.
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { fail, isMain } from "./lib/cli.mjs";
import { configPath, readConfigFile } from "./lib/config.mjs";
import { runTells } from "./lib/detectors.mjs";
import { walk } from "./lib/files.mjs";
import { computeIndex, kindOf, staticEntries } from "./lib/score.mjs";
import { analyzeStructure } from "./lib/structure.mjs";
import { NAME, VERSION } from "./lib/version.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const TELLS_PATH = join(HERE, "..", "data", "tells.json");

export function loadTells(path = TELLS_PATH) {
  return JSON.parse(readFileSync(path, "utf8")).tells;
}

// The scanned folder relative to where the scan runs, so reports do not carry local paths
// such as a home folder. Folders outside the working directory keep only their name.
export function displayRoot(root, cwd = process.cwd()) {
  const rel = relative(cwd, root).split(sep).join("/");
  if (rel === "") return ".";
  if (rel.startsWith("..") || isAbsolute(rel)) return basename(root);
  return rel;
}

export function scan(root, { ignore = [], tells = loadTells() } = {}) {
  const { files, ignored } = walk(root, { ignore });
  const cache = new Map();
  const readText = (file) => {
    if (!cache.has(file.abs)) cache.set(file.abs, readFileSync(file.abs, "utf8"));
    return cache.get(file.abs);
  };

  const structure = analyzeStructure(root, files, readText);
  const results = new Map(runTells(tells, files, readText, structure).map((r) => [r.id, r]));

  const scanned = tells
    .filter((t) => t.detection !== "dynamic")
    .map((t) => ({
      id: t.id,
      name: t.name,
      dimension: t.dimension,
      kind: kindOf(t),
      detection: t.detection,
      weight: t.weight,
      cap: t.cap,
      hits: results.get(t.id)?.hits ?? 0,
      locations: results.get(t.id)?.locations ?? [],
    }));

  const tellsById = new Map(tells.map((t) => [t.id, t]));
  const entries = staticEntries(tells, scanned);
  return {
    tool: { name: NAME, version: VERSION },
    root: displayRoot(root),
    createdAt: new Date().toISOString(),
    files: { scanned: files.length, ignored },
    structure,
    tells: scanned,
    staticIndex: computeIndex(tellsById, entries, "function"),
    styleIndex: computeIndex(tellsById, entries, "style"),
  };
}

export function formatText(result) {
  const lines = [];
  lines.push(`Phyll scan of ${result.root}`);
  lines.push(
    `Files: ${result.files.scanned} scanned, ${result.files.ignored} ignored. Framework: ${result.structure.framework}. Theme: ${result.structure.theme ?? "unknown"}.`,
  );
  lines.push(`Static AI tell index: ${result.staticIndex ?? "n/a"}/100 (lower is better)`);
  lines.push("");

  const found = result.tells
    .filter((t) => t.hits > 0)
    .sort((a, b) => b.weight - a.weight || b.hits - a.hits);
  const functionTells = found.filter((t) => (t.kind ?? "function") === "function");
  const styleTells = found.filter((t) => t.kind === "style");
  const width = Math.min(48, Math.max(10, ...found.map((t) => t.name.length)));
  const row = (t) => {
    const where = t.locations[0] ? `${t.locations[0].file}:${t.locations[0].line}` : "";
    const name = t.name.length > width ? t.name.slice(0, width - 1) + "." : t.name.padEnd(width);
    return `  ${t.id}  ${name}  ${String(t.hits).padStart(3)} hits  ${where}`;
  };

  if (functionTells.length === 0) lines.push("No tells that get in the way of use were found in the source.");
  else lines.push("Tells that get in the way of use:", ...functionTells.map(row));
  lines.push("");
  if (styleTells.length) {
    lines.push(
      `Style notes, left as they are (style index ${result.styleIndex ?? "n/a"}/100):`,
      ...styleTells.map(row),
      "",
    );
  }

  const { routes, forms, modals, notes } = result.structure;
  lines.push(routes.length ? `Routes: ${routes.map((r) => r.path).join(", ")}` : "Routes: none found");
  const longForms = forms.filter((f) => f.fields >= 7);
  if (forms.length) {
    const deferred = forms.reduce((sum, f) => sum + (f.deferred ?? 0), 0);
    lines.push(
      `Forms: ${forms.length}` +
        (longForms.length ? `, longest ${Math.max(...forms.map((f) => f.fields))} fields` : "") +
        (deferred ? `, plus ${deferred} optional behind a closed <details>` : ""),
    );
  }
  if (modals.count) lines.push(`Modals: ${modals.count}`);
  for (const note of notes) lines.push(`Note: ${note}`);
  return lines.join("\n") + "\n";
}

function main() {
  let args;
  try {
    args = parseArgs({
      allowPositionals: true,
      options: {
        out: { type: "string" },
        format: { type: "string", default: "json" },
        config: { type: "string" },
        help: { type: "boolean", short: "h" },
      },
    });
  } catch (error) {
    fail(error.message, 2);
  }
  const { values, positionals } = args;
  if (values.help) {
    process.stdout.write("Usage: node scan.mjs [dir] [--out scan.json] [--format json|text] [--config path]\n");
    return;
  }

  const root = resolve(positionals[0] ?? ".");
  let isDir = false;
  try {
    isDir = statSync(root).isDirectory();
  } catch {
    isDir = false;
  }
  if (!isDir) fail(`${root} is not a folder`, 2);

  let config;
  try {
    config = readConfigFile(values.config ? resolve(values.config) : configPath(root));
  } catch (error) {
    fail(error.message, 2);
  }

  const result = scan(root, { ignore: Array.isArray(config.ignore) ? config.ignore : [] });
  const json = JSON.stringify(result, null, 2) + "\n";

  if (values.out) {
    const out = resolve(values.out);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, json);
    const found = result.tells.filter((t) => t.hits > 0).length;
    if (values.format === "text") process.stdout.write(formatText(result));
    process.stdout.write(`Wrote ${out}: static index ${result.staticIndex ?? "n/a"}, ${found} tells found.\n`);
    return;
  }
  process.stdout.write(values.format === "text" ? formatText(result) : json);
}

if (isMain(import.meta.url)) main();
