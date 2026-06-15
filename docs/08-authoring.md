# 08 — authoring

How content is drafted, refined, and published.

## Core decision: local-first, MCP-driven

Authoring uses two local MCP servers plus one tiny CLI. No remote services. No auth. Files are written directly to the repo on disk; publishing is a git push.

```
You (in Claude Code or Claude Desktop)
  │  "draft an essay on slowness"
  ▼
Claude reads voice/echo.md  ─► [obsidian-mcp]   (local, existing OSS)
Claude writes draft .mdx    ─► [echo-mcp]       (local, we build)
  │
  ▼
Your repo on disk
  │  refine in $EDITOR
  ▼
echo publish on-slowness     (CLI, local)
  │  git commit && git push
  ▼
Cloudflare Pages builds → live
```

## Components

### 1. Obsidian MCP server (existing)

Use one of the maintained OSS implementations:

- [`mcp-obsidian`](https://github.com/MarkusPfundstein/mcp-obsidian) — talks to Obsidian via the Local REST API plugin
- [`obsidian-mcp-server`](https://github.com/cyanheads/obsidian-mcp-server) — alternative, similar surface

We don't write this. We configure it.

**Used for:** reading `voice/echo.md` (and any other voice/reference notes) at draft time.

### 2. Echo MCP server (we build)

A local stdio MCP server in `tools/echo-mcp/`. Single-binary, no auth, writes to the repo on disk.

**Tools exposed:**

| tool | purpose |
|------|---------|
| `list_collections` | `essays`, `films`, `notes` |
| `list_drafts` | every `.mdx` with `draft: true` |
| `list_published` | every `.mdx` with `draft: false`, with frontmatter |
| `new_essay(title, summary?, draft_body?)` | scaffolds `essays/<slug>.mdx`, returns path |
| `new_film(title, video_path, summary?)` | runs video pipeline, uploads to R2, scaffolds `films/<slug>.mdx` |
| `new_note(title, body)` | scaffolds `notes/<slug>.mdx` |
| `set_echo_color(slug, color)` | updates the `echo` frontmatter field |
| `set_frontmatter(slug, fields)` | generic frontmatter patch |
| `read_post(slug)` | full content of an existing post (for AI refinement) |
| `write_post(slug, body)` | overwrites body, preserves frontmatter |
| `publish(slug)` | flips `draft: false`, sets `date`, leaves the git commit to the CLI |

**Tools NOT exposed (intentionally):**

- No `git_commit`, no `git_push`. Publishing-as-commit lives in the CLI so accidental MCP-driven pushes can't happen.
- No `delete_post`. Deletions go through git like everything else.

**Transport:** stdio. Configured in Claude Code/Desktop's MCP settings as a local server pointing at the binary.

### 3. Echo CLI (we build)

`scripts/echo.ts`, runnable as `echo` via `package.json` bin. Wraps the same operations for terminal-first workflows.

**Commands:**

```bash
echo new essay "on slowness"               # scaffold + open in $EDITOR
echo new essay "on slowness" --ai          # call Claude API with voice/echo.md as prompt
echo new film ./raw/clip.mov "field notes vol 3"
                                            # run video pipeline → R2 → scaffold film mdx
echo new note "agents are not magic"
echo color essays/on-slowness.mdx          # pick from associated asset or set explicit hex
echo publish essays/on-slowness            # flip draft, set date, git commit + push
echo drafts                                # list draft posts across all collections
echo serve                                 # alias for npm run dev
echo voice                                 # opens voice/echo.md in $EDITOR (resolved via env)
```

**The CLI and the MCP server share** a `lib/content.ts` module with all read/write logic. Same code path, two interfaces.

## Voice via Obsidian

The voice file lives in your Obsidian vault at `voice/echo.md`. The Echo MCP server reads it through the Obsidian MCP server when invoked.

**Why Obsidian as the source:**

- Voice is **author-level context**, not project-level. If you start another site, you write `voice/<name>.md` and reuse the machinery.
- Obsidian is where personal notes already live for many writers.
- It keeps voice out of the public repo — your style guide isn't part of the published artifact.

**Lookup path:**

```
ECHO_VAULT_PATH        # env var pointing to your Obsidian vault root
                       # default: $HOME/Documents/Obsidian
ECHO_VOICE_NOTE        # default: voice/echo.md
```

Template for the voice file: see [voice-template.md](./voice-template.md). Copy that into your vault and edit it personally.

## Publishing flow

1. Draft created (via Claude + MCP, or via `echo new --ai`, or by hand)
2. File lives in repo with `draft: true`
3. Refine in any editor; `npm run dev` shows drafts locally
4. `echo publish <slug>`:
   - Flips `draft: false`
   - Sets `date: <today>` if not present
   - Runs `npm run build` to catch errors
   - `git add . && git commit -m "publish: <title>" && git push`
5. Cloudflare Pages builds and deploys automatically

Publishing is **explicit and atomic**. Nothing publishes itself.

## What we are deferring

- **Mobile authoring** — drop in a remote-hosted Echo MCP variant (HTTP transport + single bearer token in a CF Worker) when phone authoring becomes a real need.
- **Scheduled publish** — `publish --at "2026-06-01"` would require GitHub Actions. Skip until needed.
- **Multi-author** — out of scope. This is a personal site.
- **Image generation for posts** — could plug in later via another MCP. Not v1.

## Open items to settle with the user

- Final voice doc content (co-authored, see [voice-template.md](./voice-template.md))
- Which Obsidian MCP implementation to adopt
- Whether the CLI ships as a standalone `npm` package or stays in-repo as `pnpm echo ...`
