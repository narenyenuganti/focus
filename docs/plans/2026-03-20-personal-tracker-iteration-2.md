# Personal Tracker Iteration 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the next layer of personal-tracker depth with configurable goals/presets, richer personal insights, and a visible local sync history.

**Architecture:** Keep the local-first Next.js shape intact. New persistent state should live under `data/` as human-readable JSON, exposed through server routes and folded into the existing dashboard snapshot. UI work should extend the current shell instead of introducing new pages, so the app stays centered on the focus dashboard with optional side panels.

**Tech Stack:** Next.js App Router, React, TypeScript, local JSON storage, git-based sync metadata, Vitest, Playwright.

---

### Task 1: Add Repo-Native Settings And Goal Configuration

**Files:**
- Create: `data/config/settings.json`
- Create: `lib/server/settings.ts`
- Create: `app/api/settings/route.ts`
- Create: `components/settings-panel.tsx`
- Modify: `lib/server/schema.ts`
- Modify: `lib/server/dashboard.ts`
- Modify: `components/focus-timer.tsx`
- Modify: `components/tracker-shell.tsx`
- Modify: `tests/unit/dashboard.test.ts`
- Modify: `tests/e2e/manual-tracking.spec.ts`

**Step 1: Write the failing test**

Add a dashboard/settings test that expects:
- default settings to be returned when `data/config/settings.json` is empty or missing
- saved focus presets and weekly goals to appear in the tracker snapshot

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/dashboard.test.ts`
Expected: FAIL because settings data is not yet available in the dashboard snapshot.

**Step 3: Write minimal implementation**

Implement:
- a settings schema with fields for `displayName`, `weeklyFocusGoalMinutes`, `weeklyWorkoutGoalMinutes`, `sleepGoalHours`, and `focusPresets`
- a settings reader/writer with sensible defaults
- `POST /api/settings` for saving settings
- a `Settings` panel for editing goals and presets
- focus timer support for rendering saved presets instead of hardcoded ones

**Step 4: Run tests to verify it passes**

Run: `npm test -- tests/unit/dashboard.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add data/config/settings.json lib/server/settings.ts app/api/settings/route.ts components/settings-panel.tsx lib/server/schema.ts lib/server/dashboard.ts components/focus-timer.tsx components/tracker-shell.tsx tests/unit/dashboard.test.ts tests/e2e/manual-tracking.spec.ts
git commit -m "feat: add tracker settings and goals"
```

### Task 2: Add Personal Insights And Achievement Cards

**Files:**
- Create: `components/insights-panel.tsx`
- Modify: `lib/server/dashboard.ts`
- Modify: `components/tracker-shell.tsx`
- Modify: `tests/unit/dashboard.test.ts`

**Step 1: Write the failing test**

Add dashboard assertions for:
- current focus streak
- weekly goal progress percentages
- milestone badges driven by tracked minutes and workout totals

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/dashboard.test.ts`
Expected: FAIL because the snapshot does not yet expose insights or achievements.

**Step 3: Write minimal implementation**

Implement:
- derived insight data in `buildDashboardSnapshot`
- streak logic based on daily focus history
- a compact `Insights` panel showing streaks, consistency, goal completion, and unlocked milestones
- shell wiring so the panel is reachable from the bottom navigation

**Step 4: Run tests to verify it passes**

Run: `npm test -- tests/unit/dashboard.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add components/insights-panel.tsx lib/server/dashboard.ts components/tracker-shell.tsx tests/unit/dashboard.test.ts
git commit -m "feat: add personal insights and achievements"
```

### Task 3: Add Sync History And Recovery Visibility

**Files:**
- Create: `components/sync-history-panel.tsx`
- Modify: `lib/server/git-sync.ts`
- Modify: `app/api/sync/route.ts`
- Modify: `components/sync-button.tsx`
- Modify: `components/tracker-shell.tsx`
- Modify: `tests/unit/git-sync.test.ts`
- Modify: `tests/unit/git-sync-route.test.ts`

**Step 1: Write the failing test**

Add git sync tests that expect:
- recent tracker commits to be returned in newest-first order
- dirty file status to be exposed without creating a commit

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/git-sync.test.ts tests/unit/git-sync-route.test.ts`
Expected: FAIL because sync history/status endpoints are not implemented.

**Step 3: Write minimal implementation**

Implement:
- git helpers that read recent tracker sync commits and current repo status
- `GET /api/sync` or equivalent sync metadata endpoint
- a panel showing latest sync time, pending local changes, and recent commit messages

**Step 4: Run tests to verify it passes**

Run: `npm test -- tests/unit/git-sync.test.ts tests/unit/git-sync-route.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add components/sync-history-panel.tsx lib/server/git-sync.ts app/api/sync/route.ts components/sync-button.tsx components/tracker-shell.tsx tests/unit/git-sync.test.ts tests/unit/git-sync-route.test.ts
git commit -m "feat: add sync history visibility"
```

### Task 4: Integrate, Polish, And Re-Verify

**Files:**
- Modify: `app/globals.css`
- Modify: `README.md`
- Modify: `tests/e2e/focus-timer.spec.ts`
- Modify: `tests/e2e/manual-tracking.spec.ts`

**Step 1: Write the failing/coverage additions**

Extend Playwright coverage to prove:
- settings changes alter the visible presets/goals
- insights panel renders derived stats
- sync history panel renders metadata without breaking manual sync

**Step 2: Run targeted tests to verify gaps**

Run: `npm run test:e2e -- tests/e2e/focus-timer.spec.ts tests/e2e/manual-tracking.spec.ts`
Expected: FAIL until the new panels and selectors are wired up.

**Step 3: Write minimal integration/polish**

Implement:
- bottom-nav and panel-shell updates for the new panels
- styling that keeps the centered focus experience intact while exposing deeper personal data
- README updates for local password setup, settings storage, and sync behavior

**Step 4: Run full verification**

Run:
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run test:e2e`

Expected: all PASS

**Step 5: Commit**

```bash
git add app/globals.css README.md tests/e2e/focus-timer.spec.ts tests/e2e/manual-tracking.spec.ts
git commit -m "feat: polish tracker insights and settings experience"
```
