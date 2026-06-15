# 07 — roadmap

Four phases. Each phase produces a concrete, reviewable artifact before the next begins.

## Phase 1 — documentation (current)

Capture the full plan before any visual or code work, so the moodboard and sketches reference a stable spec.

- [x] `docs/README.md` — index
- [x] `docs/00-vision.md` — what echo is
- [x] `docs/01-aesthetic-direction.md` — Swiss × Japan, signature move, palette/type
- [x] `docs/02-architecture.md` — stack, repo layout, deploy
- [x] `docs/03-content-model.md` — essays / films / notes, frontmatter
- [x] `docs/04-agent-llm-layer.md` — llms.txt, RSS, JSON-LD, manifest
- [x] `docs/05-video-pipeline.md` — ffmpeg, R2, optimize-video script
- [x] `docs/06-mcp-server.md` — local Echo MCP, tools surface
- [x] `docs/08-authoring.md` — Echo MCP + Obsidian MCP + CLI
- [x] `docs/voice-template.md` — starter for the voice file (lives in Obsidian)
- [ ] `docs/references/artists.md` — lesser-known artist references
- [ ] `docs/references/sites.md` — site inspirations

**Exit criteria:** all docs above written and reviewed by the user. Voice template ready to be filled in.

## Phase 2 — moodboard

Lock the visual direction with real images and links before any code or HTML is touched.

- [ ] Curate 10–15 images per artist on the references list, in `docs/moodboard/artists/`
- [ ] Curate 8–10 reference sites with screenshots, in `docs/moodboard/sites/`
- [ ] Pick 3 candidate type pairings (display + body) and document the choice
- [ ] Pick a paper-white shade and an ink shade (oklch coordinates)
- [ ] Document 3 example `echo` colors that might appear on real posts
- [ ] One-page moodboard summary in `docs/moodboard/README.md` distilling the direction

**Exit criteria:** the user can point at the moodboard and say "yes, this is the feeling."

## Phase 3 — sketch

Static HTML mockups, no framework. Two pages. Iterate to lock the visual.

- [ ] `sketch/index.html` — homepage, interleaved index
- [ ] `sketch/post.html` — single essay page
- [ ] `sketch/film.html` — single film page
- [ ] `sketch/tokens.css` — final design tokens
- [ ] `sketch/typography.css` — final type scale + pairings
- [ ] Hand-rolled, no Tailwind, ~300 lines of CSS total
- [ ] Side-by-side review of all three pages on 320 / 768 / 1024 / 1440

**Exit criteria:** user approves the look at all four breakpoints. CSS tokens lifted directly into the scaffold next.

## Phase 4 — scaffold

Materialize the full Astro project with all surfaces wired end-to-end. Three placeholder posts.

### 4a — base
- [ ] `npm create astro@latest` + MDX integration
- [ ] Port `sketch/` CSS into `src/styles/`
- [ ] `src/content/config.ts` with Zod schemas from doc 03
- [ ] `Layout.astro`, `Header.astro`, `Footer.astro`, `Prose.astro`, `Film.astro`

### 4b — content surfaces
- [ ] `src/pages/index.astro`, `/about.astro`
- [ ] `src/pages/[collection]/[slug].astro`
- [ ] `src/pages/[collection]/[slug].md.ts` (raw markdown mirrors)
- [ ] Three placeholder posts (one essay, one film with dummy video, one note)

### 4c — agent surfaces
- [ ] `src/pages/rss.xml.ts`
- [ ] `src/pages/feed.json.ts`
- [ ] `src/pages/sitemap.xml.ts`
- [ ] `src/pages/llms.txt.ts`
- [ ] `src/pages/llms-full.txt.ts`
- [ ] `src/pages/manifest.json.ts`
- [ ] JSON-LD generators in `src/lib/jsonld.ts`
- [ ] `<head>` defaults with all `<link rel="alternate">` tags

### 4d — authoring
- [ ] `lib/content.ts` shared module
- [ ] `scripts/echo.ts` CLI (new / publish / color / drafts / serve / voice)
- [ ] `scripts/optimize-video.ts` ffmpeg wrapper
- [ ] `tools/echo-mcp/` local MCP server
- [ ] Document MCP wiring for Claude Code in `README.md`

### 4e — deploy
- [ ] Cloudflare Pages project connected to repo
- [ ] Cloudflare R2 bucket `echo-media` + custom domain `media.chastel.co`
- [ ] DNS for the apex domain (TBD)
- [ ] Verify `npm run build` passes locally
- [ ] First deploy. Verify all six agent surfaces in production.

**Exit criteria:** the site is live, an LLM can fetch `/manifest.json` and `/essays/<slug>.md` and reason about a real post, and the author can run `echo new essay "..."` and `echo publish` to go live.

## Ongoing — after launch

Not part of the initial build but tracked for context.

- Per-tag pages (`/tags/[tag]`)
- Per-collection feeds (`/essays/rss.xml`, etc.)
- Subtitles pipeline for films when needed
- Remote Echo MCP variant for mobile authoring (see [06](./06-mcp-server.md))
- First voice refinement pass after the third published essay
