# Focus Friend-Style Gamification Design

**Date:** 2026-03-30
**Status:** Approved
**Goal:** Transform Naren from a purely functional focus timer into a cozy, gamified focus app inspired by Focus Friend by Hank Green, while preserving all existing functionality.

---

## 1. App Flow & Navigation

### Bottom Navigation Bar (5 tabs)

| Tab | Purpose |
|-----|---------|
| **Focus** | Main screen — Bean character in its room + timer controls + presets |
| **Room** | Arrange/place owned decorations in the Bean's room |
| **Shop** | Browse and buy decorations with socks currency |
| **Stats** | Existing stats: streak, heatmap, weekly goals |
| **Settings** | Existing settings: presets, sounds, goals, sync + new sound/break options |

### Core Session Flow

```
Focus Tab (idle) → Start Session → Bean turns away & knits →
Timer counts down → Session completes → Bean celebrates →
Currency awarded → Break timer starts → Shop tab auto-opens →
Browse/buy decorations → Break ends → Back to Focus tab
```

### Interrupted Session Flow

```
Focus Tab (active) → User clicks Stop → Bean's knitting unravels →
Bean sad face → No currency awarded → Returns to idle state
```

---

## 2. Bean Character & Animation States

### Visual Design

- Simple CSS/SVG oval shape (~80px wide, ~90px tall)
- Warm brown fill (`#8B6914`), rounded top, slightly flatter bottom
- Face drawn with CSS: two dot eyes + curved mouth
- Sits/stands on the floor area of the room, centered

### 4 Animation States

| State | Face | Body | Animation |
|-------|------|------|-----------|
| **Idle** | Happy `◡‿◡` | Facing forward | Gentle bobbing (translateY), subtle breathing scale |
| **Focusing** | Calm `– –` | Turned away (back visible) | Knitting loop — two small needle lines move rhythmically, yarn strand wiggles via CSS keyframes |
| **Celebrating** | Big smile `◡▽◡` | Facing forward, arms up | Bounce + confetti particles (CSS pseudo-elements), sock icon floats up showing `+N 🧦` |
| **Sad** | Frown `◠_◠` | Facing forward, slumped | Yarn unravels downward (stroke-dashoffset animation), Bean shrinks slightly, muted color filter |

### Transitions

- Each state change has a ~0.5s CSS transition
- Bean rotates 180° (Y-axis) when switching between facing forward and facing away

---

## 3. Room & Decoration System

### Room Structure

The Bean's room is the background of the Focus tab — a warm 2D side-view (dollhouse cross-section).

- **Wall area** (top 60%): Light warm color (`#FDF6E3`). Holds wall decorations (art, shelves, clock, window).
- **Floor area** (bottom 40%): Slightly darker (`#F5ECD7`). Holds floor items (rug, plant, desk, lamp).
- Bean sits/stands on the floor area, centered.

### Decoration Placement

- In Room tab, decorations are draggable to predefined grid positions
- Slot-based: 4 wall slots, 4 floor slots, 2 surface slots (~10 placement slots total)
- Placed items render as small SVG/CSS illustrations
- Simpler than free-form, looks tidy

### Starter Decorations (18 items, 3 price tiers)

| Tier | Cost | Items |
|------|------|-------|
| **Basic** (6) | 50–100 🧦 | Small plant, basic rug, simple poster, desk lamp, bookshelf, trash can |
| **Mid** (6) | 150–300 🧦 | Cozy armchair, window with curtains, wall clock, potted tree, side table, floor lamp |
| **Premium** (6) | 400–700 🧦 | Fancy desk, large painting, cat bed (with cat!), string lights, coffee machine, record player |

### Room Unlock

- Second room costs 1,000 🧦
- Shown as locked in Shop with a progress bar
- Room expansion is a future concern — only 1 room in this implementation

---

## 4. Currency, Shop & Break Timer

### Currency: Socks 🧦

- 1 sock per minute of completed focus time (rounded down)
- Displayed in top bar at all times (e.g. `🧦 1,050`)
- Only awarded on session completion — interrupted sessions earn nothing
- Celebrating Bean shows `+N 🧦` floating animation when awarded

### Shop Tab

- Grid of decoration cards: preview illustration, name, cost
- Purchased items grayed out with checkmark
- Category filter tabs at top: Wall, Floor, Furniture
- Locked room shown at bottom with progress bar (`🧦 750 / 1,000`)

### Break Timer

