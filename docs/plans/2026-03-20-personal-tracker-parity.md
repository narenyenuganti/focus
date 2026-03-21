# Personal Tracker Parity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the authenticated tracker shell feel much closer to the Peazehub reference without discarding the local-first personal-tracker functionality already built.

**Architecture:** Keep the current Next.js App Router and local JSON data model intact. This iteration is primarily a shell-and-interaction pass: simplify the focus screen into a timer-first appliance, move auxiliary tracker surfaces into lighter overlay/panel states, and rebuild the surrounding atmosphere, modal, and player chrome so the app reads like a single-screen focus hub instead of a dashboard with drawers.

**Tech Stack:** Next.js App Router, React, TypeScript, CSS in `app/globals.css`, local JSON storage, Vitest, Playwright.

---

### Task 1: Reshape The Authenticated Shell Around A Focus-First Layout

**Files:**
- Modify: `components/tracker-shell.tsx`
- Modify: `app/globals.css`
- Modify: `tests/e2e/focus-timer.spec.ts`
- Modify: `tests/e2e/app.spec.ts`

**Step 1: Write the failing test**

Extend browser coverage so the authenticated shell proves the focus-first chrome exists:
- top metric pill bar remains visible after unlock
- bottom shell controls stay visible without opening a side-by-side dashboard layout
- auxiliary content opens as a lighter overlay/panel state rather than permanently reserving wide two-column space

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/app.spec.ts tests/e2e/focus-timer.spec.ts`
Expected: FAIL because the shell still renders the heavier split-column dashboard model.

**Step 3: Write minimal implementation**

Implement:
- a tighter shell state model in `tracker-shell.tsx` that preserves existing panels but presents them as lighter contextual surfaces
- bottom-bar clusters and top-bar geometry that stay closer to the Peazehub shell proportions
- CSS changes to reduce dashboard bulk in `.hub-main`, `.hub-panel-column`, `.hub-topbar`, `.hub-bottombar`, `.utility-cluster`, and `.nav-cluster`

**Step 4: Run tests to verify it passes**

Run: `npm run test:e2e -- tests/e2e/app.spec.ts tests/e2e/focus-timer.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add components/tracker-shell.tsx app/globals.css tests/e2e/app.spec.ts tests/e2e/focus-timer.spec.ts
git commit -m "feat: tighten the focus-first tracker shell"
```

### Task 2: Simplify The Timer Surface And Upgrade The Mini Player

**Files:**
- Modify: `components/focus-timer.tsx`
- Modify: `components/tracker-shell.tsx`
- Modify: `app/globals.css`
- Modify: `tests/e2e/focus-timer.spec.ts`
- Modify: `tests/unit/smoke.test.tsx`

**Step 1: Write the failing test**

Add focused assertions for:
- the timer remaining the dominant element on the page
- a primary start control plus a minimal reset affordance
- a richer mini-player with distinct play/next/expand controls
- preset access staying available without visually overwhelming the timer

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/focus-timer.spec.ts && npm test -- tests/unit/smoke.test.tsx`
Expected: FAIL because the current timer surface is still too busy and the mini-player is underbuilt.

**Step 3: Write minimal implementation**

Implement:
- a leaner `FocusTimer` surface with stricter hierarchy around the ring, time readout, and primary action
- smaller or secondary treatment for presets and status copy
- a real mini-player control row in `tracker-shell.tsx`
- CSS updates for `.focus-panel`, `.focus-ring`, `.timer-actions`, `.preset-grid`, and `.mini-player`

**Step 4: Run tests to verify it passes**

Run: `npm run test:e2e -- tests/e2e/focus-timer.spec.ts && npm test -- tests/unit/smoke.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add components/focus-timer.tsx components/tracker-shell.tsx app/globals.css tests/e2e/focus-timer.spec.ts tests/unit/smoke.test.tsx
git commit -m "feat: simplify the focus timer and player chrome"
```

### Task 3: Rebuild The Atmosphere And Modal Chrome

**Files:**
- Modify: `components/announcement-modal.tsx`
- Modify: `app/globals.css`
- Modify: `tests/e2e/app.spec.ts`
- Modify: `README.md`

**Step 1: Write the failing test**

Extend shell coverage so the promo modal and landing visuals prove:
- the announcement modal still blocks first entry until dismissed
- the modal includes richer promo-card structure and CTA copy
- the shell keeps the atmospheric background and glass treatment after dismissal

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e -- tests/e2e/app.spec.ts`
Expected: FAIL because the modal copy/structure and shell atmosphere are still too generic.

**Step 3: Write minimal implementation**

Implement:
- a more Peazehub-like promo interstitial in `announcement-modal.tsx`
- stronger room-like atmosphere in `app/globals.css` using layered gradients, silhouettes, glows, and denser glass treatments
- README notes that the current parity pass focuses on shell fidelity while keeping the data model local-first

**Step 4: Run tests to verify it passes**

Run: `npm run test:e2e -- tests/e2e/app.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add components/announcement-modal.tsx app/globals.css tests/e2e/app.spec.ts README.md
git commit -m "feat: polish the tracker atmosphere and modal"
```

### Task 4: Full Verification And Manual Comparison Loop

**Files:**
- Modify: `docs/plans/2026-03-20-personal-tracker-parity.md`

**Step 1: Capture the local shell for comparison**

Run a local dev server and save a fresh screenshot of the authenticated dashboard after dismissing the modal.

**Step 2: Compare against the current Peazehub reference**

Compare the local screenshot against the captured Peazehub dashboard reference and note remaining high-value parity gaps directly in this plan file under a short `Follow-up Notes` section.

**Step 3: Run full verification**

Run:
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run test:e2e`

Expected: all PASS

**Step 4: Commit**

```bash
git add docs/plans/2026-03-20-personal-tracker-parity.md
git commit -m "docs: capture parity follow-up notes"
```
