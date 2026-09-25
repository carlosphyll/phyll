// The connector, the npm package `phyll`: set up in Codex and Claude Code, keep the key, and run
// a whole review over MCP against the engine and a real browser, the way an agent would.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { makeTree, ROOT } from "./helpers.mjs";
import { sampleReport } from "./samples.mjs";
import { engineSkip, startEngine } from "./engine-for-tests.mjs";
import { badgeMarkdown, main, scanNext } from "../packages/connector/src/cli.mjs";
import { loadCredentials, saveCredentials } from "../packages/connector/src/credentials.mjs";
import { engineClient } from "../packages/connector/src/engine.mjs";
import { BIN } from "../packages/connector/src/paths.mjs";
import { normalizeUrl } from "../packages/connector/src/review.mjs";
import {
  codexBlock,
  ensureBrowser,
  JSON_AGENTS,
  mcpCommand,
  mcpJson,
  playwrightCli,
  registerClaude,
  withoutTable,
  writeCodexConfig,
  writeJsonConfig,
} from "../packages/connector/src/setup.mjs";

const CONNECTOR = join(ROOT, "packages", "connector");
const hasDeps = existsSync(join(CONNECTOR, "node_modules", "@modelcontextprotocol", "sdk"));

async function run(argv, env, extra = {}) {
  const out = [];
  const err = [];
  const code = await main(argv, { env, stdout: { write: (s) => out.push(s) }, stderr: { write: (s) => err.push(s) }, ...extra });
  return { code, out: out.join(""), err: err.join("") };
}

test("the agent starts the connector through npx when it comes from npm, and straight from the folder in development", () => {
  assert.deepEqual(mcpCommand({ published: true, platform: "linux" }), ["npx", "-y", "phyll@latest", "mcp"]);
  assert.deepEqual(mcpCommand({ published: true, platform: "win32" }), ["cmd", "/c", "npx", "-y", "phyll@latest", "mcp"]);
  assert.deepEqual(mcpCommand({ published: false, node: "/usr/bin/node", bin: "/src/phyll/bin/phyll.mjs" }), ["/usr/bin/node", "/src/phyll/bin/phyll.mjs", "mcp"]);
  assert.equal(normalizeUrl("localhost:5173"), "http://localhost:5173/");
  assert.throws(() => normalizeUrl("ftp://example.com"), /must start with http/);
});

test("setup codex adds one [mcp_servers.phyll] table and keeps the rest of config.toml", () => {
  const home = makeTree({
    "config.toml": 'model = "gpt-5"\n\n[mcp_servers.other]\ncommand = "other"\n\n[mcp_servers.phyll]\ncommand = "old"\n\n[mcp_servers.phyll.env]\nA = "1"\n\n[profiles.fast]\nmodel = "gpt-5-mini"\n',
  });
  const command = ["C:\\Program Files\\nodejs\\node.exe", "C:\\code\\phyll\\bin\\phyll.mjs", "mcp"];
  const file = writeCodexConfig(command, { CODEX_HOME: home });
  const text = readFileSync(file, "utf8");
  assert.match(text, /\[mcp_servers\.other\]\ncommand = "other"/);
  assert.match(text, /\[profiles\.fast\]\nmodel = "gpt-5-mini"/);
  assert.doesNotMatch(text, /command = "old"|\[mcp_servers\.phyll\.env\]/);
  assert.equal(text.match(/\[mcp_servers\.phyll\]/g).length, 1);
  assert.ok(text.endsWith(codexBlock(command)));
  assert.match(codexBlock(command), /command = "C:\\\\Program Files\\\\nodejs\\\\node\.exe"/);
  writeCodexConfig(command, { CODEX_HOME: home });
  assert.equal(readFileSync(file, "utf8").match(/\[mcp_servers\.phyll\]/g).length, 1, "running setup twice keeps one table");
  assert.equal(withoutTable("[a]\nx = 1\n[mcp_servers.phyll]\ny = 2\n[b]\nz = 3", "mcp_servers.phyll"), "[a]\nx = 1\n[b]\nz = 3");
});