- Default break duration: 5 minutes (configurable in Settings)
- After Bean celebrates and currency is awarded, banner: "Break time! Browse the shop while you rest."
- Shop tab auto-opens
- Small countdown in top bar shows remaining break time
- When break ends, a gentle chime (Fairy Fountain) plays + prompt nudges back to Focus tab
- User can skip break or return to Focus early at any time

### Data Model Additions

```
data/economy/wallet.json    — { "socks": 0, "totalEarned": 0 }
data/economy/inventory.json — { "purchased": [] }
data/economy/room.json      — { "placements": {} }
```

---

## 5. Lo-fi Ambient Music & Sound

### Ambient Music During Focus

- Synthesized via Web Audio API (same approach as existing Zelda chimes in `lib/sounds.ts`)
- Simple lo-fi loop: soft pad chords cycling through a 4-chord progression, gentle filtered noise layer for vinyl warmth
- Slow tempo (~70 BPM), ~30 second loop, crossfades seamlessly with itself
- Starts when focus session begins, stops when session ends

### Mute Button

- Small speaker icon in top-right corner of Focus view, always visible during sessions
- Toggle: muted/unmuted state persisted in settings
- Independent of completion chime setting (can mute lo-fi but still hear completion chime)

### Existing Sounds Preserved

- 5 Zelda-inspired completion chimes play on session complete (after Bean celebration)
- Break-end chime: reuse Fairy Fountain as the break-over nudge

### Settings Additions

- New toggle: "Ambient music during focus" (on/off, default on)
- New toggle: "Break-end chime" (on/off, default on)
- Existing completion sound picker unchanged

---

## 6. Theme & Visual Overhaul

### Color System: Dark → Warm Cozy Light

| Element | Current (Dark) | New (Cozy) |
|---------|---------------|------------|
| Background | Dark purple/gray | `#F8F5F0` warm cream |
| Cards/panels | Dark surface | `#FFFFFF` with `#E8E4DC` borders |
| Primary accent | Purple/indigo | `#1D5A5D` deep teal |
| Action buttons | Purple | `#B0C423` lime green |
| Text primary | White | `#333333` |
| Text secondary | Gray-400 | `#666666` |
| Font | System default | Poppins (300, 600) |
| Border radius | Mixed | 12–16px everywhere |
| Top bar pills | Dark surface | `#E8F5E9` soft green |

### What Stays the Same

- All timer logic, presets, session tracking, streak calculation
- Activity heatmap (re-themed to warm colors)
- Settings panel structure (re-themed + new options added)
- Stats overview (re-themed)
- Git sync mechanism and button
- Auth/login gate (re-themed)
- All API routes and data schemas
- All existing test coverage

### CSS Approach

- Replace `globals.css` CSS variables and Tailwind config theme colors
- Layout changes from two-column to single-column with bottom nav
- Component internals stay intact, only wrapper/styling changes

---

## 7. Layout: Bean-Centered Single View

The Focus tab is the main screen. The Bean lives inside its room. The timer overlays the room.

### Focus Tab Layout (top to bottom)

1. **Top bar:** Streak count (left), currency display `🧦 N` (right), mute button (right)
2. **Room area (main):** Full-width warm rectangle. Wall + floor. Bean centered on floor. Placed decorations visible in their slots. During focus, timer countdown overlaid large at bottom of room.
3. **Bean status text:** Below room. "Bean is ready to focus!" / "Bean is focusing..." / etc.
4. **Timer display:** Large countdown when active, preset selector when idle
5. **Preset selector:** Horizontal pill row (Pomodoro, Eisenhower, 52/17, Deep Work)
6. **Action button:** Full-width lime green. "Start Focus" / "Stop" / "Skip Break"
7. **Bottom nav:** 5 tab icons + labels

### Room Tab Layout

1. **Top bar:** Same as Focus tab
2. **Room area:** Same room view but decorations have drag handles visible
3. **Slot indicators:** Empty slots shown as dashed outlines
4. **Inventory bar:** Horizontal scrollable row of owned-but-unplaced decorations at bottom
5. **Bottom nav**

### Shop Tab Layout

1. **Top bar:** Same, currency prominently displayed
2. **Category filters:** Wall | Floor | Furniture pill tabs
3. **Item grid:** 2-column grid of decoration cards (preview, name, cost, buy button)
4. **Locked room card:** At bottom, progress bar toward 1,000 🧦
5. **Bottom nav**
