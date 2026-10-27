# Baseload — your blog

One file, `index.html`, holds the whole site: design (CSS), content (the `THEMES` and `POSTS` lists) and behaviour (JavaScript).

## 1. What is in this repository
- `index.html`: the whole site: design, stories and behaviour.
- `netlify.toml`: tells Netlify to check the stories, then publish this folder.
- `scripts/check-stories.js`: the story check.
- `README.md`: this guide.

## 2. Edit it
Open `index.html` on GitHub and click the pencil icon, or use a code editor such as **VS Code**. Use Find (Ctrl/Cmd + F) to jump to these parts:

| Find this | What it controls |
|---|---|
| `1. DESIGN TOKENS` | Colours and fonts for the whole site |
| `A. SETTINGS` | Site name, LinkedIn link, newsletter message |
| `const SECTIONS` | The sectors you cover: live or planned |
| `const STAGES` | The five cycle stages and their wording |
| `B. THEMES` | The cycle map: each theme and its stage |
| `C. STORIES` | Your news summaries |
| `G. LCOE CALCULATOR` | The solar farm calculator and its example projects |

Commit the change on GitHub, and the live site updates in about a minute.

## 3. Open, add or pause a sector
All sectors live in one list, `SECTIONS`. Each has a `status`:
- `"live"`: shown on the site and in the menu, and included in the Sunday drafts.
- `"planned"`: shown in "On the drawing board" as a sector coming later.
- `"archived"`: hidden from the site and from the Sunday drafts. Its stories stay in the file, and setting it back to `"live"` brings them back. A theme whose stories are all archived also hides from the cycle map until it has a live story again.

To start covering a planned sector: change `"planned"` to `"live"`. It gets its own block on the home page (three newest stories), a footer link and Sunday drafts automatically.

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

A theme with no photos falls back to a drawn thumbnail made from its `icon` (sun, globe, pylon, server, bond, battery, crane or chart).

## 4. Move a theme along the cycle
The site's question is: where is the next investment cycle forming? Every theme in `B. THEMES` sits at one of five stages:

| Stage | What it looks like |
|---|---|
| 1 Signal | A policy, price or technology shift. Little money has moved yet. |
| 2 Early capital | First platforms and early financings. High risk, high target returns. |
| 3 Build-out | Large funds close, supply chains stretch, equipment runs short. |
| 4 Crowded | Too much money, falling prices and returns, contracts replace market risk. |
| 5 Mature | Steady cash flows, lower returns, pension funds and core funds own it. |

To move a theme, change its `stage` number. The wave in the hero, the cycle map and every card update by themselves. Review the stages once a month, not every week.

To add a theme, copy one block and give it a short `id`, a `name`, a `stage`, `photos`, an `icon`, a one-line `thesis` and a `watch` line (what would move it to the next stage). Five to seven themes is enough.

## 5. Add a story
In `C. STORIES`, copy one `{ ... },` block, paste it at the top of the list and change:
- `slug`: short web name, lowercase with hyphens, must be unique
- `section`: the `id` of a live sector, such as `"sustainable-finance"` or `"energy"`
- `theme`: the `id` of one theme, such as `"compute"`
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
The live site is **infrabrief.netlify.app**. It is built from this GitHub repository (`ptlamm/baseload`). Netlify publishes whatever is on the `main` branch.

### Every Sunday (automatic)
1. The scheduled task drafts the week's stories and opens a **pull request** in this repository, titled "Weekly briefing: <date>".
2. Netlify builds a **deploy preview**: a private copy of the site with the new stories. The link appears in the pull request.
3. Read the preview. To change a story, open the pull request's **Files changed** tab, click the three dots on `index.html`, choose **Edit file**, fix the text and commit.
4. Click **Merge pull request**. The live site updates within a minute.

To skip a week, close the pull request without merging.

### Before every deploy (automatic)
Netlify runs `scripts/check-stories.js`. If a story points to a theme or section that does not exist, or the code has a typo, the deploy stops, the live site stays as it was, and the error shows in Netlify's deploy log.

### Your own edits
Edit `index.html` directly on GitHub: open the file, click the pencil icon, change the text and commit to `main`. The site updates in about a minute. Use this for theme stages, sections and the About text.

Later you can buy a domain (around £10 a year) and connect it in Netlify's domain settings.

## 7. Next steps
- **Real email sign-ups:** create a free Buttondown or Substack account and replace the form in section `H` with their embed code.
- **Images for posts:** add image files to this repository and add `"<img src='my-chart.png' alt='Description'>"` as a body item.
- **When the post list gets long:** move posts into a content system such as Sanity, or a static site builder such as Astro. That is a good second project.
