# Personal Tracker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a local-first personal tracking app that recreates the Peazehub feel while adding health, sleep, workout, and focus tracking with repo-backed persistence and manual git sync.

**Architecture:** Use a Next.js App Router application with a server-side password gate, server actions and route handlers for writes, and a repo-native data layer that stores human-readable JSON under `data/`. Derive dashboard summaries from stored records on the server, then render a Peazehub-inspired interface with a focus timer, streaks, heatmaps, stats, routines, and manual trackers. A sync route will stage only tracked data files and create a git commit so the repo itself becomes the local source of truth and history.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Vitest, React Testing Library, Playwright, Node.js file system APIs, simple cookie-based password session.

---

### Task 1: Scaffold The Application And Tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `playwright.config.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `public/`
- Create: `tests/unit/smoke.test.tsx`
- Create: `tests/e2e/app.spec.ts`
- Modify: `README.md`

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

test('renders the password entry experience', () => {
  render(<HomePage />)
  expect(screen.getByText(/unlock your tracker/i)).toBeInTheDocument()
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/smoke.test.tsx`
Expected: FAIL because the Next.js app and component do not exist yet.

**Step 3: Write minimal implementation**

Create the Next.js app scaffold, Tailwind setup, Vitest configuration, and a minimal home page that renders the unlock shell.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/unit/smoke.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add .
git commit -m "chore: scaffold personal tracker app"
```

### Task 2: Add Password Protection And Repo Data Layer

**Files:**
- Create: `middleware.ts`
- Create: `app/login/page.tsx`
- Create: `app/actions/auth.ts`
- Create: `lib/auth/session.ts`
- Create: `lib/server/data-store.ts`
- Create: `lib/server/schema.ts`
- Create: `data/focus/sessions.json`
- Create: `data/health/metrics.json`
- Create: `data/sleep/entries.json`
- Create: `data/workouts/entries.json`
- Create: `data/journal/daily.json`
- Create: `tests/unit/auth-session.test.ts`
- Create: `tests/unit/data-store.test.ts`
- Modify: `app/page.tsx`

**Step 1: Write the failing tests**

```ts
import { isPasswordValid } from '@/lib/auth/session'

test('accepts the configured tracker password', () => {
  process.env.APP_PASSWORD = 'secret'
  expect(isPasswordValid('secret')).toBe(true)
  expect(isPasswordValid('wrong')).toBe(false)
})
```

```ts
import { writeCollection, readCollection } from '@/lib/server/data-store'

test('writes and reads repo-backed collections', async () => {
  await writeCollection('focus/sessions', [{ id: '1', minutes: 25 }])
  const records = await readCollection('focus/sessions')
  expect(records).toEqual([{ id: '1', minutes: 25 }])
})
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- tests/unit/auth-session.test.ts tests/unit/data-store.test.ts`
Expected: FAIL because auth and storage modules do not exist.

**Step 3: Write minimal implementation**

Implement a cookie-backed single-password session, middleware redirects, login page and server action, plus repo-native JSON read/write helpers with validated defaults.

**Step 4: Run tests to verify they pass**

Run: `npm test -- tests/unit/auth-session.test.ts tests/unit/data-store.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add password gate and repo data store"
```

### Task 3: Build Focus Timer, Derived Stats, And Sync Workflow

**Files:**
- Create: `app/api/focus/session/route.ts`
- Create: `app/api/sync/route.ts`
- Create: `lib/server/focus.ts`
- Create: `lib/server/git-sync.ts`
- Create: `components/focus-timer.tsx`
- Create: `components/stats-overview.tsx`
- Create: `components/activity-heatmap.tsx`
- Create: `tests/unit/focus.test.ts`
- Create: `tests/unit/git-sync.test.ts`
- Create: `tests/e2e/focus-timer.spec.ts`
- Modify: `app/page.tsx`

**Step 1: Write the failing tests**

```ts
import { buildFocusSummary } from '@/lib/server/focus'

test('aggregates sessions into streak and total minutes', () => {
  const summary = buildFocusSummary([
    { startedAt: '2026-03-18T09:00:00.000Z', endedAt: '2026-03-18T09:25:00.000Z' },
    { startedAt: '2026-03-19T09:00:00.000Z', endedAt: '2026-03-19T09:50:00.000Z' },
  ])
  expect(summary.totalMinutes).toBe(75)
  expect(summary.currentStreakDays).toBe(2)
})
```

```ts
import { buildSyncCommitMessage } from '@/lib/server/git-sync'

test('builds a readable sync commit message', () => {
  expect(buildSyncCommitMessage('focus')).toMatch(/sync: update tracker data/)
})
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- tests/unit/focus.test.ts tests/unit/git-sync.test.ts`
Expected: FAIL because the summary and sync helpers do not exist.

**Step 3: Write minimal implementation**

Implement session persistence, stat aggregation, timer UI controls, heatmap rendering, and a manual `Sync` action that stages only `data/` files and creates a commit when there are changes.

**Step 4: Run tests to verify they pass**

Run: `npm test -- tests/unit/focus.test.ts tests/unit/git-sync.test.ts tests/e2e/focus-timer.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add focus tracking and manual sync"
```

### Task 4: Add Health, Sleep, Workout, And Daily Reflection Tracking

**Files:**
- Create: `components/health-panel.tsx`
- Create: `components/sleep-panel.tsx`
- Create: `components/workout-panel.tsx`
- Create: `components/daily-log-panel.tsx`
- Create: `app/api/health/route.ts`
- Create: `app/api/sleep/route.ts`
- Create: `app/api/workouts/route.ts`
- Create: `app/api/daily-log/route.ts`
- Create: `lib/server/dashboard.ts`
- Create: `tests/unit/dashboard.test.ts`
- Create: `tests/e2e/manual-tracking.spec.ts`
- Modify: `app/page.tsx`

**Step 1: Write the failing tests**

```ts
import { buildDashboardSnapshot } from '@/lib/server/dashboard'

test('builds dashboard cards from focus, sleep, workout, and health data', () => {
  const snapshot = buildDashboardSnapshot({
    focusSessions: [{ startedAt: '2026-03-19T09:00:00.000Z', endedAt: '2026-03-19T09:25:00.000Z' }],
    sleepEntries: [{ date: '2026-03-19', hours: 8 }],
    workouts: [{ date: '2026-03-19', type: 'Lift', durationMinutes: 60 }],
    healthMetrics: [{ date: '2026-03-19', weight: 175, restingHeartRate: 54 }],
  })
  expect(snapshot.cards.length).toBeGreaterThan(3)
})
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- tests/unit/dashboard.test.ts`
Expected: FAIL because the dashboard aggregator and tracker panels do not exist.

**Step 3: Write minimal implementation**

Add server routes and client forms for manual tracking, derive dashboard insights and streaks, and integrate them into the main Peazehub-inspired shell.

**Step 4: Run tests to verify they pass**

Run: `npm test -- tests/unit/dashboard.test.ts tests/e2e/manual-tracking.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add personal health and habit tracking"
```

### Task 5: Match The Visual Direction And Responsive Experience

**Files:**
- Modify: `app/globals.css`
- Modify: `app/page.tsx`
- Modify: `components/focus-timer.tsx`
- Modify: `components/stats-overview.tsx`
- Modify: `components/activity-heatmap.tsx`
- Modify: `components/health-panel.tsx`
- Modify: `components/sleep-panel.tsx`
- Modify: `components/workout-panel.tsx`
- Modify: `components/daily-log-panel.tsx`
- Create: `components/sidebar.tsx`
- Create: `components/announcement-card.tsx`
- Create: `tests/e2e/responsive.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from '@playwright/test'

test('dashboard remains usable on mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.getByText(/focus session/i)).toBeVisible()
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/responsive.spec.ts`
Expected: FAIL until the page is responsive and the authenticated flow is automated in the test.

**Step 3: Write minimal implementation**

Refine the UI to closely mirror the Peazehub dashboard mood, spacing, cards, gradients, and navigation while keeping the added personal-tracking sections coherent on desktop and mobile.

**Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- tests/e2e/responsive.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: polish dashboard experience"
```

### Task 6: Verify End To End, Compare Against Peazehub, And Document Usage

**Files:**
- Modify: `README.md`
- Create: `docs/ui-comparison.md`
- Modify: `tests/e2e/app.spec.ts`

**Step 1: Write the failing test**

```ts
import { test, expect } from '@playwright/test'

test('complete local workflow works end to end', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /sync/i })).toBeVisible()
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/app.spec.ts`
Expected: FAIL until the seeded local workflow is complete.

**Step 3: Write minimal implementation**

Finish missing workflow wiring, seed sensible defaults, document environment variables and sync behavior, and capture a concise UI comparison note against the authenticated Peazehub dashboard.

**Step 4: Run test to verify it passes**

Run: `npm test && npm run test:e2e`
Expected: PASS.

**Step 5: Commit**

```bash
git add .
git commit -m "docs: finalize tracker workflow and verification"
```
