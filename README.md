# naren

Local-first personal tracking app built with Next.js.

The current parity pass pushes the authenticated shell closer to Peazehub with a timer-first dashboard, four central destinations (`Statistics`, `Groups`, `Achievements`, `Leaderboard`), and utility-driven sync while keeping storage, auth, and sync strictly local-first.

## What It Tracks

- Focus sessions with configurable presets and weekly goals
- Sleep, workouts, health metrics, and daily reflections routed through grouped panels
- Achievement-style streaks and milestones derived from your tracker data
- Manual git-based sync history for repo-native persistence

## Local Setup

Set an app password before starting the server:

```bash
export APP_PASSWORD=tracker
npm install
npm run dev
```

Open `http://127.0.0.1:3000` and unlock the dashboard with the configured password.

## Data Layout

Tracker state lives directly in the repo under `data/`:

- `data/focus/sessions.json`
- `data/sleep/entries.json`
- `data/workouts/entries.json`
- `data/health/metrics.json`
- `data/journal/daily.json`
- `data/config/settings.json`

Manual sync creates commits for changed tracker files under `data/`, so repo history doubles as your change log.

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm test
npm run build
npm run test:e2e
```
