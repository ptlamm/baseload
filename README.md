# Transilience — your blog

One file, `index.html`, holds the whole site: design (CSS), content (the `THEMES` and `POSTS` lists) and behaviour (JavaScript). The file is shown as six pages: Home, Stories, Cycle map, Deals, Calculator and About.

## 1. What is in this repository
- `index.html`: the whole site: design, stories and behaviour.
- `_redirects`: serves `index.html` at each page address (`/stories`, `/deals`...) on Cloudflare Pages.
- `netlify.toml`: the old Netlify settings, kept as a backup host.
- `scripts/check-stories.js`: the story check.
- `README.md`: this guide.

## 2. Edit it
Open `index.html` on GitHub and click the pencil icon, or use a code editor such as **VS Code**. Use Find (Ctrl/Cmd + F) to jump to these parts:

| Find this | What it controls |
|---|---|
| `1. DESIGN TOKENS` | Colours and fonts for the whole site |
| `A. SETTINGS` | Site name, LinkedIn link, Substack address |
| `const SECTIONS` | The sectors you cover: live or planned |
| `const STAGES` | The five cycle stages and their wording |
| `B. THEMES` | The cycle map: each theme and its stage |
| `C. STORIES` | Your news summaries |
| `G. LCOE CALCULATOR` | The solar farm calculator and its example projects |
| `F2. PAGES` | The list of pages and their addresses |

Commit the change on GitHub, and the live site updates in about a minute.

## 2b. Pages
| Page | Address | What is on it |
|---|---|---|
| Home | `/` | The hero, On the wire, the six newest stories |
| Stories | `/stories` | Browse by tag, then every live sector (six stories each, then "See all") |
| Cycle map | `/cycle` | How the cycle works, and where each theme sits |
| Deals | `/deals` | The deal tracker |
| Calculator | `/calculator` | The levelised-cost calculator |
| About | `/about` | About you, and On the drawing board |

Each block inside `<main>` in `index.html` has `data-page="..."`, the page it shows on. To move a block to another page, change that word. A block can sit on two pages: the Subscribe block has `data-page="home about"`.

To add a page: add it to `PAGES` (find `F2. PAGES`), give its blocks `data-page="its-id"`, add a menu link next to the others, and add a line for its address to `_redirects` (and to `netlify.toml`, the backup host).

Links from the old one-page site still work: `/#deals` opens the Deals page, `/#energy` opens Stories at Energy, and a story link such as `/#story-slug` opens the story on any page.

## 3. Open, add or pause a sector
All sectors live in one list, `SECTIONS`. Each has a `status`:
- `"live"`: shown on the site and in the menu, and included in the Sunday drafts.
- `"planned"`: shown in "On the drawing board" as a sector coming later.
- `"archived"`: hidden from the site and from the Sunday drafts. Its stories stay in the file, and setting it back to `"live"` brings them back. A theme whose stories are all archived also hides from the cycle map until it has a live story again.

To start covering a planned sector: change `"planned"` to `"live"`. It gets its own block on the Stories page, and Sunday drafts, automatically.

To add a new idea: copy one line, give it a short unique `id` (lowercase, hyphens), a `name`, a one-line `blurb` and `status: "planned"`.

To pause a sector: set it back to `"planned"`. Its stories stay in the file but are hidden until you switch it on again.

The order of the list is the order on the page. Start with the sector you know best.

### Thumbnails (photos)
Each theme has a `photos` list of three free Unsplash photos. Its stories use them in turn, so neighbouring cards rarely repeat. The site loads them straight from Unsplash, and the footer and story pages credit Unsplash.

To change or add a theme photo:
1. Find a photo on **unsplash.com**. Use free photos only; skip any marked **Unsplash+**.
2. Open the photo, right-click it and choose **Copy image address**.
3. The address looks like `https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?...`. Copy the part from `photo-` up to the `?`.
4. Paste it into the theme's `photos` list in quotes, separated by commas.

