// Checks index.html before it goes live.
// Run it yourself with:  node scripts/check-stories.js
// It stops with an error if the page script is broken or a story points
// to a theme, section or signal that does not exist.
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
  "\n;({ SECTIONS, THEMES, STAGES, SIGNALS, POSTS });";
let data;
try { data = vm.runInNewContext(dataCode, {}); } catch (e) { fail("Could not read the story lists: " + e.message); }
const { SECTIONS, THEMES, STAGES, SIGNALS, POSTS } = data;

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
  if (p.image !== undefined && typeof p.image !== "string") problems.push(`${name}: image must be a file path or link in quotes.`);
});

if (problems.length) fail(problems.join("\n"));
console.log(`OK: ${POSTS.length} stories, ${THEMES.length} themes, ${live.size} live sections.`);

function fail(msg) { console.error("Story check failed:\n" + msg); process.exit(1); }
