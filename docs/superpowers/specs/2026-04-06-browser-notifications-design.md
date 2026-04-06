# Browser Notifications Design

## Summary

Add browser notifications alongside existing sounds when focus sessions complete and breaks end. Tied to the existing `notificationSound` setting — no new settings required.

## Behavior

When `notificationSound !== "off"`, two things happen at each notification point:
1. The existing synthesized sound plays (unchanged)
2. A browser `Notification` fires with a contextual message

### Notification messages

| Event | Title | Body |
|---|---|---|
| Focus session complete | Focus session complete! | Time for a break. |
| Break end | Break's over! | Ready to focus. |

### Permission flow

- **When:** Permission is requested on the first Start button click via `Notification.requestPermission()`
- **Why there:** It's a user gesture (browsers are more likely to grant), and it's a natural moment of intent
- **If denied or unsupported:** Sounds still work. No error, no retry, no nagging. The `notify()` helper silently no-ops when permission isn't granted or the API isn't available.

## Implementation

### New file: `lib/notifications.ts`

Two exported functions:
- `requestNotificationPermission()` — calls `Notification.requestPermission()` if the API exists and permission is `"default"` (not yet asked). No-ops otherwise.
- `notify(title: string, body: string)` — creates a `new Notification(title, { body })` if permission is `"granted"`. No-ops otherwise.

### Changes to existing files

**`components/focus-timer.tsx`:**
- Import `requestNotificationPermission` and `notify`
- Call `requestNotificationPermission()` in the Start button's `onClick` handler
- Call `notify(...)` next to the existing `playSound()` call when the timer completes
- Pass a `notify` prop or the `notificationSound` value to `BreakTimer` (already passed)

**`components/break-timer.tsx`:**
- Import `notify`
- Call `notify(...)` in `handleEnd()` next to the existing `playBreakEndChime()` call, gated on the same `notificationSound !== "off"` check

### No schema or settings changes

The existing `notificationSound` setting controls both sounds and browser notifications. Browser-level permission is managed natively by the browser.

## Testing

- Unit test for `notify()`: mock `Notification` constructor, verify it fires when permission is granted, verify no-op when denied or unsupported
- Unit test for `requestNotificationPermission()`: verify it calls `Notification.requestPermission()` only when permission is `"default"`
- Existing focus-timer and break-timer tests remain unchanged (they don't test sound playback side effects)
