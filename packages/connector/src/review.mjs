// What each connector tool does. The agent that calls them does the thinking on its owner's
// plan; the connector keeps the browser, the files and the key on this machine and asks the
// engine for the method, the guides and the finished report.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { BrowserSession, captureWithSession } from "./browser.mjs";
import { loadCredentials } from "./credentials.mjs";
import { engineClient } from "./engine.mjs";
import { importSkill, probeSource, VERSION } from "./paths.mjs";

export const timestamp = (date = new Date()) => date.toISOString().replace(/[:.]/g, "-").slice(0, 19);

export function normalizeUrl(input) {
  const text = String(input ?? "").trim();
  if (!text) throw new Error("give the address of the running app, such as http://localhost:3000");
  const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `http://${text}`);
  if (!/^https?:$/.test(url.protocol)) throw new Error("the address must start with http:// or https://");
  return url.href;
}

function localeLanguage() {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale ?? "";
  return locale.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
}

export function describeCapture(manifest) {
  const pages = manifest?.pages ?? [];
  if (!pages.length) return "No screen could be captured, so capture what you need with the browser tools.";
  const lines = pages.map((p) => {
    const files = [p.screenshot, p.probe].filter(Boolean).join(", ");
    const trouble = p.error ? ` Could not capture: ${p.error}.` : "";
    const errors = p.consoleErrors?.length ? ` JavaScript errors: ${p.consoleErrors.slice(0, 2).join(" | ")}.` : "";
    return `- ${p.route} at ${p.viewport} size${p.status ? `, HTTP ${p.status}` : ""}: ${files || "no files"}.${trouble}${errors}`;
  });
  return ["Captured screens, with the probe result for each, saved in capture.json:", ...lines].join("\n");
}

function finishText(result, reportRel) {
  const report = result.report ?? {};
  const summary = report.summary ?? {};
  const byId = new Map((report.findings ?? []).map((f) => [f.id, f]));
  const top = (report.topThree ?? []).map((id) => byId.get(id)).filter(Boolean);
  const previous = typeof report.history?.previousIndex === "number" ? `, previous ${report.history.previousIndex}` : "";
  return [
    result.message,
    `AI tell index: ${summary.aiTellIndex ?? "n/a"}/100${previous}. Lower is better.`,
    summary.inputs ? `Inputs asked / needed on the core jobs: ${summary.inputs.asked} / ${summary.inputs.needed}.` : null,
    top.length ? "What blocks people most:" : null,
    ...top.map((f, i) => `${i + 1}. ${f.title} (${f.severity})`),
    `Report on this machine: ${reportRel}/report.md`,
    `Link: ${result.url}`,
    "Tell the person the index, these findings and where the report is, and offer to fix them.",
  ]
    .filter((line) => line !== null && line !== undefined)
    .join("\n");
}

const NOT_CONNECTED =
  "Phyll is not connected on this computer yet. Ask the person to run npx phyll signup their@email.com in a terminal (or npx phyll login <key> if they already have an account), then try again.";

export class Connector {
  constructor({ env = process.env, cwd = process.cwd(), fetchImpl = globalThis.fetch, loadPlaywright = () => import("playwright"), now = () => new Date() } = {}) {
    this.env = env;
    this.cwd = cwd;
    this.fetchImpl = fetchImpl;
    this.loadPlaywright = loadPlaywright;
    this.now = now;
    this.review = null;
  }

  engine() {
    const { server, key } = loadCredentials(this.env);
    return key && server ? engineClient({ server, key, version: VERSION, fetchImpl: this.fetchImpl }) : null;
  }

  // The review of this session, or the newest one in the project, so fixes can happen in a new
  // conversation after the review ended.
  current() {
    if (this.review) return this.review;
    const reports = join(this.cwd, ".phyll", "reports");
    const newest = existsSync(reports)
      ? readdirSync(reports)
          .filter((name) => existsSync(join(reports, name, "session.json")))
          .sort()
          .at(-1)
      : null;
    if (!newest) throw new Error("no review has started. Call start_review with the address of the app first.");
    const saved = JSON.parse(readFileSync(join(reports, newest, "session.json"), "utf8"));
    this.review = { ...saved, project: this.cwd, reportDir: join(reports, newest), reportRel: `.phyll/reports/${newest}`, browser: null };
    return this.review;
  }

  async browser() {
    const review = this.current();
    if (!review.browser) {
      const mod = await this.loadPlaywright();
      const playwright = mod.chromium ? mod : mod.default;
      const session = new BrowserSession({ playwright, baseUrl: review.url, out: review.reportDir, probeSource: probeSource() });
      try {
        await session.start();
      } catch (error) {
        const missing = /Executable doesn't exist|playwright install/i.test(error?.message ?? "");
        throw new Error(missing ? "the browser is not installed. Ask the person to run npx phyll setup once, with the name of their agent, such as npx phyll setup codex." : `the browser did not start: ${error.message}`);
      }
      review.browser = session;
    }
    return review.browser;
  }

  async scan({ dir } = {}) {
    const { scan, formatText } = await importSkill("scripts/scan.mjs");
    return { text: formatText(scan(resolve(this.cwd, dir ?? "."))) };
  }

