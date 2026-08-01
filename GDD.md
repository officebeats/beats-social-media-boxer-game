# Game Design Document (GDD): Ring Rush - Puzzle Boxing

## 1. Executive Summary & Core Concept

**Ring Rush: Puzzle Boxing** is a 2026 AAA arcade versus puzzle game directly inspired by Capcom's *Super Puzzle Fighter II Turbo*, rebuilt ground-up for boxing entertainment and themed around **Adrien "The Problem" Broner**, **Deen The Great**, and the broader influencer/pro boxing stream ecosystem (featuring Adin Ross, N3ON, Blueface, Gervonta Davis, and Floyd Mayweather).

The game combines dual-grid competitive drop-puzzle strategy with real-time animated boxing combat. Clearing gems, forming fused Power Gems, and triggering Crash Gem detonations causes fighters in the background ring to throw punches, weave in signature stances, unleash SUPER finishers, and drop custom Counter Gem patterns onto the rival's grid.

This document serves as the authoritative blueprint for developers and AI agents to build, expand, or recreate the complete game vision.

---

## 2. Roster & Celebrity Stream Ecosystem

The playable roster bridges championship pro boxing with the viral stream culture of Brand Risk, Misfits, and Kick/Twitch boxing events.

```
                  ┌─────────────────────────────────────────┐
                  │           SELECTABLE ROSTER             │
                  ├────────────────────┬────────────────────┤
                  │   PRO CHAMPIONS    │ STREAMER INFLUENCERS│
                  ├────────────────────┼────────────────────┤
                  │ Adrien Broner      │ Adin Ross          │
                  │ Deen The Great     │ N3ON               │
                  │ Gervonta Davis*    │ Blueface           │
                  │ Floyd Mayweather*  │ Walid Sharks       │
                  └────────────────────┴────────────────────┘
                                         *Unlockable Bosses
```

### 2.1 Roster Profiles & Gameplay Differentiators

| Fighter | Archetype / Persona | Signature Stance | Passive Perk / Special Ability | Counter Gem Drop Pattern (6-Col Matrix) |
| :--- | :--- | :--- | :--- | :--- |
| **Adrien Broner** | Philly Shell Master | `broner-philly-roll` (Left arm low, shoulder roll) | **Philly Armor**: Takes 15% fewer Counter Gems. Power Gems yield +30% attack power. | `[Gold, Gold, Red, Red, Gold, Gold]` (Solid Heavy Block) |
| **Deen The Great** | High-Guard Pressure | `deen-pressure-bounce` (Dual gloves high, rapid leg bounce) | **Chain Surge**: Chain Multipliers scale 1.5× faster. SUPER meter fills +20% faster. | `[Blue, Cyan, Blue, Cyan, Blue, Cyan]` (Alternating Stair Step) |
| **Adin Ross** | The Executive Promoter | `adin-hype-guard` (Gold mic guard, ringmaster step) | **Hype Cash-In**: Soft/Hard drops grant +2% SUPER meter per gem dropped. | `[Gold, Red, Gold, Red, Gold, Red]` (Checkerboard Wealth) |
| **N3ON** | The Agitator | `neon-twitch-guard` (Unstable frantic bobbing) | **Fast Countdown**: Counter Gems dropped onto opponent spawn with 3-turn timers instead of 5. | `[Green, Green, Yellow, Yellow, Green, Green]` (Twin Spike Columns) |
| **Blueface** | The Wildcard | `blueface-brawl-stance` (Wide loose arms, unpredictable heavy stance) | **Brawl Chaos**: Counter Gems drop in randomized color order, confusing rival grid planning. | `[Random, Random, Random, Random, Random, Random]` (Randomized Noise) |
| **Walid Sharks** | Flashy Counter-Puncher | `walid-counter-bounce` (Low hands, fast head movement) | **Reflex Counter**: Clearing gems while taking damage converts 1 incoming Counter Gem into a Crash Gem. | `[Red, Blue, Green, Yellow, Red, Blue]` (Full Rainbow Array) |
| **Gervonta Davis** *(Boss)* | The Tank | `tank-peekaboo` (Tight peek-a-boo guard, heavy sway) | **Knockout Power**: 2×2 Power Gem detonations yield 3× attack damage and trigger immediate screen shake. | `[Red, Red, Red, Red, Red, Red]` (Solid Monochromatic Wall) |
| **Floyd Mayweather** *(Boss)* | Money TBE | `floyd-master-defense` (Flawless shoulder roll & elbow block) | **The Best Ever**: Automatically converts 2 Counter Gems into Normal Gems every 10 seconds. | `[Gold, Gold, Gold, Gold, Gold, Gold]` (Pure Gold Wall) |

---

## 3. Puzzle Engine & Super Puzzle Fighter II Mechanics

