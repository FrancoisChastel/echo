# sketch-cinematic-2 — saved v3 + 2 motion passes

> **Saved version.** v3 layout (left-aligned post, loose-only index, full-bleed cinematic film)
> with the first motion pass (page rise, hairline draw, hover micro-interactions, grain, brand mark)
> AND the second motion pass (loose-list stagger, title settle, read progress, oklch hover reveal,
> film-bleed reveal) — but BEFORE the third pass added scroll-triggered reveals.
> Restore from this folder if the scroll-triggered reveal turns out to be too much.

## How to view

```bash
cd sketch-cinematic-2
python3 -m http.server 4326
# open http://localhost:4326
```

---

# Original notes — v3 + second motion pass

v3 layout (left-aligned post, loose-only index, full-bleed cinematic film) with the **first motion pass** preserved and a **second motion pass** added on top.

The v3 baseline (before second pass) lives at `../sketch-cinematic/` so you can flip back if the new motion is too much.

## How to view

```bash
cd sketch
python3 -m http.server 4322
# open http://localhost:4322
```

Comparisons:
- `:4322` — **this** (v3 + second motion pass)
- `:4325` — `sketch-cinematic/` (v3 baseline, first motion pass only)
- `:4324` — `sketch-motion/` (warm-minimal v1 + first motion pass)
- `:4323` — `sketch-warm/` (pristine v1, no motion)
- `:4321` — moodboard

## What got added in the second motion pass

Five new moves. All compositor-friendly, all stripped by `prefers-reduced-motion`, only one (the read-progress) needs a tiny JS file.

1. **Staggered home list entry.** On the homepage, the loose-list items fade up sequentially (70ms apart), starting at 80ms. Replaces the bulk `main` fade-in on the home page — the page composes itself piece by piece instead of all at once.
2. **Title settle.** On post + film pages, the title appears with letter-spacing slightly open (+0.012em) and settles to its tight default (-0.015em) over 800ms. Barely perceptible — adds a "landing" feeling without you noticing why.
3. **Read progress bar.** Thin (2px) line at the very bottom of the viewport on post + film pages, in the per-post echo color, fills 0 → 100% as you scroll. No rail — invisible until it starts filling. Driven by `--read` CSS var from `progress.js`.
4. **Echo name oklch reveal.** Hover the `terracotta` / `teal` label at the foot of any post — the oklch value fades in to the right. Easter egg; reads as "of course this site knows its own color values".
5. **Film bleed reveal.** On the film page, the full-bleed video frame fades in with a tiny scale-from-0.98 → 1 over 900ms (100ms delayed). Subtle "this is arriving" feeling that pairs with the cinematic framing.

## Files

```
sketch/
├── tokens.css       unchanged from v3
├── styles.css       v3 styles + first motion pass + "phase 3.2 second motion pass" block
├── index.html       added `body class="home"` + inline `style="--i: N"` on each list item
├── post.html        added `body class="post"` + `<div class="read-progress">` + `data-oklch` + `<script src="progress.js">`
├── film.html        added `body class="film film-page"` + `<div class="read-progress">` + `data-oklch` + `<script src="progress.js">`
├── progress.js      ~10 lines, updates `--read` from scroll position
└── README.md        this file
```

## What's still NOT here (intentionally)

- No parallax, no scroll-jacking, no decorative animation
- No "fade text into view" as you scroll — the entry rise is once, on page load
- No mouse-tracking effects
- No autoplay video
- No animated icons or hover gimmicks

## Things to react to

1. **Stagger speed (70ms)** — too slow / right / faster
2. **Title settle** — does it feel like anything, or is it invisible?
3. **Read progress bar** — useful or vain (2px echo color, bottom edge)
4. **Echo name hover reveal** — fun easter egg or noise?
5. **Film bleed reveal** — right or distracting?
6. **Compared to sketch-cinematic (4325)** — the right amount of more, or already over?

Send back per-item or "ship it" → phase 4 (Astro scaffold).
