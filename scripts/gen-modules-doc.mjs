// Regenerates MODULES.md from src/lib/registry.ts + categories.ts so the
// docs can never drift from the actual module map. Run with:
//   node scripts/gen-modules-doc.mjs
import { readFileSync, writeFileSync } from "node:fs";

const registrySrc = readFileSync(new URL("../src/lib/registry.ts", import.meta.url), "utf8");
const categoriesSrc = readFileSync(new URL("../src/lib/categories.ts", import.meta.url), "utf8");

function parseObjects(src, startMarker, endMarker) {
  const start = src.indexOf(startMarker);
  const end = src.indexOf(endMarker, start);
  const body = src.slice(start, end);
  const entries = [];
  const re = /\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(body))) {
    const chunk = m[1];
    const obj = {};
    const fieldRe = /(\w+):\s*("((?:[^"\\]|\\.)*)"|\[[^\]]*\])/g;
    let f;
    while ((f = fieldRe.exec(chunk))) {
      const [, key, raw, str] = f;
      if (str !== undefined) {
        obj[key] = str;
      } else {
        // array of strings
        obj[key] = [...raw.matchAll(/"([^"]*)"/g)].map((x) => x[1]);
      }
    }
    if (obj.id || obj.label) entries.push(obj);
  }
  return entries;
}

const categories = parseObjects(categoriesSrc, "export const CATEGORIES", "];");
const modules = parseObjects(registrySrc, "export const MODULES", "\n];");

const byCategory = Object.fromEntries(categories.map((c) => [c.id, []]));
for (const m of modules) (byCategory[m.category] ??= []).push(m);

const STATUS_LABEL = { live: "✅ Live", scaffolded: "🟡 Scaffolded", planned: "⬜ Planned" };

let out = `# Ci Business OS — Module Map

_Generated from \`src/lib/registry.ts\` by \`scripts/gen-modules-doc.mjs\`. Do not edit by hand — edit the registry and regenerate._

${modules.length} modules across ${categories.length} categories. Status counts:

`;

const counts = modules.reduce((acc, m) => ((acc[m.status] = (acc[m.status] ?? 0) + 1), acc), {});
for (const [status, label] of Object.entries(STATUS_LABEL)) {
  out += `- ${label}: ${counts[status] ?? 0}\n`;
}
out += "\n---\n\n";

for (const cat of categories) {
  const mods = byCategory[cat.id] ?? [];
  if (mods.length === 0) continue;
  out += `## ${cat.label}\n\n${cat.description}\n\n`;
  out += `| Module | Status | Replaces | Description |\n|---|---|---|---|\n`;
  for (const m of mods) {
    out += `| **${m.name}** | ${STATUS_LABEL[m.status] ?? m.status} | ${m.replaces ?? "—"} | ${m.description} |\n`;
  }
  out += "\n";
}

writeFileSync(new URL("../MODULES.md", import.meta.url), out);
console.log(`Wrote MODULES.md — ${modules.length} modules, ${categories.length} categories.`);
