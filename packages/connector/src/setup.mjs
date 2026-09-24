// Connects Phyll to the person's agent: an MCP server entry in Codex's config.toml, or a
// `claude mcp add` for Claude Code, and the Chromium build Playwright needs.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join } from "node:path";
import { BIN, PUBLISHED } from "./paths.mjs";

// How the agent starts the connector: through npx when installed from npm, or straight from
// this folder when it runs from the repository.
export function mcpCommand({ published = PUBLISHED, platform = process.platform, node = process.execPath, bin = BIN } = {}) {
  if (!published) return [node, bin, "mcp"];
  const npx = ["npx", "-y", "phyll@latest", "mcp"];
  return platform === "win32" ? ["cmd", "/c", ...npx] : npx;
}

const tomlString = (value) => JSON.stringify(String(value));

export function codexBlock(command) {
  return `[mcp_servers.phyll]\ncommand = ${tomlString(command[0])}\nargs = [${command.slice(1).map(tomlString).join(", ")}]\n`;
}

// Removes [mcp_servers.phyll] and its sub-tables, keeping everything else in the file as it was.
export function withoutTable(text, name) {
  const kept = [];
  let skipping = false;
  for (const line of text.split("\n")) {
    const header = line.trim().match(/^\[\[?\s*([^\]]+?)\s*\]\]?$/);
    if (header) skipping = header[1] === name || header[1].startsWith(`${name}.`);
    if (!skipping) kept.push(line);
  }
  return kept.join("\n");
}

export function writeCodexConfig(command, env = process.env) {
  const dir = env.CODEX_HOME || join(homedir(), ".codex");
  const file = join(dir, "config.toml");
  const before = existsSync(file) ? readFileSync(file, "utf8") : "";
  const rest = withoutTable(before, "mcp_servers.phyll").replace(/\s+$/, "");
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, `${rest ? `${rest}\n\n` : ""}${codexBlock(command)}`);
  return file;
}

const quote = (arg) => (/[\s"]/.test(arg) ? `"${arg.replaceAll('"', '\\"')}"` : arg);

export function registerClaude(command, run = spawnSync) {
  const args = ["mcp", "add", "--scope", "user", "phyll", "--", ...command];
  const call = (list) => run("claude", list.map(quote), { shell: true, encoding: "utf8" });
  call(["mcp", "remove", "phyll", "--scope", "user"]);
  const added = call(args);
  if (added.error || added.status !== 0) return { ok: false, manual: `claude ${args.map(quote).join(" ")}` };
  return { ok: true };
}

// Opens Chromium once; when Playwright says it is missing, installs it.
export async function ensureBrowser({ write = () => {}, run = spawnSync } = {}) {
  const { chromium } = await import("playwright");
  try {
    await (await chromium.launch()).close();
    return true;
  } catch (error) {
    if (!/Executable doesn't exist|playwright install/i.test(error?.message ?? "")) throw error;
  }
  write("Installing the browser Phyll uses, Chromium (about 150 MB)...\n");
  const cli = createRequire(import.meta.url).resolve("playwright/cli");
  return run(process.execPath, [cli, "install", "chromium"], { stdio: "inherit" }).status === 0;
}
