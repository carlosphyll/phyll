// Small helpers shared by the command-line scripts.
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// True when the module at metaUrl is the script Node was asked to run.
export function isMain(metaUrl) {
  if (!process.argv[1]) return false;
  const self = fileURLToPath(metaUrl);
  const entry = resolve(process.argv[1]);
  return process.platform === "win32" ? self.toLowerCase() === entry.toLowerCase() : self === entry;
}

export function fail(message, code = 1) {
  process.stderr.write(`phyll: ${message}\n`);
  process.exit(code);
}
