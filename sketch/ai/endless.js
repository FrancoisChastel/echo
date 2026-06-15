// The Endless Echo — corpus-stitched + paced like human writing
//
// Production: build-time script runs the corpus through local llama.cpp /
// LM Studio once → emits a static endless-pool.json (~80KB).
// Client picks from pools by depth, types each paragraph out at human pace.
// Zero LLM inference per visit.
//
// Pacing strategy: typing speed slows with depth, punctuation extends pauses,
// the corpus "thinks" between paragraphs. The slowness is the feature.
(() => {
  // ============================================================
  // pools
  // ============================================================

  const POOL = [
    "There is a particular pleasure in doing one thing slowly when the world is fast.",
    "The pleasure isn't the slowness itself.",
    "It's the noticing it permits.",
    "Slowness is the technique you reach for when the texture of the result matters.",
    "A quick task done attentively is not fast.",
    "A long task done while elsewhere is not slow.",
    "I have begun to suspect that the speed at which we work is not a property of the work itself, but of the relationship we have with it.",
    "What we keep, and what we let pass — most of a life is the second category.",
    "To attend to something is to accept being changed by it.",
    "Attention is the small portion of the world we agree to receive in full.",
    "I had not noticed because each return felt fresh.",
    "Stepping back, I could see the pattern.",
    "The same idea, approached at different angles, year after year.",
    "What I meant happens at the speed of attention.",
    "Tools are not neutral here.",
    "A tool that makes you faster at a thing that wants slowness quietly changes what you make.",
    "You will not notice the change in any single instance.",
    "Only later, looking back across a year of work.",
    "What survives this conversation is the willingness to wait.",
    "The waiting is the work the slowness was always for.",
    "It is possible to spend a day producing nothing and still have done something.",
    "The difference is not visible in the output.",
    "A film I almost finished — but did not — has taught me more than the films I completed quickly.",
    "Sometimes the work asks to be left alone for a week.",
    "The week is part of the making, though no one will see it in the result.",
    "I started this series to learn what a film could be when stripped of plot.",
    "There is a moment near the middle where the shadow of a hand crosses the frame.",
    "I left it because the hand is doing what the camera is doing, which is watching.",
    "Color graded warm to match the afternoon.",
    "Architecture, time, and the spaces between meetings.",
    "The day held a shape I had not chosen but could now see.",
    "Mornings have a register that afternoons cannot reach.",
    "By evening, I had not made anything, and yet.",
    "There is a kind of attention that only the third or fourth visit can bring.",
    "The first visit is curiosity, the second comparison, the third the beginning of what was always there.",
    "I returned to this again.",
  ];

  const FRAGMENTS = [
    "the noticing.", "the waiting.", "the not-finishing.", "the small adjustment of a hand.",
    "what survives.", "what we let pass.", "the texture of the result.", "almost done.", "again.",
    "the third visit.", "by evening.", "stripped of plot.", "the relationship we have with it.",
    "the air.", "warm.", "the same idea.", "year after year.", "the willingness to wait.",
  ];

  const SPACED_WORDS = [
    "slowness", "attention", "morning", "silence", "again", "return", "notice",
    "echo", "drift", "still", "wait", "paper", "light", "breath", "almost", "warm", "after",
  ];

  const BRACKETS = [
    "[ no signal ]", "[ inferring ]", "[ silence detected ]", "[ drift ]", "[ archive ]",
    "[ found ]", "[ in margin ]", "[ unsigned ]", "[ no nearby pieces ]",
    "[ resume on next visit ]", "[ continuity unclear ]", "[ the file repeats ]",
    "[ static ]", "[ light through paper ]", "[ frame 0420 ]", "[ reel intact ]",
    "[ index unknown ]", "[ partial transcript ]", "[ tape damage ]",
  ];

  const COORDS = [
    "48.8566° N, 2.3522° E · 14:32", "40.7128° N, 74.0060° W · 03:18",
    "mcmlxxiii.xi.04", "lat unknown · long unknown · 04:44",
    "coords lost — last seen feb", "52°N · winter", "isfjorden · midwinter",
    "st-malo · low tide", "dec. xxiv, ante meridiem", "23h59 · paris",
    "tokyo · 05:11 · drizzle", "side B · 17:24 elapsed",
  ];

  const QUERIES = [
    '"how to do nothing"', '"the work I almost finished"', '"what attention buys"',
    '"slow as discipline"', '"the noticing"', '"between two points the air"',
    '"what we keep what we let pass"', '"the third visit"', '"silence after a line"',
    '"how to leave a thing alone"', '"film with no plot"', '"by evening yet"',
  ];

  const FOUND = [
    "~ scene release: 04.iii.1996 ~", "( catalogued, not yet read )", "BF 408 .H29 1991",
    "// see: marginalia § 7", "rec. on: c-90, side B", "~ from a forgotten archive ~",
    "plate xxxi, fig. 2", "ms. fr. 1373, fol. 42v", "tape 03, side A — unmarked",
    "sub rosa, n.d.", "( verso, fol. 4 )", "manuscript abandoned, pencil note in margin",
    "diary, undated, lost since 1987", "( found inside a borrowed book )",
  ];

  const SINGLE_CHARS = ["·", "—", ".", ":", "◦", "∘", "·"];

  const EMPTY_BRACKETS = [
    "[ ]", "[      ]", "[             ]", "[ ... ]", "[          ]", "[                ]",
    "[          .          ]", "[ — ]",
  ];

  // ============================================================
  // helpers
  // ============================================================

  const recentlyUsed = [];

  function pickFrom(pool) {
    for (let tries = 0; tries < 8; tries++) {
      const s = pool[Math.floor(Math.random() * pool.length)];
      if (!recentlyUsed.includes(s)) {
        recentlyUsed.push(s);
        if (recentlyUsed.length > 8) recentlyUsed.shift();
        return s;
      }
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function glitchString(s) {
    return s.split("").map(c => {
      if (/[a-zA-Z]/.test(c) && Math.random() < 0.18) return "░";
      return c;
    }).join("");
  }

  function reverseString(s) {
    return s.split("").reverse().join("");
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ============================================================
  // depth → content
  // ============================================================

  function generate(depth) {
    const r = Math.random();

    if (depth < 4) {
      const n = 3 + Math.floor(Math.random() * 2);
      const out = [];
      for (let i = 0; i < n; i++) out.push(pickFrom(POOL));
      return { type: "para", text: out.join(" ") };
    }
    if (depth < 9) {
      const n = 2 + Math.floor(Math.random() * 2);
      const out = [];
      for (let i = 0; i < n; i++) out.push(pickFrom(POOL));
      return { type: "para", text: out.join(" ") };
    }
    if (depth < 16) {
      return { type: "para", text: pickFrom(POOL) };
    }
    if (depth < 30) {
      return { type: "frag", text: pickFrom(FRAGMENTS) };
    }
    if (depth < 60) {
      if (r < 0.65) return { type: "frag", text: pickFrom(FRAGMENTS) };
      return { type: "spaced", text: pickFrom(SPACED_WORDS) };
    }
    if (depth < 90) {
      // underground territory
      if (r < 0.20) return { type: "spaced",  text: pickFrom(SPACED_WORDS) };
      if (r < 0.40) return { type: "bracket", text: pickFrom(BRACKETS) };
      if (r < 0.55) return { type: "coord",   text: pickFrom(COORDS) };
      if (r < 0.75) return { type: "found",   text: pickFrom(FOUND) };
      if (r < 0.92) return { type: "query",   text: pickFrom(QUERIES) };
      return { type: "frag", text: pickFrom(FRAGMENTS) };
    }
    if (depth < 150) {
      // found footage — glitched / reversed
      if (r < 0.32) return { type: "glitch",   text: glitchString(pickFrom(POOL)) };
      if (r < 0.52) return { type: "reversed", text: reverseString(pickFrom(FRAGMENTS)) };
      if (r < 0.72) return { type: "bracket",  text: pickFrom(BRACKETS) };
      if (r < 0.86) return { type: "coord",    text: pickFrom(COORDS) };
      return { type: "empty", text: pickFrom(EMPTY_BRACKETS) };
    }
    // depth 150+ — dissolution
    if (r < 0.34) return { type: "char",    text: pickFrom(SINGLE_CHARS) };
    if (r < 0.58) return { type: "empty",   text: pickFrom(EMPTY_BRACKETS) };
    if (r < 0.78) return { type: "bracket", text: pickFrom(BRACKETS) };
    return { type: "spaced", text: pickFrom(SPACED_WORDS) };
  }

  function buildElement(item) {
    const t = item.type;
    const el = document.createElement("p");

    if (t === "para" || t === "frag") {
      /* default p style */
    } else if (t === "spaced") {
      el.className = "deep-spaced";
    } else if (t === "bracket") {
      el.className = "deep-bracket";
    } else if (t === "coord") {
      el.className = "deep-coord";
    } else if (t === "found") {
      el.className = "deep-found";
    } else if (t === "query") {
      el.className = "deep-query";
    } else if (t === "glitch") {
      el.className = "deep-glitch";
    } else if (t === "reversed") {
      el.className = "deep-reversed";
    } else if (t === "char") {
      el.className = "deep-char";
    } else if (t === "empty") {
      el.className = "deep-bracket";
    }

    return el;
  }

  // typewriter pacing — depth-aware
  // shallow = 30-70ms/char; deeper = 60-150ms/char; deepest = very deliberate
  function charDelay(char, depth) {
    const baseSlow = Math.min(60, depth * 0.7);
    let delay = 30 + baseSlow + Math.random() * 40;

    if (".?!".includes(char))      delay += 380 + Math.random() * 420;
    else if (",;:".includes(char)) delay += 90 + Math.random() * 130;
    else if (char === " " && Math.random() < 0.07) delay += 220 + Math.random() * 280; // hesitation
    else if (char === "—") delay += 140;

    return delay;
  }

  // pause between paragraphs — gets longer the deeper we go
  function endOfParagraphPause(depth) {
    const base = 800 + depth * 10;
    return base + Math.random() * 1400;
  }

  // vertical spacing per paragraph grows with depth so reaching 150 takes
  // real time. Same formula used by endless-final.html for parity.
  function extraMargin(depth) {
    if (depth < 16) return 0;
    return Math.min(20, (depth - 16) * 0.3);
  }

  // pause after a marker so it can register before more text arrives
  function markerPause() {
    return 1400 + Math.random() * 1200;
  }

  // types that should appear instantly (system markers etc.) instead of typed
  function isInstant(type) {
    return type === "bracket" || type === "coord" || type === "query" ||
           type === "found"   || type === "empty"   || type === "char"   ||
           type === "spaced";
  }

  // ============================================================
  // markers
  // ============================================================

  const MARKERS = {
    4:   "the echo deepens",
    9:   "the echo wanders",
    16:  "the echo dreams",
    30:  "almost silence",
    60:  "underground",
    90:  "found footage",
    150: "the archive corrupts",
    250: "still here",
    500: "this is not the end",
  };

  function appendMarker(text) {
    const el = document.createElement("div");
    el.className = "ai-marker deep reveal";
    el.innerHTML = `— ${text} <span class="dot">·</span>`;
    // markers carry the spacing of their depth + 4rem for section-break weight
    const m = (extraMargin(depth) + 4).toFixed(2) + "rem";
    el.style.marginTop = m;
    el.style.marginBottom = m;
    body.insertBefore(el, sentinel);
    requestAnimationFrame(() => el.classList.add("revealed"));
  }

  // ============================================================
  // typing loop
  // ============================================================

  const body = document.querySelector(".endless-body");
  const sentinel = document.querySelector(".endless-sentinel");
  const depthEl = document.querySelector("#endless-depth");
  const moodEl = document.querySelector("#endless-mood");
  const hint = document.querySelector(".endless-hint");
  const boundary = document.querySelector(".ai-marker");
  const article = document.querySelector("[data-category]");
  if (!body || !sentinel) return;

  // The post's category — assigned by the AI at publish time. Used to weight
  // the depth-→-pool selection so different essays grow different echoes.
  const category = article?.dataset.category || "general";

  let depth = 0;
  let isWriting = false;
  let ready = true;
  let lastScrollY = window.scrollY;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ============================================================
  // mood — visible "alive" state
  // ============================================================

  const MOODS = [
    { from: 0,   name: "composing"     },
    { from: 4,   name: "deepening"     },
    { from: 9,   name: "wandering"     },
    { from: 16,  name: "dreaming"      },
    { from: 30,  name: "almost silence"},
    { from: 60,  name: "underground"   },
    { from: 90,  name: "found footage" },
    { from: 150, name: "dissolving"    },
  ];

  function updateMood(d) {
    if (!moodEl) return;
    let name = "composing";
    for (const m of MOODS) if (d >= m.from) name = m.name;
    moodEl.textContent = name;
  }

  async function writeParagraph(el, text, depth) {
    el.classList.add("writing");

    if (reducedMotion) {
      el.textContent = text;
    } else {
      for (let i = 0; i < text.length; i++) {
        el.textContent = text.slice(0, i + 1);
        await sleep(charDelay(text[i], depth));
      }
    }

    el.classList.remove("writing");
    el.classList.add("done");
  }

  function settleOpacity(el, depth) {
    if (depth < 16) return;
    const op = Math.max(0.45, 1 - (depth - 16) * 0.008);
    el.style.transition = "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)";
    requestAnimationFrame(() => { el.style.opacity = op.toFixed(2); });
  }

  function shouldGenerate() {
    const rect = sentinel.getBoundingClientRect();
    return rect.top - innerHeight < 800;
  }

  // Generate ONE paragraph (or instant fragment) per call.
  async function generateOne() {
    depth++;
    if (MARKERS[depth]) {
      appendMarker(MARKERS[depth]);
      await sleep(markerPause());
    }

    const item = generate(depth);
    const el = buildElement(item);
    el.dataset.type = item.type;
    // depth-scaled extra spacing — by depth 60+, each paragraph sits in
    // nearly a full viewport of paper. Forces scrolling time.
    const m = extraMargin(depth);
    if (m > 0) {
      el.style.marginTop = m.toFixed(2) + "rem";
      el.style.marginBottom = m.toFixed(2) + "rem";
    }
    body.insertBefore(el, sentinel);

    if (depthEl) depthEl.textContent = depth;
    updateMood(depth);

    if (reducedMotion || isInstant(item.type)) {
      await sleep(isInstant(item.type) ? 350 : 0);
      el.textContent = item.text;
      el.classList.add("done");
      await sleep(endOfParagraphPause(depth));
    } else {
      await writeParagraph(el, item.text, depth);
      await sleep(endOfParagraphPause(depth));
    }

    settleOpacity(el, depth);
  }

  function maybeHideHint() {
    if (hint && depth > 0) hint.classList.add("is-hidden");
  }

  function triggerOne() {
    if (isWriting || !ready) return;
    if (!shouldGenerate()) return;

    ready = false;
    isWriting = true;

    generateOne()
      .then(() => {
        isWriting = false;
        maybeHideHint();
        setTimeout(() => { ready = true; }, 300);
      });
  }

  // ============================================================
  // SUBTLE FIRST TRIGGER — the corpus "notices" the reader
  // ============================================================
  //
  // After the boundary marker has been in view for ~1.8s, the first
  // paragraph begins on its own. Mood flickers: listening → noticed →
  // composing. Reads like the AI is alive, aware of you arriving.
  //
  // Every paragraph after this one requires an active downward scroll.

  let firstTriggered = false;
  let dwellTimeout = null;

  if (boundary && !reducedMotion) {
    if (moodEl) moodEl.textContent = "listening";

    const dwellIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (firstTriggered) {
          dwellIO.disconnect();
          return;
        }
        if (entry.isIntersecting) {
          dwellTimeout = setTimeout(() => {
            if (firstTriggered) return;
            firstTriggered = true;
            if (moodEl) moodEl.textContent = "noticed";
            // brief beat after "noticed" before the corpus speaks
            setTimeout(triggerOne, 900);
          }, 1800);
        } else if (dwellTimeout) {
          clearTimeout(dwellTimeout);
          dwellTimeout = null;
        }
      });
    }, { threshold: 0.6 });

    dwellIO.observe(boundary);
  } else if (reducedMotion) {
    // reduced motion: skip the dwell theatrics, but still wait for scroll
    if (moodEl) moodEl.textContent = "ready";
  }

  // ============================================================
  // SCROLL TRIGGER — each downward scroll burst summons one paragraph
  // ============================================================

  function onScroll() {
    const y = window.scrollY;
    const dy = y - lastScrollY;
    lastScrollY = y;

    if (dy < 4) return;          // only downward intent
    if (!firstTriggered) firstTriggered = true;  // scroll preempts dwell
    triggerOne();
  }

  addEventListener("scroll", onScroll, { passive: true });
})();
