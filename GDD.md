# Game Design Document (GDD): Ring Rush - Puzzle Boxing

## 1. Executive Summary & Vision

**Ring Rush: Puzzle Boxing** is a 2026 AAA-grade 2D arcade versus puzzle game that merges the high-octane head-to-head mechanics of *Super Puzzle Fighter II Turbo* with the spectacle of modern championship boxing. Players choose between featured fighters (Adrien "The Problem" Broner and Deen The Great), dropping and detonating gems to trigger punches, counter-bars, and SUPER finisher combos.

This document serves as the single source of truth for all game mechanics, design guidelines, technical architecture, and execution specifications so any developer or AI coding agent can recreate, maintain, or extend the game to AAA standards.

---

## 2. Core Game Loop & Match Flow

```
[ Title Screen ] ──> [ Fighter Select ] ──> [ Match Intro / Round Call ]
                                                   │
[ Results / Victory Screen ] <── [ KO / Time Up ] <──┘ (Active Gameplay)
```

1. **Title Screen**: Animated faceoff showcase with continuous shadow boxing sparring between Broner and Deen inside the ring, arcade title logo, and audio toggle.
2. **Fighter Select Screen**: Symmetrical selection cards featuring character stats (Power, Speed, Counter, Super), signature stance previews, and locked mystery slots for future roster expansions.
3. **Match Intro Screen**: Round 1 call animation (`ROUND 1` / `FIGHT!`), dynamic arena crowd lighting, synth audio initialization.
4. **Active Match Gameplay**: Real-time dual-board puzzle combat. Player controls left board; AI or local rival controls right board. Detonating gems triggers real-time punch animations and sends Counter Gems to the opponent's grid.
5. **Results Screen**: KO victory call, statistics breakdown (Max Chain, Total Gems Cleared, Match Time), and high-resolution AAA digital painting victory portrait card (`broner-hd-victory.jpg` / `deen-hd-victory.jpg`).

---

## 3. Puzzle Engine & Grid Mechanics

### 3.1 Grid Architecture
- **Dimensions**: 6 Columns × 12 Rows per player grid.
- **Piece Spawning**: Falling pairs consist of a `pivot` gem (`y=0`) and a `satellite` gem (`y=1`), vertically stacked matching the `NEXT` preview box 1:1.
- **Movement & Rotation**:
  - `Left` (`←`) / `Right` (`→`): Horizontal translation.
  - `Rotate` (`↻`): 90-degree clockwise rotation around the pivot gem with wall-kick allowance.
  - `Soft Drop` / `Hard Drop` (`↓`): Accelerates vertical gravity down to the highest available solid row.

### 3.2 Gem Types & Behaviors
| Gem Type | Visual Marker | Engine Behavior |
| :--- | :--- | :--- |
| **Normal Gem** | Faceted jewel (Red, Blue, Green, Yellow) | Standard building block; stacks vertically and horizontally. |
| **Crash Gem** | Glowing orb core | Detonates when landing adjacent to any matching-color Normal or Power Gem. |
| **Power Gem** | Fused multi-cell giant gem (2×2 or larger) | Forms automatically when 4+ matching normal gems form solid rectangular blocks. Detonations yield 2.5× attack damage. |
| **Counter Gem** | Timed countdown badge (`5` to `1`) | Sent to opponent grid upon taking damage. Displays underlying gem color. Decrements each turn; converts into Normal Gem at `0`. Cannot be detonated directly by Crash Gems until timer reaches `0`. |

### 3.3 Chain Combos & Damage Formula
When a Crash Gem detonates:
1. All connected matching-color gems detonate simultaneously.
2. Gravity applies, causing suspended gems to fall.
3. If new matches or Crash Gems land adjacent to matching colors, a **Chain Combo** triggers (`CHAIN 2`, `CHAIN 3`, etc.).
4. **Garbage Attack Sent**:
   $$\text{Counter Gems Sent} = (\text{Cleared Gems} \times 0.75) \times \text{Chain Multiplier}$$

---

## 4. Fighter Combat & Animation Specs

