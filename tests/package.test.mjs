import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { DASHES, parseFrontmatter, readText, ROOT, SKILL, stripCode } from "./helpers.mjs";
import { VERSION } from "../skills/phyll/scripts/lib/version.mjs";

const skillMd = readText("skills/phyll/SKILL.md");
const front = parseFrontmatter(skillMd);

function markdownFiles(dir = ROOT) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".git")) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...markdownFiles(path));
    else if (entry.name.endsWith(".md")) out.push(path);
  }
  return out;
}

test("SKILL.md frontmatter follows the Agent Skills format", () => {
  assert.ok(front, "SKILL.md needs YAML frontmatter");
  assert.equal(front.name, "phyll");
  assert.match(front.name, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  assert.ok(front.description.length >= 100, "the description should say when to use the skill");
  assert.ok(front.description.length <= 1024, `description is ${front.description.length} characters, the limit is 1024`);
  assert.equal(front.license, "MIT");
  assert.equal(front.metadata.version, VERSION);
});

test("the skill folder name matches the skill name", () => {
  assert.ok(existsSync(join(ROOT, "skills", front.name, "SKILL.md")));
});

test("every file SKILL.md points to exists", () => {
  const paths = new Set(
    [...skillMd.matchAll(/`((?:references|scripts|data|schema)\/[\w./-]+)`/g)].map((m) => m[1]),
  );
  const minimum = existsSync(join(SKILL, "references")) ? 8 : 1;
  assert.ok(paths.size >= minimum, "SKILL.md should point to the files it uses");
  for (const p of paths) assert.ok(existsSync(join(SKILL, ...p.split("/"))), `SKILL.md mentions ${p}, which does not exist`);
});

test("Codex metadata names the skill", () => {
  const yaml = readText("skills/phyll/agents/openai.yaml");
  assert.match(yaml, /display_name: "Phyll"/);
  assert.match(yaml, /\$phyll/);
});

test("markdown prose has no em or en dashes", () => {
  const offenders = [];
  for (const file of markdownFiles()) {
    const prose = stripCode(readFileSync(file, "utf8"));
    prose.split("\n").forEach((line, i) => {
      if (DASHES.test(line)) offenders.push(`${relative(ROOT, file).split(sep).join("/")}:${i + 1}`);
    });
  }
  assert.deepEqual(offenders, [], "use a period, comma, colon or parentheses instead of a dash");
});
