# 04 — agent / LLM layer

Every public artifact has a machine-readable counterpart. Six surfaces:

1. **JSON-LD** in every HTML page
2. **Raw markdown mirrors** at `/<collection>/<slug>.md`
3. **RSS feed** at `/rss.xml`
4. **JSON Feed** at `/feed.json`
5. **`/llms.txt`** and **`/llms-full.txt`**
6. **`/manifest.json`** — the canonical content index, consumed by the Echo MCP server (read tools, see [06](./06-mcp-server.md))

All six are emitted at build time from the same content collections. One source, six projections.

## 1. JSON-LD

Every page includes structured data inside `<script type="application/ld+json">`. Two contexts always present (`Person`, `WebSite`); a third per page type:

- Essay → `Article`
- Film → `VideoObject` (plus `Article` for the writeup)
- Note → `Article` (BlogPosting subtype)

Example for a film page:

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Field notes, vol. 3",
  "description": "A 90-second study of light through paper.",
  "uploadDate": "2026-05-12",
  "duration": "PT1M30S",
  "thumbnailUrl": "https://media.chastel.co/films/field-notes-3/poster.webp",
  "contentUrl": "https://media.chastel.co/films/field-notes-3/1080.h264.mp4",
  "embedUrl": "https://chastel.co/films/field-notes-3",
  "author": { "@type": "Person", "name": "François Chastel", "url": "https://chastel.co" }
}
```

Generators live in `src/lib/jsonld.ts`. One pure function per content type.

## 2. Raw markdown mirrors

For every post at `/essays/<slug>` there's a sibling at `/essays/<slug>.md` that returns the original markdown with frontmatter. No HTML, no JS, no parsing required.

```
GET /essays/on-slowness        → text/html
GET /essays/on-slowness.md     → text/markdown; charset=utf-8
```

Implemented as `src/pages/essays/[slug].md.ts` returning the raw file content with the right content-type.

**Why this matters:** agents fetch markdown reliably. HTML extraction is lossy and brittle. This is the single highest-signal thing we ship for LLM consumption.

## 3. RSS feed

`/rss.xml`. Standard RSS 2.0 with `<atom:link rel="self">` and full content in `<content:encoded>`. Cross-collection by default; per-collection optional later.

Generated in `src/pages/rss.xml.ts` using `@astrojs/rss`.

## 4. JSON Feed

`/feed.json`. [JSON Feed 1.1](https://www.jsonfeed.org/version/1.1/). Easier for agents to parse than RSS, and more accurate for `summary`/`content_text`/`content_html` separation.

```json
{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "echo",
  "home_page_url": "https://chastel.co",
  "feed_url": "https://chastel.co/feed.json",
  "author": { "name": "François Chastel", "url": "https://chastel.co" },
  "items": [
    {
      "id": "https://chastel.co/essays/on-slowness",
      "url": "https://chastel.co/essays/on-slowness",
      "title": "On slowness",
      "summary": "One sentence.",
      "content_text": "...",
      "date_published": "2026-05-27T00:00:00Z",
      "tags": ["attention", "craft"],
      "_echo": { "type": "essay", "color": "#c97b4f", "raw_markdown_url": "https://chastel.co/essays/on-slowness.md" }
    }
  ]
}
```

The `_echo` extension carries site-specific metadata without violating the spec.

## 5. `/llms.txt` and `/llms-full.txt`

The [llms.txt](https://llmstxt.org/) convention. Two files:

**`/llms.txt`** — short, curated index pointing at the most important content and the machine-readable surfaces.

```markdown
# echo

> A personal site by François Chastel. Films, essays, and notes.
> Paper-white, near-black, one color per post.

## Endpoints

- Raw markdown for any post: append `.md` to the URL
- RSS: https://chastel.co/rss.xml
- JSON Feed: https://chastel.co/feed.json
- Full manifest: https://chastel.co/manifest.json

## Essays

- [On slowness](https://chastel.co/essays/on-slowness.md): One sentence summary.

## Films

- [Field notes, vol. 3](https://chastel.co/films/field-notes-3.md): One sentence summary.

## Notes

- [A small theory of agents](https://chastel.co/notes/a-small-theory-of-agents.md): One sentence summary.

## About

- [About this site](https://chastel.co/about.md)
```

**`/llms-full.txt`** — the entire corpus concatenated as one markdown file with `---` separators. For agents that want everything in one fetch.

Both are generated at build time in `src/pages/llms.txt.ts` and `src/pages/llms-full.txt.ts`.

## 6. `/manifest.json`

The canonical machine-readable index of all content. Consumed by the Echo MCP server's read tools.

```json
{
  "site": {
    "name": "echo",
    "url": "https://chastel.co",
    "author": { "name": "François Chastel", "url": "https://chastel.co" }
  },
  "generated_at": "2026-05-27T12:00:00Z",
  "collections": ["essays", "films", "notes"],
  "posts": [
    {
      "collection": "essays",
      "slug": "on-slowness",
      "title": "On slowness",
      "summary": "One sentence.",
      "date": "2026-05-27",
      "tags": ["attention", "craft"],
      "echo": "#c97b4f",
      "url": "https://chastel.co/essays/on-slowness",
      "markdown_url": "https://chastel.co/essays/on-slowness.md",
      "word_count": 842
    }
  ]
}
```

Single source of truth. The RSS, JSON Feed, and llms.txt are all projections of this same manifest.

## `<head>` defaults

Every page emits:

```html
<link rel="alternate" type="application/rss+xml" title="echo" href="/rss.xml">
<link rel="alternate" type="application/feed+json" title="echo" href="/feed.json">
<link rel="alternate" type="text/markdown" title="raw markdown" href="/essays/on-slowness.md">
<meta name="description" content="...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="https://chastel.co/essays/on-slowness">
```

The `alternate type="text/markdown"` link is the explicit signal to agents: "here's the markdown version of this page."

## `/robots.txt`

Permissive. Disallow nothing. We want LLM training crawlers reading this. Explicitly allow known good agents.

```
User-agent: *
Allow: /

Sitemap: https://chastel.co/sitemap.xml
```

## What we are not doing

- No paywall, no auth, no rate limiting. Free for agents to read.
- No `/api/chat` endpoint. We are not building a RAG-over-self.
- No vector DB. The MCP server does cheap substring + tag filtering; that's enough for hundreds of posts.
