# Browser Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fire browser notifications alongside sounds when focus sessions complete and breaks end.

**Architecture:** A thin `lib/notifications.ts` utility wraps the Web Notification API. Permission is requested on the Start button click. The two existing notification sites (timer complete, break end) each add a `notify()` call next to their existing sound call, gated on the same `notificationSound !== "off"` check.

**Tech Stack:** Web Notification API, Vitest

---

### Task 1: Create `lib/notifications.ts` with tests

**Files:**
- Create: `lib/notifications.ts`
- Create: `tests/unit/notifications.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/notifications.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { notify, requestNotificationPermission } from "@/lib/notifications";

describe("requestNotificationPermission", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls Notification.requestPermission when permission is default", () => {
    const requestPermission = vi.fn().mockResolvedValue("granted");
    vi.stubGlobal("Notification", { permission: "default", requestPermission });

    requestNotificationPermission();

    expect(requestPermission).toHaveBeenCalledOnce();
  });

  it("does not call requestPermission when already granted", () => {
    const requestPermission = vi.fn();
    vi.stubGlobal("Notification", { permission: "granted", requestPermission });

    requestNotificationPermission();

    expect(requestPermission).not.toHaveBeenCalled();
  });

  it("does not call requestPermission when denied", () => {
    const requestPermission = vi.fn();
    vi.stubGlobal("Notification", { permission: "denied", requestPermission });

    requestNotificationPermission();

    expect(requestPermission).not.toHaveBeenCalled();
  });

  it("no-ops when Notification API is unavailable", () => {
    vi.stubGlobal("Notification", undefined);

    expect(() => requestNotificationPermission()).not.toThrow();
  });
});

describe("notify", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a Notification when permission is granted", () => {
    const MockNotification = vi.fn();
    MockNotification.permission = "granted";
    vi.stubGlobal("Notification", MockNotification);

    notify("Test Title", "Test body");

    expect(MockNotification).toHaveBeenCalledWith("Test Title", { body: "Test body" });
  });

  it("does not create a Notification when permission is denied", () => {
    const MockNotification = vi.fn();
    MockNotification.permission = "denied";
    vi.stubGlobal("Notification", MockNotification);

    notify("Test Title", "Test body");

    expect(MockNotification).not.toHaveBeenCalled();
  });

  it("does not create a Notification when permission is default", () => {
    const MockNotification = vi.fn();
    MockNotification.permission = "default";
    vi.stubGlobal("Notification", MockNotification);

    notify("Test Title", "Test body");

    expect(MockNotification).not.toHaveBeenCalled();
  });

  it("no-ops when Notification API is unavailable", () => {
    vi.stubGlobal("Notification", undefined);

    expect(() => notify("Test Title", "Test body")).not.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/notifications.test.ts`
Expected: FAIL — module `@/lib/notifications` does not exist

- [ ] **Step 3: Write the implementation**

Create `lib/notifications.ts`:

```ts
export function requestNotificationPermission(): void {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "default") return;
  void Notification.requestPermission();
}

export function notify(title: string, body: string): void {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  new Notification(title, { body });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/notifications.test.ts`
Expected: All 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/notifications.ts tests/unit/notifications.test.ts
git commit -m "feat: add browser notification helpers with tests"
```

---

### Task 2: Wire notifications into FocusTimer

**Files:**
- Modify: `components/focus-timer.tsx`

- [ ] **Step 1: Add imports**

Add to the import block at the top of `components/focus-timer.tsx`:

```ts
import { notify, requestNotificationPermission } from "@/lib/notifications";
```

- [ ] **Step 2: Request permission on Start click**

In the Start button's `onClick` handler (around line 470), add `requestNotificationPermission()` right after `warmUpAudio()`:

```ts
onClick={() => {
  warmUpAudio();
  requestNotificationPermission();
  // ... rest of handler unchanged
```

- [ ] **Step 3: Fire notification on session complete**

In the `tick` function inside the running `useEffect` (around line 302), add `notify()` next to the existing `playSound()` call:

```ts
if (notificationSound !== "off") {
  playSound(notificationSound as SoundId);
  notify("Focus session complete!", "Time for a break.");
}
```

- [ ] **Step 4: Run all tests**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add components/focus-timer.tsx
git commit -m "feat: fire browser notification on focus session complete"
```

---

### Task 3: Wire notifications into BreakTimer

**Files:**
- Modify: `components/break-timer.tsx`

- [ ] **Step 1: Add import**

Add to the import block at the top of `components/break-timer.tsx`:

```ts
import { notify } from "@/lib/notifications";
```

- [ ] **Step 2: Fire notification on break end**

In the `handleEnd` callback (around line 24), add `notify()` next to the existing `playBreakEndChime()` call:

```ts
const handleEnd = useCallback(() => {
  if (notificationSound !== "off") {
    playBreakEndChime();
    notify("Break's over!", "Ready to focus.");
  }
  onBreakEndRef.current();
}, [notificationSound]);
```

- [ ] **Step 3: Run all tests**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add components/break-timer.tsx
git commit -m "feat: fire browser notification on break end"
```
