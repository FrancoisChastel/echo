# echo

A small log of films, essays, and notes by François Chastel.

Live at **https://francoischastel.github.io/echo/** (redirects to `/sketch/`).

## Structure

```
echo/
├── index.html           root redirect → sketch/
├── sketch/              the live site (phase 3 · v3)
│   ├── index.html       homepage
│   ├── post.html        essay layout
│   ├── article.html     three-voice segmented essay
│   ├── film.html        full-bleed film page
│   ├── tokens.css       design tokens
│   ├── styles.css       main stylesheet
│   ├── article.css      article-specific layout
│   ├── *.js             progressive enhancement (reveal, progress, header, article)
│   ├── rss.xml          RSS 2.0 feed
│   ├── feed.json        JSON Feed 1.1
│   ├── llms.txt         agent-readable index
│   └── ai/              AI demo gallery
├── sketch-*/            earlier sketch iterations (preserved as historical refs)
├── moodboard/           visual direction references
└── docs/                project documentation
```

## Local preview

```bash
cd sketch
python3 -m http.server 4322
# open http://localhost:4322
```

## Deploy

GitHub Pages, served from the `main` branch root. The `.nojekyll` file disables
Jekyll processing so files starting with `_` are served as-is.

To enable, in the GitHub repo settings:

1. **Settings → Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main`, folder: `/ (root)`
4. Save. First deploy completes in ~1 minute.

## Phases

See [docs/07-roadmap.md](docs/07-roadmap.md). Phases 1–3 complete. Phase 4
(Astro scaffold) deferred — the static sketch ships as v1.
