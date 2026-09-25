import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseFrontmatter, readJson, readText, ROOT } from "./helpers.mjs";
import { VERSION } from "../skills/phyll/scripts/lib/version.mjs";

const plugin = readJson(".claude-plugin/plugin.json");
const marketplace = readJson(".claude-plugin/marketplace.json");

test("plugin.json names the plugin and points to the repository", () => {
  assert.equal(plugin.name, "phyll");
  assert.match(plugin.name, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  assert.equal(plugin.license, "MIT");
  assert.equal(plugin.repository, "https://github.com/carlosphyll/phyll");
  assert.ok(plugin.description.length > 40);
});

test("marketplace.json lists this repository as the phyll plugin", () => {
  assert.equal(marketplace.name, "carlosphyll");
  assert.ok(marketplace.owner?.name);
  const entry = marketplace.plugins.find((p) => p.name === plugin.name);
  assert.ok(entry, "the marketplace should list the plugin");
  assert.equal(entry.source, "./");
});

test("every version in the repository matches", () => {
  const versions = {
    "lib/version.mjs": VERSION,
    "plugin.json": plugin.version,
    "marketplace.json": marketplace.plugins[0].version,
    "tells.json": readJson("skills/phyll/data/tells.json").version,
    "SKILL.md": parseFrontmatter(readText("skills/phyll/SKILL.md")).metadata.version,
  };
  for (const file of ["package.json", "packages/cli/package.json", "packages/connector/package.json", "cloud/package.json"]) {
    if (existsSync(join(ROOT, ...file.split("/")))) versions[file] = readJson(file).version;
  }
  // The MCP registry entry: at the root of the public repository, in public/ here.
  for (const file of ["server.json", "public/server.json"]) {
    if (!existsSync(join(ROOT, ...file.split("/")))) continue;
    const server = readJson(file);
    versions[file] = server.version;
    versions[`${file} package`] = server.packages[0].version;
    assert.equal(server.name, readJson("packages/connector/package.json").mcpName, "the registry name matches the npm package's mcpName");
    assert.ok(server.description.length <= 100, "the registry takes at most 100 characters");
  }
  for (const [where, version] of Object.entries(versions)) assert.equal(version, VERSION, `${where} has ${version}`);
});

const pluginFiles = (dir) =>
  readdirSync(join(ROOT, dir))
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ path: `${dir}/${f}`, text: readText(`${dir}/${f}`) }));

test("agents have a name, a description and keep the host's tools", () => {
  const agents = pluginFiles("agents");
  assert.ok(agents.length >= 1);
  for (const { path, text } of agents) {
    const front = parseFrontmatter(text);
    assert.ok(front?.name, `${path} needs a name`);
    assert.ok(front?.description?.length > 40, `${path} needs a description`);
    assert.equal(front.tools, undefined, `${path} should not narrow tools, or it loses the browser tools`);
  }
});

test("commands have a description and only run when the person asks", () => {
  const commands = pluginFiles("commands");
  assert.deepEqual(commands.map((c) => c.path).sort(), ["commands/fix.md", "commands/review.md", "commands/scan.md"]);
  for (const { path, text } of commands) {
    const front = parseFrontmatter(text);
    assert.ok(front?.description, `${path} needs a description`);
    assert.equal(front["disable-model-invocation"], "true", `${path} should be user-invoked only`);
    assert.match(text, /\$ARGUMENTS/, `${path} should pass the arguments on`);
  }
});

test("paths under the plugin root that agents and commands mention exist", () => {
  for (const { path, text } of [...pluginFiles("agents"), ...pluginFiles("commands")]) {
    for (const m of text.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([\w./-]+\.\w+)/g)) {
      assert.ok(existsSync(join(ROOT, ...m[1].split("/"))), `${path} mentions ${m[1]}, which does not exist`);
    }
  }
});
