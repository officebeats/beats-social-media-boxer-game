# GAME DESIGN DOCUMENT: RING RUSH - PUZZLE BOXING

**Document Version:** 2.0.0 (Production Release Candidate)  
**Lead Game Producer:** Antigravity Studios / Executive Production Team  
**Principal Game Designer:** Lead Competitive Puzzle & Fighting Game Systems Architect  
**Target Platform:** Mobile Web (iOS / Android Modern Viewports 19.5:9 & 20:9) & Desktop Browsers  
**Tech Stack:** TypeScript, Vite, HTML5 Canvas / DOM Hybrid, Web Audio API, Vitest, Playwright  

---

## 1. Executive Summary & Design Pillars

### 1.1 Elevator Pitch
**Ring Rush: Puzzle Boxing** is an arcade versus puzzle-fighter that fuses the head-to-head mechanics of Capcom’s *Super Puzzle Fighter II Turbo* with the viral spectacle of modern influencer and championship boxing. Players select from featured boxers—including Adrien "The Problem" Broner and Deen The Great—dropping, fusing, and detonating gems to trigger punches, counter-attacks, and cinematic SUPER finishers in real time.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CORE GAMEPLAY LOOP                                 │
│                                                                                 │
│  [ Falling Pair ] ──> [ Grid Gravity ] ──> [ Power Fusion / Crash Detonation ] │
│         │                                                  │                    │
│         ▼                                                  ▼                    │
│  [ Input Controls ]                                [ Garbage Cascade Sent ]     │
│  (Left, Right, Rotate, Drop)                              │                    │
│                                                           ▼                    │
│                                            [ Ring Fighter Attack Visualizer ]   │
│                                            (Jab, Hook, Uppercut, SUPER KO)      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Core Design Pillars
1. **Super Puzzle Fighter II Parity**: Faithful reproduction of classic 6×12 puzzle grid mechanics—including candidate pair rotations, 2×2+ Power Gem fusion, glowing Crash Orb detonations, and character-specific Counter Gem drop patterns.
2. **Tactile Arcade Boxing Impact**: Real-time combat visualizer linking puzzle actions directly to animated 16-bit fighter stances, hit spark directional flashes, screen shake impulse curves, and synth punch audio.
3. **Viral Boxing Culture**: Authentic roster inspired by championship boxing and high-profile stream boxing events (Adrien Broner, Deen The Great, Adin Ross, N3ON, Blueface, Gervonta Davis, Floyd Mayweather).
4. **Sub-100ms Mobile Ergonomics**: Built specifically for modern mobile screens (iPhone 16 Pro, Galaxy S24) with 58px+ touch targets, safe-area inset compliance, and persistent container event delegation.

---

## 2. System Architecture & Game Loops

### 2.1 Macro Metagame Loop
```
[ Title Faceoff & Sparring ] ──> [ Symmetrical Character Select ]
                                                │
[ Victory KO / HD AAA Card ] <── [ Match End ] <── [ Active Dual-Grid Battle ]
```

1. **Title Screen**: Continuous 12 FPS shadow-boxing sparring animation between Broner and Deen, synth audio toggle, and gold bevel arcade typography.
2. **Fighter Select Screen**: Symmetrical selection cards displaying fighter attributes (Power, Speed, Counter Resilience, Super Rate), signature stance previews, and locked boss slots.
3. **Match Intro**: Round 1 call sequence (`ROUND 1` / `FIGHT!`) with dynamic arena lighting and audio engine initialization.
4. **Active Match**: Real-time dual-grid puzzle battle with player vs. AI or rival.
5. **Results Screen**: Match stats breakdown (Max Chain, Total Gems Cleared, Elapsed Time) paired with a high-resolution AAA digital painting victory portrait card (`broner-hd-victory.jpg` / `deen-hd-victory.jpg`).

---

## 3. Complete Puzzle Engine & Combat Math Specification