### 3.1 Grid Architecture & Controls
- **Grid Dimensions**: 6 Columns × 12 Rows per player.
- **Falling Candidate Pair**: Vertically stacked pair (`pivot` at `y=0`, `satellite` at `y=1`), matching the `NEXT` preview box 1:1.
- **Controls**:
  - `Left` (`←`) / `Right` (`→`): Horizontal grid translation.
  - `Rotate` (`↻`): Clockwise 90-degree pair rotation with wall-kick allowance.
  - `Soft/Hard Drop` (`↓`): Instant vertical acceleration to the lowest open row.

### 3.2 Gem Types
1. **Normal Gems**: 4 colors (Red `#e63946`, Blue `#0077b6`, Green `#2a9d8f`, Yellow `#e9c46a`).
2. **Crash Gems**: Glowing orb cores. Detonates when touching adjacent matching-color Normal or Power Gems.
3. **Power Gems**: Fused 2×2, 2×3, 3×3, or 4×4 rectangular blocks formed automatically when matching normal gems settle into solid rectangles. Detonations deliver 2.5× base attack damage.
4. **Counter Gems**: Timed countdown gems (`5` $\to$ `0`) displaying underlying gem color badges. Sent to rival's board upon taking damage. Decrements each turn; turns into Normal Gems at `0`.

### 3.3 Combo Damage & Garbage Formula
$$\text{Counter Gems Sent} = \left\lfloor (\text{Cleared Gems} \times 0.75) \times \text{Chain Multiplier} \right\rfloor$$
- **Chain 1**: 1.0×
- **Chain 2**: 1.5×
- **Chain 3**: 2.2×
- **Chain 4+**: 3.5×

---

## 4. Fighter Move Visualizer, Sprite Sheet Specs & Animation Timing

### 4.1 Visual Move Display System
Every boxer visualizes real-time combat in the ring corresponding directly to puzzle board events:

```
[ Puzzle Event ]                  [ Fighter Move Visualizer Action ]
───────────────────────────────────────────────────────────────────────
Idle Stance                 ──>   Continuous Idle Stance (Philly Roll / High Guard Bounce)
1-2 Gem Clear               ──>   Light Left Jab + Jab SFX
3-5 Gem Clear               ──>   Heavy Right Hook + Hit Spark Flash Overlay on Rival
2×2 Power Gem Detonation    ──>   Signature Uppercut / Overhand + Screen Shake + Impact Flash
Chain Combo (Chain 2+)      ──>   Flurry Combination (Jab-Cross-Hook) + Floating Combo Copy
SUPER Meter Active (100%)   ──>   Golden Super Aura Glow (@keyframes super-ready)
SUPER Button Tapped         ──>   Cinematic Finisher Punch + 5-Row Counter Gem Rain
Counter Gems Received       ──>   Hurt Flinch / Head Snap Back Animation
Match Knockout (KO)         ──>   Knockdown Flatten Animation + KO Bell + HD Victory Card
```

### 4.2 Capcom 12/15 FPS Arcade Animation Timing & Motion Style
To capture the exact snappy, weighted 2D arcade feel of Capcom's *Super Puzzle Fighter II Turbo*:

- **Render Loop vs. Animation Step Rate**: The web application renders at **60 FPS**, but character sprite sheet animations execute at a discrete **12 FPS – 15 FPS step rate** (each keyframe is held for 4 to 5 render frames, i.e., **80ms – 100ms per step**).
- **CSS Step Functions**: Sprite keyframe animations MUST use discrete step timing (`animation-timing-function: steps(N)`) so transitions tick crisply between frames with **zero linear interpolation blur**.

#### Frame Breakdown & Timing Matrix:

| Move State | Total Frames | Step Duration per Frame | Total Cycle Time | Animation Feel & Motion Rules |
| :--- | :--- | :--- | :--- | :--- |
| **Idle Stance** | 4 Frames | 90ms | 360ms (Looping) | **Philly Roll / Bounce**: Frame 1 (Neutral), Frame 2 (Shoulder Step), Frame 3 (Peak Roll), Frame 4 (Relax Step). |
| **Light Jab** | 3 Frames | 60ms / 120ms / 80ms | 260ms (Snappy) | Frame 1 (Quick Windup), Frame 2 (Full Extension Impact + Hit Spark), Frame 3 (Snappy Guard Recovery). |
| **Heavy Counter** | 5 Frames | 80ms / 100ms / 140ms / 100ms / 80ms | 500ms (Heavy Weight) | Frame 1 (Crouch Windup), Frame 2 (Explosive Rise), Frame 3 (Peak Impact + Flash Screen Shake), Frame 4 (Follow-through), Frame 5 (Reset). |
| **SUPER Finisher** | 8 Frames | 80ms per frame | 640ms (Multi-hit Flurry) | Rapid 4-punch flurry (Jab $\to$ Cross $\to$ Hook $\to$ Uppercut $\to$ Victory Pose). |
| **Hurt Flinch** | 3 Frames | 120ms / 100ms / 80ms | 300ms (Recoil) | Frame 1 (Head Snap Back), Frame 2 (Peak Recoil), Frame 3 (Guard Reset). |
| **Knockout (KO)** | 4 Frames | 140ms per frame | 560ms (Flatten) | Frame 1 (Stagger), Frame 2 (Knees Buckle), Frame 3 (Canvas Falling), Frame 4 (Sprawled Motionless). |
| **Victory Pose** | 4 Frames | 100ms per frame | 400ms (Looping) | Belt Raise / Flex Stance with ambient sparkle particles. |

