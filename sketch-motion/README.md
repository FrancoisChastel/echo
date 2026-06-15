# sketch-motion — saved alternate

> **Saved version.** The v1 warm-minimal-margin-noted base with the motion + texture layer.
> Superseded by `../sketch/` (v3 left-aligned + cinematic) after the second round of moodboard picks moved
> away from the margin column and the dense archive.
> Kept here in case any of those moves (margin metadata column, dense+loose hybrid index, centered film)
> turn out to be missed.

## How to view

```bash
cd sketch-motion
python3 -m http.server 4324
# open http://localhost:4324
```

Comparisons:
- `:4322` — this (warm + motion)
- `:4323` — `sketch-warm/` original v1, no motion (pure baseline)
- `:4321` — moodboard

## What got added

Eight thin layers, all compositor-friendly, all stripped when `prefers-reduced-motion: reduce`:

1. **Paper grain** — very faint SVG noise overlay (~4% opacity, mix-blend multiply). Adds tactile warmth without showing as a pattern.
2. **Smooth scroll** — `scroll-behavior: smooth` for in-page anchor links.
3. **Page entry rise** — header / main / footer fade up 8px, staggered 0–220ms.
4. **Echo hairline draws in** — on post and film pages, the 3px color bar at the top scales from 0 → 1 left-to-right over 850ms on load. Reads as the page *adopting* its color.
5. **Loose-item hover** — title slides 4px right, and a colored `·` appears before the metadata (the per-post echo color). Subtle but signals "this is hoverable, this has a color".
6. **Dense-item hover** — row nudges 3px right via transform (no reflow). Combined with the existing background tint.
7. **Body-link underline** — body links inside the post get an underline that grows from 0 → 100% on hover (currentColor 1px, 400ms ease-out). Echo color on hover.
8. **Brand mark** — a small colored `·` before the brand in the header, in the page's echo color. Same dot you see on hover in the list — the wordmark's tiny signature.

## Files

```
sketch/
├── tokens.css       same as v1 (warm paper, warm dark, JetBrains Mono + EB Garamond)
├── styles.css       v1 styles + "phase 3.1 motion + texture layer" block at the bottom
├── index.html       homepage (unchanged from v1)
├── post.html        essay (unchanged structurally + one demo link added)
├── film.html        film page (unchanged from v1)
└── README.md        this file
```

## What's NOT here (intentionally)

- No scroll-jacking, no parallax, no animated decorative elements
- No JavaScript — every effect is pure CSS (one less moving part to maintain)
- No read-progress indicator (defer; can add as a single element if wanted)
- No section-into-view animations (the page-load rise covers entry; scroll feels honest)
- No hover sound or "delight" gimmicks

## What to react to

1. **Page entry rise** — too noticeable / right / could be more
2. **Hairline draw-in** — meaningful or fussy
3. **Loose-item title slide + dot reveal** — distinctive / overdone / invisible
4. **Dense-item nudge** — too subtle / fine / drop it
5. **Paper grain** — adds warmth / doesn't show / too much
6. **Body link underline** — open `post.html` and hover the link in the "Tools are not neutral here" paragraph; check the speed/weight
7. **Brand mark `·` before "echo"** — works as a signature / busy / drop it
8. **Overall** — feels alive / feels designed / want one more touch

Send back a list of yes/change/drop per item, or "ship it". Phase 4 (Astro scaffold) is next.
