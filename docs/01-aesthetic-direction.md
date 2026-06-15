# 01 — aesthetic direction

> **Status**: locked from phase 2 (moodboard, 2026-05-27). Concrete decisions below.
> The phase 3 sketch implements these literally; the scaffold ports the sketch's CSS unchanged.

## The blend (locked)

**Warm minimal · mono labels + serif body · reverent · margin-noted essays.**

Phase 2 moodboard picked elements from all three candidate directions and let the synthesis define a fourth thing:

- The **warmth** of Swiss editorial (paper + ink in the warm range, never cool / never dark)
- The **typographic distinctiveness** of Editorial dark (mono UI + classical serif body) — without literal darkness
- The **reverence** of Quiet Japan (for film pages — centered, breathing, italic title)
- The **editorial margin column** for essays (metadata as quiet labels in the gutter, not in the body)

The thread: warmth + restraint + a single distinctive typographic gesture (mono labels against serif body). Nothing precious; nothing default.

## Signature move

Every post emits **one color** drawn from its content — a frame from the film, a tone from the writing. The site is otherwise paper + ink. The color appears as:

- A hairline rule (3px) at the top of the page
- The color name as a small mono caption near the foot
- Nowhere else — no fills, no tints, no buttons in that color

One design event per page. The name *echo* keeps earning its meaning.

## Palette (locked)

```css
--paper:       oklch(98% 0.005 90)   /* warm off-white — default */
--paper-bone:  oklch(96% 0.01 70)    /* bone / cream — film pages only */
--ink:         oklch(22% 0.005 50)   /* warm dark — not near-black */
--rule:        oklch(85% 0 0)        /* hairline rules */
--mute:        oklch(50% 0 0)        /* secondary text, captions, dates */
--echo:        var per-post          /* see seed palette below */
```

The bone paper is used only on film pages — a small, deliberate cinematic warmth shift. Essays, notes, and the homepage stay on `--paper`.

### Echo seed palette

Two colors anchor the system:

- `oklch(60% 0.18 30)` — **terracotta** (warm pole)
- `oklch(50% 0.15 180)` — **teal** (cool pole)

These set the *range*: warm earth to cool water, both at moderate saturation. Future posts pick anywhere along that arc (ochre, moss, indigo, burgundy all fit). When a new color is added to the system, document it in this file with its oklch coordinates.

**Guardrail**: chroma in the 0.12–0.20 range, lightness 40%–70%. Anything outside that range fights the warm paper and looks inserted.

## Typography (locked)

**Pairing 2**: JetBrains Mono (UI) + EB Garamond (body).

| use | family | size | notes |
|-----|--------|------|------|
| body | EB Garamond | 1.05–1.15rem | line-height 1.7, measure ~50ch |
| titles (essay / film / note) | EB Garamond | 2.2rem–2.6rem | weight 400 (regular), letter-spacing tight |
| section labels, dates, navigation, captions | JetBrains Mono | 10–13px | letter-spacing 0.02em–0.05em, lowercase preferred |
| pull quotes / asides | EB Garamond italic | inherits | sparingly |
| code | JetBrains Mono | matches body size | same family as UI — consistent |

**No third family.** If a third typographic register is needed, it comes from EB Garamond italic, not a new font. The two-family rule is part of the design.

Numbers under ten spelled out in prose; ten and over as digits. Titles in sentence case ("On slowness"), navigation lowercase ("essays", "films").

## Layout (locked — second pass)

Second round of moodboard picks simplified the structure: drop the margin column, drop the dense archive from the home page, go cinematic on films.

### Index — loose only

Picked: B (loose, generous, with summaries).

```
echo · françois chastel              about · rss · feed · llms

— recent

2026.05.27 · essay
On slowness
There is a particular pleasure in doing one thing slowly when the
world is fast — not as a protest, exactly, but as a counterweight.

2026.05.12 · film
Field notes, vol. 3
A 90-second study of light through paper.

[ ~8–10 most recent items, all in loose form ]

─────────────
earlier →
```

