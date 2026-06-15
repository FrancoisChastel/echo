# sketch-warm — saved alternate (v1)

> **Saved version.** This is the "warm minimal · mono+serif · margin-noted" sketch from the first pass.
> The active sketch is in `../sketch/` (a quieter, more academic variant).
> Kept here for comparison and as a fallback if the quieter direction doesn't land.

Three static pages implementing the original locked aesthetic from [docs/01-aesthetic-direction.md](../docs/01-aesthetic-direction.md).

## How to view

```bash
cd sketch-warm
python3 -m http.server 4323
# open http://localhost:4323
```

Moodboard remains on `4321` so you can compare phase 2 ↔ phase 3.

## Files

```
sketch/
├── tokens.css       design tokens (palette, type, spacing, layout)
├── styles.css       all component styles — ports to scaffold unchanged
├── index.html       homepage: loose recent + dense archive
├── post.html        essay page: centered measure + left margin metadata
├── film.html        film page: centered with breathing space
└── README.md        this file
```

## Sketch-only

- `<nav class="sketch-nav">` bottom-right corner — flip between the three pages quickly. Deleted at scaffold time.
- Hash-anchor links (`#rss`, `#llms`) for nav items that will become real routes.

## What to check

Open each page at all four breakpoints. In Chrome/Firefox/Safari:

| breakpoint | width | what to verify |
|------|------|------|
| mobile | 320–600 | header stacks, dense archive condenses, post margin collapses to footer |
| tablet | 768 | type still reads, margin column still visible on post (collapses at 900) |
| laptop | 1024 | margin column fully visible, comfortable measure |
| desktop | 1440+ | nothing feels lost in the page; type doesn't oversize |

## What to react to

Open items called out in the doc are the things to specifically eyeball:

1. **Title size on post pages.** Current: `clamp(2.2rem, 1.7rem + 2vw, 2.8rem)`. Too small? Too large?
2. **Margin column width.** Current: `11rem`. Wider (12)? Narrower (9)?
3. **Body measure.** Current: `52ch`. Comfortable? Cramped?
4. **Echo color event.** Hairline at top + colored square + colored "— name" at bottom. Too much? Too little?
5. **Loose / dense split on homepage.** Five recent feels right? Want more?
6. **Year separators in the archive.** Currently faint mono caption — readable?

Send back a list of "yes / change to X / remove Y" per item, or a single "ship it" if it all feels right. We then move to phase 4 (scaffold).
