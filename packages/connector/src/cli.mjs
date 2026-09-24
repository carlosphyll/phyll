// phyll: the commands a person types. The review itself happens inside their agent, through
// the MCP server that `phyll mcp` runs and `phyll setup` registers.
import { parseArgs } from "node:util";
import { clearCredentials, credentialsPath, loadCredentials, saveCredentials } from "./credentials.mjs";
import { engineClient } from "./engine.mjs";
import { importSkill, VERSION } from "./paths.mjs";
import { ensureBrowser, mcpCommand, registerClaude, writeCodexConfig } from "./setup.mjs";

export const HELP = `Phyll ${VERSION}: UX review for apps built with AI, inside the agent you already use.

Get started:
  npx phyll signup you@example.com     Create a free account; the key is saved on this computer
  npx phyll setup codex                Connect Phyll to Codex (or: npx phyll setup claude)
  Then ask your agent: review my app at http://localhost:3000

Commands:
  signup <email>     Create a free account, with free full reviews
  login <key>        Use an account you already have on this computer
  setup <agent>      Connect Phyll to codex or claude, and install the browser it uses
  status             Your plan and the reviews left
  pro                Subscribe to Phyll Pro
  billing            Change the card or cancel Phyll Pro
  scan [folder]      Scan the source for AI tells. Free, with no account
  mcp                Run the connector for your agent (setup registers it for you)
  logout             Forget the key on this computer

Options: --server <address> for signup and login, --lang <code> for signup, --format json for scan.

The AI work runs in your agent, on your own plan. Phyll's engine sends the method and keeps the reports.
`;

const guessLanguage = () => ((Intl.DateTimeFormat().resolvedOptions().locale ?? "").toLowerCase().startsWith("pt") ? "pt-BR" : "en");

function options(args, spec) {
  return parseArgs({ args, allowPositionals: true, strict: true, options: spec });
}

export async function main(argv, io = {}) {
  const out = io.stdout ?? process.stdout;
  const err = io.stderr ?? process.stderr;
  const env = io.env ?? process.env;
  const cwd = io.cwd ?? process.cwd();
  const fetchImpl = io.fetch ?? globalThis.fetch;
  const write = (text) => out.write(text);
  const fail = (text, code = 1) => {
    err.write(`phyll: ${text}\n`);
    return code;
  };
  const client = (server, key) => engineClient({ server, key, version: VERSION, fetchImpl });
  const [command, ...rest] = argv;

  try {
    switch (command) {
      case undefined:
      case "help":
      case "-h":
      case "--help":
        write(HELP);
        return 0;
      case "version":
      case "-v":
      case "--version":
        write(`phyll ${VERSION}\n`);
        return 0;

      case "signup": {
        const { values, positionals } = options(rest, { server: { type: "string" }, lang: { type: "string" } });
        if (positionals.length !== 1) return fail("give your email, such as npx phyll signup you@example.com", 2);
        const server = String(values.server ?? loadCredentials(env).server ?? "").replace(/\/+$/, "");
        if (!server) return fail("give the address of the Phyll server with --server", 2);
        const answer = await client(server, null).signup(positionals[0], values.lang ?? guessLanguage());
        if (!answer.ok) return fail(answer.json.message ?? `Phyll answered ${answer.status}.`);
        const path = saveCredentials({ server, key: answer.json.key }, env);
        write(`${answer.json.message}\nYour key, shown only now: ${answer.json.key}\nIt is saved in ${path}.\n\nNext, connect Phyll to your agent:\n  npx phyll setup codex\n  npx phyll setup claude\n`);
        return 0;
      }

      case "login": {
        const { values, positionals } = options(rest, { server: { type: "string" } });
        if (positionals.length !== 1) return fail("give your key, such as npx phyll login phyll_...", 2);
        const server = String(values.server ?? loadCredentials(env).server ?? "").replace(/\/+$/, "");
        if (!server) return fail("give the address of the Phyll server with --server", 2);
        const answer = await client(server, positionals[0]).me();
        if (!answer.ok) return fail(answer.json.message ?? `Phyll answered ${answer.status}.`);
        saveCredentials({ server, key: positionals[0] }, env);
        write(`Signed in as ${answer.json.email}, on the ${answer.json.plan === "pro" ? "Phyll Pro" : "free"} plan.\n`);
        return 0;
      }

      case "logout":
        clearCredentials(env);
        write(`Removed ${credentialsPath(env)}.\n`);
        return 0;

      case "status": {
        const { server, key } = loadCredentials(env);
        if (!key) return fail("no account on this computer yet. Run npx phyll signup you@example.com");
        const answer = await client(server, key).me();
        if (!answer.ok) return fail(answer.json.message ?? `Phyll answered ${answer.status}.`);
        const me = answer.json;
        const sessions = me.sessions ?? {};
        const plan =
          me.plan === "pro"
            ? `Phyll Pro. Reviews this month: ${sessions.used ?? 0}.`
            : `Free. ${Math.max(0, (sessions.limit ?? 0) - (sessions.used ?? 0))} of ${sessions.limit} free reviews left.`;
        write(`${me.email} on ${server}\n${plan}\n`);
        return 0;
      }

      case "pro":
      case "billing": {
        const { server, key } = loadCredentials(env);
        if (!key) return fail("no account on this computer yet. Run npx phyll signup you@example.com");
        const answer = command === "pro" ? await client(server, key).checkout() : await client(server, key).portal();
        if (!answer.ok) return fail(answer.json.message ?? `Phyll answered ${answer.status}.`);
        write(`${command === "pro" ? "Subscribe to Phyll Pro here" : "Manage Phyll Pro here"}:\n${answer.json.url}\n`);
        return 0;
      }

      case "setup": {
        const agent = rest[0];
        if (!["codex", "claude"].includes(agent)) return fail("say which agent to connect: npx phyll setup codex, or npx phyll setup claude", 2);
        const command = io.mcpCommand ?? mcpCommand();
        if (agent === "codex") {
          const file = writeCodexConfig(command, env);
          write(`Phyll is connected to Codex in ${file}. Restart Codex so it loads the connector.\n`);
        } else {
          const result = registerClaude(command, io.run);
          write(
            result.ok
              ? "Phyll is connected to Claude Code. Start a new session so it loads the connector.\n"
              : `Claude Code was not found on this computer. Run this where it is installed:\n  ${result.manual}\n`,
          );
        }
        if (!(await (io.ensureBrowser ?? ensureBrowser)({ write }))) return fail("the browser could not be installed. Run: npx playwright install chromium");
        write(
          loadCredentials(env).key
            ? "Next, ask your agent to review your app, for example: review my app at http://localhost:3000\n"
            : "Next, create your account: npx phyll signup you@example.com\n",
        );
        return 0;
      }

      case "scan": {
        const { values, positionals } = options(rest, { format: { type: "string" } });
        const { scan, formatText } = await importSkill("scripts/scan.mjs");
        const result = scan(positionals[0] ?? cwd);
        write(values.format === "json" ? `${JSON.stringify(result, null, 2)}\n` : formatText(result));
        return 0;
      }

      case "mcp": {
        const { runMcpServer } = await import("./mcp.mjs");
        await runMcpServer({ env, cwd, fetchImpl });
        return null;
      }

      default:
        return fail(`there is no command ${command}. Run npx phyll --help`, 2);
    }
  } catch (error) {
    if (String(error?.code ?? "").startsWith("ERR_PARSE_ARGS")) return fail(`${error.message}. Run npx phyll --help`, 2);
    throw error;
  }
}