### 4.1 Character Profiles & Stances
- **Adrien Broner**:
  - **Stance**: Philly Shell shoulder roll (`broner-philly-roll`). Left arm low, right hand guarding chin, rhythmic shoulder roll animation.
  - **Trunks**: Black & Gold with crown emblem.
  - **Stat Bias**: High Counter Damage, Heavy Punch Impact.
- **Deen the Great**:
  - **Stance**: High Guard pressure bounce (`deen-pressure-bounce`). Dual gloves up, rapid vertical leg bounce stance animation.
  - **Trunks**: Cyan Blue & Red with `DEEN` waistband.
  - **Stat Bias**: High Move Speed, Fast SUPER Meter Fill.

### 4.2 Combat State Machine
Each fighter sprite sheet (`broner-states.png`, `deen-states.png`) contains 4 state poses:
1. `idle`: Default animated boxer stance.
2. `attack`: Triggered when clearing 3+ gems or executing a chain. Displays hit spark flash overlays on rival.
3. `hurt`: Triggered when receiving Counter Gems. Flinch / knockback animation.
4. `win`: Triggered on match KO. Shown on Results screen alongside HD victory portrait art.

### 4.3 SUPER Meter System
- Fills from `0%` to `100%` as gems are cleared.
- At `100%`, the `SUPER` button glows with a golden aura animation (`@keyframes super-ready`).
- Tapping `SUPER` unleashes a 5-row Counter Gem barrage and triggers the fighter's signature finisher punch.

---

## 5. UI/UX & Mobile Ergonomics Best Practices

1. **Touch Controls**:
   - Minimum Button Height: **58px – 70px**.
   - Border Radius: **14px** with tactile active press shrink (`scale(0.93)`).
   - Placement: Elevated at `bottom: max(calc(env(safe-area-inset-bottom) + 12px), 14px)` to ensure natural thumb reach on 19.5:9 and 20:9 mobile viewports without hand joint strain.
2. **Ring Perspective & Fighter Placement**:
   - `.fight-plane` positioned at `top: 7.2%`, `height: clamp(165px, 28vh, 250px)` ([styles.css](file:///C:/Users/admin-beats/OneDrive/Documents/Puzzle-Fighter-Boxing/src/styles.css#L692-L702)).
   - Fighters stand full-length directly on the ring canvas floor mat inside the 4 corner posts without puzzle board overlap or legs getting cut off.
3. **HUD Header**:
   - Dual health tracks (`16px` height) with high-contrast gradient fills and `48 × 48 px` fighter portrait frames.

---

## 6. Technical Architecture & File Sitemap

```
├── index.html                   # HTML5 Entry Point & Container Layout
├── GDD.md                       # Game Design Document (This File)
├── src/
│   ├── main.ts                  # State Machine, Screen Rendering, Audio Synth, Event Delegation
│   ├── styles.css               # Vanilla CSS Design System, Keyframes, Ergonomics Tokens
│   └── game/
│       ├── puzzle.ts            # Pure Functional Puzzle Core & Collision Math
│       └── puzzle.test.ts       # Vitest Unit Test Suite for Engine Validation
├── public/
│   └── assets/
│       ├── arena/               # venue-far.jpg, ring-mid.png
│       ├── fighters/            # broner-states.png, deen-states.png, broner-hd-victory.jpg, deen-hd-victory.jpg
│       └── gems/                # gems.png
├── capture.js                   # Playwright Screenshot Visual Test Harness
└── package.json                 # Build Scripts (npm run dev, test, lint, build, capture)
```

---

## 7. Guidelines for AI Agents Recreating this Vision

When an AI coding agent is tasked with adding features or recreating this game:
1. **Never Break Touch Delegation**: All screen navigation and gameplay buttons must use persistent event delegation on `#app` for `pointerdown` and `click` to prevent dropped taps on mobile touchscreens.
2. **Preserve High-Contrast Sizing**: Never decrease touch targets below 52px or hide health bars behind UI panels.
3. **Maintain Pure Engine Tests**: All puzzle grid logic in `src/game/puzzle.ts` must remain pure functions tested via `vitest`. Run `npm run test` before every commit.
4. **Use Screenshots for Visual Verification**: Always run `npm run capture` (`node capture.js`) to generate and verify screenshots in `playthrough_review_gallery.md` before claiming visual completion.