test("setup claude registers the connector with claude mcp add, or prints the command to run", () => {
  const calls = [];
  const ok = registerClaude(["node", "C:\\My Code\\phyll.mjs", "mcp"], (cmd, args) => {
    calls.push([cmd, ...args].join(" "));
    return { status: 0 };
  });
  assert.equal(ok.ok, true);
  assert.deepEqual(calls, ["claude mcp remove phyll --scope user", 'claude mcp add --scope user phyll -- node "C:\\My Code\\phyll.mjs" mcp']);
  const missing = registerClaude(["npx", "-y", "phyll@latest", "mcp"], () => ({ status: 1 }));
  assert.deepEqual(missing, { ok: false, manual: "claude mcp add --scope user phyll -- npx -y phyll@latest mcp" });
});

test("the key stays in ~/.phyll, the environment wins over the file, and it only travels over https", async () => {
  const env = { PHYLL_HOME: makeTree({}) };
  assert.deepEqual(loadCredentials(env), { server: "https://agentphyll.com", key: null });
  saveCredentials({ server: "https://phyll.example", key: "phyll_file" }, env);
  assert.deepEqual(loadCredentials(env), { server: "https://phyll.example", key: "phyll_file" });
  assert.deepEqual(loadCredentials({ ...env, PHYLL_API_KEY: "phyll_env", PHYLL_API_URL: "http://localhost:8787/" }), { server: "http://localhost:8787", key: "phyll_env" });
  const plain = await engineClient({ server: "http://phyll.example", key: "phyll_x", fetchImpl: () => assert.fail("no request goes out") }).me();
  assert.equal(plain.ok, false);
  assert.match(plain.json.message, /only over https/);
});

test("signup, status, login and logout from the terminal", engineSkip, async () => {
  const engine = await startEngine();
  try {
    const env = { PHYLL_HOME: makeTree({}) };
    const signup = await run(["signup", "person@example.com", "--server", engine.url, "--lang", "pt-BR"], env);
    assert.equal(signup.code, 0, signup.err);
    assert.match(signup.out, /Conta criada, com 5 revisões grátis\./);
    const key = signup.out.match(/phyll_[A-Za-z0-9]{32}/)[0];
    assert.deepEqual(loadCredentials(env), { server: engine.url, key });
    assert.match((await run(["status"], env)).out, /Free\. 5 of 5 free reviews left\./);
    const account = await run(["account"], env);
    assert.equal(account.code, 0, account.err);
    assert.match(account.out, /\/login\/[A-Za-z0-9]{40}\n$/);
    assert.match((await run(["account"], { PHYLL_HOME: makeTree({}) })).err, /no account on this computer yet/);
    const pro = await run(["pro"], env);
    assert.equal(pro.code, 1);
    assert.match(pro.err, /Phyll Pro is not open on this server yet/);

    const other = { PHYLL_HOME: makeTree({}) };
    assert.equal((await run(["login", "phyll_wrong", "--server", engine.url], other)).code, 1);
    const login = await run(["login", key, "--server", engine.url], other);
    assert.match(login.out, /Signed in as person@example\.com, on the free plan\./);
    await run(["logout"], other);
    assert.equal(loadCredentials(other).key, null);
    assert.equal((await run(["signup"], env)).code, 2);
  } finally {
    await engine.close();
  }
});

