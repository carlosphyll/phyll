// Calls to the Phyll engine. Every call answers { ok, status, json } and never throws, so the
// agent always gets a message it can pass on.
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;

export function engineClient({ server, key = null, version = "0", fetchImpl = globalThis.fetch }) {
  const base = String(server ?? "").replace(/\/+$/, "");
  async function call(method, path, body) {
    if (!base) return { ok: false, status: 0, json: { message: "No Phyll server is set. Sign up with npx phyll signup you@example.com --server <address>." } };
    if (key && !/^https:\/\//i.test(base) && !LOCAL.test(base)) {
      return { ok: false, status: 0, json: { message: `Phyll sends your key only over https, and ${base} is not.` } };
    }
    let response;
    try {
      response = await fetchImpl(`${base}${path}`, {
        method,
        headers: {
          ...(key ? { authorization: `Bearer ${key}` } : {}),
          ...(body === undefined ? {} : { "content-type": "application/json" }),
          "user-agent": `phyll/${version}`,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (error) {
      return { ok: false, status: 0, json: { message: `Could not reach Phyll at ${base} (${error?.cause?.code ?? error?.message ?? error}).` } };
    }
    const json = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, json: json ?? {} };
  }
  return {
    base,
    signup: (email, language) => call("POST", "/v1/signup", { email, language }),
    me: () => call("GET", "/v1/me"),
    startSession: (body) => call("POST", "/v1/sessions", body),
    guide: (id, name, tells = []) =>
      call("GET", `/v1/sessions/${encodeURIComponent(id)}/guides/${encodeURIComponent(name)}${tells.length ? `?tells=${encodeURIComponent(tells.join(","))}` : ""}`),
    submitReport: (id, report) => call("POST", `/v1/sessions/${encodeURIComponent(id)}/report`, { report }),
    checkout: () => call("POST", "/v1/billing/checkout"),
    portal: () => call("POST", "/v1/billing/portal"),
    loginLink: () => call("POST", "/v1/login-link"),
    // Signing in from the browser: the terminal asks for a code, then checks until the person
    // allows it on the site.
    deviceStart: (name) => call("POST", "/v1/device", { name }),
    deviceCheck: (deviceCode) => call("POST", "/v1/device/token", { deviceCode }),
  };
}
