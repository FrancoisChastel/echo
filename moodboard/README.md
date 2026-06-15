# moodboard

A local one-page moodboard for phase 2 of the echo build.

## How to view

### Option 1 — open the file directly

```bash
open /Users/francoischastel/Documents/github.com/FrancoisChastel/echo/moodboard/index.html
```

### Option 2 — serve it (recommended; fonts load more reliably)

```bash
cd /Users/francoischastel/Documents/github.com/FrancoisChastel/echo/moodboard
python3 -m http.server 4321
# then open http://localhost:4321
```

or

```bash
npx --yes serve /Users/francoischastel/Documents/github.com/FrancoisChastel/echo/moodboard
```

## What's inside

One scrollable page, eight sections:

1. **direction** — three full-bleed aesthetic candidates (Swiss editorial / Quiet Japan / Editorial dark)
2. **type** — four candidate font pairings, all rendering the same fake article
3. **palette** — three paper whites + three inks, with oklch values
4. **echo colors** — six candidate "one color per post" signature colors, each shown as a sample index card
5. **index layout** — three ways to lay out the homepage (dense / loose / asymmetric)
6. **post layout** — three ways to render an essay (centered / left / sidenoted)
7. **film layout** — three ways to present a video (full-bleed / centered / split)
8. **references** — annotated links to artists and sites

Plus a closing **decisions** block — read it, then send back a row of selections.

## How to give feedback

When you've scrolled through, send a row like:

```
direction C · type 2 · warm paper · cool ink · index A · post B · film A · keep all echo colors
```

Or describe what you wish were different ("I like type 2 but with the title smaller", "echo bar should be at the bottom not top", etc).

I'll lock the choices, update `docs/01-aesthetic-direction.md` to reflect them, and we move to phase 3 (sketch).

## What this moodboard is NOT

- Not pixel-final. Spacing, sizes, and details are deliberately rough.
- Not the actual site. This is one HTML file with no framework, used only for visual decisions.
- Not exhaustive. If a direction you want isn't represented, say so and I'll add it.
