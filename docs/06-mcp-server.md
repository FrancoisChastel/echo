# 06 — MCP server

A single MCP server, **local-only in v1**, with both read and write capabilities. Lives in `tools/echo-mcp/`. Speaks stdio. Wired into Claude Code / Claude Desktop / any MCP client via local config.

## Why local-only first

- **No infra.** No Worker, no domain, no auth.
- **Direct filesystem access** for writes. The server writes `.mdx` files straight to the repo on disk.
- **Public read surface already exists** — RSS, JSON Feed, raw markdown mirrors, `manifest.json`. Any remote agent can read the site without an MCP server.
- The MCP server adds the things public HTTP can't: **authoring** and **structured tool calls** for agents already running on your machine.

When mobile authoring becomes a real need, we add an HTTP transport in front of the same server logic, deploy to a CF Worker, gate with a bearer token. The internal tool surface stays identical.

## Transport & wiring

- **Transport**: stdio (standard MCP local mode)
- **Binary**: `tools/echo-mcp/dist/server.js` (Node 20+, ESM)
- **Config in Claude Code** (`~/.claude/mcp_servers.json` or equivalent):

```json
{
  "mcpServers": {
    "echo": {
      "command": "node",
      "args": ["/Users/francoischastel/Documents/github.com/FrancoisChastel/echo/tools/echo-mcp/dist/server.js"],
      "env": {
        "ECHO_REPO_ROOT": "/Users/francoischastel/Documents/github.com/FrancoisChastel/echo"
      }
    },
    "obsidian": {
      "command": "uvx",
      "args": ["mcp-obsidian"],
      "env": {
        "OBSIDIAN_API_KEY": "<from local rest api plugin>",
        "OBSIDIAN_HOST": "127.0.0.1",
        "OBSIDIAN_PORT": "27124"
      }
    }
  }
}
```

Both servers run as needed by the client. They don't talk to each other directly — Claude orchestrates: read voice from Obsidian, then write draft via Echo.

## Tool surface

### Read tools

| tool | input | output | notes |
|------|-------|--------|------|
| `list_collections` | — | `["essays", "films", "notes"]` | static |
| `list_posts` | `{ collection?, limit?, include_drafts? }` | array of post summaries | summaries from manifest; cheap |
| `get_post` | `{ collection, slug }` | full post (frontmatter + body) | from disk, not network |
| `search_posts` | `{ query, collection?, tags? }` | array of matches with highlights | substring + tag filter; no vector DB |
| `get_manifest` | — | full `manifest.json` | re-read from disk on each call |
| `get_feed_urls` | — | `{ rss, json_feed, llms_txt, llms_full, manifest, sitemap }` | for "how do I subscribe" prompts |

### Write tools

| tool | input | effect |
|------|-------|--------|
| `new_essay` | `{ title, summary?, body? }` | writes `essays/<slug>.mdx`, `draft: true` |
| `new_film` | `{ title, video_path, summary?, body? }` | runs `optimize-video.ts`, uploads to R2, writes `films/<slug>.mdx` |
| `new_note` | `{ title, body }` | writes `notes/<slug>.mdx`, `draft: true` |
| `set_frontmatter` | `{ collection, slug, fields }` | patches frontmatter, preserves body |
| `set_echo_color` | `{ collection, slug, color }` | shortcut for the most-edited field |
| `write_post` | `{ collection, slug, body }` | overwrites body, preserves frontmatter |
| `publish` | `{ collection, slug }` | flips `draft: false`, sets `date` if missing. **Does not git commit.** |

### Explicitly NOT exposed

- `delete_post` — git handles deletes; preventing accidental destruction
- `git_commit` / `git_push` — keeping side-effects out of the MCP surface, in the CLI only
- `regenerate_all_feeds` — feeds are build-time, not runtime

## Concurrency & safety

- All writes go through a `writeMdx(path, frontmatter, body)` function that:
  1. Reads existing file (if any) to preserve unknown frontmatter fields.
  2. Validates frontmatter against the same Zod schema as Astro content collections.
  3. Writes atomically (write to `<path>.tmp`, then rename).
- No locking — single-author single-machine assumption. If two writes race, last write wins; git history catches anything weird.
- Server refuses to write outside `ECHO_REPO_ROOT/src/content/`.

## Code structure

```
tools/echo-mcp/
├── src/
│   ├── server.ts          # MCP server bootstrap (stdio transport)
│   ├── tools/
│   │   ├── read.ts        # all read tools
│   │   └── write.ts       # all write tools
│   ├── lib/
│   │   └── content.ts     # SHARED with scripts/echo.ts via workspace import
│   └── schema.ts          # frontmatter Zod schemas
├── package.json
└── tsconfig.json
```

`lib/content.ts` is the single source of truth for read/write semantics. The CLI and the MCP server both call into it. No drift possible.

## Dependencies

- `@modelcontextprotocol/sdk` — official MCP TypeScript SDK
- `zod` — schema validation (same lib Astro uses)
- `gray-matter` — frontmatter parsing
- `slugify` — title → slug

No HTTP, no auth, no database.

## Manifest read path

The MCP server reads from `dist/manifest.json` (built artifact) when available; falls back to scanning `src/content/` and assembling a manifest in-memory if `dist/` is stale or absent. So:

- After `npm run build` — fast read from manifest file.
- In dev — live read from source.

The Claude Code client sees identical behavior either way.

## v2: remote variant (deferred)

When phone authoring justifies it:

- Same `tools/` and `lib/content.ts`, new entry point with HTTP/SSE transport.
- Deployed as a Cloudflare Worker.
- Single bearer token in a Worker secret.
- Writes via the GitHub REST API (creating commits) instead of filesystem.
- The Echo MCP server name in client configs stays `echo`; only the connection URL changes.

That's a one-day swap. Not v1.
