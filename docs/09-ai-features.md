# 09 — ai features

Six visitor-facing AI moves. None is a chatbot. Each does one thing, then steps back. All run on a one-time local-AI pre-compute pass (llama.cpp / LM Studio) at publish time — **zero runtime inference cost**, forever.

## What gets generated, when

| feature | what | when generated | where stored |
|---|---|---|---|
| The Endless Echo | 5 content pools per category (fragments, brackets, coords, queries, found) | publish time, per category | `public/ai/endless-pool.json` |
| The Drift | embedding for each post + nearest-3 per post | publish time | `public/ai/drift.json` |
| Marginal Echoes | resonant quote pairs per paragraph | publish time, per post | `public/ai/marginals/<slug>.json` |
| The Echo Chamber | sentence embeddings + LLM judge prompt | publish time (embeddings) + runtime once per query (judge) | `public/ai/sentences.json` |
| The Echo Garden | embedding + UMAP coordinates per post | publish time | `public/ai/garden.json` |
| Post category | one classification per post | publish time | post frontmatter `category` |

The only thing that runs at visit time is **The Echo Chamber's judge step** (1 small LLM call per visitor question, ~$0.001 with Claude Haiku 4.5). Everything else is static JSON.

## The voice file

All prompts reference the voice file:

```
~/Documents/Obsidian/voice/echo.md  (per env var ECHO_VOICE_NOTE)
```

Every prompt below loads the voice file as a system prompt prelude. See [voice-template.md](./voice-template.md) for the template.

## Anti-slop foundations (loaded into every prompt)

```
You are working in the voice and corpus of a specific author. Your output
will be displayed AS IS on their personal website. The author's voice is
described in voice/echo.md. Honor it.

UNIVERSAL CONSTRAINTS — applied to every output:

- Specific over general. Concrete over abstract. A small adjustment of a
  hand beats "presence". An afternoon in February beats "moments of pause".

- NEVER use any of these words: journey, embrace, navigate, unlock,
  mindful, intentional, authentic, resonate, dive, leverage, holistic,
  wellness, balance, optimize, productive, productivity hack, mindfulness,
  consciously, deliberately (the adverb is fine, the rhetoric is not).

- NEVER begin a sentence with: "The importance of", "The art of",
  "Embracing the", "Navigating the", "Unlocking", "In essence",
  "Ultimately", "Moreover", "Furthermore", "It is important to note",
  "In today's world", "In a world where".

- NEVER frame anything as a tutorial or listicle. No "5 ways", no
  "here are the steps", no bullet lists of takeaways.

- NEVER explain. The author does not explain. They observe.

- NEVER produce a moral. The author does not moralize. They notice.

- Hedge honestly, not weasily. "I have begun to suspect" is fine.
  "Some people believe" is not.

- If you cannot meet the constraints with the input provided, output the
  literal string [ silence ] and nothing else. A skipped output is better
  than a false one.

The author would rather see [ silence ] than something they would not
have written.
```

Every prompt below assumes this foundation is loaded.

---

## 1 · Post category classification

**When**: at publish time, once per post.
**Why**: drives which content pools The Endless Echo draws from. Also surfaces as the "mood" of the corpus to readers.
**Model**: any small instruct model. Claude Haiku 4.5, Llama 3.3 8B, anything competent.

```
You are reading one post by the author. Classify it into EXACTLY ONE
of these categories. Each category will weight which fragments,
coordinates, and found phrases the site uses when it continues this
post's echo into infinite scroll.

THE CATEGORIES:

  philosophical-slowness    essays on attention, slowness, presence,
                            the texture of work. introspective, quiet.
  philosophical-craft       essays on making, finishing, abandoning,
                            the relationship to one's tools.
  philosophical-time        essays on days, returns, seasons, memory.
  film-sensory              writeups for films — light, motion, room.
  film-technical            writeups for films — camera, color, edit.
  note-observational        short notes — fragments of a thought.
  note-technical            short notes — tech, agents, code.
  other                     none of the above.

THE POST:

[full post markdown including frontmatter]

OUTPUT FORMAT:
One word: the category slug. Nothing else.

If the post is genuinely ambiguous between two categories, pick the
one closer to its first paragraph's register. Do not output a list,
explanation, or confidence score.
```

The category is written back to the post's frontmatter (`category: philosophical-slowness`) and is the input to every other prompt below that mentions per-category pools.

---

## 2 · Endless Echo — pool generation

**When**: at publish time, once per category (not per post — categories share pools).
**Why**: feeds the scroll-summoned paragraphs forever.
**Model**: a strong local model (Llama 3.3 70B if available; 8B works for the simpler pools).

