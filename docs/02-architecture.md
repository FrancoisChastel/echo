# 02 — architecture

## Stack

| Layer | Choice | Why |
|------|--------|-----|
| Framework | **Astro 5** | Zero JS by default. Content-first. MDX + content collections. |
| Authoring | **MDX** | Markdown for prose, components when needed (one `<Film>`, one `<Aside>`). |
| Styling | **Vanilla CSS + design tokens** | No Tailwind. One token file, hand-written CSS per component. Keeps the art-vibe honest. |
| Hosting | **Cloudflare Pages** | Free, edge cache, custom domain, integrates with R2. |
| Object storage | **Cloudflare R2** | Free egress to CF Pages. Holds video, posters, large images. |
| Echo MCP server (local) | **Node stdio server, in-repo** | Read + write tools for authoring. Local-only in v1. Wraps the same `lib/content.ts` as the CLI. |
| Obsidian MCP server | **Existing OSS** | Reads voice file from your Obsidian vault at draft time. Not in this repo. |
| Authoring CLI | **TypeScript, in-repo** | `echo new`, `echo publish`, `echo color`. Same code path as MCP server. |
| Domain | TBD | Suggested: `chastel.co` or `echo.chastel.co`. |

## Decisions, justified

- **Astro over Next.js** — content-first site, zero need for server components or React runtime.
- **No Tailwind** — utility classes work against the art direction. A 300-line hand-written CSS file expresses intent better than `text-balance md:text-4xl lg:leading-tight`.
- **No CMS** — content is `.mdx` files in git. Future-proof. Forkable. Backed up by the act of writing it.
- **Cloudflare end-to-end** — Pages + R2 + Workers means one billing, one DNS, free egress between them.

## Repo layout

```
echo/
├── docs/                       # this directory
├── public/
│   ├── llms.txt
│   ├── llms-full.txt
│   ├── robots.txt
│   └── favicon.svg
├── src/
│   ├── content/
│   │   ├── config.ts           # content collection schemas (Zod)
│   │   ├── essays/             # *.mdx
│   │   ├── films/              # *.mdx (one per film, video URL in frontmatter)
│   │   └── notes/              # *.mdx (shorter form)
│   ├── components/
│   │   ├── Layout.astro
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Film.astro          # <video> with poster + sources
│   │   └── Prose.astro         # the reading container
│   ├── pages/
│   │   ├── index.astro         # the index
│   │   ├── about.astro
│   │   ├── rss.xml.ts          # RSS feed
│   │   ├── feed.json.ts        # JSON Feed
│   │   ├── sitemap.xml.ts
│   │   └── [collection]/
│   │       ├── [slug].astro    # rendered HTML post
│   │       └── [slug].md.ts    # raw markdown mirror for agents
│   ├── lib/
│   │   ├── manifest.ts         # emits build-time manifest.json
│   │   └── jsonld.ts           # structured data generators
│   └── styles/
│       ├── tokens.css          # design tokens (one source of truth)
│       ├── reset.css
│       ├── typography.css
│       └── global.css
├── scripts/
│   ├── echo.ts                 # authoring CLI (`echo new`, `echo publish`, ...)
│   └── optimize-video.ts       # ffmpeg wrapper, uploads to R2
├── tools/
│   └── echo-mcp/               # local MCP server, stdio transport
│       ├── server.ts
│       └── package.json
├── lib/
│   └── content.ts              # shared by CLI and MCP server
├── astro.config.mjs
├── tsconfig.json
├── package.json
└── README.md
```

## Build outputs

The Astro build produces:

- Static HTML for every page.
- `/posts/[slug].md` raw markdown mirror for each post.
- `/rss.xml` and `/feed.json`.
- `/sitemap.xml`.
- `/llms.txt` and `/llms-full.txt` (generated from content collections).
- `/manifest.json` — full content index, consumed by the MCP server.

## Deployment

```
git push origin main
  → Cloudflare Pages build (npm run build)
  → publishes to chastel.co (or chosen domain)
  → manifest.json is fetched by the MCP Worker on demand
```

Videos are uploaded separately via `scripts/optimize-video.ts` to R2; frontmatter references the R2 URL.

Authoring happens locally (see [08 — authoring](./08-authoring.md)). The Echo MCP server runs on your machine via stdio, configured in Claude Code/Desktop's MCP settings. It writes `.mdx` files to the repo on disk; publishing is a manual git push via the CLI.

## Environments

- **local** — `npm run dev`, Astro dev server on `:4321`
- **preview** — Cloudflare preview deploys per branch
- **production** — `main` branch

No staging beyond preview deploys. This is a personal site.

## What we are explicitly not building

- No server-side rendering.
- No API routes beyond build-time endpoints (`rss.xml.ts`, `sitemap.xml.ts`).
- No auth, no comments, no DB.
- No analytics SDK. If analytics happen at all, it's a single image pixel or Cloudflare's built-in.