### 3.1 Grid Architecture & Collision Math
- **Grid Size**: 6 Columns × 12 Rows per player board.
- **Spawn Coordinates**: Falling pair spawns at `y=0` (Pivot Gem) and `y=1` (Satellite Gem), matching the vertical `NEXT` preview box 1:1.
- **Rotation Engine**: 90-degree clockwise rotation around the pivot gem. Includes 1-cell horizontal wall-kick allowance if rotation is blocked by a wall or occupied cell.
- **Gravity Acceleration**:
  - Passive Drop Speed: 1 row per 800ms (Level 1) down to 200ms (Level 10).
  - Soft Drop / Hard Drop: Instant downward raycast to lowest available solid row.

### 3.2 Gem Classification & Mechanics Matrix
| Gem Type | Visual Identifier | Collision & Engine Logic |
| :--- | :--- | :--- |
| **Normal Gem** | Faceted Jewel (Red, Blue, Green, Yellow) | Standard building block. Stacks vertically and horizontally. Forms Power Gems when matching solid rectangles. |
| **Crash Gem** | Glowing Orb Core | Detonates upon settling adjacent (top, bottom, left, right) to any matching-color Normal or Power Gem. |
| **Power Gem** | Fused Multi-Cell Gem (2×2, 2×3, 3×3, 4×4) | Merges automatically when 4+ matching normal gems form solid rectangular blocks. Detonation yields 2.5× attack damage. |
| **Counter Gem** | Timed Countdown Badge (`5` $\to$ `0`) | Sent to rival's board upon taking damage. Displays underlying gem color. Decrements each turn; turns into Normal Gem at `0`. Cannot be detonated by Crash Gems until timer reaches `0`. |

### 3.3 Complete Attack & Damage Formulas

#### Base Health & Damage Table
- **Fighter Health Pool**: 1,000 HP per fighter.
- **Single Gem Detonation**: 25 Damage / 1 Counter Gem sent.
- **2×2 Power Gem Detonation**: 180 Damage / 6 Counter Gems sent.
- **3×3 Power Gem Detonation**: 450 Damage / 14 Counter Gems sent.
- **SUPER Finisher**: 600 Damage / 5-Row Solid Counter Gem Rain.

#### Garbage Attack Formula
$$\text{Counter Gems Sent} = \left\lfloor \left( (\text{Cleared Gems} \times 0.75) + \text{Power Gem Bonus} \right) \times \text{Chain Multiplier} \right\rfloor$$

Where:
- **Power Gem Bonus**: $+4$ for 2×2, $+10$ for 3×3, $+18$ for 4×4.
- **Chain Multipliers**:
  - Chain 1 (Single Detonation): **1.0×**
  - Chain 2 (First Cascade): **1.5×**
  - Chain 3 (Second Cascade): **2.2×**
  - Chain 4+ (Triple+ Cascade): **3.5×**

---

## 4. Roster Balance Matrix & Counter Gem Drop Patterns

Each character is engineered with distinct stat biases, passive perks, active SUPER finishers, and unique 6-column Counter Gem drop patterns (identical to *Super Puzzle Fighter II Turbo* character balance!).

```
                          COUNTER GEM DROP PATTERNS (6-COL MATRIX)

Adrien Broner:     [ Gold | Gold |  Red |  Red | Gold | Gold ]   (Solid Heavy Block)
Deen The Great:    [ Blue | Cyan | Blue | Cyan | Blue | Cyan ]   (Alternating Stair Step)
Adin Ross:         [ Gold |  Red | Gold |  Red | Gold |  Red ]   (Checkerboard Wealth)
N3ON:              [ Green| Green| Yellow|Yellow|Green|Green ]   (Twin Spike Columns)
Blueface:          [ Rand | Rand | Rand | Rand | Rand | Rand ]   (Randomized Noise)
Walid Sharks:      [  Red | Blue | Green| Yellow| Red| Blue ]   (Full Rainbow Array)
Gervonta Davis:    [  Red |  Red |  Red |  Red |  Red |  Red ]   (Monochromatic Wall)
Floyd Mayweather:  [ Gold | Gold | Gold | Gold | Gold | Gold ]   (Pure Gold Wall)
```