The prompt asks for FIVE pools in one structured output. Run once per category. Save as `public/ai/endless-pool.<category>.json`.

```
You are extracting and generating five content pools for an INFINITE
SCROLL feature on the author's personal essay site.

A visitor scrolls past the end of an essay. The site appends paragraphs
forever. Real-time inference would be expensive; instead, the site
pre-computes pools once and stitches forever.

CATEGORY:
[category slug]

CORPUS (all posts in this category):
[concatenated markdown]

PRODUCE FIVE POOLS as JSON. The schema:

{
  "fragments": [ string, string, ... ],   // 40 entries
  "brackets":  [ string, string, ... ],   // 30 entries
  "coords":    [ string, string, ... ],   // 25 entries
  "queries":   [ string, string, ... ],   // 20 entries
  "found":     [ string, string, ... ]    // 20 entries
}

WHAT EACH POOL IS:

—— fragments ——
Short closed phrases (3–12 words, ends in period). They look like
sentences the author might have written in the margin of one of their
essays — but are not literal quotes.

Each fragment MUST contain at least one concrete noun (a hand, a window,
a tape, the afternoon, a paragraph, a film, the third visit).

Each fragment must end in a period.

GOOD:
  the small adjustment of a hand.
  by evening, yet.
  warm to match the afternoon.
  the third visit.
  a tape with one side unmarked.

BAD (do not produce):
  the importance of slowing down.        ← abstract / tutorial
  embracing the journey of craft.        ← cliché
  mindfully attending to the present.    ← buzzwords

—— brackets ——
System markers wrapped in square brackets. Lowercase, 2–5 words inside.
They read like the status lights of a quiet, slightly damaged archive
machine that has been reading the corpus for years.

GOOD:
  [ no signal ]
  [ silence detected ]
  [ resume on next visit ]
  [ continuity unclear ]
  [ the file repeats ]
  [ light through paper ]

BAD:
  [ error 404 ]                          ← web cliché
  [ loading... ]                         ← generic
  [ welcome back, user ]                 ← chatbot register

—— coords ——
Found timestamps and locations. They feel salvaged from a logbook.
Variety required:
  - lat/long with time:       "48.8566° N, 2.3522° E · 14:32"
  - roman-month dates:        "mcmlxxiii.xi.04"
  - poetic locations:         "tokyo · 05:11 · drizzle"
  - lost coordinates:         "coords lost — last seen feb"
  - tape stamps:              "side B · 17:24 elapsed"

Times must feel chosen, never round (3am, late afternoon, dawn — not 1pm).
Dates weight 1970s–1990s. No present year.

—— queries ——
Search queries the kind of reader who finished this corpus might have
typed. Each in double quotes, 3–10 words.

GOOD:
  "how to do nothing"
  "the work I almost finished"
  "between two points the air"
  "silence after a line"

BAD:
  "productivity tips for slow workers"    ← buzzword
  "mindfulness in modern life"            ← slop
  "work-life balance philosophy"          ← consultancy

—— found ——
Archival references. Variety required:
  - catalog signatures:     "BF 408 .H29 1991"
  - manuscript refs:        "ms. fr. 1373, fol. 42v"
  - tape labels:            "rec. on: c-90, side B"
  - marginal pencil notes:  "manuscript abandoned, pencil note in margin"
  - plate references:       "plate xxxi, fig. 2"
  - scene release tags:     "~ scene release: 04.iii.1996 ~"
  - sub rosa markers:       "sub rosa, n.d."

Latin abbreviations welcome (n.d., c., fol., recto, verso, ms.).
No invented book titles. No real public figure names.

CATEGORY-SPECIFIC WEIGHTING:

If category is film-* — bias coords and found toward shoot logs:
  "reel 02, take 4"
  "lens stopped at f/2.8"
  "color match: afternoon, north light"

If category is note-technical — bias brackets and queries toward
  the register of debugging notes:
  [ inferring ]
  [ partial transcript ]
  "what mcp gets right"

If category is philosophical-* — bias fragments toward the inner life,
  toward returning and attention.

REJECT-RESET:
If, while writing, you notice yourself producing a tutorial or a buzzword
or a generic line, STOP and rewrite that pool from scratch. Output only
the final clean pool. The author would rather see fewer real entries than
many slop ones — if you cannot produce 40 honest fragments, produce 25.

OUTPUT:
Valid JSON only. No commentary before or after the JSON.
```

---

## 3 · The Drift — resonance graph

