# 03 — content model

Three collections. Each is a folder of `.mdx` files validated by a Zod schema in `src/content/config.ts`.

## Collections

### `essays`

Long-form philosophical writing. The default form.

```yaml
---
title: "On slowness"
slug: "on-slowness"           # optional; derived from filename otherwise
date: 2026-05-27
summary: "One sentence. Used in feeds, llms.txt, and meta tags."
echo: "#c97b4f"               # the post's single color (oklch also accepted)
tags: ["attention", "craft"]
draft: false
---
```

Body is MDX. Components allowed inline: `<Aside>`, `<Pull>` (pull quote), `<Figure>`.

### `films`

A short video plus a brief writeup. The film is the artifact; the prose contextualizes.

```yaml
---
title: "Field notes, vol. 3"
slug: "field-notes-3"
date: 2026-05-12
summary: "A 90-second study of light through paper."
echo: "#3a5a40"
duration: "PT1M30S"           # ISO 8601 duration, used in JSON-LD VideoObject
video:
  poster: "https://media.chastel.co/films/field-notes-3/poster.webp"
  sources:
    - { src: "https://media.chastel.co/films/field-notes-3/1080.av1.mp4", type: "video/mp4; codecs=av01.0.05M.08" }
    - { src: "https://media.chastel.co/films/field-notes-3/1080.h264.mp4", type: "video/mp4; codecs=avc1.4d401f" }
    - { src: "https://media.chastel.co/films/field-notes-3/720.h264.mp4", type: "video/mp4; codecs=avc1.4d401e", media: "(max-width: 768px)" }
  width: 1920
  height: 1080
tags: ["film", "studies"]
draft: false
---
```

Body is short — one to three paragraphs. The video carries the weight.

### `notes`

Short form. Fragments, tech takes, observations. Index treats them differently — denser listing.

```yaml
---
title: "A small theory of agents"
date: 2026-04-30
summary: "Three paragraphs on why MCP feels right."
echo: "#1d3557"
tags: ["agents", "mcp"]
draft: false
---
```

No required `slug` — derived. No required `summary` for notes under 200 words (the body is the summary).

## Shared frontmatter fields

| field | type | required | notes |
|------|------|---------|------|
| `title` | string | yes | |
| `date` | ISO date | yes | publication date |
| `updated` | ISO date | no | shows "updated" line in UI |
| `summary` | string | essays/films yes | feeds + meta + llms.txt |
| `echo` | css color | no | defaults to ink if omitted |
| `tags` | string[] | no | lowercased, kebab-case |
| `draft` | boolean | no | excluded from build if true |
| `canonical` | url | no | for cross-posted content |

## Slug rules

- Default slug = filename without extension.
- Override with explicit `slug` if needed (e.g., renaming a file without breaking links).
- Slugs are kebab-case, ASCII only, no dates in the slug itself.

## URL structure

```
/                       index — recent essays, films, notes interleaved by date
/essays/[slug]          rendered essay
/essays/[slug].md       raw markdown mirror (agent endpoint)
/films/[slug]           rendered film page
/films/[slug].md        raw markdown mirror
/notes/[slug]           rendered note
/notes/[slug].md        raw markdown mirror
/tags/[tag]             posts tagged with [tag] (optional, build later)
/about                  who, why
```

No `/blog`, no `/posts`, no `/articles`. The collection name *is* the section.

## Drafts

`draft: true` excludes from:

- The build (no HTML page emitted)
- All feeds (RSS, JSON Feed, llms.txt)
- The MCP manifest
- The sitemap

To preview a draft, run `npm run dev` — drafts render locally only.

## Index ordering

Reverse chronological by `date`. Cross-collection (essays, films, notes appear interleaved on `/`).

## Constraints

- One `.mdx` file per piece. No multi-file posts.
- Images and posters live under `public/media/` for small assets, R2 for large.
- No inline base64 images in MDX.
- MDX components stay shallow — if a post needs a custom layout, consider whether it should be a one-off page in `src/pages/` instead.