### 4.1 Character Balance Matrix

| Fighter | Health | Move Speed | Attack Multiplier | Super Charge Rate | Passive Ability | Signature SUPER Finisher |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Adrien Broner** | 1,100 HP | 1.0× | 1.25× | 1.0× | **Philly Armor**: Takes 15% fewer Counter Gems. Power Gems deal +30% damage. | **Can't Play With Me Counter**: 600 Damage + 5-Row Solid Red Drop. |
| **Deen The Great** | 950 HP | 1.3× | 1.0× | 1.25× | **Chain Surge**: Chain Multipliers scale 1.5× faster. Soft drops grant +3% Super. | **Misfits Combo Blitz**: 520 Damage + Rapid Alternating Stair Drop. |
| **Adin Ross** | 1,000 HP | 1.1× | 1.0× | 1.4× | **Hype Cash-In**: Soft/Hard drops generate +2% SUPER meter per gem dropped. | **Brand Risk Overload**: 500 Damage + Gold/Red Checkerboard Barrage. |
| **N3ON** | 900 HP | 1.4× | 0.95× | 1.1× | **Fast Countdown**: Counter Gems dropped onto rival spawn with 3-turn timers instead of 5. | **Twitch Agitation**: 480 Damage + 4-Column Fast Countdown Rain. |
| **Blueface** | 1,050 HP | 0.95× | 1.35× | 0.9× | **Brawl Chaos**: Counter Gems drop in randomized color order to confuse rival planning. | **Thotiana Knockout**: 580 Damage + Randomized Noise Barrage. |
| **Walid Sharks** | 950 HP | 1.35× | 1.05× | 1.2× | **Reflex Counter**: Clearing gems while taking damage converts 1 incoming Counter Gem into a Crash Gem. | **Flash Counter Uppercut**: 510 Damage + Full Rainbow Array Drop. |
| **Gervonta Davis** *(Boss)* | 1,250 HP | 1.1× | 1.45× | 1.0× | **Knockout Power**: 2×2 Power Gem detonations deal 3× damage and trigger screen shake. | **Tank Upper Cut**: 700 Damage + Solid Monochromatic Red Wall. |
| **Floyd Mayweather** *(Boss)* | 1,300 HP | 1.2× | 1.2× | 1.1× | **The Best Ever**: Automatically converts 2 Counter Gems into Normal Gems every 10s. | **TBE 50-0 Masterclass**: 680 Damage + Pure Gold Wall Rain. |

---

## 5. Fighter Move Visualizer & Animation Timing Specs

### 5.1 Real-Time Combat Visualizer Engine
Every puzzle event maps directly to real-time fighting animations in the arena background:

```
[ PUZZLE ENGINE EVENT ]             [ ARENA COMBAT VISUALIZER ACTION ]
─────────────────────────────────────────────────────────────────────────────────────
Idle Stance                 ──>     Continuous Animated Stance (Philly Roll / High Guard Bounce)
1-2 Gem Clear               ──>     Light Left Jab + Jab SFX
3-5 Gem Clear               ──>     Heavy Right Hook + Directional Hit Spark Overlay on Rival
2×2 Power Gem Detonation    ──>     Signature Uppercut / Overhand + Screen Shake + Impact Flash
Chain Combo (Chain 2+)      ──>     Flurry Combination (Jab-Cross-Hook) + Floating Combo Copy
SUPER Meter Ready (100%)    ──>     Golden Super Aura Glow (@keyframes super-ready)
SUPER Button Tapped         ──>     Cinematic Finisher Punch + 5-Row Counter Gem Rain
Counter Gems Received       ──>     Hurt Flinch / Head Snap Back Animation
Match KO                    ──>     Knockdown Flatten Animation + KO Bell + HD Victory Card
```

