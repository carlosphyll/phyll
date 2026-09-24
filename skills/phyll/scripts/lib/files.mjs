// Walks a project and returns the UI source files Phyll reads.
import { readdirSync, statSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";

export const CATEGORY_BY_EXT = Object.freeze({
  ".html": "markup",
  ".htm": "markup",
  ".jsx": "markup",
  ".tsx": "markup",
  ".vue": "markup",
  ".svelte": "markup",
  ".astro": "markup",
  ".mdx": "markup",
  ".js": "script",
  ".ts": "script",
  ".mjs": "script",
  ".cjs": "script",
  ".css": "style",
  ".scss": "style",
  ".sass": "style",
  ".less": "style",
});

// Folders that hold dependencies or build output. Phyll never enters them.
// Any folder whose name starts with a dot is skipped as well (.git, .next, .svelte-kit, .phyll).
const SKIPPED_DIRS = new Set([
  "node_modules",
  "bower_components",
  "dist",
  "build",
  "out",
  "coverage",
  "vendor",
  "storybook-static",
]);

// Files that exist in most projects but say nothing about the product's own interface.
// components/ui holds copied library primitives (shadcn/ui and similar); counting their
// rounded corners and shadows would flag every project that uses such a kit.
export const DEFAULT_IGNORE = Object.freeze([
  "**/components/ui/**",
  "**/*.test.*",
  "**/*.spec.*",
  "**/__tests__/**",
  "**/__mocks__/**",
  "**/*.stories.*",
  "**/*.min.*",
  "**/*.d.ts",
]);

const SPECIAL = new Set(["\\", "^", "$", ".", "|", "+", "(", ")", "[", "]", "{", "}"]);

// Converts a glob to a RegExp over forward-slash relative paths.
// ** crosses folders, * stays inside one folder, ? is one character.
export function globToRegExp(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") {
        if (glob[i + 2] === "/") {
          re += "(?:.*/)?";
          i += 2;
        } else {
          re += ".*";
          i += 1;
        }
      } else {
        re += "[^/]*";
      }
    } else if (c === "?") {
      re += "[^/]";
    } else if (SPECIAL.has(c)) {
      re += "\\" + c;
    } else {
      re += c;
    }
  }
  return new RegExp("^" + re + "$");
}

// A pattern without wildcards is treated as a path prefix, so "src/legacy" ignores the folder.
function toMatcher(pattern) {
  const clean = pattern.replace(/\\/g, "/").replace(/^\.\//, "").replace(/\/$/, "");
  if (!/[*?]/.test(clean)) return (rel) => rel === clean || rel.startsWith(clean + "/");
  const re = globToRegExp(clean);
  return (rel) => re.test(rel);
}

export function toRel(root, abs) {
  return relative(root, abs).split(sep).join("/");
}

export function walk(root, { ignore = [], maxBytes = 512 * 1024 } = {}) {
  const matchers = [...DEFAULT_IGNORE, ...ignore].map(toMatcher);
  const files = [];
  let ignored = 0;

  const visit = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".") || SKIPPED_DIRS.has(entry.name)) continue;
        visit(abs);
        continue;
      }
      if (!entry.isFile()) continue;
      const ext = extname(entry.name).toLowerCase();
      const category = CATEGORY_BY_EXT[ext];
      if (!category) continue;
      const rel = toRel(root, abs);
      if (matchers.some((m) => m(rel))) {
        ignored++;
        continue;
      }
      if (statSync(abs).size > maxBytes) {
        ignored++;
        continue;
      }
      files.push({ abs, rel, ext, category });
    }
  };

  visit(root);
  files.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
  return { files, ignored };
}
