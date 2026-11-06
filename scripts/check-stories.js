// Checks index.html before it goes live.
// Run it yourself with:  node scripts/check-stories.js
// It stops with an error if the page script is broken, a story points
// to a theme, section or signal that does not exist, or a row in
// deals.csv is wrong.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) fail("No <script> block found in index.html.");
const code = match[1];

// 1. The whole script must be valid JavaScript.
try { new vm.Script(code); } catch (e) { fail("The page script has a syntax error: " + e.message); }

// 2. Load the data lists (everything before the helpers section).
const cut = code.indexOf("D. HELPERS");
if (cut < 0) fail("Could not find the 'D. HELPERS' marker in the script.");
const dataCode = code.slice(0, code.lastIndexOf("/*", cut)) +
  "\n;({ SECTIONS, THEMES, STAGES, SIGNALS, POSTS, TAGS: typeof TAGS === \"undefined\" ? null : TAGS, NOT_DEALS: typeof NOT_DEALS === \"undefined\" ? null : NOT_DEALS, DEAL_STATUS: typeof DEAL_STATUS === \"undefined\" ? null : DEAL_STATUS });";
let data;
try { data = vm.runInNewContext(dataCode, {}); } catch (e) { fail("Could not read the story lists: " + e.message); }
const { SECTIONS, THEMES, STAGES, SIGNALS, POSTS, TAGS, NOT_DEALS, DEAL_STATUS } = data;