### 5.2 Capcom 12/15 FPS Arcade Animation Timing Matrix
To capture the exact snappy, weighted 2D arcade feel of Capcom's *Super Puzzle Fighter II Turbo*:

- **Render Loop vs. Animation Step Rate**: The application renders at **60 FPS**, while character sprite sheet animations execute at a discrete **12 FPS – 15 FPS step rate** (**80ms – 100ms per step**).
- **CSS Step Functions**: Sprite keyframe animations MUST use discrete step timing (`animation-timing-function: steps(N)`) so transitions tick crisply between frames with **zero linear interpolation blur**.

#### Frame Breakdown & Step Timing Matrix
| Move State | Total Frames | Step Duration per Frame | Total Cycle Time | Motion Style & Keyframe Rules |
| :--- | :--- | :--- | :--- | :--- |
| **Idle Stance** | 4 Frames | 90ms | 360ms (Looping) | **Philly Roll / Bounce**: Frame 1 (Neutral), Frame 2 (Shoulder Step 1), Frame 3 (Peak Roll), Frame 4 (Relax Step 2). |
| **Light Jab** | 3 Frames | 60ms / 120ms / 80ms | 260ms (Snappy) | Frame 1 (Windup), Frame 2 (Full Extension Contact + Hit Spark), Frame 3 (Guard Reset). |
| **Heavy Counter** | 5 Frames | 80ms / 100ms / 140ms / 100ms / 80ms | 500ms (Heavy Weight) | Frame 1 (Crouch Windup), Frame 2 (Explosive Rise), Frame 3 (Peak Impact + Flash Screen Shake), Frame 4 (Apex Follow-through), Frame 5 (Reset). |
| **SUPER Finisher** | 8 Frames | 80ms per frame | 640ms (Flurry) | Rapid 4-punch flurry (Jab $\to$ Cross $\to$ Hook $\to$ Uppercut $\to$ Victory Pose). |
| **Hurt Flinch** | 3 Frames | 120ms / 100ms / 80ms | 300ms (Recoil) | Frame 1 (Head Snap Back), Frame 2 (Peak Recoil), Frame 3 (Guard Reset). |
| **Knockout (KO)** | 4 Frames | 140ms per frame | 560ms (Flatten) | Frame 1 (Stagger), Frame 2 (Knees Buckle), Frame 3 (Canvas Falling), Frame 4 (Sprawled Motionless). |
| **Victory Pose** | 4 Frames | 100ms per frame | 400ms (Looping) | Belt Raise / Flex Stance with ambient sparkle particles. |

### 5.3 AI Sprite Sheet Generation Guidelines
To generate new or replacement fighter sprite sheets using AI image generation tools (`generate_image`), follow these precise specifications:

- **Canvas Resolution**: 2048 × 2048 pixels (or 1024 × 1024).
- **Grid Layout**: 4 Columns × 2 Rows (8-cell sheet) or 4 Columns × 4 Rows (16-cell sheet).
- **Background**: Solid `#00ff00` Chroma-Key Green for automated background removal.
- **Art Direction Style**: 16-bit Capcom Arcade Pixel Art, Super Puzzle Fighter II Turbo style, rich HSL colors, crisp black outlines, 2D fighting game character sprite sheet.

#### Production Prompt Template (Adrien Broner):
> *"A 16-bit arcade pixel art sprite sheet of professional boxer Adrien Broner on a solid green #00ff00 background. 4 animation poses from left to right: Cell 1: Philly Shell boxer idle stance with left arm low and right glove at chin; Cell 2: Heavy right hook punch with extended arm and gold glove; Cell 3: Hurt flinch stance with head snapped back; Cell 4: Arms raised victory celebration stance with championship belt. Capcom Super Puzzle Fighter II Turbo pixel art style, high detail, clean outlines."*

---

## 6. UI/UX, Mobile Ergonomics & Visual Production Standards