**When**: at publish time, after a new post is added or any post is meaningfully edited.
**Why**: each post knows its three nearest neighbors *by feeling*, not by tag or date.
**Architecture**:
1. Generate an embedding for each post (full body), using a small local embedding model (all-MiniLM-L6-v2 or similar).
2. For each post, compute cosine similarity to every other post.
3. Take the top-10 nearest by embedding.
4. Pass that list to the LLM judge below to pick the 3 best **by feel**.

```
A reader has just finished THIS POST:

  TITLE:    [current post title]
  SUMMARY:  [summary]
  OPENING:  [first 3 sentences]
  CLOSING:  [last 2 sentences]

They are about to drift to ONE other post.

CANDIDATE POSTS (top 10 by embedding similarity):

  1. [title · summary · first sentence]
  2. ...
  ...
  10. ...

CHOOSE THE THREE that most resonate. Resonance means:
  - it continues a thought the current post raised — without repeating it
  - it asks something the current post implied but didn't ask
  - it offers a different angle on the same underlying preoccupation

DO NOT PICK:
  - the most recent post by default
  - the longest post by default
  - a post that simply shares a keyword (the connection must be felt,
    not lexical)
  - the post the reader is on (obviously)

OUTPUT: a JSON array of three integers — the candidate numbers, in order
of strength of resonance.

If fewer than three candidates genuinely resonate, output fewer. Empty
array is acceptable. Forced resonance is worse than honest absence.
```

The result is written to `public/ai/drift.json`:
```json
{
  "on-slowness":      ["on-attention", "on-finishing", "the-shape-of-a-day"],
  "on-attention":     ["on-slowness", "geometry-of-attention"],
  ...
}
```

At runtime the client picks ONE from the array per click (rotating, or the first).

---

## 4 · Marginal Echoes — per-paragraph quote pairing

**When**: at publish time, once per post.
**Why**: while a visitor reads a paragraph, an italic line from an *older* post appears in the right margin, echoing it.
**Architecture**:
1. For each paragraph in the new post, get its embedding.
2. Find the top 10 nearest sentences from posts OLDER than this one.
3. LLM judge picks the one that genuinely echoes.

```
You are pairing a paragraph from a new post with ONE echoing line from
an OLDER post by the same author.

THE NEW POST PARAGRAPH:

[paragraph text]

THE NEW POST'S CONTEXT:
  title:    [title]
  category: [category]

TEN NEAREST LINES FROM OLDER POSTS (by embedding similarity):

  1. "[line]" — from [older post title], [date]
  2. ...
  ...
  10. ...

CHOOSE ONE that ECHOES the paragraph.

ECHO MEANS:
  - the line could be a quiet confirmation of the paragraph, never a
    contradiction
  - the line approaches the same idea from a different angle or image
  - the line predates the new paragraph (older post — already filtered
    for you above)
  - the line is interesting in isolation, not only as a callback

OUTPUT: one integer — the chosen line number — and nothing else.

If NONE of the ten lines genuinely echoes this paragraph, output:
  SKIP

A skip is far better than a forced echo. Visitors will only trust the
marginal echoes if every one of them is real. We would rather a post
have three marginal echoes than seven half-echoes.
```

Result: `public/ai/marginals/<slug>.json`:
```json
{
  "p1": { "quote": "what we keep, and what we let pass.", "source": "on attention", "date": "2026-04-11" },
  "p2": null,
  "p3": { "quote": "the geometry of attention.", "source": "...", "date": "..." },
  ...
}
```

`null` paragraphs render with no margin note. **The site's quietness is part of the design.**

---

## 5 · The Echo Chamber — runtime judge

**When**: each visitor query (1 call per submission, ~$0.001 with Claude Haiku 4.5).
**Why**: the visitor types a phrase; the site returns ONE sentence from the corpus that resonates.
**Architecture**:
1. Embed visitor input.
2. Find top-10 nearest sentences from the full corpus.
3. LLM judge picks one (or refuses).

```
A visitor has come to a quiet website and typed a phrase into a single
input field. They are asking nothing. They are bringing something.

Your job is to find ONE sentence from the author's corpus that quietly
resonates with what the visitor brought. You are not the author. You
do not compose. You only choose.

VISITOR'S PHRASE:

  "[user input]"

TEN CANDIDATES (top by embedding similarity from the full corpus):

  1. "[sentence]" — from [post title], [date]
  2. ...
  ...
  10. ...

CHOOSE the ONE that best resonates with what the visitor brought.

RESONANCE means:
  - emotional register matches (tired → quiet; lost → settling; urgent
    → still; curious → opening)
  - the chosen sentence acknowledges what the visitor brought without
    explaining it
  - the chosen sentence stands on its own, not as advice but as company
  - the resonance is by feeling, not by shared words

DO NOT:
  - pick a sentence just because it shares words with the visitor's phrase
  - pick the most quotable sentence by default
  - explain the choice

OUTPUT FORMAT — strict JSON:
{
  "choice": <integer 1-10>,
  "confidence": "high" | "medium" | "low"
}

If NONE of the ten candidates genuinely resonates, output:
{
  "choice": null,
  "confidence": "none"
}

The site will display, in that case, the line:
  "the corpus has nothing for this. yet."

That line is true and useful. Returning it is not a failure.
```

