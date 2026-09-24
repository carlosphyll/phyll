// Turns the detectors declared in tells.json into matches over source files.
// Detector kinds: regex, phrase, classCombo (utility-class lists) and metric (from the structure scan).

const ALL_CATEGORIES = ["markup", "script", "style"];
const DEFAULT_CATEGORIES = {
  regex: ALL_CATEGORIES,
  phrase: ["markup", "script"],
  classCombo: ALL_CATEGORIES,
  metric: [],
};
export const MAX_LOCATIONS = 10;

// ---------- lines ----------

export function makeLineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1);
  return (index) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

export function lineAt(text, index) {
  return makeLineIndex(text)(index);
}

// ---------- string literal reading ----------

// Returns the index of the closing quote, or the index before a newline for unterminated strings.
function skipQuoted(text, start, quote) {
  for (let i = start + 1; i < text.length; i++) {
    const c = text[i];
    if (c === "\\") {
      i++;
      continue;
    }
    if (c === quote) return i;
    if (c === "\n") return i - 1;
  }
  return text.length - 1;
}

// Reads a template literal that starts at text[start] === "`".
// Collects its static parts and any string literals inside ${...}, in order.
function readTemplate(text, start) {
  const parts = [];
  let current = "";
  for (let i = start + 1; i < text.length; i++) {
    const c = text[i];
    if (c === "\\") {
      current += text[i + 1] ?? "";
      i++;
      continue;
    }
    if (c === "`") {
      parts.push(current);
      return { end: i, parts };
    }
    if (c === "$" && text[i + 1] === "{") {
      parts.push(current);
      current = "";
      const inner = readBalanced(text, i + 1, "{", "}");
      parts.push(...inner.strings);
      i = inner.end;
      continue;
    }
    current += c;
  }
  parts.push(current);
  return { end: text.length - 1, parts };
}

// Reads from text[start] === open to its matching close, collecting string literal contents.
function readBalanced(text, start, open, close) {
  let depth = 0;
  const strings = [];
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'") {
      const end = skipQuoted(text, i, c);
      strings.push(text.slice(i + 1, end));
      i = end;
      continue;
    }
    if (c === "`") {
      const { end, parts } = readTemplate(text, i);
      strings.push(...parts);
      i = end;
      continue;
    }
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return { end: i, strings };
    }
  }
  return { end: text.length - 1, strings };
}

const tokenize = (s) => s.split(/\s+/).filter(Boolean);

// ---------- class lists ----------

