# sketch — phase 3 · v3 + third motion pass (scroll reveal)

Active sketch. Layered:

| pass | what | how |
|---|---|---|
| layout v3 | left-aligned post, loose-only index, full-bleed film, bone paper | locked in `docs/01-aesthetic-direction.md` |
| motion 1 | paper grain, page rise, hairline draw, hover micros, brand mark | pure CSS |
| motion 2 | loose-list stagger, title settle, read progress, oklch hover, video reveal | CSS + `progress.js` |
| motion 3 | scroll-triggered reveal on body content | CSS `.reveal` + `reveal.js` (IntersectionObserver) |
| motion 4 | **sticky header — translucent paper + blur when scrolled, hides on scroll-down, returns on scroll-up** | CSS + `header.js` |

The v3 + motion-2 baseline (before this scroll-reveal pass) lives at `../sketch-cinematic-2/`. Flip back if too much.

## How to view

```bash
cd sketch
python3 -m http.server 4322
# open http://localhost:4322
```

Comparisons:
- `:4322` — **this** (v3 + motion 1 + 2 + 3 scroll reveal)
- `:4326` — `sketch-cinematic-2/` (v3 + motion 1 + 2, NO scroll reveal — direct A/B)
- `:4325` — `sketch-cinematic/` (v3 baseline + motion 1 only)
- `:4324` — `sketch-motion/` (warm-minimal v1 + motion 1)
- `:4323` — `sketch-warm/` (pristine v1, no motion)
- `:4321` — moodboard

## What got added in motion pass 3

The scroll reveal turns reading and browsing into a quiet performance. Each piece of content arrives as you encounter it — not as a single big load.

| element | when it reveals |
|---|---|
| loose-list items (homepage) | above-fold items reveal on load with 60ms inter-item stagger; below-fold items reveal individually as they scroll into view |
| section captions (`— recent`, `— archive`) | as they enter view |
| `earlier →` link | as it enters view |
| post body paragraphs, `h2`s, blockquotes, dividers | as each enters view |
| blockquotes specifically | also slide in 8px from the left — adds a small editorial gesture |
| film body paragraphs | as each enters view |
| echo color signature at the foot | as it enters view |

**Transition shape**: 650ms ease-out-expo (`cubic-bezier(0.16, 1, 0.3, 1)`), opacity 0 → 1 + translateY 14px → 0. Same easing language as the rest of the motion layer.

**Above-fold handling**: IntersectionObserver fires immediately on attach for elements already in view. The JS staggers them 60ms apart so they compose, not pop. Below-fold elements reveal individually with no stagger (one at a time).

**rootMargin: `0px 0px -8% 0px`** — the reveal fires slightly *before* the element is fully on screen. By the time your eye reaches it, it's done. Reading flow stays uninterrupted.

## What's deliberately untouched

- Title, lead, crumb — these are page anchors. They appear immediately (with their own subtle motion: title-settle, crumb fade, lead fade). No scroll-reveal — they shouldn't make you wait.
- Site header + footer — they keep their own entry rise (no scroll reveal).
- Video — film-bleed video reveal is on load, not on scroll. The video is a destination, not a discovery.

## Files

```
sketch/
├── tokens.css       unchanged
├── styles.css       v3 + 3 motion passes; new "phase 3.3 scroll-reveal layer" at the bottom
├── index.html       added <script src="reveal.js">
├── post.html        added <script src="reveal.js"> (before progress.js)
├── film.html        added <script src="reveal.js"> (before progress.js)
├── reveal.js        ~30 lines IntersectionObserver
├── progress.js      unchanged
└── README.md        this file
```

## Things to react to (motion 3 + 4)

1. **Sticky header — hide on scroll-down, show on scroll-up** — natural / annoying / right
2. **Header translucent blur on scroll** — strength right (10px blur, 88% paper opacity)?
3. **Threshold (80px scroll before hiding)** — too early / too late
4. **Reveal timing (650ms)** — right / slower / faster
5. **Blockquote left slide** — adds character or distracts
6. **A/B vs 4326** (motion 3+4 vs motion 1+2 only) — earns its weight
7. **Ship it** → phase 4 Astro scaffold

Send back per-item or "ship it".