---

## 6 · The Echo Garden — embedding + projection

**When**: at publish time, after any post change.
**Why**: the corpus is shown as a constellation. Posts close in idea are close on the canvas.
**Architecture**:
1. Embed each post (whole body, mean-pooled).
2. Run UMAP (or t-SNE) to project to 2D.
3. Save coordinates + post metadata to JSON.

No LLM prompt needed for the math. But the per-post metadata used to render the dots is enriched with a single LLM-classified "feeling" word, which appears on hover:

```
For one post, output ONE word that captures its dominant feeling.
NOT its topic. Its feeling.

POST:
  title: [title]
  body:  [first 3 paragraphs]

ALLOWED FEELING WORDS (closed list — pick exactly one):
  quiet, urgent, returning, suspended, gathering, lonely, plain,
  warm, austere, drifting, surprised, decided, mournful, dawning,
  unfinished, certain, doubtful, attentive, drowsy, sharp.

OUTPUT: one word from the list above. Nothing else.

If the post genuinely is none of these, output: undefined.
```

Renders on hover: `"on slowness — attentive"`.

---

## 7 · Voice consistency check (build-time gate)

Optional but recommended: after any AI-generated pool is regenerated, run the voice consistency check. If it fails, the build fails.

```
You are a strict editor checking whether a batch of AI-generated lines
sound like they were written by the author whose voice is described in
voice/echo.md.

VOICE GUIDE:
[voice/echo.md]

CORPUS SAMPLES (5 randomly chosen real paragraphs):
[samples]

NEW BATCH TO EVALUATE:
[batch of N lines]

For EACH line in the new batch, decide:
  PASS  — sounds like the author
  FAIL  — sounds like generic AI / not the voice / contains slop

OUTPUT FORMAT — JSON array of strings:
  ["PASS", "FAIL", "PASS", ...]   (one per line in batch, in order)

A line FAILS if it:
  - uses any banned word (see voice file)
  - begins with a banned phrase
  - reads like a tutorial
  - explains
  - moralizes
  - contains an abstract noun without a concrete companion

If MORE THAN 25% of the batch fails, the entire build fails. The pools
must be regenerated before the site can publish.
```

---

## Operational summary

| step | who | how often | cost |
|---|---|---|---|
| classify a new post into a category | local LLM | once per publish | free |
| (re)generate per-category endless pools | local LLM (Llama 3.3 70B ideal) | once per category change | free |
| compute embeddings for all sentences | local sentence-transformers | once per publish | free |
| compute drift / garden / marginals | local LLM judge over top-K embedding candidates | once per publish | free |
| answer a visitor's echo-chamber query | Claude Haiku 4.5 over top-10 candidates | per visitor question | ~$0.001 |
| voice consistency gate | local LLM | once per publish | free |

**Total cost for a personal-traffic site (10k monthly visits, 1k chamber queries): under $1/month.** All other features are pre-computed.

## What this whole document is not

- Not a guarantee. LLMs drift. The voice-gate (#7) is the load-bearing safety net. If you skip it, slop will sneak in eventually.
- Not a chatbot. There is no conversation surface. The visitor speaks once, the site responds once.
- Not personalized. The corpus is the same for everyone. The mood is the corpus's, not the visitor's.

## Files this spec implies

```
scripts/
├── ai-classify.ts         # post → category
├── ai-pools.ts            # per-category endless pool generation
├── ai-embed.ts            # corpus → embeddings
├── ai-drift.ts            # post → 3 nearest by resonance
├── ai-marginals.ts        # paragraph → 1 echo line each
├── ai-garden.ts           # corpus → 2D constellation + feeling words
└── ai-voice-gate.ts       # batch → PASS/FAIL gate

public/ai/
├── endless-pool.<category>.json
├── drift.json
├── marginals/<slug>.json
├── sentences.json         # embeddings + raw text
└── garden.json            # 2D positions + feelings
```

The runtime client only needs these JSON files. The local AI pipeline only runs at publish time.
