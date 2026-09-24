// Reads .phyll/config.json from the reviewed project. Every field is optional.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const CONFIG_DIR = ".phyll";
export const CONFIG_FILE = "config.json";

export function configPath(projectDir) {
  return join(projectDir, CONFIG_DIR, CONFIG_FILE);
}

export function readConfigFile(path) {
  if (!path || !existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`Could not read ${path}: ${error.message}`);
  }
}