test("login without a key waits until the person allows this computer in the browser", engineSkip, async () => {
  const engine = await startEngine();
  try {
    const env = { PHYLL_HOME: makeTree({}) };
    let opened = null;
    const login = await run(["login", "--server", engine.url], env, {
      hostname: () => "test-laptop",
      sleep: async () => {},
      // The browser opens the connect page, and the person, signed in, allows it.
      openBrowser: async (url) => {
        opened = url;
        await engine.allowDevice(url.split("/connect/")[1], "browser@example.com");
      },
    });
    assert.equal(login.code, 0, login.err);
    assert.match(opened, /\/connect\/[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    assert.match(login.out, /Check that the page shows the code [A-Z0-9]{4}-[A-Z0-9]{4}\./);
    assert.match(login.out, /Signed in as browser@example\.com, on the free plan\./);
    assert.match(loadCredentials(env).key, /^phyll_/);
    assert.match((await run(["status"], env)).out, /Free\./);
    assert.equal((await run(["login", "a", "b", "--server", engine.url], env)).code, 2);
  } finally {
    await engine.close();
  }
});

test("setup writes the agent's config and checks the browser", async () => {
  const env = { PHYLL_HOME: makeTree({}), CODEX_HOME: makeTree({}) };
  let checked = false;
  const result = await run(["setup", "codex"], env, {
    mcpCommand: ["node", "phyll.mjs", "mcp"],
    ensureBrowser: async () => (checked = true),
  });
  assert.equal(result.code, 0, result.err);
  assert.ok(checked);
  assert.match(result.out, /Phyll is connected to Codex in .*config\.toml/);
  assert.match(result.out, /Next, create your account: npx phyll signup you@example\.com/);
  assert.match(readFileSync(join(env.CODEX_HOME, "config.toml"), "utf8"), /\[mcp_servers\.phyll\]\ncommand = "node"\nargs = \["phyll\.mjs", "mcp"\]/);
  assert.equal((await run(["setup", "notepad"], env)).code, 2);
});

test("setup connects Cursor, Windsurf and Gemini CLI in their JSON files and keeps the rest", async () => {
  const home = makeTree({
    ".cursor/mcp.json": JSON.stringify({ mcpServers: { other: { command: "other-mcp" } } }),
    ".gemini/settings.json": JSON.stringify({ theme: "Dracula", mcpServers: { phyll: { command: "old" } } }),
  });
  const env = { PHYLL_HOME: makeTree({}) };
  const io = { home, mcpCommand: ["node", "phyll.mjs", "mcp"], ensureBrowser: async () => true };
  for (const [agent, { name }] of Object.entries(JSON_AGENTS)) {
    const result = await run(["setup", agent], env, io);
    assert.equal(result.code, 0, result.err);
    assert.match(result.out, new RegExp(`Phyll is connected to ${name} in `));
  }
  const read = (...path) => JSON.parse(readFileSync(join(home, ...path), "utf8"));
  const entry = { command: "node", args: ["phyll.mjs", "mcp"] };
  assert.deepEqual(read(".cursor", "mcp.json").mcpServers, { other: { command: "other-mcp" }, phyll: entry });
  assert.deepEqual(read(".codeium", "windsurf", "mcp_config.json"), { mcpServers: { phyll: entry } });
  assert.deepEqual(read(".gemini", "settings.json"), { theme: "Dracula", mcpServers: { phyll: entry } });

  // A file with comments is not plain JSON: it stays as it was, and setup shows what to paste.
  const commented = '{\n  // my servers\n  "mcpServers": {}\n}\n';
  writeFileSync(join(home, ".cursor", "mcp.json"), commented);
  const kept = await run(["setup", "cursor"], env, io);
  assert.equal(kept.code, 0, kept.err);
  assert.match(kept.out, /is not plain JSON, so Phyll left it as it was/);
  assert.ok(kept.out.includes(mcpJson(io.mcpCommand)));
  assert.equal(readFileSync(join(home, ".cursor", "mcp.json"), "utf8"), commented);
  writeFileSync(join(home, "array.json"), "[]");
  assert.equal(writeJsonConfig(join(home, "array.json"), io.mcpCommand), false);

  // Any other agent with MCP gets the entry to paste.
  const other = await run(["setup", "other"], env, io);
  assert.equal(other.code, 0, other.err);
  assert.deepEqual(JSON.parse(other.out.slice(other.out.indexOf("{"), other.out.lastIndexOf("}") + 1)), { mcpServers: { phyll: entry } });
});

test("scan ends with the next step, and prints a README badge once the index is low", async () => {
  const env = { PHYLL_HOME: makeTree({}) };
  const after = join(ROOT, "examples", "dm-automation", "after");
  const text = await run(["scan", after], env);
  assert.equal(text.code, 0, text.err);
  assert.match(text.out, /Next: a full review opens the app as a first-time user/);
  assert.match(text.out, /npx phyll setup codex {6}\(or claude, cursor, windsurf, gemini\)/);
  assert.match(text.out, /Show the index in your README: npx phyll scan --format badge/);
  assert.doesNotMatch(text.out, / 1 hits /);
  const badge = await run(["scan", after, "--format", "badge"], env);
  assert.equal(badge.code, 0, badge.err);
  assert.match(badge.out, /^\[!\[Phyll AI tell index: \d+\/100\]\(https:\/\/agentphyll\.com\/badge\/index\/\d+\.svg\)\]\(https:\/\/agentphyll\.com\)\n$/);
  assert.equal((await run(["scan", after, "--format", "xml"], env)).code, 2);
  assert.doesNotMatch(scanNext(60), /README/);
  assert.equal(badgeMarkdown(7, "https://example.test"), "[![Phyll AI tell index: 7/100](https://example.test/badge/index/7.svg)](https://example.test)");
});

// On a new computer Chromium is missing, and setup installs it with Playwright's own command
// line, which the package does not export by name.
test("setup installs a missing Chromium through Playwright's command line", async () => {
  const cli = playwrightCli();
  assert.ok(existsSync(cli), cli);
  const calls = [];
  const lines = [];
  const missing = {
    launch: async () => {
      throw new Error("browserType.launch: Executable doesn't exist at /home/someone/ms-playwright/chromium");
    },
  };
  const installed = await ensureBrowser({ chromium: missing, write: (line) => lines.push(line), run: (...args) => (calls.push(args), { status: 0 }) });
  assert.equal(installed, true);
  assert.deepEqual(calls[0][1], [cli, "install", "chromium"]);
  assert.match(lines.join(""), /Installing the browser Phyll uses/);
  const present = { launch: async () => ({ close: async () => {} }) };
  assert.equal(await ensureBrowser({ chromium: present, run: () => assert.fail("nothing to install") }), true);
});

test("an agent reviews an app through the connector: method, capture, browser, guides and the finished report", { ...engineSkip, timeout: 120000 }, async (t) => {
  if (!hasDeps) {
    t.skip("the connector's dependencies are not installed (cd packages/connector && npm install)");
    return;
  }
  const connectorRequire = createRequire(join(CONNECTOR, "package.json"));
  const load = (spec) => import(pathToFileURL(connectorRequire.resolve(spec)).href);
  const playwright = await load("playwright");
  const chromium = playwright.chromium ?? playwright.default?.chromium;
  try {
    await (await chromium.launch()).close();
  } catch {
    t.skip("Playwright's browser is not installed");
    return;
  }
  const { Client } = await load("@modelcontextprotocol/sdk/client/index.js");
  const { StdioClientTransport } = await load("@modelcontextprotocol/sdk/client/stdio.js");

  const app = createServer((req, res) => {
    const pages = {
      "/": '<!doctype html><html lang="en"><title>Replyloop</title><h1>Replyloop</h1><p>Answer comments with a DM.</p><a href="/flows">Flows</a><button>Get Started</button>',
      "/flows": '<!doctype html><html lang="en"><title>Flows</title><h1>Flows</h1><label for="k">Keyword</label><input id="k">',
    };
    const body = pages[new URL(req.url, "http://x").pathname];
    res.writeHead(body ? 200 : 404, { "content-type": "text/html; charset=utf-8" });
    res.end(body ?? "<h1>Not found</h1>");
  });
  await new Promise((done) => app.listen(0, "127.0.0.1", done));
  const appUrl = `http://127.0.0.1:${app.address().port}/`;

  const engine = await startEngine({ freeSessions: 2 });
  const project = makeTree({ "src/App.jsx": 'export default () => <button className="bg-gradient-to-r from-purple-500 to-blue-500">Get Started</button>;\n' });
  const home = makeTree({});
  saveCredentials({ server: engine.url, key: engine.newKey() }, { PHYLL_HOME: home });
  const client = new Client({ name: "test-agent", version: "1.0.0" });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [BIN, "mcp"], cwd: project, env: { ...process.env, PHYLL_HOME: home }, stderr: "pipe" }));
  const call = async (name, args = {}) => {
    const result = await client.callTool({ name, arguments: args });
    return { ...result, text: result.content.filter((c) => c.type === "text").map((c) => c.text).join("\n") };
  };
  try {
    const tools = (await client.listTools()).tools;
    const names = tools.map((tool) => tool.name);
    for (const name of ["start_review", "capture", "open", "snapshot", "click", "screenshot", "probe", "guide", "finish_review", "scan", "account", "upgrade"]) {
      assert.ok(names.includes(name), name);
    }
    // Agents, and directories that grade servers, read each tool by its description: every tool
    // says what it does and returns, and every field says what it takes.
    for (const tool of tools) {
      assert.ok(tool.description.length >= 80, `${tool.name} has a full description`);
      for (const [field, schema] of Object.entries(tool.inputSchema.properties ?? {})) assert.ok(schema.description?.length >= 20, `${tool.name}.${field} is described`);
    }

    const started = await call("start_review", { url: appUrl, language: "en", jobs: ["Create a flow"] });
    assert.ok(!started.isError, started.text);
    assert.match(started.text, /^Review started\. 1 of 2 free reviews left\./);
    const folder = started.text.match(/Report folder: (\.phyll\/reports\/[\w-]+)/)[1];
    const reportDir = join(project, ...folder.split("/"));
    assert.ok(existsSync(join(reportDir, "scan.json")));
    assert.match(started.text, /# The method/);
    assert.match(started.text, /Core jobs they named: Create a flow\./);

    const captured = await call("capture", { routes: ["/", "/flows"] });
    assert.match(captured.text, /- \/ at desktop size, HTTP 200: screens\/desktop-home\.png/);
    assert.ok(existsSync(join(reportDir, "screens", "mobile-flows.png")));
    assert.match((await call("open", { path: "/flows" })).text, /Opened \/flows/);
    assert.match((await call("snapshot")).text, /heading "Flows"/);
    const shot = await call("screenshot", { name: "Flows empty" });
    assert.equal(shot.content[0].type, "image");
    assert.match((await call("open", { path: "https://elsewhere.example/" })).text, /only pages on/);
    assert.match((await call("guide", { name: "tells", tells: ["F05"] })).text, /^### F05\. /);

    assert.match((await call("finish_review")).text, /report\.json is missing/);
    writeFileSync(join(reportDir, "report.json"), JSON.stringify({ findings: 3 }));
    const rejected = await call("finish_review");
    assert.equal(rejected.isError, true);
    assert.match(rejected.text, /problem\(s\)/);

    const report = sampleReport();
    for (const field of ["language", "mode", "schemaVersion"]) delete report[field];
    delete report.target.url;
    writeFileSync(join(reportDir, "report.json"), JSON.stringify(report, null, 2));
    const finished = await call("finish_review");
    assert.ok(!finished.isError, finished.text);
    assert.match(finished.text, /^Report saved\.\nAI tell index: \d+\/100\. Lower is better\./);
    assert.match(finished.text, /Link: http:\/\/127\.0\.0\.1:\d+\/r\/[A-Za-z0-9]{16}/);
    assert.match(readFileSync(join(reportDir, "report.md"), "utf8"), /Nine fields before the first automation/);
    assert.equal(JSON.parse(readFileSync(join(reportDir, "report.json"), "utf8")).target.url, appUrl);

    assert.match((await call("account")).text, /1 of 2 free reviews left/);

    // A new conversation, for the fixes: a fresh connector picks up the newest review.
    const later = new Client({ name: "test-agent", version: "1.0.0" });
    await later.connect(new StdioClientTransport({ command: process.execPath, args: [BIN, "mcp"], cwd: project, env: { ...process.env, PHYLL_HOME: home }, stderr: "pipe" }));
    try {
      const fixing = await later.callTool({ name: "guide", arguments: { name: "fixing" } });
      assert.ok(!fixing.isError, fixing.content[0].text);
    } finally {
      await later.close();
    }
    assert.ok(!(await call("start_review", { url: appUrl, language: "en" })).isError);
    const blocked = await call("start_review", { url: appUrl, language: "en" });
    assert.match(blocked.text, /You have used your 2 free reviews\./);
    assert.match((await call("scan", { dir: "." })).text, /Static AI tell index/);
  } finally {
    await client.close();
    await engine.close();
    app.close();
  }
});
