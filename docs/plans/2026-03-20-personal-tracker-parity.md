# Personal Tracker Parity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the authenticated tracker shell materially closer to Peazehub's dashboard composition while preserving the local-first personal tracking features already built.

**Architecture:** Keep the current Next.js app-router structure and repo-native data model, but reshape the authenticated shell around Peazehub's visual hierarchy: a stronger ambient background, tighter top/bottom glass bars, a more faithful timer stack, a richer mini-player, and a reduced set of primary navigation pills. Preserve feature coverage by combining closely related personal panels instead of adding more top-level nav items.

**Tech Stack:** Next.js 15, React, TypeScript, app router, CSS in `app/globals.css`, Playwright e2e, Vitest unit tests.

---

### Task 1: Lock the Shell-Structure Contract in E2E

**Files:**
- Modify: `tests/e2e/focus-timer.spec.ts`
- Modify: `tests/e2e/manual-tracking.spec.ts`
- Optional modify: `tests/e2e/app.spec.ts`

**Step 1: Write the failing test**

Extend the authenticated-shell assertions so the tests expect the next parity target instead of the current shell. Cover:
- four primary nav pills instead of five
- an achievements-oriented panel entry instead of a generic insights label
- a combined recovery/wellbeing entry instead of separate sleep + health primary pills
- richer mini-player controls and/or labels that are stable enough for Playwright to assert
- promo modal copy and CTA that more closely match the intended dashboard feel

Concrete assertions to add:

```ts
await expect(page.getByRole("button", { name: "Statistics" })).toBeVisible();
await expect(page.getByRole("button", { name: "Achievements" })).toBeVisible();
await expect(page.getByRole("button", { name: "Recovery" })).toBeVisible();
await expect(page.getByRole("button", { name: "Workouts" })).toBeVisible();
await expect(page.getByRole("button", { name: "Expand player" })).toBeVisible();
```

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/focus-timer.spec.ts tests/e2e/manual-tracking.spec.ts`

Expected: FAIL because the current shell still exposes `Insights`, `Sleep`, and `Health` as separate primary nav buttons and does not yet expose the tighter mini-player contract.

**Step 3: Write minimal implementation**

Do not style yet. Change only enough structure/copy so the new shell contract exists:
- reduce the primary nav to four entries
- map existing insight content to an `Achievements` entry
- introduce a `Recovery` panel that preserves sleep and health visibility
- expose stable music/player controls and labels for testing

**Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- tests/e2e/focus-timer.spec.ts tests/e2e/manual-tracking.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add tests/e2e/focus-timer.spec.ts tests/e2e/manual-tracking.spec.ts components/tracker-shell.tsx components/announcement-modal.tsx
git commit -m "test: define parity shell contract"
```

### Task 2: Rework the Authenticated Shell Chrome

**Files:**
- Modify: `components/tracker-shell.tsx`
- Modify: `components/focus-timer.tsx`
- Modify: `components/announcement-modal.tsx`
- Modify: `app/globals.css`
- Test: `tests/e2e/focus-timer.spec.ts`

**Step 1: Write the failing test**

Add DOM-level expectations for the shell chrome that reflects the intended structure:
- tighter top metrics pill layout
- center timer stack with dots, ambient tags, and button cluster
- mini-player with play/track/next/expand composition
- utility clusters that still expose daily log, sync, logout, and settings

Use text/role assertions rather than screenshots.

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/focus-timer.spec.ts`

Expected: FAIL because the current chrome is still only an approximation of the Peazehub shell.

**Step 3: Write minimal implementation**

Update the shell structure and styling together:
- adjust `TrackerShell` markup so the bottom bar reads as left utilities, centered primary nav, and right utilities
- make the mini-player feel like a real shell control instead of a placeholder row
- tighten the focus timer presentation to resemble the target composition without removing repo-native status details
- update the promo modal so the visual hierarchy is closer to the original product announcement pattern
- move any purely decorative logic into CSS instead of component conditionals

**Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- tests/e2e/focus-timer.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add components/tracker-shell.tsx components/focus-timer.tsx components/announcement-modal.tsx app/globals.css tests/e2e/focus-timer.spec.ts
git commit -m "feat: refine tracker shell chrome"
```

### Task 3: Collapse Personal Panels into Peazehub-Like Primary Navigation

**Files:**
- Modify: `components/tracker-shell.tsx`
- Modify: `components/insights-panel.tsx`
- Create or modify: `components/recovery-panel.tsx`
- Modify: `components/sleep-panel.tsx`
- Modify: `components/health-panel.tsx`
- Modify: `app/globals.css`
- Test: `tests/e2e/manual-tracking.spec.ts`

**Step 1: Write the failing test**

Extend manual-flow coverage so it proves the preserved personal features still exist after the shell restructure:
- health metrics remain reachable through the combined recovery surface
- sleep data remains visible through the same surface
- achievements still surface streak/milestone content
- settings and daily log remain reachable through utility controls

Example target assertions:

```ts
await page.getByRole("button", { name: "Recovery" }).click();
await expect(page.getByText(/sleep/i)).toBeVisible();
await expect(page.getByText(/resting heart rate|weight|body fat/i)).toBeVisible();
await page.getByRole("button", { name: "Achievements" }).click();
await expect(page.getByRole("heading", { name: /compound|achievement/i })).toBeVisible();
```

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/manual-tracking.spec.ts`

Expected: FAIL until the panel consolidation exists.

**Step 3: Write minimal implementation**

Implement the least disruptive panel restructure:
- rename the insights destination to `Achievements`
- create a single `Recovery` panel that reuses current sleep and health summaries instead of keeping them as separate primary entries
- keep `Daily log` and `Settings` in utility affordances
- keep `Sync` in the left utility cluster and preserve its current behavior

**Step 4: Run test to verify it passes**

Run: `npm run test:e2e -- tests/e2e/manual-tracking.spec.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add components/tracker-shell.tsx components/insights-panel.tsx components/recovery-panel.tsx components/sleep-panel.tsx components/health-panel.tsx app/globals.css tests/e2e/manual-tracking.spec.ts
git commit -m "feat: align panel navigation with parity shell"
```

### Task 4: Final Verification and Docs

**Files:**
- Modify: `README.md`
- Optional modify: `docs/plans/2026-03-20-personal-tracker-parity.md`

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

Update `README.md` only if the renamed shell destinations or panel organization changed materially enough that setup or usage guidance is now misleading.

**Step 4: Run verification again if docs touched executable examples**

Run: `npm run lint`

Expected: PASS

**Step 5: Commit**

```bash
git add README.md docs/plans/2026-03-20-personal-tracker-parity.md
git commit -m "docs: update tracker parity notes"
```
