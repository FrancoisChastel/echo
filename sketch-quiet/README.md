# sketch-quiet — rejected v2 (saved for reference)

> **Status: rejected.** This direction read as too pretentious — over-academic, lost the warmth of the locked aesthetic.
> Kept here so we can revisit specific moves (drop cap, italic titles, roman numerals, § ornaments) if any of them turn out to be missed.
> The active sketch is in `../sketch/` (warm + motion).

Original notes below.

---

Second sketch iteration. Leans hard into Quiet Japan + academic restraint. Pretentious by design — small press monograph register.

The previous warm-minimal-margin-noted version is saved at `../sketch-warm/` and served on `:4323` for comparison.

## How to view

```bash
cd sketch
python3 -m http.server 4322
# open http://localhost:4322
```

The warm-minimal sketch lives on `:4323`. Flip between the two tabs.

## What changed from v1

| | v1 warm (saved) | v2 quiet (this) |
|---|---|---|
| alignment | left | centered by default |
| title style | roman, large | italic, modest |
| post layout | centered measure + left margin metadata | centered everything, no margin column |
| body width | 52ch | 44ch |
| line-height | 1.7 | 1.85 |
| date format | 2026.05.27 | 27.v.2026 |
| dividers | hairlines | § and ·  ·  · |
| quotes | hanging | « » centered |
| drop cap | off | on (italic) |
| echo color event | hairline at top + filled square + label | a single `·` mark in metadata + label at foot |
| section headings | left-aligned | § centered italic |
| signature | none | "— françois" italic |
| footer | rss · feed · llms | "echo · mmxxvi · françois chastel" centered |
| paper | warm off-white | slightly creamer |
| spacing | generous | even more generous |
| page max | 72rem | 56rem |

The locked palette (warm paper + warm ink) and locked typography (EB Garamond + JetBrains Mono) are unchanged. Everything else got quieter.

## Files

```
sketch/
├── tokens.css       smaller scales, narrower measure, more space
├── styles.css       centered defaults, italic titles, ornaments
├── index.html       work list, no summaries on older items
├── post.html        centered title + drop-cap body + signature
├── film.html        vol. iii + italic title + small video
└── README.md        this file
```

## What to react to

Open items now:

1. **Pretentiousness level.** Too much? Just right? Push harder?
2. **Drop cap.** Helps or distracts? (currently 3.4rem italic, first letter only)
3. **Roman numeral dates.** "27.v.2026" — readable? Or pretentious-bad?
4. **« » centered blockquotes.** Beautiful or too French?
5. **Italic centered titles.** Reads as quiet-confident or as precious?
6. **Single `·` echo mark.** Enough color event, or invisible?
7. **`vol. iii` for films.** Worth keeping? Drop it?
8. **No summaries on older items.** Index gets sparser past the recent block — feels right or too thin?

Send back "v1 / v2 / blend / push further" plus per-item notes. We lock the actual direction, then scaffold.