- All items get the loose treatment: date + kind, title, one-sentence summary
- 8–10 items on the home page
- "earlier →" link at the bottom routes to `/archive` (dense list lives there in scaffold)
- No dense list on the homepage

### Post — left-aligned, declarative

Picked: B.

```
                                              [echo hairline color]

  echo / essays

  On slowness

  2026.05.27 · 1,200 words · 6 min · attention · craft

  There is a particular pleasure in doing one thing slowly
  when the world is fast — not as a protest, exactly, but
  as a counterweight.

  The pleasure isn't the slowness itself. It's the
  noticing it permits.

  ...

  — terracotta
```

- Single column, ~38rem wide, centered on the page
- Title: large (clamp 2.4 → 3.2rem), left-aligned, weight 400, letter-spacing -0.015em, line-height 1.05
- Lead line: mono caption with `date · words · time · tags`, colored `·` separators in the per-post echo
- Body: EB Garamond at body size, line-height 1.7, left-aligned
- Blockquote: 2px left border in the echo color
- Closing: `— terracotta` (or current echo name) in mono at the foot
- No margin metadata column

### Film — full-bleed video first

Picked: A.

```
echo · françois chastel              about · rss · feed · llms

─────────────────────────────────────────────────────────────
│                                                            │
│                        [video, full-bleed]                 │
│                                                            │
─────────────────────────────────────────────────────────────

  echo / films

  Field notes, vol. 3

  2026.05.12 · 1:30 · 1920×1080

  A 90-second study of light through paper. Shot over
  an afternoon in February in a room with one window
  and a single sheet of tracing paper. The camera
  barely moves.

  — teal
```

- Body background: **bone** (`--paper-bone`) — only film pages get this paper
- Header in the same row as essays
- Video extends edge-to-edge of the viewport (`width: 100vw + negative margins` breakout from `.page`)
- Below the video: same narrow column as posts (~38rem, centered, left-aligned text)
- Title, mono meta line with colored `·` separators, body, echo signature — same structure as post

## Motion

- Default: none.
- Allowed: 150ms opacity fade on link hover; 300ms fade-in on first scroll into view (once per element).
- Banned: parallax, scroll-jacking, decorative motion, anything that uses `top/left/width/height` for animation.
- `prefers-reduced-motion: reduce` disables all motion. Always.

## What we are not doing

- No dark mode toggle. The site is warm paper, period.
- No glassmorphism, no neumorphism, no gradients (except inside the film poster image itself).
- No icon library. No emoji in UI.
- No card grids. No SaaS hero. No "scroll to reveal" theatre.
- No third typeface. No accent color beyond the per-post echo.

## Forbidden in design review

If anyone (including the author) reaches for these words to describe the site, the work needs revisiting:

- "clean and modern"
- "minimal SaaS"
- "Tailwind default"
- "looks like Linear"
- "we could just add a small accent…"

## References

See [references/artists.md](./references/artists.md) and [references/sites.md](./references/sites.md). Living moodboard at `moodboard/` (run `python3 -m http.server 4321` inside that directory). The submitted picks are recorded in this file under the "locked" headings above.

## Open items (after second sketch round)

- **Title size cap**: now `clamp(2.4 → 3.2rem)`. Confirm at desktop.
- **Bone paper for films**: confirm the warmth shift is felt without being a "theme change".
- **Full-bleed video sizing**: cap at 1600px? Or true edge-to-edge always? Defer until first real film is in.
- **Archive page**: not yet sketched. Scaffold should ship `/archive` as a dense list (the old A pattern) for everything past the 10 most recent.

## Motion + texture layer

The sketch added a thin motion + grain layer that ports to scaffold unchanged. Documented in `sketch/styles.css` under the "motion + texture layer" block. Summary:

- Paper grain via inline SVG noise overlay (~4% opacity, mix-blend multiply)
- Page entry: header / main / footer fade up 8px, staggered 0–220ms
- Echo hairline draws in left → right over 850ms on post + film load
- Loose-item hover: title slides 4px right + colored `·` appears in metadata
- Body link underline grows from 0 → 100% on hover
- Small colored `·` brand mark before "echo" in the header
- All stripped by `prefers-reduced-motion: reduce`
