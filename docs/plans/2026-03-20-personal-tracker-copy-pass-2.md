# Personal Tracker Copy Pass 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Tighten the local-first tracker so the authenticated shell reads much closer to Peazehub while preserving focus, sleep, workout, health, daily-log, settings, and repo sync functionality.

**Architecture:** Keep the current Next.js app-router structure and repo-native JSON storage, but make the visible shell more literal: four center pills that match the Peazehub labels, a timer-first hero with fewer visible controls, a lighter utility cluster, and a more faithful promo overlay. Preserve the personal-tracking surfaces by moving them under the four-pill shell instead of keeping them as extra first-class nav buttons.

**Tech Stack:** Next.js 15, React, TypeScript, app router, CSS in `app/globals.css`, Playwright e2e, Vitest unit tests.

---

### Task 1: Lock the Copy-Faithful Shell Contract in E2E

**Files:**
- Modify: `tests/e2e/app.spec.ts`
- Modify: `tests/e2e/focus-timer.spec.ts`
- Modify: `tests/e2e/manual-tracking.spec.ts`

**Step 1: Write the failing test**

Extend the authenticated-shell assertions so the visible controls match the live Peazehub pass:
- the center nav exposes `Statistics`, `Groups`, `Achievements`, and `Leaderboard`
- the old visible nav labels `Insights`, `Sleep`, and `Health` no longer appear in the bottom bar
- the idle focus controls surface `Start` as the only named primary timer action
- sync stays reachable, but as a utility control rather than a text-heavy utility cluster
- the manual tracking flows remain reachable through the new groups/leaderboard surfaces

Concrete assertions to add:

```ts
await expect(page.getByRole("button", { name: "Statistics", exact: true })).toBeVisible();
await expect(page.getByRole("button", { name: "Groups", exact: true })).toBeVisible();
await expect(page.getByRole("button", { name: "Achievements", exact: true })).toBeVisible();
await expect(page.getByRole("button", { name: "Leaderboard", exact: true })).toBeVisible();
await expect(page.getByRole("button", { name: "Insights" })).toHaveCount(0);
await expect(page.getByRole("button", { name: "Sleep" })).toHaveCount(0);
await expect(page.getByRole("button", { name: "Health" })).toHaveCount(0);
await expect(page.getByRole("button", { name: "Finish Session" })).toHaveCount(0);
```

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/app.spec.ts tests/e2e/focus-timer.spec.ts tests/e2e/manual-tracking.spec.ts`

Expected: FAIL because the current shell still exposes `Insights`, `Sleep`, `Health`, `Finish Session`, and the old utility/sync presentation.

**Step 3: Write minimal implementation**

Change only enough structure and labels to satisfy the new contract:
- rename the visible nav pills
- remove the old visible timer action labels from the idle state
- update manual-flow routes so the tests can still reach sleep, workout, health, and daily-log actions through the new shell

**Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- tests/e2e/app.spec.ts tests/e2e/focus-timer.spec.ts tests/e2e/manual-tracking.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add tests/e2e/app.spec.ts tests/e2e/focus-timer.spec.ts tests/e2e/manual-tracking.spec.ts components/tracker-shell.tsx components/focus-timer.tsx
git commit -m "test: define copy-pass shell contract"
```

### Task 2: Rebuild the Shell Chrome Around the Four-Pill Layout

**Files:**
- Modify: `components/tracker-shell.tsx`
- Modify: `components/focus-timer.tsx`
- Modify: `components/sync-button.tsx`
- Modify: `app/globals.css`
- Test: `tests/e2e/focus-timer.spec.ts`

**Step 1: Write the failing test**

Add DOM-level expectations that capture the next shell shape:
- the bottom bar still has left utilities, centered pills, and right utilities
- the timer idles with one prominent `Start` control
- preset information can still be read, but it no longer renders as a row of visible pill buttons
- sync remains available via an icon-only utility affordance with a history panel
- the mini-player remains visible and centered between the timer and bottom bar

Concrete assertions to add:

```ts
await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
await expect(page.getByRole("button", { name: "Sync tracker data" })).toBeVisible();
await expect(page.getByRole("button", { name: /Classic Pomodoro/i })).toHaveCount(0);
await expect(page.locator(".mini-player")).toBeVisible();
```

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/focus-timer.spec.ts`

Expected: FAIL because the current shell still renders preset buttons and text-heavy sync controls.

**Step 3: Write minimal implementation**

Update shell structure and styling together:
- keep the four-pill shell centered in the bottom bar
- demote preset switching into a compact display/control instead of visible named buttons
- collapse the timer actions so idle state is much closer to the Peazehub appliance
- convert sync to an icon-only control with a popover/history panel
- tighten the bar geometry and player chrome to match the live shell more closely

**Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- tests/e2e/focus-timer.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add components/tracker-shell.tsx components/focus-timer.tsx components/sync-button.tsx app/globals.css tests/e2e/focus-timer.spec.ts
git commit -m "feat: tighten shell chrome for copy pass"
```

### Task 3: Rehome Personal Tracking Into Groups, Achievements, and Leaderboard