// 3. Check every story.
const problems = [];
const live = new Set(SECTIONS.filter(s => s.status === "live").map(s => s.id));
const allSections = new Set(SECTIONS.map(s => s.id));
const themes = new Set(THEMES.map(t => t.id));
const slugs = new Set();
SECTIONS.forEach(s => { if (!["live", "planned", "archived"].includes(s.status)) problems.push(`Section "${s.id}" has status "${s.status}"; use live, planned or archived.`); });
THEMES.forEach(t => {
  if (!(t.stage >= 1 && t.stage <= STAGES.length)) problems.push(`Theme "${t.id}" has stage ${t.stage}; it must be 1 to ${STAGES.length}.`);
  (t.photos || []).forEach(ph => { if (!/^photo-[0-9]+-[0-9a-f]+$/.test(ph)) problems.push(`Theme "${t.id}" has a photo "${ph}" that does not look like an Unsplash photo id (photo-123...-abc...).`); });
});
POSTS.forEach((p, i) => {
  const name = p.slug || `story #${i + 1}`;
  if (!p.slug || !/^[a-z0-9-]+$/.test(p.slug)) problems.push(`${name}: slug must use lowercase letters, numbers and hyphens.`);
  if (slugs.has(p.slug)) problems.push(`${name}: slug is used twice.`);
  slugs.add(p.slug);
  if (!allSections.has(p.section)) problems.push(`${name}: section "${p.section}" does not exist.`);
  else if (!live.has(p.section)) console.log(`Note: ${name} is in a section that is not live ("${p.section}"), so it stays hidden.`);
  if (!themes.has(p.theme)) problems.push(`${name}: theme "${p.theme}" does not exist.`);
  if (!SIGNALS[p.signal]) problems.push(`${name}: signal must be forward, confirms or back.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date || "")) problems.push(`${name}: date must look like 2026-10-25.`);
  ["title", "summary", "cycleRead"].forEach(k => { if (!p[k]) problems.push(`${name}: missing ${k}.`); });
  if (!Array.isArray(p.body) || !p.body.length) problems.push(`${name}: body must be a list of paragraphs.`);
  if (!p.source || !/^https?:\/\//.test(p.source.url || "")) problems.push(`${name}: source needs a name and a full link.`);
  if (TAGS) {
    const t = p.tags || {};
    if (!TAGS.region.includes(t.region)) problems.push(`${name}: tags.region "${t.region}" is not in the TAGS region list.`);
    if (!TAGS.deal.includes(t.deal)) problems.push(`${name}: tags.deal "${t.deal}" is not in the TAGS deal list.`);
    if (!(TAGS.asset[p.section] || []).includes(t.asset)) problems.push(`${name}: tags.asset "${t.asset}" is not in the asset list for section "${p.section}".`);
  }
  if (p.deal) problems.push(`${name}: deal facts now go in deals.csv, not in the story. Move them to a row with story "${p.slug}".`);
  if (p.image !== undefined && typeof p.image !== "string") problems.push(`${name}: image must be a file path or link in quotes.`);
});

// 4. Check deals.csv, the deal tracker's own file.
const dealFile = path.join(__dirname, "..", "deals.csv");
let dealCount = 0;
if (!fs.existsSync(dealFile)) problems.push("deals.csv is missing. The deal tracker reads its rows from that file.");
else {
  const rows = parseCSV(fs.readFileSync(dealFile, "utf8"));
  const COLS = ["id", "date", "deal", "section", "theme", "region", "deal_type", "asset", "country", "amount",
                "usd_millions", "status", "investors", "recipient", "source_name", "source_url", "story"];
  const head = (rows[0] || []).map(h => h.trim());
  const missing = COLS.filter(c => !head.includes(c));
  if (missing.length) problems.push(`deals.csv: the first row must name the columns; missing: ${missing.join(", ")}.`);
  else {
    const ids = new Set(), seen = new Map(), linked = new Set();
    const posts = new Map(POSTS.map(p => [p.slug, p]));
    rows.slice(1).forEach((r, i) => {
      const line = i + 2;
      const o = {}; head.forEach((h, k) => o[h] = (r[k] ?? "").trim());
      const name = `deals.csv line ${line}${o.id ? ` (${o.id})` : ""}`;
      dealCount++;
      if (r.length !== head.length) problems.push(`${name}: has ${r.length} cells but there are ${head.length} columns. A cell with a comma in it needs "double quotes" around it.`);
      if (!/^[a-z0-9-]+$/.test(o.id)) problems.push(`${name}: id must use lowercase letters, numbers and hyphens.`);
      if (ids.has(o.id)) problems.push(`${name}: id is used twice.`);
      ids.add(o.id);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(o.date)) problems.push(`${name}: date must look like 2026-10-25.`);
      if (!o.deal) problems.push(`${name}: deal (the short headline) is empty.`);
      if (!allSections.has(o.section)) problems.push(`${name}: section "${o.section}" does not exist.`);
      if (!themes.has(o.theme)) problems.push(`${name}: theme "${o.theme}" does not exist.`);
      if (TAGS) {
        if (!TAGS.region.includes(o.region)) problems.push(`${name}: region "${o.region}" is not in the TAGS region list.`);
        if (!TAGS.deal.includes(o.deal_type)) problems.push(`${name}: deal_type "${o.deal_type}" is not in the TAGS deal list.`);
        if (!(TAGS.asset[o.section] || []).includes(o.asset)) problems.push(`${name}: asset "${o.asset}" is not in the asset list for section "${o.section}".`);
      }
      if (NOT_DEALS && NOT_DEALS.includes(o.deal_type)) problems.push(`${name}: "${o.deal_type}" is not a deal type; policy and report items do not go in deals.csv.`);
      if (!o.country) problems.push(`${name}: country is empty.`);
      if (!o.amount) problems.push(`${name}: amount is empty; write "Not disclosed" if the source gives none.`);
      if (o.usd_millions !== "" && !(/^\d+(\.\d+)?$/.test(o.usd_millions))) problems.push(`${name}: usd_millions must be a plain number such as 105 (no $, m or commas), or empty.`);
      if (DEAL_STATUS && !DEAL_STATUS.includes(o.status)) problems.push(`${name}: status must be one of ${DEAL_STATUS.join(", ")}.`);
      if (!o.recipient) problems.push(`${name}: recipient is empty.`);
      if (!o.source_name || !/^https?:\/\//.test(o.source_url)) problems.push(`${name}: needs source_name and a full source_url.`);
      const key = (o.source_url + "|" + o.amount).toLowerCase();
      if (seen.has(key)) problems.push(`${name}: looks like a repeat of line ${seen.get(key)} (same source and amount).`);
      seen.set(key, line);
      if (o.story) {
        const p = posts.get(o.story);
        if (!p) problems.push(`${name}: story "${o.story}" is not a story slug in index.html.`);
        else {
          linked.add(o.story);
          if (p.section !== o.section) problems.push(`${name}: section "${o.section}" differs from its story's section "${p.section}".`);
          if (p.tags && p.tags.deal !== o.deal_type) problems.push(`${name}: deal_type "${o.deal_type}" differs from its story's deal tag "${p.tags.deal}".`);
        }
      }
    });
    if (NOT_DEALS) POSTS.forEach(p => {
      if (p.tags && p.tags.deal && !NOT_DEALS.includes(p.tags.deal) && !linked.has(p.slug))
        problems.push(`${p.slug}: deal stories ("${p.tags.deal}") need a row in deals.csv with story "${p.slug}".`);
    });
  }
}

if (problems.length) fail(problems.join("\n"));
console.log(`OK: ${POSTS.length} stories, ${dealCount} deals, ${THEMES.length} themes, ${live.size} live sections.`);

// Reads CSV text (commas, quoted cells, "" for a quote mark) into rows of cells
function parseCSV(text) {
  const rows = []; let row = [], cell = "", quoted = false;
  text = text.replace(/^\ufeff/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some(v => v.trim() !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some(v => v.trim() !== "")) rows.push(row);
  return rows;
}

function fail(msg) { console.error("Story check failed:\n" + msg); process.exit(1); }
