# oscilloscope

> **Playground, not production.** This project exists to try things out:
> layout ideas, motion, pre-rendering, small interactions. Content is lorem
> ipsum, links are placeholders, and nothing here is hardened or maintained
> for a real deploy. Break it freely.

Personal site for Jake Martinez. Asymmetric editorial skeleton wearing an
instrument panel: blueprint grid, rulers, live readouts. Vite + Vue 3 +
vue-router, pre-rendered to static HTML by `vite-ssg`.

## Develop

    npm install
    npm run dev      # http://localhost:5173
    npm run build    # pre-renders every route -> dist/<route>/index.html
    npm run preview
    npm test         # node --test, no framework

## Content

Markdown with a small frontmatter block. The filename is the URL.

- `src/content/work/*.md` -> `/work/<file>`: a spec sheet. `title`, `year`,
  `stack: [a, b]`, `summary`, optional `order:`. Every other key (`role`,
  `status`, `client`, `link: https://...`) becomes its own spec row, no code
  change needed.
- `src/content/writing/*.md` -> `/writing/<file>`: `title`, `date`
  (YYYY-MM-DD), `summary`. Listed newest first at `/writing`.

The frontmatter parser (`src/frontmatter.js`) handles flat `key: value` and
`[a, b]` lists only. Markdown is rendered with `marked` and trusted: it is
written by the site owner.

Anything not matched renders a "Not found" page in the client. For a real 404
status, point the host's 404 page at `dist/index.html`.

## Layout

Nothing is centred. Meta bar across the top; a "now" brief on the left and the selected-work index on the right; the name
anchored bottom-left over two lines with the second indented into the first;
a status bar underneath everything.

The chrome (grid, bars, band, readouts) lives in `src/App.vue`; routes swap
the middle. `ROLE`, `PLACE` and `GITHUB` sit at the top of `App.vue`, `NAME`
and `CONTACT` at the top of `src/views/Home.vue`. The visible name is
`aria-hidden`; a visually hidden `<h1>` comes first so screen readers get the
name before the section headings. Inner pages are `Writing.vue` (the list)
and `Entry.vue` (project, post or not found).

## The instrument layer

- Blueprint grid behind everything: hairlines every 16px, heavier rules every
  96px, radially masked so it fades out at the edges. Four stacked
  `linear-gradient`s — no DOM, no images.
- A wide soft light follows the pointer (600px radius, 3% green). Ambient room
  light, not a pointer indicator.
- Fine grain overlay from an inline SVG `feTurbulence`, at 3.5%.
- Tick rulers down the top and left edges.
- The top bar clock shows UTC-3 (Jake's time), not the visitor's.
- The status bar reads out live `x/y`, viewport size, measured fps, the last
  public push from the GitHub events API (unauthenticated, one request per
  visit, silent on failure) and the build id. `x/y` and fps hide on devices
  without hover.
- All chrome layers are `position: fixed`, so the frame stays on the viewport
  while long pages scroll.
- Corner brackets frame the viewport.
- Pointer position and the coordinate readout are written straight to CSS
  custom properties and `textContent`, so moving the mouse never re-renders
  Vue. The fps counter is a `requestAnimationFrame` loop that publishes once
  a second.
- `__BUILD_ID__` is stamped at build time by `vite.config.js`, so the number
  in the corner is real.

## Interaction

- The name reveals with a soft-edged mask sweeping left to right, driven by an
  `@property`-registered `--reveal` percentage. One transition, no per-letter
  staggering.
- Hovering (or tabbing to) a work row dims the others, slides that row right,
  tints its stack tags and lights up its number and year. Pure CSS via
  `:has()`; hover is gated behind `(hover: hover)` so taps do not stick.
- A waveform band drifts across the middle of the page. Its amplitude swells
  with pointer speed and eases back to rest every frame, so the page answers
  to the cursor without anything following it. The path is three octaves of
  value noise, seeded per load, so it never repeats and differs every visit.
  Logic in `src/wave.js`.
- Each project has a wave signature derived from its slug (stretch and
  roughness). Hovering or focusing its row, or opening its page, eases the
  band into that shape. With `prefers-reduced-motion` the band does not drift
  or ease and only redraws when something changes.
- Contact links grow an accent underline from the left.

## Look

- Near-black `#07090b`, mint accents `#9df6ca` / `#44c384`, tabular numerals
  everywhere. Tokens in `src/style.css`.
- Light systems get a blueprint theme: cyanotype blue `#103a6a` with white
  linework. Only the tokens change; the canvas re-reads its stroke colour when
  the scheme flips.
- Fonts are self-hosted via `@fontsource` (latin subsets load on demand), no
  request to Google.
- The name scales with viewport height as well as width, so a 1440×900 screen
  fits the home page without scrolling.
- Name and work titles in Instrument Serif italic — the only non-mono type on
  the page. The name carries a gradient clipped to the text, which means its
  padding box must be large enough to contain the italic's overhang; the
  padding on `.name` is load-bearing, and negative margins cancel it out in
  layout. Shrink it and the letters get cut.
- Grid and grain give the surface texture, but there are no scanlines and no
  CRT curvature: this reads as an instrument, not a retro terminal.

## Notes

- Project and post content is placeholder. The `email` contact link still
  points at `#`; use `mailto:` when it is real.
- No `og:image` yet: it needs a real domain and a 1200×630 image.
- Corner brackets are hidden under 640px and the grid loosens to 64px;
  animations respect `prefers-reduced-motion`.