To give one story its own picture, add `image: "images/file.png"` (a file you upload to the repository) or a full image link to that story. Never use pictures copied from news articles.

Photos are picked by the story's **asset tag** first. `ASSET_PHOTOS` (just below `TAGS`) lists photos for assets such as Ports, Airports, Solar and Data centres, so a port deal shows a port. An asset with no photos there uses its theme's photos instead. Add photos to `ASSET_PHOTOS` the same way as theme photos; Gas & LNG and Water & utilities still need some.

A theme with no photos falls back to a drawn thumbnail made from its `icon` (sun, globe, pylon, server, bond, battery, crane or chart).

### Deal tracker (`deals.csv`)
The deals live in their own file, **`deals.csv`**, one row per deal. The site reads it every time the page opens and shows the **Deal tracker** table, newest first, with a total of the deals that have a US dollar figure. The **Download CSV** button hands visitors this same file.

A deal can have a full story, or just a row:
- **With a story:** put the story's `slug` in the `story` column. The table links to the story, and the story page shows a "Deal facts" box.
- **Without a story:** leave `story` empty. The table links straight to the original source, marked ↗.

To edit it, open `deals.csv` on GitHub and click the pencil (GitHub shows it as a table), or download it, edit it in Excel and save it as CSV. The columns:

| Column | What goes in it |
|---|---|
| `id` | Short unique name, lowercase with hyphens. For a deal with a story, use the story's slug. |
| `date` | Date of the original report, `2026-10-25` |
| `deal` | A one-line headline in your own words |
| `section`, `theme` | The ids of a section and a theme, as in `index.html` |
| `region`, `deal_type`, `asset` | Tags from the `TAGS` lists. Policy and report items do not go in this file. |
| `country` | Country of the deal or asset, or "Global" / "Emerging markets" |
| `amount` | As reported, in its own currency: `$105m`, `€300m`, `Not disclosed` |
| `usd_millions` | A plain number such as `105`, only when the source gives a US$ figure; otherwise empty |
| `status` | Closed, Agreed, Open or Cancelled |
| `investors` | Who puts the money in, separated by semicolons: `HSBC; ADB`. Empty if not named. |
| `recipient` | Who receives the money |
| `source_name`, `source_url` | The publisher and the link to the original |
| `story` | The slug of the Transilience story about it, or empty |

A cell with a comma in it needs "double quotes" around it (Excel does this for you). The story check stops the build if a row has a wrong value, if the same deal appears twice, or if a deal story has no row.

### Tags
Every story has three tags: a **region**, a **deal type** and an **asset**. They show as small chips on cards and story pages; clicking one lists every story with that tag in the "Browse by tag" section. The lists live in `TAGS` near the top of the stories:

- **Region:** UK, Europe, US, Vietnam, ASEAN, India, Australia, Other emerging markets, Global
- **Deal type:** Fund raise, Stake sale / M&A, Debt & project finance, Bond issue, Contract / PPA, Tender / auction, Policy & regulation, Report & data
- **Asset:** a separate list for each section

To add a tag, add it to the right list in `TAGS`. Use exactly the same spelling in stories; the story check stops the build if a tag is not on the lists. Tags with no live stories stay hidden on the site.

## 4. Move a theme along the cycle
The site's question is: where is the next investment cycle forming? Every theme in `B. THEMES` sits at one of five stages:

| Stage | What it looks like |
|---|---|
| 1 Signal | A policy, price or technology shift. Little money has moved yet. |
| 2 Early capital | First platforms and early financings. High risk, high target returns. |
| 3 Build-out | Large funds close, supply chains stretch, equipment runs short. |
| 4 Crowded | Too much money, falling prices and returns, contracts replace market risk. |
| 5 Mature | Steady cash flows, lower returns, pension funds and core funds own it. |

To move a theme, change its `stage` number. The cycle map and every card update by themselves. Review the stages once a month, not every week.

