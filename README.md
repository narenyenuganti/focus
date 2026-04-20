# Focus

A local-first, single-user focus timer that grows a quiet garden.

Built with Next.js 15 (App Router), React 19, Tailwind 3, and SQLite. The UI is a
bordered "ivory monastery" layout set in Instrument Serif, Inter, and JetBrains Mono.

## The tabs

- **Focus** — a breathing dial with 60 tick marks, a preset rail (Pomodoro /
  Eisenhower / 52·17 / Deep Work), and a Today / Week / Streak meta strip. A
  "Well done." flash rises on completion.
- **Garden** — an animated scene (drifting clouds, swaying trees, rippling pond,
  falling petals, fireflies) tied to a time-of-day scrubber (Dawn → Dusk).
  Fifteen creatures are clickable: the koi jumps, the frog leaps, the cat
  stretches, the owl bobs and blinks, the ladybug flies off, and so on.
- **Market** — a featured hero, a category dropdown with per-category counts,
  rarity pills (Common / Rare / Legendary), a mono search box, and a 61-item
  catalog of plants, trees, stones, light, water, creatures, sky, and seasonal
  items with short botanical blurbs.
- **Ledger** — a 24×7 heatmap of the last 24 weeks, a big serif weekly total,
  goal bar, and Today / Streak / Sessions / Lifetime KPI rows.
- **Settings** — bordered row form for weekly goal, theme, ambient sound,
  end-of-session chime, break duration, and inline preset editing.

## Local setup

```bash
export APP_PASSWORD=tracker   # anything; 'tracker' is the default
npm install
npm run dev
```

Open `http://127.0.0.1:3000` and unlock with the configured password.

## Data

Everything is local. The SQLite database lives at `data/tracker.db` and stores
focus sessions, the seed wallet, inventory, and room state; user preferences
live alongside it at `data/config/settings.json`. Override the directory with
`TRACKER_DATA_DIR` if needed.

Tables (see `lib/server/db.ts` for the full schema):

- `focus_sessions` — one row per completed session
- `wallet` — seed balance
- `inventory` — acquired market items
- `room_placements`, `room_state` — legacy room editor tables (no longer in the
  UI; kept for future use)

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
```

## Testing

```bash
npm test           # vitest unit + component tests
npm run test:e2e   # playwright
```

## Project layout

```
app/                Next.js App Router (layout, routes, globals.css, api/)
components/         UI components
  focus-timer.tsx     breathing dial + preset rail + controls + meta
  focus-dial.tsx      440×440 SVG dial with 60 ticks
  garden-view.tsx     section head, scene frame, chips, story, scrubber
  garden-scene.tsx    1000×520 animated scene + pokeable creatures
  garden-glyph.tsx    ~75 painterly filled-shape glyphs
  shop-panel.tsx      market hero, dropdown, rarity pills, grid, footnote
  ledger-view.tsx     heatmap + weekly big-num + KPIs
  settings-panel.tsx  bordered-row form with seg controls
  tracker-shell.tsx   app layout (topbar, top nav, stage, footer)
lib/
  garden-catalog.ts   the 61-item catalog
  garden-palette.ts   shared PAL constants
  server/             SQLite, schema, queries
tests/
  unit/               vitest specs
  e2e/                playwright specs
data/                 SQLite db + config JSON (gitignored)
```
