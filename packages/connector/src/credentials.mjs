// The Phyll key and server on this computer, in ~/.phyll/credentials.json. PHYLL_API_URL and
// PHYLL_API_KEY win over the file, and PHYLL_HOME moves the folder.
import { chmodSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// The address of Phyll's own server. --server or PHYLL_API_URL point the connector elsewhere.
export const DEFAULT_SERVER = "https://agentphyll.com";

export const phyllHome = (env = process.env) => env.PHYLL_HOME || join(homedir(), ".phyll");
export const credentialsPath = (env = process.env) => join(phyllHome(env), "credentials.json");

export function loadCredentials(env = process.env) {
  let file = {};
  try {
    file = JSON.parse(readFileSync(credentialsPath(env), "utf8"));
  } catch {
    file = {};
  }
  return {
    server: String(env.PHYLL_API_URL || file.server || DEFAULT_SERVER || "").replace(/\/+$/, "") || null,
    key: env.PHYLL_API_KEY || file.key || null,
  };
}

export function saveCredentials({ server, key }, env = process.env) {
  mkdirSync(phyllHome(env), { recursive: true, mode: 0o700 });
  const path = credentialsPath(env);
  writeFileSync(path, JSON.stringify({ server, key }, null, 2) + "\n", { mode: 0o600 });
  try {
    chmodSync(path, 0o600);
  } catch {
    // Windows keeps its own permissions on the user folder.
  }
  return path;
}

export function clearCredentials(env = process.env) {
  rmSync(credentialsPath(env), { force: true });
}
