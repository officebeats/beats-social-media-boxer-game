# GAME DESIGN DOCUMENT: RING RUSH - PUZZLE BOXING

**Document Version:** 2.2.0 (Authentic Stream Roster Release Candidate)  
**Lead Game Producer:** Antigravity Studios / Executive Production Team  
**Principal Game Designer:** Lead Competitive Puzzle & Fighting Game Systems Architect  
**Target Platform:** Mobile Web (iOS / Android Modern Viewports 19.5:9 & 20:9) & Desktop Browsers  
**Tech Stack:** TypeScript, Vite, HTML5 Canvas / DOM Hybrid, Web Audio API, Vitest, Playwright  

---

## 1. Executive Summary & Design Pillars

### 1.1 Elevator Pitch
**Ring Rush: Puzzle Boxing** is an arcade versus puzzle-fighter that fuses the head-to-head mechanics of Capcom’s *Super Puzzle Fighter II Turbo* with the viral spectacle of the 2026 Kick warehouse streams ("Locked In-A-Thon" / "Crash Out Boyz") hosted by **Adrien "The Problem" Broner** and **Deen The Great**. Players select from the authentic stream guest roster—including Ryan Garcia, Ray J, N3ON, Blueface, Chrisean Rock, Rampage Jackson, Adin Ross, Charleston White, Antonio Brown, and Floyd Mayweather—dropping, fusing, and detonating gems to trigger punches, counter-attacks, and cinematic SUPER finishers in real time.

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
3. **Authentic 2026 Stream Culture**: Roster strictly features celebrities and viral guests who actually appeared on Adrien Broner & Deen The Great's Kick streams (Ryan Garcia, Ray J, N3ON, Blueface, Chrisean Rock, Rampage Jackson, Adin Ross, Charleston White, AB, Gervonta Davis, Floyd Mayweather).
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
5. **Results Screen**: Match stats breakdown (Max Chain, Total Gems Cleared, Elapsed Time) paired with a high-resolution AAA digital painting victory portrait card.

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
- **Fighter Health Pool**: 900 HP – 1,300 HP depending on character.
- **Single Gem Detonation**: 25 Damage / 1 Counter Gem sent.
- **2×2 Power Gem Detonation**: 180 Damage / 6 Counter Gems sent.
- **3×3 Power Gem Detonation**: 450 Damage / 14 Counter Gems sent.
- **SUPER Finisher**: 500–700 Damage / 5-Row Solid Counter Gem Rain.

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

## 4. Authentic Stream Roster, Balance Matrix & Counter Gem Drop Patterns

Each character represents a real personality from Adrien Broner & Deen The Great's 2026 Kick streams ("Locked In-A-Thon" warehouse marathons & "Crash Out Boyz" stream events).

### 4.1 Counter Gem Drop Patterns (6-Column Matrix)

```
Adrien Broner:     [ Gold | Gold |  Red |  Red | Gold | Gold ]   (Solid Heavy Block)
Deen The Great:    [ Blue | Cyan | Blue | Cyan | Blue | Cyan ]   (Alternating Stair Step)
Ryan Garcia:       [  Red | Cyan | Red  | Cyan | Red  | Cyan ]   (KingRy Flash Cross)
Ray J:             [ Gold | Blue | Gold | Blue | Gold | Blue ]   (Tech Vision Grid)
N3ON:              [ Green| Green| Yellow|Yellow|Green|Green ]   (Twin Spike Columns)
Blueface:          [ Rand | Rand | Rand | Rand | Rand | Rand ]   (Randomized Noise)
Chrisean Rock:     [ Red  | Red  | Red  | Red  | Yellow|Yellow]  (Brawler Front Wall)
Rampage Jackson:   [ Red  | Gold | Red  | Gold | Red  | Gold ]   (MMA Heavy Slam)
Adin Ross:         [ Gold |  Red | Gold |  Red | Gold |  Red ]   (Checkerboard Wealth)
Charleston White:  [ Yellow|Red  | Yellow|Red  | Yellow|Red  ]   (Crash Out Rant Grid)
Walid Sharks:      [  Red | Blue | Green| Yellow| Red| Blue ]   (Full Rainbow Array)
Antonio Brown:     [ Gold | Cyan | Gold | Cyan | Gold | Cyan ]   (AB Business Grid)
Gervonta Davis:    [  Red |  Red |  Red |  Red |  Red |  Red ]   (Monochromatic Wall) [Boss]
Floyd Mayweather:  [ Gold | Gold | Gold | Gold | Gold | Gold ]   (Pure Gold Wall) [Grand Boss]
```