### 4.3 Sprite Sheet Generation Specs for AI Agents
To generate new or replacement fighter sprite sheets using AI image generation tools (`generate_image`), follow these precise specifications:

- **Canvas Resolution**: 2048 × 2048 pixels (or 1024 × 1024).
- **Grid Layout**: 4 Columns × 2 Rows (8-cell sheet) or 4 Columns × 4 Rows (16-cell sheet).
- **Background**: Solid `#00ff00` Chroma-Key Green for automated background removal.
- **Art Direction**: 16-bit Capcom Arcade Pixel Art, Super Puzzle Fighter II Turbo style, rich HSL colors, crisp black outlines, 2D fighting game character sprite sheet.

#### AI Prompt Template (Example for Adrien Broner):
> *"A 16-bit arcade pixel art sprite sheet of professional boxer Adrien Broner on a solid green #00ff00 background. 4 animation poses from left to right: Cell 1: Philly Shell boxer idle stance with left arm low and right glove at chin; Cell 2: Heavy right hook punch with extended arm and gold glove; Cell 3: Hurt flinch stance with head snapped back; Cell 4: Arms raised victory celebration stance with championship belt. Capcom Super Puzzle Fighter II Turbo pixel art style, high detail, clean outlines."*

#### AI Prompt Template (Example for Deen The Great):
> *"A 16-bit arcade pixel art sprite sheet of champion boxer Deen The Great on a solid green #00ff00 background. 4 animation poses from left to right: Cell 1: High guard boxing stance with cyan blue trunks and red gloves; Cell 2: Fast left jab punch; Cell 3: Hurt reel back pose; Cell 4: Flexing victory pose. Capcom 2D fighting game pixel art style, solid green background."*

---

## 5. UI/UX & Mobile Ergonomics Standards

1. **Touch Control Buttons**:
   - Height: **58px – 70px** minimum touch target.
   - Border Radius: **14px** with inset gold highlights and tactile active press scale (`scale(0.93)`).
   - Ergonomics: Elevated at `bottom: max(calc(env(safe-area-inset-bottom) + 12px), 14px)` to sit naturally in the thumb arc on modern mobile viewports (19.5:9 and 20:9 aspect ratios) without hand strain.
2. **Ring Perspective & In-Ring Grounding**:
   - `.fight-plane` anchored at `top: 7.2%`, `height: clamp(165px, 28vh, 250px)` ([styles.css](file:///C:/Users/admin-beats/OneDrive/Documents/Puzzle-Fighter-Boxing/src/styles.css#L692-L702)).
   - Fighters stand full-length directly on the ring canvas floor mat inside the 4 corner posts and back ropes, with zero puzzle board clipping or overlapping.
3. **Victory Presentation**:
   - On match KO, the game displays a high-resolution AAA digital painting victory portrait card (`broner-hd-victory.jpg` / `deen-hd-victory.jpg`) framed in gold bevel borders with golden ambient lighting (`box-shadow: 0 0 45px rgba(255, 190, 41, 0.48)`), matching the victory presentation of *Street Fighter 6* and *Marvel vs. Capcom*.

---

## 6. Technical Architecture & File Sitemap

```
├── index.html                   # HTML5 Entry Point & Container Layout
├── GDD.md                       # Game Design Document (This File)
├── src/
│   ├── main.ts                  # State Machine, Screen Markup, Web Audio Synth, Event Delegation
│   ├── styles.css               # Design System, Keyframe Animations, Ergonomics Tokens
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

## 7. Execution Rules for AI Agents Recreating or Extending the Game

When an AI coding agent works on this codebase:
1. **Maintain Pure Engine Logic**: All puzzle state transformations in `src/game/puzzle.ts` must remain pure functions. Run `npm run test` before every commit.
2. **Obey Persistent Event Delegation**: All screen interactions and gameplay touch buttons must use container event delegation on `#app` (`pointerdown` / `click`) to prevent dropped taps or audio unlock failures on mobile devices.
3. **Validate Visual Quality with Screenshot Harness**: Run `npm run capture` (`node capture.js`) to refresh playthrough screenshots in `playthrough_review_gallery.md` and visually inspect alignment before submitting work.
