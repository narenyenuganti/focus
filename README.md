# naren

Local-first personal tracking app built with Next.js.

The current shell keeps the timer-first dashboard and utility-driven sync, but trims the main chrome down to `Statistics` plus `Settings` for a single-user workflow.

## What It Tracks

- Focus sessions with configurable presets and weekly goals
- Sleep, workouts, health metrics, and daily reflections persisted locally in the repo
- Settings for focus presets and weekly goals
- Manual git-based sync history that pushes tracker data to `origin/main`

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

Manual sync creates commits for changed tracker files under `data/` and then pushes `main` to `origin`, so repo history doubles as your change log.

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