  async startReview({ url, name, language, user, jobs, project_dir: projectDir } = {}) {
    const engine = this.engine();
    if (!engine) return { text: NOT_CONNECTED, isError: true };
    const target = normalizeUrl(url);
    const project = resolve(this.cwd, projectDir ?? ".");
    if (!existsSync(project)) throw new Error(`the project folder ${project} does not exist`);
    const { configPath, readConfigFile } = await importSkill("scripts/lib/config.mjs");
    const config = readConfigFile(configPath(project));
    const reportRel = `.phyll/reports/${timestamp(this.now())}`;
    const reportDir = join(project, ...reportRel.split("/"));
    mkdirSync(reportDir, { recursive: true });

    const { scan } = await importSkill("scripts/scan.mjs");
    const result = scan(project, { ignore: config.ignore ?? [] });
    writeFileSync(join(reportDir, "scan.json"), JSON.stringify(result, null, 2) + "\n");
    const routes = (result.structure?.routes ?? []).map((r) => r.path);
    const summary = {
      staticIndex: result.staticIndex,
      tells: result.tells.filter((t) => t.hits > 0).map((t) => ({ id: t.id, hits: t.hits })),
      structure: {
        routes: routes.map((path) => ({ path })),
        forms: (result.structure?.forms ?? []).map((f) => ({ file: f.file, line: f.line, fields: f.fields })),
      },
    };

    const lang = language || config.language || localeLanguage();
    const answer = await engine.startSession({
      url: target,
      name: name || config.name || basename(project),
      language: lang,
      user: user || config.endUser || undefined,
      jobs: jobs?.length ? jobs : Array.isArray(config.coreJobs) ? config.coreJobs : [],
      reportFolder: reportRel,
      scan: summary,
    });
    if (!answer.ok) {
      rmSync(reportDir, { recursive: true, force: true });
      const link = answer.json.checkoutUrl ? `\nCheckout: ${answer.json.checkoutUrl}` : "";
      return { text: `${answer.json.message ?? `Phyll answered ${answer.status}.`}${link}`, isError: answer.status !== 402 };
    }
    await this.review?.browser?.close();
    const { staticRoutes } = await importSkill("scripts/capture.mjs");
    this.review = { id: answer.json.id, url: target, project, reportDir, reportRel, routes: staticRoutes(routes), browser: null };
    writeFileSync(join(reportDir, "session.json"), JSON.stringify({ id: answer.json.id, url: target, routes: this.review.routes }, null, 2) + "\n");
    return { text: [answer.json.message, `Report folder: ${reportRel}`, "", answer.json.instructions].join("\n") };
  }

  async capture({ routes } = {}) {
    const review = this.current();
    const { staticRoutes, uniqueSlugs } = await importSkill("scripts/capture.mjs");
    let list = staticRoutes(routes?.length ? routes : review.routes).slice(0, 12);
    if (!list.length) list = ["/"];
    const session = await this.browser();
    return { text: describeCapture(await captureWithSession({ session, routes: list, out: review.reportDir, slugs: uniqueSlugs(list) })) };
  }

  async guide({ name, tells = [] } = {}) {
    const review = this.current();
    const engine = this.engine();
    if (!engine) return { text: NOT_CONNECTED, isError: true };
    const answer = await engine.guide(review.id, name, tells);
    return answer.ok ? { text: answer.json.text } : { text: answer.json.message ?? `Phyll answered ${answer.status}.`, isError: true };
  }

  async finishReview() {
    const review = this.current();
    const engine = this.engine();
    if (!engine) return { text: NOT_CONNECTED, isError: true };
    const path = join(review.reportDir, "report.json");
    if (!existsSync(path)) return { text: `report.json is missing in ${review.reportRel}. Write it there first.`, isError: true };
    let report;
    try {
      report = JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
      return { text: `report.json is not valid JSON: ${error.message}`, isError: true };
    }
    const answer = await engine.submitReport(review.id, report);
    if (!answer.ok) {
      const problems = (answer.json.errors ?? []).map((e) => `- ${e}`);
      return { text: [answer.json.message ?? `Phyll answered ${answer.status}.`, ...problems].join("\n"), isError: true };
    }
    writeFileSync(path, JSON.stringify(answer.json.report, null, 2) + "\n");
    writeFileSync(join(review.reportDir, "report.md"), answer.json.markdown);
    await review.browser?.close();
    review.browser = null;
    return { text: finishText(answer.json, review.reportRel) };
  }

  async account() {
    const engine = this.engine();
    if (!engine) return { text: NOT_CONNECTED, isError: true };
    const answer = await engine.me();
    if (!answer.ok) return { text: answer.json.message ?? `Phyll answered ${answer.status}.`, isError: true };
    const me = answer.json;
    const sessions = me.sessions ?? {};
    const left = me.plan === "pro" ? "Phyll Pro, unlimited reviews" : `${Math.max(0, (sessions.limit ?? 0) - (sessions.used ?? 0))} of ${sessions.limit} free reviews left`;
    return { text: `${me.email}: ${left}.` };
  }

  async upgrade() {
    const engine = this.engine();
    if (!engine) return { text: NOT_CONNECTED, isError: true };
    const answer = await engine.checkout();
    return answer.ok
      ? { text: `Ask the person to open this link to subscribe to Phyll Pro: ${answer.json.url}` }
      : { text: answer.json.message ?? `Phyll answered ${answer.status}.`, isError: true };
  }

  async close() {
    await this.review?.browser?.close();
  }
}
