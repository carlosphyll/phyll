// A small stand-in for Phyll's engine, so the connector tests run without it. It answers the same
// routes with the same shapes and messages, and keeps everything in memory.
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";

export const engineSkip = {};

const id = () => randomBytes(12).toString("base64url").replace(/[-_]/g, "x").slice(0, 16);
const pt = (language) => String(language ?? "").startsWith("pt");

export async function startEngine({ freeSessions = 5 } = {}) {
  const accounts = new Map();
  const sessions = new Map();
  const newAccount = (email) => {
    const key = `phyll_${id()}${id()}`;
    accounts.set(key, { email, used: 0 });
    return key;
  };
  let base = "";

  const server = createServer(async (req, res) => {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const body = raw ? JSON.parse(raw) : {};
    const reply = (status, data) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(data));
    };
    const url = new URL(req.url, "http://x");
    const account = accounts.get(String(req.headers.authorization ?? "").replace(/^Bearer /, ""));

    if (req.method === "POST" && url.pathname === "/v1/signup") {
      if ([...accounts.values()].some((a) => a.email === body.email)) return reply(409, { message: `${body.email} already has an account.` });
      const key = newAccount(body.email);
      const message = pt(body.language) ? `Conta criada, com ${freeSessions} revisões grátis.` : `Account created, with ${freeSessions} free reviews.`;
      return reply(201, { email: body.email, plan: "free", key, reviewsLeft: freeSessions, message });
    }
    if (!account) return reply(401, { message: "Missing or unknown API key." });
    if (req.method === "GET" && url.pathname === "/v1/me") {
      return reply(200, { email: account.email, plan: "free", sessions: { used: account.used, limit: freeSessions, period: "total" } });
    }
    if (req.method === "POST" && url.pathname === "/v1/login-link") {
      return reply(201, { url: `http://${req.headers.host}/login/${"a".repeat(40)}` });
    }
    if (req.method === "POST" && url.pathname === "/v1/sessions") {
      if (account.used >= freeSessions) {
        const message = pt(body.language)
          ? `Você usou as ${freeSessions} revisões grátis. O Phyll Pro custa R$ 9 por mês, com revisões ilimitadas. O Phyll Pro abre em breve.`
          : `You have used your ${freeSessions} free reviews. Phyll Pro costs R$ 9 a month, with unlimited reviews, and checkout shows the price in your currency. Phyll Pro opens soon.`;
        return reply(402, { message });
      }
      account.used += 1;
      const session = { id: id(), url: body.url };
      sessions.set(session.id, session);
      const left = freeSessions - account.used;
      const jobs = body.jobs?.length ? `Core jobs they named: ${body.jobs.join("; ")}.` : "Infer two or three core jobs.";
      return reply(201, {
        id: session.id,
        instructions: `You are doing a Phyll review of ${body.url}. The report folder is ${body.reportFolder}.\n\n${jobs}\n\n# The method\n\nFrame, collect evidence, judge, report.`,
        guides: ["walkthrough", "heuristics", "report-format", "fixing", "tells"],
        plan: "free",
        reviewsLeft: left,
        message: pt(body.language) ? `Revisão iniciada. Restam ${left} de ${freeSessions} revisões grátis.` : `Review started. ${left} of ${freeSessions} free reviews left.`,
      });
    }
    const guide = url.pathname.match(/^\/v1\/sessions\/([^/]+)\/guides\/([a-z-]+)$/);
    if (req.method === "GET" && guide && sessions.has(guide[1])) {
      const tells = (url.searchParams.get("tells") ?? "").split(",").filter(Boolean);
      const text = guide[2] === "tells" && tells.length ? tells.map((t) => `### ${t}. A tell\n\nWatch for it.`).join("\n\n") : `# ${guide[2]}\n\nA guide.`;
      return reply(200, { name: guide[2], text });
    }
    const report = url.pathname.match(/^\/v1\/sessions\/([^/]+)\/report$/);
    if (req.method === "POST" && report && sessions.has(report[1])) {
      const given = body.report ?? {};
      if (!Array.isArray(given.findings)) {
        return reply(400, { message: "The report has 1 problem(s). Fix them in report.json and call finish_review again.", errors: ["findings must be a list"] });
      }
      const built = { ...given, target: { ...(given.target ?? {}), url: sessions.get(report[1]).url }, summary: { aiTellIndex: 42 }, topThree: given.findings.slice(0, 3).map((f) => f.id) };
      const markdown = `# Phyll review\n\n${given.findings.map((f) => `### ${f.id}. ${f.title}`).join("\n\n")}\n`;
      return reply(201, { url: `${base}/r/${id()}`, project: `${base}/p/project-${id()}`, report: built, markdown, message: "Report saved." });
    }
    if (req.method === "POST" && url.pathname.startsWith("/v1/billing/")) return reply(503, { message: "Phyll Pro is not open on this server yet." });
    return reply(404, { message: "There is nothing at this address." });
  });

  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  base = `http://127.0.0.1:${server.address().port}`;
  return {
    url: base,
    newKey: () => newAccount("maker@example.com"),
    close: () =>
      new Promise((done) => {
        server.closeAllConnections();
        server.close(done);
      }),
  };
}
