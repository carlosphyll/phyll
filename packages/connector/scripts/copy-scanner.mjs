// Copies the open parts of skills/phyll into this package before npm packs it: the scanner, the
// probe, the capture helpers and the catalog data. The review method never ships with it.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE = join(HERE, "..");
const SOURCE = join(PACKAGE, "..", "..", "skills", "phyll");
const TARGET = join(PACKAGE, "skill");

export const OPEN_FILES = [
  "scripts/scan.mjs",
  "scripts/capture.mjs",
  "scripts/probe.js",
  "scripts/lib/cli.mjs",
  "scripts/lib/config.mjs",
  "scripts/lib/detectors.mjs",
  "scripts/lib/files.mjs",
  "scripts/lib/score.mjs",
  "scripts/lib/structure.mjs",
  "scripts/lib/version.mjs",
  "data/tells.json",
  "schema/tells.schema.json",
  "schema/config.schema.json",
];

if (!existsSync(join(SOURCE, "scripts", "scan.mjs"))) {
  console.error(`copy-scanner: the scanner is not at ${SOURCE}`);
  process.exit(1);
}
rmSync(TARGET, { recursive: true, force: true });
for (const file of OPEN_FILES) {
  mkdirSync(dirname(join(TARGET, file)), { recursive: true });
  cpSync(join(SOURCE, file), join(TARGET, file));
}
console.log(`copy-scanner: ${OPEN_FILES.length} files in ${TARGET}`);