1. **Touch Control Buttons**:
   - Minimum Button Height: **58px – 70px**.
   - Border Radius: **14px** with gold bevel borders and active scale shrink (`scale(0.93)`).
   - Placement: Elevated at `bottom: max(calc(env(safe-area-inset-bottom) + 12px), 14px)` to fit comfortably in the thumb arc on modern mobile viewports (19.5:9 and 20:9 aspect ratios) without lower hand strain.
2. **In-Ring Fighter Grounding**:
   - `.fight-plane` anchored at `top: 7.2%`, `height: clamp(165px, 28vh, 250px)` ([styles.css](file:///C:/Users/admin-beats/OneDrive/Documents/Puzzle-Fighter-Boxing/src/styles.css#L692-L702)).
   - Fighters stand full-length directly on the ring canvas floor mat inside the 4 corner posts and back ropes, with zero puzzle board clipping or overlapping.
3. **Victory Card Presentation**:
   - On match KO, the game displays a high-resolution AAA digital painting victory portrait card (`broner-hd-victory.jpg` / `deen-hd-victory.jpg`) framed in gold bevel borders with golden ambient lighting (`box-shadow: 0 0 45px rgba(255, 190, 41, 0.48)`), matching the victory presentation of *Street Fighter 6* and *Marvel vs. Capcom*.

---

## 7. Sound Design & Synthesizer Architecture

The audio engine uses zero external audio files, relying on a custom zero-dependency **Web Audio API Arcade Synthesizer** (`arcadeAudio` in `src/main.ts`):

- **Drop Sound**: Frequency sweep from 320Hz to 120Hz (Sine wave, 80ms duration).
- **Crash Detonation**: Low-frequency explosion noise + square wave burst (60Hz to 240Hz, 300ms duration).
- **Punch Impact SFX**: Hard punch transient synth burst with noise burst (140ms duration).
- **SUPER Charge**: Ascending arpeggio chime (440Hz $\to$ 554Hz $\to$ 659Hz $\to$ 880Hz, 400ms duration).
- **KO Bell**: Dual metallic chime (800Hz & 1200Hz decay bell, 1200ms duration).

---

## 8. Technical Architecture & Sitemap

```
├── index.html                   # HTML5 Entry Point & Root Container
├── GDD.md                       # Master Game Design Document (This File)
├── src/
│   ├── main.ts                  # State Machine, Screen Renderers, Web Audio Synth, Event Delegation
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

## 9. Production Roadmap & AI Coding Agent Guidelines

### 9.1 Milestone Timeline
- [x] **Milestone 1 (Pre-Alpha Vertical Slice)**: 6×12 grid, candidate pair rotation, gravity, 2×2 Power Gem fusion, Crash Gem detonation, Web Audio synth, Broner & Deen stances.
- [x] **Milestone 2 (Ergonomics & Visual Polish)**: 58px+ mobile touch controls, safe-area compliance, HD AAA victory portrait cards, in-ring canvas grounding.
- [ ] **Milestone 3 (Roster Expansion)**: Implement Adin Ross, N3ON, Blueface, and Walid Sharks with custom Counter Gem drop patterns and character abilities.
- [ ] **Milestone 4 (Multiplayer Netcode)**: Real-time WebSockets peer-to-peer online versus mode with matchmaking lobby.

### 9.2 Execution Directives for AI Agents
1. **Maintain Pure Engine Logic**: All puzzle state transformations in `src/game/puzzle.ts` MUST remain pure functions. Always run `npm run test` before committing code.
2. **Enforce Container Event Delegation**: All screen interactions and gameplay buttons MUST use persistent container delegation on `#app` for `pointerdown` and `click` to prevent dropped taps or mobile audio lockouts.
3. **Automated Visual Verification**: Run `npm run capture` (`node capture.js`) to generate fresh playthrough screenshots in `playthrough_review_gallery.md` and visually inspect alignment before submitting work.