const CLASS_ATTR = /(?<![\w$.-])(?::class|v-bind:class|\[class\]|\[ngClass\]|className|class)\s*=\s*/g;
const CLASS_CALL = /(?<![\w$.])(?:cn|clsx|classnames|classNames|twMerge|twJoin|cva|tv|cx)\s*\(/g;
const APPLY = /@apply\s+([^;{}]+);/g;
const LOOSE_LITERAL = /"([^"\n]*)"|'([^'\n]*)'/g;
const UTILITY_TOKEN = /^!?(?:[a-z0-9:_\-/.%#&>~*]|\[[^\]\s]*\])+$/;

function looksLikeClassList(content) {
  const tokens = tokenize(content);
  if (tokens.length < 2) return false;
  if (!tokens.some((t) => t.includes("-"))) return false;
  return tokens.every((t) => UTILITY_TOKEN.test(t));
}

// Returns [{ index, classes }] for every class list found in the text, in source order.
// category "style" only reads @apply; other categories read attributes, class helper calls,
// @apply inside embedded style blocks, and loose string literals that look like utility lists.
export function extractClassLists(text, category = "markup") {
  const lists = [];
  const consumed = [];
  const inConsumed = (index) => consumed.some(([a, b]) => index >= a && index <= b);

  if (category !== "style") {
    for (const m of text.matchAll(CLASS_ATTR)) {
      const pos = m.index + m[0].length;
      const c = text[pos];
      if (c === '"' || c === "'") {
        const end = skipQuoted(text, pos, c);
        lists.push({ index: pos, classes: tokenize(text.slice(pos + 1, end)) });
        consumed.push([m.index, end]);
      } else if (c === "{") {
        const { end, strings } = readBalanced(text, pos, "{", "}");
        lists.push({ index: pos, classes: tokenize(strings.join(" ")) });
        consumed.push([m.index, end]);
      }
    }
    for (const m of text.matchAll(CLASS_CALL)) {
      if (inConsumed(m.index)) continue;
      const open = m.index + m[0].length - 1;
      const { end, strings } = readBalanced(text, open, "(", ")");
      lists.push({ index: m.index, classes: tokenize(strings.join(" ")) });
      consumed.push([m.index, end]);
    }
  }

  for (const m of text.matchAll(APPLY)) {
    lists.push({ index: m.index, classes: tokenize(m[1]) });
    consumed.push([m.index, m.index + m[0].length]);
  }

  if (category !== "style") {
    for (const m of text.matchAll(LOOSE_LITERAL)) {
      if (inConsumed(m.index)) continue;
      const content = m[1] ?? m[2] ?? "";
      if (looksLikeClassList(content)) lists.push({ index: m.index, classes: tokenize(content) });
    }
  }

  return lists
    .filter((l) => l.classes.length > 0)
    .sort((a, b) => a.index - b.index);
}

// ---------- detectors ----------

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function uniqueFlags(extra = "") {
  return [...new Set(("gu" + extra).split(""))].join("");
}

// The regular expressions here always carry the g flag, which matchAll requires.
function allMatches(re, text) {
  return Array.from(text.matchAll(re), (m) => ({ index: m.index, match: m[0] }));
}

const TYPOGRAPHIC_APOSTROPHE = String.fromCharCode(0x2019);

function phraseSource(phrase) {
  return escapeRegExp(phrase.trim())
    .replace(/\s+/g, "\\s+")
    .replace(/'/g, `['${TYPOGRAPHIC_APOSTROPHE}]`);
}

export function compileDetector(detector) {
  const compiled = compileKind(detector);
  compiled.skipIf = new Set(detector.skipIf ?? []);
  return compiled;
}

// True when a project trait from the structure scan switches the detector off.
function skipped(det, structure) {
  return det.skipIf.has("darkTheme") && structure?.theme === "dark";
}

function compileKind(detector) {
  const categories = new Set(detector.in ?? DEFAULT_CATEGORIES[detector.kind] ?? ALL_CATEGORIES);
  switch (detector.kind) {
    case "regex": {
      const re = new RegExp(detector.pattern, uniqueFlags(detector.flags));
      return { kind: "regex", categories, run: (text) => allMatches(re, text) };
    }
    case "phrase": {
      const alternatives = detector.phrases.map(phraseSource).join("|");
      const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternatives})(?![\\p{L}\\p{N}])`, "giu");
      return { kind: "phrase", categories, run: (text) => allMatches(re, text) };
    }
    case "classCombo": {
      const all = detector.all.map((p) => new RegExp(p, "u"));
      const none = (detector.none ?? []).map((p) => new RegExp(p, "u"));
      const run = (text, lists = extractClassLists(text)) =>
        lists
          .filter(
            (l) =>
              all.every((re) => l.classes.some((c) => re.test(c))) &&
              !none.some((re) => l.classes.some((c) => re.test(c))),
          )
          .map((l) => ({ index: l.index, match: l.classes.join(" ") }));
      return { kind: "classCombo", categories, run };
    }
    case "metric":
      return { kind: "metric", categories, metric: detector.metric, min: detector.min };
    default:
      throw new Error(`Unknown detector kind: ${detector.kind}`);
  }
}

const clip = (s) => s.replace(/\s+/g, " ").trim().slice(0, 100);

function metricLocations(detector, structure) {
  if (!structure) return [];
  if (detector.metric === "longForms") {
    const min = detector.min ?? 7;
    return (structure.forms ?? [])
      .filter((f) => f.fields >= min)
      .map((f) => ({ file: f.file, line: f.line, match: `form with ${f.fields} fields` }));
  }
  if (detector.metric === "modals") {
    return (structure.modals?.locations ?? []).map((l) => ({ file: l.file, line: l.line, match: l.match }));
  }
  return [];
}

// Runs the static detectors of every tell over the files.
// readText(file) returns the file content; structure comes from structure.mjs and feeds metric detectors.
export function runTells(tells, files, readText, structure = null) {
  const compiled = tells
    .filter((t) => (t.detectors ?? []).length > 0)
    .map((t) => ({ tell: t, detectors: t.detectors.map(compileDetector) }));
  const results = new Map(compiled.map(({ tell }) => [tell.id, { id: tell.id, hits: 0, locations: [] }]));

  const record = (id, locations) => {
    const result = results.get(id);
    result.hits += locations.length;
    for (const loc of locations) {
      if (result.locations.length >= MAX_LOCATIONS) break;
      result.locations.push(loc);
    }
  };

  for (const file of files) {
    const text = readText(file);
    const lineOf = makeLineIndex(text);
    let lists = null;
    for (const { tell, detectors } of compiled) {
      for (const det of detectors) {
        if (det.kind === "metric" || !det.categories.has(file.category) || skipped(det, structure)) continue;
        let matches;
        if (det.kind === "classCombo") {
          lists ??= extractClassLists(text, file.category);
          matches = det.run(text, lists);
        } else {
          matches = det.run(text);
        }
        if (matches.length) {
          record(
            tell.id,
            matches.map((m) => ({ file: file.rel, line: lineOf(m.index), match: clip(m.match) })),
          );
        }
      }
    }
  }

  for (const { tell, detectors } of compiled) {
    for (const det of detectors) {
      if (det.kind === "metric") record(tell.id, metricLocations(det, structure));
    }
  }

  return [...results.values()];
}
