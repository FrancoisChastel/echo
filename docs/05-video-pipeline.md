# 05 — video pipeline

Plain `<video>` tags, static MP4 files, served from Cloudflare R2 (free egress to Pages). Self-built optimization wrapper around `ffmpeg`. No third-party video host.

## Output targets

For each source video the pipeline produces:

| file | codec | container | purpose |
|------|-------|-----------|---------|
| `<slug>/1080.av1.mp4` | AV1 (libsvtav1) | mp4 | modern browsers, ~50% smaller than H.264 |
| `<slug>/1080.h264.mp4` | H.264 (libx264) | mp4 | universal fallback |
| `<slug>/720.h264.mp4` | H.264 | mp4 | mobile / narrow viewport |
| `<slug>/poster.webp` | WebP | — | poster frame |
| `<slug>/poster.jpg` | JPEG | — | poster fallback for older clients |

Order in `<video>` matters: AV1 first (modern browsers pick it), H.264 fallback. The `media` attribute switches the H.264 stream to 720 on narrow viewports.

## Encoder settings

Picked for a balance of quality, file size, and encode time. Tune later if needed.

### AV1 (libsvtav1)

```
-c:v libsvtav1
-preset 6           # 0..13, lower = slower/better. 6 is reasonable on a laptop.
-crf 30             # 30..35 typical for web; lower = higher quality
-pix_fmt yuv420p
-svtav1-params tune=0:film-grain=8
-movflags +faststart
```

### H.264 (libx264)

```
-c:v libx264
-preset slow
-crf 22             # 22 is high quality for web
-profile:v main
-level 4.0
-pix_fmt yuv420p
-movflags +faststart
```

### Audio (both)

```
-c:a aac
-b:a 128k
-ac 2
```

If the source has no audio, audio is stripped (`-an`).

## Poster

Single frame extracted at 10% of duration (or `--poster-time SECONDS` override).

```
ffmpeg -ss <t> -i <src> -frames:v 1 -vf "scale=1920:-2" -q:v 85 poster.webp
ffmpeg -ss <t> -i <src> -frames:v 1 -vf "scale=1920:-2" -q:v 90 poster.jpg
```

## Upload

R2 bucket: `echo-media`. Public read via `media.chastel.co` custom domain.

Folder layout in R2:

```
films/
  <slug>/
    1080.av1.mp4
    1080.h264.mp4
    720.h264.mp4
    poster.webp
    poster.jpg
    source.<ext>      # original kept for re-encodes
```

Source upload is optional (`--keep-source` flag, default off — they're large).

## `scripts/optimize-video.ts` — spec

A small TypeScript script. Dependencies: `execa`, `@aws-sdk/client-s3` (R2 is S3-compatible), `commander`.

```
echo new film ./raw/clip.mov "field notes vol 3"
```

is sugar for:

```
tsx scripts/optimize-video.ts \
  --input ./raw/clip.mov \
  --slug field-notes-3 \
  --upload \
  --emit-frontmatter
```

**Behavior:**

1. Probe source with `ffprobe` (resolution, duration, has-audio).
2. Validate: refuse if width < 1280 or > 4096; warn if duration > 5 minutes.
3. Encode AV1 1080, H.264 1080, H.264 720, posters — in parallel where possible.
4. Upload outputs to R2 under `films/<slug>/`.
5. Print a frontmatter block to stdout:

```yaml
video:
  poster: https://media.chastel.co/films/field-notes-3/poster.webp
  sources:
    - { src: https://media.chastel.co/films/field-notes-3/1080.av1.mp4,  type: "video/mp4; codecs=av01.0.05M.08" }
    - { src: https://media.chastel.co/films/field-notes-3/1080.h264.mp4, type: "video/mp4; codecs=avc1.4d401f" }
    - { src: https://media.chastel.co/films/field-notes-3/720.h264.mp4,  type: "video/mp4; codecs=avc1.4d401e", media: "(max-width: 768px)" }
  width: 1920
  height: 1080
duration: PT1M30S
```

When invoked via the Echo MCP server's `new_film` tool, the frontmatter is written directly into the new `films/<slug>.mdx` file.

**Flags:**

| flag | default | purpose |
|------|---------|---------|
| `--input <path>` | required | source file |
| `--slug <slug>` | derived from filename | output folder slug |
| `--upload` | `false` | upload to R2 |
| `--keep-source` | `false` | also upload the original |
| `--poster-time <sec>` | auto (10% of duration) | poster frame timestamp |
| `--no-720` | off | skip the mobile rung |
| `--no-av1` | off | skip AV1 (faster encode for drafts) |
| `--dry-run` | off | print ffmpeg commands without running |

## Local playback in dev

When `--upload` is omitted, files write to `public/media/films/<slug>/` and the frontmatter URLs point to `/media/films/<slug>/...`. Lets you preview locally before uploading.

## Performance defaults in the `<Film>` component

The Astro `<Film>` component renders:

```html
<video
  controls
  preload="metadata"
  poster="{poster}"
  width="{width}"
  height="{height}"
  playsinline
>
  <source src="..." type="..." />
  <!-- additional sources -->
</video>
```

- `preload="metadata"` — fetches header only on page load, full stream on play.
- `loading="lazy"` not used on `<video>` (browsers ignore it); rely on `preload="metadata"` and lazy hydration of any controls.
- Explicit `width`/`height` prevent layout shift (CLS).
- No autoplay. No muted-autoplay tricks. Films are watched intentionally.

## Caching

R2 served via custom domain → Cloudflare CDN edge cache hits for free.

Response headers set on R2 bucket:

```
Cache-Control: public, max-age=31536000, immutable
```

Files are immutable per slug (re-encodes get a new path or a `?v=2` query). Never serve stale versions of the same URL.

## What we are not doing

- No HLS / DASH adaptive streaming. MP4 with `<source media=...>` switching is enough at this scale.
- No DRM. Films are public art.
- No watermark.
- No YouTube cross-post automation in v1. Manual if/when.
- No subtitles pipeline yet — when the first film needs them, add a `.vtt` step.