### 4.2 Comprehensive 14-Fighter Balance Matrix (Authentic Stream Roster)

| Fighter | Role / Stream Relation | Health | Move Speed | Attack Multiplier | Super Charge Rate | Passive Ability | Signature SUPER Finisher |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Adrien Broner** | Stream Host / COB | 1,100 HP | 1.0× | 1.25× | 1.0× | **Philly Armor**: Takes 15% fewer Counter Gems. Power Gems deal +30% damage. | **Can't Play With Me Counter**: 600 Damage + 5-Row Solid Red Drop. |
| **Deen The Great** | Stream Host / COB | 950 HP | 1.3× | 1.0× | 1.25× | **Chain Surge**: Chain Multipliers scale 1.5× faster. Soft drops grant +3% Super. | **Misfits Combo Blitz**: 520 Damage + Rapid Alternating Stair Drop. |
| **Ryan Garcia** | Warehouse Guest | 1,050 HP | 1.4× | 1.2× | 1.1× | **KingRy Speed**: Fast drop speed + clearing red gems grants +15% damage burst. | **Flash Left Hook KO**: 620 Damage + KingRy Flash Cross Barrage. |
| **Ray J** | Warehouse Guest | 1,020 HP | 1.05× | 1.1× | 1.25× | **Tech Pitch**: Soft drops generate +2% SUPER meter and convert 1 Counter Gem. | **Raytroniks Overload**: 520 Damage + Gold/Blue Tech Grid Drop. |
| **N3ON** | Stream Collaborator| 900 HP | 1.4× | 0.95× | 1.1× | **Fast Countdown**: Counter Gems dropped onto rival spawn with 3-turn timers instead of 5. | **Twitch Agitation**: 480 Damage + 4-Column Fast Countdown Rain. |
| **Blueface** | Talent Show Guest | 1,050 HP | 0.95× | 1.35× | 0.9× | **Brawl Chaos**: Counter Gems drop in randomized color order to confuse rival planning. | **Thotiana Knockout**: 580 Damage + Randomized Noise Barrage. |
| **Chrisean Rock** | Stream Boxing Guest| 1,080 HP | 1.1× | 1.3× | 0.95× | **Brawling Impulse**: Takes 10% more damage but single gem detonations deal +40% damage. | **South Beach Brawl**: 590 Damage + Heavy Front Wall Drop. |
| **Rampage Jackson**| Warehouse Guest | 1,150 HP | 0.9× | 1.4× | 0.9× | **MMA Slam**: 2×2 Power Gem detonations trigger screen shake and deal +35% damage. | **Slam KO**: 640 Damage + Heavy Gold/Red Slam Barrage. |
| **Adin Ross** | Kick Collab Host | 1,000 HP | 1.1× | 1.0× | 1.4× | **Hype Cash-In**: Soft/Hard drops generate +2% SUPER meter per gem dropped. | **Brand Risk Overload**: 500 Damage + Gold/Red Checkerboard Barrage. |
| **Charleston White**| Stream Rant Guest | 940 HP | 1.35× | 1.15× | 1.2× | **Crash Out Rant**: Clearing 4+ gems forces 1 row of yellow Counter Gems onto opponent. | **Mace & Mic Attack**: 510 Damage + Crash Out Rant Grid Drop. |
| **Walid Sharks** | Deen's Stream Rival | 950 HP | 1.35× | 1.05× | 1.2× | **Reflex Counter**: Clearing gems while taking damage converts 1 incoming Counter Gem into a Crash Gem. | **Flash Counter Uppercut**: 510 Damage + Full Rainbow Array Drop. |
| **Antonio Brown** | Stream Guest (AB) | 1,060 HP | 1.2× | 1.15× | 1.1× | **Business Boomin'**: Hard drops yield +30% score and send +1 Counter Gem. | **84 Catch KO**: 560 Damage + Gold/Cyan Business Grid. |
| **Gervonta Davis** | Boss (AB Mentee) | 1,250 HP | 1.1× | 1.45× | 1.0× | **Knockout Power**: 2×2 Power Gem detonations deal 3× damage and trigger screen shake. | **Tank Upper Cut**: 700 Damage + Solid Monochromatic Red Wall. |
| **Floyd Mayweather**| Grand Boss (50-0) | 1,300 HP | 1.2× | 1.2× | 1.1× | **The Best Ever**: Automatically converts 2 Counter Gems into Normal Gems every 10s. | **TBE 50-0 Masterclass**: 680 Damage + Pure Gold Wall Rain. |

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

