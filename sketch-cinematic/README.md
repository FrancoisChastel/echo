# sketch-cinematic — saved v3 baseline

> **Saved version.** Locked v3 layout — left-aligned declarative post, loose-only index,
> full-bleed cinematic film, bone paper on film, warm-minimal motion layer.
> The active sketch in `../sketch/` continues from here with additional subtle motion.
> Restore from this folder if the additional motion turns out to be too much.

## How to view

```bash
cd sketch-cinematic
python3 -m http.server 4325
# open http://localhost:4325
```

---

# Original notes — phase 3 · v3 left-aligned + cinematic

Implements the **second round of moodboard picks**.

The motion + texture layer the user liked is preserved; the structural changes are:

| | previous (sketch-motion) | this (v3) |
|---|---|---|
| index | loose recent + dense archive | **loose only** (10 items + "earlier →" link) |
| post | centered measure + left margin metadata | **left-aligned, declarative** (no margin column) |
| film | centered with breathing space | **full-bleed video first** |
| paper | warm only | **warm (default) + bone (film page)** |
| title size | clamp(2.2 → 2.8rem) | clamp(2.4 → 3.2rem) — bigger, more confident |

## How to view

```bash
cd sketch
python3 -m http.server 4322
# open http://localhost:4322
```

Comparisons available:
- `:4322` — **this** (v3 left-aligned + cinematic + motion)
- `:4324` — `sketch-motion/` (v1 warm-minimal + motion · saved last round)
- `:4323` — `sketch-warm/` (pristine v1 baseline, no motion)
- `:4321` — moodboard

## What's preserved from v2 motion layer

- Paper grain (subtle SVG noise overlay)
- Page entry rise (header / main / footer fade-up, staggered)
- Echo hairline draws in left-to-right on load (post + film pages)
- Loose-item hover: title slides right + colored `·` appears in metadata
- Body link underline animation
- Small `·` brand mark before "echo" in the header
- `prefers-reduced-motion` strips everything

## What's new in v3

- **Loose-only index** with summaries on every item. "earlier →" link at the bottom for the archive (sketch placeholder; real /archive page in scaffold).
- **Left-aligned declarative post**. Single column, no margin metadata. Big title (clamp 2.4 → 3.2rem). Metadata on a single mono line with colored `·` separators.
- **Full-bleed film**. Video extends edge-to-edge via `width: 100vw + negative margins`. Text content sits in the same narrow column as posts.
- **Bone paper** (`oklch(96% 0.01 70)`) used as the body background on the film page only — a slight cinematic warmth shift.
- **Blockquote with echo-color left border** — the per-post color used as a marker rather than just a bottom dash.

## Files

```
sketch/
├── tokens.css       new --paper-bone token, bigger title scale, wider measure
├── styles.css       new layouts + motion layer at the bottom
├── index.html       loose-only, 8 items, "earlier →" link
├── post.html        left-aligned, single column, single demo body link
├── film.html        full-bleed video, bone paper background
└── README.md        this file
```

## Things to react to

1. **Title size at 3.2rem cap** — declarative enough? Too big?
2. **Single-column post** — feels confident or too plain without the margin column?
3. **Full-bleed video** — right amount of cinematic? Too much (extends 100vw)?
4. **Bone paper on film page** — noticeable enough to feel intentional? Or distracting?
5. **Echo color blockquote border** — works as a per-post visual mark?
6. **"earlier →" link** — right level of hint? Want a date range, item count, etc?
7. **Loose-list at 8 items** — feels right or too long?
8. **Overall** — closer to "ship it" than v1+motion was?

Send back yes/change/drop per item, or "ship it" → phase 4 scaffold.