To add a theme, copy one block and give it a short `id`, a `name`, a `stage`, `photos`, an `icon`, a one-line `thesis` and a `watch` line (what would move it to the next stage). Five to seven themes is enough.

## 5. Add a story
In `C. STORIES`, copy one `{ ... },` block, paste it at the top of the list and change:
- `slug`: short web name, lowercase with hyphens, must be unique
- `section`: the `id` of a live sector, such as `"sustainable-finance"` or `"energy"`
- `theme`: the `id` of one theme, such as `"compute"`
- `tags`: exactly three, from the `TAGS` lists: `{ region: "Vietnam", deal: "Policy & regulation", asset: "Solar" }`. The asset must come from the story's own section list.
- For deal stories (not "Policy & regulation" or "Report & data"), also add a row to `deals.csv` with this story's slug in the `story` column.
- `signal`: `"forward"` (moves the theme towards the next stage), `"confirms"` (fits its current stage) or `"back"` (holds it back)
- `date`: the date of the original story
- `minutes`: reading time
- `featured: true` to show it in the "On the wire" slider at the top
- `title` and `summary`: one line each, in your own words
- `body`: the key facts, one short paragraph per item
- `cycleRead`: your view on what the story says about the cycle
- `source`: the publisher's name and the link to the original
- `image` (optional): your own picture for the thumbnail, such as `"images/my-chart.png"`. Upload the file to the repository first. Without it, a thumbnail is drawn for you.

### Rules for summarising other people's work
1. **Use your own words.** Read the article, close it, then write. Never paste paragraphs.
2. **Keep it short.** Two to four short paragraphs of facts. Your summary should make people want the original, not replace it.
3. **Quote rarely.** If a phrase is essential, keep it under about 15 words, in quotation marks.
4. **Always credit and link the source.** Every story needs `source`.
5. **No copied images or charts.** Use your own, or none.
6. **Add your view.** The `cycleRead` line is what makes the blog yours. It is also what makes summarising fair.
7. **Prefer the original source.** A company press release or the report itself beats a news site repeating it. Avoid paywalled links where you can.

## 6. How the site updates
The live site is **transilienceresearch.com**, hosted on **Cloudflare Pages** (free plan: up to 500 updates a month). It is built from this GitHub repository (`ptlamm/baseload`). Cloudflare publishes whatever is on the `main` branch.

Cloudflare build settings (in the Cloudflare dashboard, under the project's Settings): build command `node scripts/check-stories.js`, build output directory `/`, production branch `main`.

### Every Sunday (automatic)
1. The scheduled task drafts the week's stories and opens a **pull request** in this repository, titled "Weekly briefing: <date>".
2. Cloudflare builds a **preview**: a copy of the site with the new stories, at its own address. The link appears in the pull request.
3. Read the preview. To change a story, open the pull request's **Files changed** tab, click the three dots on `index.html`, choose **Edit file**, fix the text and commit.
4. Click **Merge pull request**. The live site updates within a minute.

To skip a week, close the pull request without merging.

### Before every deploy (automatic)
Cloudflare runs `scripts/check-stories.js`. If a story points to a theme or section that does not exist, or the code has a typo, the build stops, the live site stays as it was, and the error shows in the build log in Cloudflare.

### Your own edits
Edit `index.html` directly on GitHub: open the file, click the pencil icon, change the text and commit to `main`. The site updates in about a minute. Use this for theme stages, sections and the About text.

The domain is registered with Namecheap, and its settings (DNS) are managed in Cloudflare.

## 7. Next steps
- **Email sign-ups:** once your Substack is set up, paste its address into `newsletterUrl` in `A. SETTINGS`. The Subscribe button in the menu and the Subscribe section then appear. Until then they stay hidden.
- **Images for posts:** add image files to this repository and add `"<img src='my-chart.png' alt='Description'>"` as a body item.
- **When the post list gets long:** move posts into a content system such as Sanity, or a static site builder such as Astro. That is a good second project.
