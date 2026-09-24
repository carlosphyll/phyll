// Where the connector finds the scanner and the probe: skills/phyll when it runs from the
// repository, or the copy packed next to it on npm. The copy holds only the open parts.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const PACKAGE_DIR = join(HERE, "..");
const REPO = join(PACKAGE_DIR, "..", "..");
const IN_REPO = existsSync(join(REPO, "skills", "phyll", "scripts", "scan.mjs")) && existsSync(join(REPO, "packages", "connector", "package.json"));

export const SKILL_DIR = IN_REPO ? join(REPO, "skills", "phyll") : join(PACKAGE_DIR, "skill");
export const BIN = join(PACKAGE_DIR, "bin", "phyll.mjs");
export const VERSION = JSON.parse(readFileSync(join(PACKAGE_DIR, "package.json"), "utf8")).version;
// Installed from npm, the package sits inside a node_modules folder; from the repository it does not.
export const PUBLISHED = PACKAGE_DIR.split(/[\\/]/).includes("node_modules");

export const importSkill = (relative) => import(pathToFileURL(join(SKILL_DIR, relative)).href);
export const probeSource = () => readFileSync(join(SKILL_DIR, "scripts", "probe.js"), "utf8");
