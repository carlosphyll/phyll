// The AI tell index: a weighted share of the catalog's tells that are present, from 0 to 100.
// Each tell counts up to its weight. It reaches full weight once its hits reach its cap,
// so the index reflects how many distinct tells appear, not how large the app is.

const clamp01 = (n) => Math.max(0, Math.min(1, n));

export function strengthOf(tell, entry) {
  if (!entry || entry.status !== "present") return 0;
  if (typeof entry.strength === "number") return clamp01(entry.strength);
  if (typeof entry.hits === "number" && entry.hits > 0) return Math.min(1, entry.hits / (tell.cap || 1));
  return 1;
}

// function tells get in the way of using the product; style tells are about the generated look.
export const kindOf = (tell) => tell?.kind ?? "function";

// tellsById: Map of catalog tells. entries: [{ id, status, hits?, strength? }].
// kind limits the index to function or style tells. Unverified entries and unknown ids
// are left out. Returns null when nothing can be scored.
export function computeIndex(tellsById, entries, kind = null) {
  let weighted = 0;
  let total = 0;
  for (const entry of entries) {
    const tell = tellsById.get(entry.id);
    if (!tell || entry.status === "unverified") continue;
    if (kind && kindOf(tell) !== kind) continue;
    total += tell.weight;
    weighted += tell.weight * strengthOf(tell, entry);
  }
  return total === 0 ? null : Math.round((100 * weighted) / total);
}

// Entries for every tell the scanner can see, built from scan results ({ id, hits }).
export function staticEntries(tells, scanTells) {
  const hitsById = new Map(scanTells.map((t) => [t.id, t.hits]));
  return tells
    .filter((t) => t.detection !== "dynamic")
    .map((t) => {
      const hits = hitsById.get(t.id) ?? 0;
      return { id: t.id, status: hits > 0 ? "present" : "absent", hits, source: "static" };
    });
}

// Reviewer entries replace scan entries with the same id; the rest keep their order.
export function mergeEntries(base, overrides = []) {
  const byId = new Map(overrides.map((e) => [e.id, e]));
  const merged = base.map((e) => byId.get(e.id) ?? e);
  const known = new Set(base.map((e) => e.id));
  for (const e of overrides) if (!known.has(e.id)) merged.push(e);
  return merged;
}