**Files:**
- Create: `components/groups-panel.tsx`
- Create: `components/leaderboard-panel.tsx`
- Modify: `components/insights-panel.tsx`
- Modify: `components/tracker-shell.tsx`
- Modify: `components/daily-log-panel.tsx`
- Modify: `components/workout-panel.tsx`
- Modify: `components/sleep-panel.tsx`
- Modify: `components/health-panel.tsx`
- Modify: `app/globals.css`
- Test: `tests/e2e/manual-tracking.spec.ts`

**Step 1: Write the failing test**

Extend the manual-flow coverage so the personal-tracking features survive under the new shell:
- `Groups` exposes daily-log and workout capture
- `Leaderboard` exposes sleep and health capture
- `Achievements` keeps the streak/milestone summaries
- settings remain reachable from the utility cluster

Concrete target assertions:

```ts
await page.getByRole("button", { name: "Groups" }).click();
await page.getByRole("tab", { name: "Daily log" }).click();
await page.getByRole("button", { name: "Save daily log" }).click();
await page.getByRole("tab", { name: "Workouts" }).click();
await page.getByRole("button", { name: "Save workout" }).click();
await page.getByRole("button", { name: "Leaderboard" }).click();
await page.getByRole("tab", { name: "Sleep" }).click();
await page.getByRole("button", { name: "Save sleep entry" }).click();
await page.getByRole("tab", { name: "Health" }).click();
await page.getByRole("button", { name: "Save health metric" }).click();
await page.getByRole("button", { name: "Achievements" }).click();
await expect(page.getByRole("heading", { name: /compound|achievement/i })).toBeVisible();
```

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/manual-tracking.spec.ts`

Expected: FAIL until the new panel grouping exists.

**Step 3: Write minimal implementation**

Implement the least disruptive panel restructure:
- `Groups` becomes the shared surface for daily logs and workouts
- `Leaderboard` becomes the shared surface for sleep and health with a personal-ranking presentation
- `Achievements` reuses the current insights/streak/milestone model with tighter copy
- keep all data entry server routes and persistence behavior unchanged

**Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- tests/e2e/manual-tracking.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add components/groups-panel.tsx components/leaderboard-panel.tsx components/insights-panel.tsx components/tracker-shell.tsx components/daily-log-panel.tsx components/workout-panel.tsx components/sleep-panel.tsx components/health-panel.tsx app/globals.css tests/e2e/manual-tracking.spec.ts
git commit -m "feat: rehome tracker surfaces under the copy shell"
```

### Task 4: Sharpen the Promo Overlay and Atmosphere

**Files:**
- Modify: `components/announcement-modal.tsx`
- Modify: `app/globals.css`
- Test: `tests/e2e/app.spec.ts`

**Step 1: Write the failing test**

Refine the modal assertions so the overlay feels closer to the live interstitial:
- the modal keeps the `Next Routine` heading
- the shell behind the overlay stays visually suppressed
- the CTA row remains `Check it out` plus the secondary dismissal action
- the modal keeps a richer visual composition than the current abstract cards

Concrete assertions to add:

```ts
await expect(page.getByRole("heading", { name: "Next Routine" })).toBeVisible();
await expect(page.getByRole("button", { name: "Check it out" })).toBeVisible();
await expect(page.locator(".announcement-visual")).toBeVisible();
await expect(page.locator(".hub-topbar")).toBeHidden();
```

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/app.spec.ts`

Expected: FAIL once the new visual structure is asserted against the current modal.

**Step 3: Write minimal implementation**

Push the overlay and background closer to the live product:
- reduce the abstract-card feel in favor of a denser product-shot composition
- darken and ground the room-like background so the focus shell reads less synthetic
- keep the close/dismiss behavior intact

**Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- tests/e2e/app.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add components/announcement-modal.tsx app/globals.css tests/e2e/app.spec.ts
git commit -m "feat: polish promo overlay for copy pass"
```

### Task 5: Final Verification and Notes

**Files:**
- Modify: `README.md`
- Modify: `docs/plans/2026-03-20-personal-tracker-copy-pass-2.md`

**Step 1: Write the failing test**

No new failing test. This task is verification and documentation only.

**Step 2: Run full verification before docs edits**

Run:
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run test:e2e`

Expected: all PASS

**Step 3: Write minimal implementation**

Update `README.md` only if the visible shell destinations or usage notes changed enough to make the current copy misleading. Append follow-up notes to this plan with the remaining parity gaps after the live comparison.

**Step 4: Run verification again if docs touched executable examples**

Run: `npm run lint`

Expected: PASS

**Step 5: Commit**

```bash
git add README.md docs/plans/2026-03-20-personal-tracker-copy-pass-2.md
git commit -m "docs: record copy pass notes"
```

## Follow-Up Notes

- Live comparison on 2026-03-20: the local shell now tracks the Peazehub layout closely, but the hosted product still has richer typography, motion, and marketing composition around the overlay and top-level shell.
- The local build intentionally replaces hosted auth and cloud persistence with a single-user password gate plus repo-native JSON storage and manual git sync.
- `Groups` and `Leaderboard` are preserved as personal single-user containers for daily-log, workout, sleep, and health flows. They do not attempt to recreate Peazehub's networked social behavior.
- The focus appliance, bottom bar, and utility cluster are visually much closer after this pass, but some pixel-level spacing, iconography, and micro-interactions remain approximate rather than exact.
