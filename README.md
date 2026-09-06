# Synergy Lab website

The website for the Synergy Lab, School of Computer Science, University of Oklahoma.

A static site built with [Astro](https://astro.build/) and styled with
[Tailwind CSS](https://tailwindcss.com/). Monochrome editorial design: no accent color,
serif used only for page titles, content authored as Markdown. There is no CMS — group
members add content by editing Markdown files and opening a pull request.

Light is the default theme; a toggle in the top-right of the nav lets visitors switch to
dark mode, and the choice is remembered. The site does not auto-follow the operating
system's dark preference.

## Quick start

Requires [Node.js](https://nodejs.org/) 18.20+, 20.3+, or 22+.

```sh
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:4321/synergy-website
npm run build    # type-check + build static site into dist/
npm run preview  # preview the production build locally
npm run check    # run astro check (type checking) only
```

> The dev/preview URLs include the `/synergy-website` base path because the site is
> configured for GitHub Pages project hosting. See [Deployment](#deployment).

## Editing content

All content lives in `src/content/` as Markdown files with YAML frontmatter. To add or
change anything, edit the relevant Markdown file, run `npm run check` to confirm the
frontmatter is valid, and open a pull request. The full schema for each collection is in
[`src/content/config.ts`](src/content/config.ts).

### Add a person

Create `src/content/people/<slug>.md`. The `<slug>` (the filename) is what papers use to
credit this person, and it becomes their profile URL (`/people/<slug>`).

```markdown
---
name: "Ada Lovelace"
role: "PhD Candidate"
role_short: "PhD"          # shown on the homepage team strip
advisor: "Dr. Sarah Mitchell"
joined: "Fall 2025"
initials: "AL"             # used in the gray avatar when there's no photo
bio: "One line shown on the people page and homepage."
email: "ada@ou.edu"        # all contact fields are optional
github: "alovelace"        # username only
scholar: "https://scholar.google.com/citations?user=..."
cv: "/cv/lovelace.pdf"     # optional; file goes in public/cv/
order: 13                  # lower sorts first within a group
---

A longer bio in Markdown, with paragraphs and links. This renders on the profile page.
```

Useful flags: `is_pi: true` marks the principal investigator (shown in the PI block).
`is_alumni: true` with `alumni_year` and `alumni_destination` moves the person to the
alumni list.

To use a photo instead of initials, add `avatar: "/people/<slug>.jpg"` and put the image
at `public/people/<slug>.jpg`.

### Add a paper

Create `src/content/papers/<slug>.md`. Only frontmatter is needed — no body.

```markdown
---
title: "The title of the paper"
authors: ["lovelace", "mitchell"]   # person slugs, in author order
venue: "OSDI 2026"
year: 2026
areas: ["systems-infrastructure"]   # one or more area slugs
pdf_url: "/papers/<slug>.pdf"        # optional; file goes in public/papers/
code_url: "https://github.com/..."   # optional
bibtex_url: "/papers/<slug>.bib"     # optional; file goes in public/papers/
is_featured: false
is_workshop: false
---
```

Each name in `authors` is matched to a person by slug. If the slug has a profile, the name
links to it; co-authors outside the lab can be listed as slugs and will render as plain
text. The paper appears automatically on the research page (under each of its areas) and on
each lab member's profile.

### Add a research area

Create `src/content/areas/<slug>.md`. There are six by default; `order` controls the
`01`–`06` numbering and the sort order everywhere.

```markdown
---
title: "Systems & infrastructure"
short_title: "Systems"       # used on the research-page filter pill
description: "One line for the homepage."
full_description: "Two or three sentences for the research page."
order: 2
---
```

### Edit the join page

The recruitment text is Markdown at [`src/content/pages/join.md`](src/content/pages/join.md).
Edit the body; the `title` in frontmatter is the page heading.

## Photos and icons

- **People photos** — add `avatar: "/people/<slug>.jpg"` to a person's frontmatter and put
  the image at `public/people/<slug>.jpg`. With no avatar, a neutral gray silhouette is shown.
- **Environment photos** (the "Around the lab" strip at the bottom of the homepage) — the
  photos live in [`public/photos/`](public/photos/) (`devon-energy-hall.png`, `zarrow.webp`,
  `library.jpg`). Swap in your own by replacing those files or editing the `photos` array near
  the top of [`src/pages/index.astro`](src/pages/index.astro). Images are shown at a 3:2 ratio,
  object-fit cover.
- **Area icons** — each research area has a small line icon defined in
  [`src/components/AreaIcon.astro`](src/components/AreaIcon.astro), keyed by area slug. Add a
  new area's icon by adding an entry to the `paths` map there; unknown slugs fall back to a
  neutral dot.

### Photo credits

- **Devon Energy Hall** and the **Zarrow Family Faculty & Graduate Student Center** are
  University of Oklahoma images (from ou.edu / libraries.ou.edu). They are OU's own building
  photos used on an OU lab page; confirm with OU Communications if you publish externally.
- **Bizzell Memorial Library** is by **Michael Barera** (Wikimedia Commons),
  [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), resized to 1280px:
  [source](https://commons.wikimedia.org/wiki/File:University_of_Oklahoma_July_2019_60_(Bizzell_Memorial_Library).jpg).

The on-page credit line is in the homepage "Around the lab" section. If you replace the
photos with your own, update or remove that credit accordingly.

> Note: `npm run preview` (Astro's static preview) has a quirk where it 404s nested files in
> `public/` (like `/photos/*.jpg`). The images render correctly under `npm run dev` and on any
> real static host (GitHub Pages, Cloudflare Pages). Use `npm run dev` for local preview.

## How the pieces link together

The data model is bidirectional and resolved at build time (see
[`src/utils/queries.ts`](src/utils/queries.ts)):

- A **paper** lists author slugs and area slugs.
- A **person** page shows every paper whose `authors` array contains their slug.
- An **area** section (on the research page) shows every paper whose `areas` array contains
  its slug; the homepage shows the most recent paper per area.

Nothing is wired up by hand — add a paper with the right slugs and it shows up in all the
right places.

> Note: the homepage "Latest" line is derived from the most recent paper. There is no
> separate news collection; if you want editorial news items, add a `news` collection in
> `src/content/config.ts` and a small query, following the existing collections as a model.

## Project structure

```
src/
  components/    Nav (+ theme toggle), Footer, Avatar, AuthorList, PaperItem, PersonCard
  content/       areas/  people/  papers/  pages/   (+ config.ts schemas)
  layouts/       Base.astro — html shell, fonts, theme bootstrap, nav, footer
  pages/         index, research/, people/ (+ [slug]), join
  styles/        tokens.css (color variables + dark theme), global.css (@tailwind layers)
  utils/         queries.ts (cross-linking), url.ts (base-path helper)
public/          favicon.svg, papers/, people/ (static assets)
tailwind.config.mjs   Tailwind theme: colors mapped to the CSS variables, fonts, widths
```

## Styling and theming

Styling is [Tailwind CSS](https://tailwindcss.com/) utility classes in the markup. The
monochrome palette lives as CSS variables in
[`src/styles/tokens.css`](src/styles/tokens.css); [`tailwind.config.mjs`](tailwind.config.mjs)
maps Tailwind color names (`page`, `surface`, `hairline`, `primary`, `secondary`,
`tertiary`) to those variables. Dark mode is just a second set of variable values applied
when `data-theme="dark"` is set on `<html>` — so `bg-page`, `text-primary`, etc. re-theme
automatically with no `dark:` variants to maintain. A small inline script in
[`Base.astro`](src/layouts/Base.astro) sets the theme before paint (default light) and the
nav toggle persists the choice to `localStorage`.

A few repeated patterns are component classes in `global.css`: `.label`, `.pill`,
`.year-link`, `.hairline-underline`, and `.prose` (for Markdown bodies).

## Design constraints

The look is intentionally restrained and meant to age well. If you extend the site, keep
to these rules:

- Monochrome only — no accent or brand color. To emphasize something, add whitespace or
  size, not color.
- Font weights 400 and 500 only (`font-normal` / `font-medium`). No 600/700.
- Serif (`Newsreader`) only for page `H1`s; sans (`Hanken Grotesk`) everywhere else. Both
  load from Google Fonts via `<link>` tags in `Base.astro`; the stacks live in
  `tailwind.config.mjs`.
- Sentence case everywhere. No Title Case, no ALL CAPS.
- Hairline (`0.5px`) borders only; no shadows, gradients, or background patterns.
- To change a color, edit the variables in `tokens.css` (both light and dark), not the
  individual utility classes.

## Deployment

### GitHub Pages (configured)

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and deploys on every
push to `main`. To enable it: in the repo settings, set **Settings → Pages → Build and
deployment → Source** to **GitHub Actions**. The site publishes to
`https://<org>.github.io/synergy-website/`.

The `base` and `site` values in [`astro.config.mjs`](astro.config.mjs) assume that project
URL. If your GitHub org/user or repo name differs, update them to match.

### Cloudflare Pages (alternative)

Cloudflare Pages serves from the root, so first set `base: '/'` (and update `site` to your
final domain) in [`astro.config.mjs`](astro.config.mjs). Then, in the Cloudflare dashboard:

1. **Workers & Pages → Create → Pages → Connect to Git**, and select this repository.
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Framework preset: **Astro** (or leave as "None" — the command and output above are all
   that's required).

Cloudflare installs dependencies and builds automatically on each push. No workflow file is
needed; you can delete `.github/workflows/deploy.yml` if you deploy only to Cloudflare.