---

## 6. UI/UX, Mobile Ergonomics & Visual Production Standards

1. **Touch Control Buttons**:
   - Minimum Button Height: **58px – 70px**.
   - Border Radius: **14px** with gold bevel borders and active scale shrink (`scale(0.93)`).
   - Placement: Elevated at `bottom: max(calc(env(safe-area-inset-bottom) + 12px), 14px)` to fit comfortably in the thumb arc on modern mobile viewports (19.5:9 and 20:9 aspect ratios) without lower hand strain.
2. **In-Ring Fighter Grounding**:
   - `.fight-plane` anchored at `top: 7.2%`, `height: clamp(165px, 28vh, 250px)`.
   - Fighters stand full-length directly on the ring canvas floor mat inside the 4 corner posts and back ropes, with zero puzzle board clipping or overlapping.
3. **Victory Card Presentation**:
   - On match KO, the game displays a high-resolution AAA digital painting victory portrait card framed in gold bevel borders with golden ambient lighting (`box-shadow: 0 0 45px rgba(255, 190, 41, 0.48)`), matching the victory presentation of *Street Fighter 6* and *Marvel vs. Capcom*.

---

## 7. Sound Design & Synthesizer Architecture

The audio engine uses zero external audio files, relying on a custom zero-dependency **Web Audio API Arcade Synthesizer** (`arcadeAudio`):

- **Drop Sound**: Frequency sweep from 320Hz to 120Hz (Sine wave, 80ms duration).
- **Crash Detonation**: Low-frequency explosion noise + square wave burst (60Hz to 240Hz, 300ms duration).
- **Punch Impact SFX**: Hard punch transient synth burst with noise burst (140ms duration).
- **SUPER Charge**: Ascending arpeggio chime (440Hz $\to$ 554Hz $\to$ 659Hz $\to$ 880Hz, 400ms duration).
- **KO Bell**: Dual metallic chime (800Hz & 1200Hz decay bell, 1200ms duration).

---

## 8. Clean Technical Architecture & Sitemap

```
├── GDD.md                       # Master Game Design Document (This File)
├── index.html                   # Clean HTML5 Entry Point & Canvas/DOM Container
├── package.json                 # Modern Lightweight Vite + TypeScript + Vitest Setup
├── vite.config.ts               # Vite Configuration
├── tsconfig.json                # Strict TypeScript Configuration
├── src/
│   ├── main.ts                  # Main Game Loop, Screen State Controller & Event Manager
│   ├── style.css                # Premium Dark Arcade Aesthetics & Responsive Ergonomics
│   ├── engine/
│   │   ├── types.ts             # Core Interfaces (Gems, Board, Fighter, Stats, Attacks)
│   │   ├── puzzle.ts            # Pure Functional Puzzle Matrix Engine & Fusion/Collision Rules
│   │   ├── fighters.ts          # Authentic Stream Roster Registry & Fighter Ability Definitions
│   │   └── audio.ts             # Zero-Dependency Web Audio Synth
│   └── ui/
│       ├── render.ts            # Canvas Dual-Grid Renderer & Particle Visualizer
│       ├── fighters-view.ts     # 12 FPS Arcade Fighter Animation Renderer
│       └── controls.ts          # Touch & Keyboard Delegation Handler
└── test/
    └── puzzle.test.ts           # Vitest Unit Tests for Grid Gravity, Fusion, and Garbage
```
