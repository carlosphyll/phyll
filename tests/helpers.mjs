// Shared helpers for the Phyll test suite.
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const tempRoots = [];
process.on("exit", () => {
  for (const dir of tempRoots) rmSync(dir, { recursive: true, force: true });
});

// Builds a throwaway directory tree from { "relative/path": "content" } and returns its path.
export function makeTree(files) {
  const root = mkdtempSync(join(tmpdir(), "phyll-test-"));
  tempRoots.push(root);
  for (const [rel, content] of Object.entries(files)) {
    const abs = join(root, ...rel.split("/"));
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content);
  }
  return root;
}

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SKILL = join(ROOT, "skills", "phyll");
export const FIXTURES = join(ROOT, "tests", "fixtures");

export const readText = (rel) => readFileSync(join(ROOT, rel), "utf8");
export const readJson = (rel) => JSON.parse(readText(rel));

// En and em dashes, built from code points so the source stays ASCII.
export const DASHES = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");

const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

export function loadAjv() {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  ajv.addFormat("date-time", DATE_TIME);
  ajv.addFormat("uri", /^https?:\/\/\S+$/);
  return ajv;
}

// Removes fenced code blocks and inline code so prose checks only see prose.
export function stripCode(markdown) {
  return markdown
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, "")
    .replace(/`[^`\n]*`/g, "");
}

// Minimal YAML frontmatter reader: key: value, quoted values, | and > blocks,
// one level of nested maps and simple lists. Enough for SKILL.md, agents and commands.
export function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return null;
  const lines = match[1].split(/\r?\n/);
  const data = {};
  let i = 0;
  const unquote = (v) => {
    const t = v.trim();
    if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1);
    return t;
  };
  while (i < lines.length) {
    const line = lines[i];
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) { i++; continue; }
    const [, key, rest] = kv;
    if (rest === "|" || rest === ">" || rest === "|-" || rest === ">-") {
      const block = [];
      i++;
      while (i < lines.length && (/^\s+/.test(lines[i]) || lines[i] === "")) { block.push(lines[i].trim()); i++; }
      data[key] = rest.startsWith("|") ? block.join("\n").trim() : block.join(" ").replace(/\s+/g, " ").trim();
      continue;
    }
    if (rest === "") {
      const nested = {};
      const list = [];
      i++;
      while (i < lines.length && /^\s+/.test(lines[i])) {
        const item = lines[i].match(/^\s+-\s+(.*)$/);
        const sub = lines[i].match(/^\s+([A-Za-z0-9_-]+):\s*(.*)$/);
        if (item) list.push(unquote(item[1]));
        else if (sub) nested[sub[1]] = unquote(sub[2]);
        i++;
      }
      data[key] = list.length ? list : nested;
      continue;
    }
    data[key] = unquote(rest);
    i++;
  }
  return data;
}
