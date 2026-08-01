# GAME DESIGN DOCUMENT: RING RUSH — PUZZLE BOXING

**Document Version:** 3.0.0 (AAA Production Standard — Viral Release Candidate)  
**Studio:** Antigravity Studios — Executive Production Division  
**Lead Game Producer:** AAA Competitive Game Systems Producer  
**Principal Game Designer:** Senior Puzzle-Fighter & 2D Combat Systems Architect  
**Art Director:** Pixel Art & UI/UX Visual Production Lead  
**Target Platform:** Mobile Web (iOS Safari / Android Chrome) & Desktop Browsers  
**Aspect Ratios:** 19.5:9 (iPhone 16 Pro), 20:9 (Galaxy S24), 16:9 (Desktop)  
**Tech Stack:** TypeScript, Vite, HTML5 Canvas (layered multi-canvas), Web Audio API, Vitest, Playwright  
**Target FPS:** 60 FPS render / 12 FPS sprite step rate  

---

## 1. EXECUTIVE SUMMARY & DESIGN PILLARS

### 1.1 Elevator Pitch

**Ring Rush: Puzzle Boxing** is a fast-session arcade versus puzzle-fighter that fuses the head-to-head mechanics of Capcom's *Super Puzzle Fighter II Turbo* with the viral spectacle of the 2026 Kick warehouse streams ("Locked In-A-Thon" / "Crash Out Boyz") hosted by **Adrien "The Problem" Broner** and **Deen The Great**. Players choose from 14 celebrity fighters — all real guests from the Broner & Deen streams — then drop, fuse, and detonate gems to trigger real-time punches, counter-attacks, and cinematic SUPER finishers against a parallax-scrolling 3-layer boxing arena rendered entirely inside a stacked HTML5 Canvas system.

### 1.2 Why This Goes Viral

| Viral Lever | Mechanic |
| :--- | :--- |
| **Celebrity Recognition** | 14 real, recognizable public figures that stream audiences already follow. |
| **Clip-Worthy Moments** | SUPER finisher cinematics with screen-freeze, flash, and KO bell create 15-second social media clips. |
| **"One More Match" Loop** | Average match length: 60–90 seconds. Instant restart. No loading screens. |
| **Share & Challenge** | Post-match screen generates a shareable fight card image (winner name, stats, time) with deep-link rematch URL. |
| **Boss Unlocks** | Gervonta Davis and Floyd Mayweather are locked bosses — beat them on Hard AI to unlock, fueling progression talk. |
| **Mobile-Native** | Zero install. Tap a link, play instantly. No app store friction. |

### 1.3 Core Design Pillars

1. **Super Puzzle Fighter II Turbo Parity** — Faithful 6×12 grid, candidate pair rotation with wall-kicks, 2×2+ Power Gem fusion, Crash Orb color-match detonations, character-specific Counter Gem drop patterns, and cascading chain combos.
2. **Tactile Arcade Boxing Impact** — Every puzzle event triggers a visible, audible, *felt* response: directional hit sparks, per-pixel screen shake with exponential decay curves, synth punch audio, and a parallax arena that reacts to combat.
3. **Authentic 2026 Stream Culture** — Roster strictly features celebrities who actually appeared on the Adrien Broner & Deen The Great Kick streams in 2026.
4. **Sub-100ms Mobile Ergonomics** — 58px+ touch targets, safe-area inset compliance, persistent container event delegation, and zero dropped taps on iOS Safari.

---

## 2. VISUAL PRODUCTION SYSTEM — ARENA, PARALLAX & SPRITE ARCHITECTURE

This section defines the exact rendering pipeline that makes the game look and feel like a premium arcade title inside a web browser. Every element described here is designed to be implementable with `<canvas>` layers and CSS.

### 2.1 Stacked Multi-Canvas Architecture

The game renders using **4 stacked HTML5 canvas elements** (plus DOM overlays for UI) layered via CSS `position: absolute` inside a single `#arena-viewport` container. Each canvas has a distinct role and update frequency to maximize visual depth while minimizing overdraw.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Z-INDEX STACK (bottom to top)                                         │
│                                                                        │
│  [z:0]  CANVAS: bg-far      — Crowd & venue (parallax 0.15×)          │
│  [z:1]  CANVAS: bg-mid      — Ring ropes, posts, floor (parallax 0.5×)│
│  [z:2]  CANVAS: fighters    — Fighter sprites, hit sparks, particles   │
│  [z:3]  CANVAS: puzzle-left — P1 6×12 gem grid + falling pair          │
│  [z:3]  CANVAS: puzzle-right— P2 6×12 gem grid + falling pair          │
│  [z:4]  DOM:    hud-overlay  — HP bars, SUPER meter, combo counter,    │
│                                timer, touch controls                   │
│  [z:5]  DOM:    modal-layer  — Round intro, SUPER cinematic, KO card   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Three-Layer Parallax Arena System

The boxing arena is composed of three visual depth layers that shift horizontally in response to the **attacker-defender momentum axis**. When Player 1 lands attacks, the "camera" drifts subtly toward Player 2 (and vice versa), creating the illusion of the fight moving across the ring. All movement is horizontal only, producing a clean 2D "camera pan" effect.

#### Layer Definitions

| Layer | Canvas ID | Depth | Parallax Speed | Content | Redraw Frequency |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Far Background** | `bg-far` | Deepest | `0.15× camera` | Dark arena venue — upper balcony crowd silhouettes, overhead spotlights, haze glow, hanging banners. Rendered as a single wide bitmap (2048px or 3072px wide) tiled horizontally. | Redrawn only on camera drift (≤10×/sec). |
| **Mid Ring** | `bg-mid` | Middle | `0.5× camera` | Boxing ring floor (canvas mat with logo), corner posts (4 visible), top and bottom ropes (3 ropes each), ring apron skirt, and floor shadow gradients. Perspective achieved via **per-row horizontal scaling** (wider rows at bottom, narrower at top) to simulate a 3/4 top-down view. | Redrawn only on camera drift. |
| **Fighter Plane** | `fighters` | Foreground | `1.0× camera` | Both fighter sprites, hit spark overlays, floating combo text, SUPER aura particles, and knockdown animations. Fighters are drawn at full camera speed so they feel grounded on the ring mat. | Redrawn every frame (60 FPS). |

#### Camera Drift Behavior

```
Camera X Offset = lerp(currentOffset, targetOffset, 0.08)

Where:
  - targetOffset shifts +30px toward P2 when P1 attacks
  - targetOffset shifts -30px toward P1 when P2 attacks
  - targetOffset decays to 0 (center) during idle periods (no attacks for 1.5s)
  - Maximum drift range: ±60px from center
```

The parallax multipliers mean: when the camera drifts 30px right, `bg-far` moves 4.5px, `bg-mid` moves 15px, and fighters move the full 30px. This creates a convincing depth separation with minimal computation.

#### Per-Row Ring Floor Perspective

To achieve the 3/4 perspective "looking slightly down at the ring" without any 3D math, the mid-layer ring floor uses **per-row horizontal scaling**:

```
For each scanline Y from ringTopY to ringBottomY:
    progress     = (Y - ringTopY) / (ringBottomY - ringTopY)    // 0.0 at top → 1.0 at bottom
    scaleX       = lerp(0.72, 1.0, progress)                    // narrower at top, full width at bottom
    sourceWidth  = ringTextureWidth
    destWidth    = sourceWidth * scaleX
    destX        = (canvasWidth - destWidth) / 2                 // center each scaled row

    ctx.drawImage(ringTexture,
        0, Y - ringTopY, sourceWidth, 1,                        // source: 1px-tall horizontal strip
        destX, Y, destWidth, 1                                   // dest: scaled strip centered
    )
```

This technique (identical to SNES Mode 7 / CPS-2 row-scroll) renders at ≤0.5ms per frame because it only runs on the `bg-mid` canvas, which redraws infrequently.

### 2.3 Arena Visual Asset Specifications

Each arena layer is a pre-rendered bitmap asset. Below are the exact generation specifications for AI image tools (`generate_image`) or manual pixel art.

| Asset | Filename | Dimensions | Format | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Far Crowd Panorama** | `arena-far.png` | 3072 × 512 px | PNG-24 | Dark arena venue panorama. Upper deck crowd silhouettes (black/dark purple shapes), overhead spotlights casting volumetric cone beams downward, subtle haze/fog gradients, hanging championship banners. Color palette: deep blacks (#0a0a12), midnight purples (#1a1030), amber spotlight cones (#fbbf24 at 15% opacity). Wraps horizontally for seamless tiling. |
| **Ring Mid Layer** | `arena-mid.png` | 2048 × 400 px | PNG-32 (alpha) | Boxing ring viewed from 3/4 perspective. White canvas mat floor with center logo circle, 4 red corner post cushions, 3 horizontal ropes on each side (top and bottom), ring apron skirt (dark blue with gold trim). Floor shadow gradient darkening toward edges. Transparent above and below ring geometry for compositing. |
| **Ring Floor Texture** | `ring-floor.png` | 1024 × 256 px | PNG-24 | Flat top-down ring canvas mat texture for per-row perspective warping. White/cream canvas with subtle weave texture, center circle marking, corner markings. Used as source for the scanline-by-scanline perspective draw. |

### 2.4 Fighter Sprite Sheet Specification

Each fighter is a single PNG sprite sheet containing all animation states. Sprites are drawn in **chibi / super-deformed 16-bit arcade pixel art** style (large head ≈40% of body height, stocky proportions, bold black outlines, rich HSL saturated fills) to match the *Super Puzzle Fighter II Turbo* aesthetic.

#### Sprite Sheet Grid Layout

Each sheet is a **1024 × 1024 px** PNG organized as an **8-column × 4-row grid** (32 cells total), where each cell is **128 × 256 px** (width × height). The fighter faces RIGHT by default; the P2 version is drawn by flipping the canvas horizontally (`ctx.scale(-1, 1)`).

```
┌──────────────────────────────────────────────────────────────────────┐
│  SPRITE SHEET GRID  (1024 × 1024 px)  —  8 cols × 4 rows           │
│  Each cell: 128 × 256 px                                            │
│                                                                      │
│  Row 0:  IDLE (4 frames)          | GUARD (2 frames) | TAUNT (2)   │
│  Row 1:  JAB (3 frames)           | HOOK (3 frames)  | unused (2)  │
│  Row 2:  UPPERCUT (4 frames)      | SUPER (4 frames)               │
│  Row 3:  FLINCH (3 frames)        | KO FALL (3 frames)| WIN (2)    │
└──────────────────────────────────────────────────────────────────────┘
```

#### Cell Map Reference

| Row | Col 0 | Col 1 | Col 2 | Col 3 | Col 4 | Col 5 | Col 6 | Col 7 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0** | Idle 1 | Idle 2 | Idle 3 | Idle 4 | Guard 1 | Guard 2 | Taunt 1 | Taunt 2 |
| **1** | Jab 1 (windup) | Jab 2 (extend) | Jab 3 (reset) | Hook 1 (wind) | Hook 2 (swing) | Hook 3 (follow) | — | — |
| **2** | Upper 1 | Upper 2 | Upper 3 | Upper 4 | Super 1 | Super 2 | Super 3 | Super 4 |
| **3** | Flinch 1 | Flinch 2 | Flinch 3 | KO 1 (stagger) | KO 2 (buckle) | KO 3 (fall) | Win 1 | Win 2 |

#### AI Sprite Sheet Generation Prompt Template

> *"A 1024x1024 pixel sprite sheet on a solid magenta #FF00FF chroma-key background. 8 columns by 4 rows, each cell 128x256 pixels. 16-bit Capcom arcade chibi pixel art of [FIGHTER NAME]: [BRIEF VISUAL DESCRIPTION — skin tone, hair, outfit, gloves color]. Row 0: idle boxing stance (4 frames of subtle weight-shift bounce), guard pose (2 frames), taunt (2 frames). Row 1: left jab (3 frames — windup/extend/reset), right hook (3 frames — wind/swing/follow). Row 2: uppercut (4 frames — crouch/rise/peak/land), super attack (4 frames — windup/flash/strike/pose). Row 3: hurt flinch (3 frames — snap back/recoil/recover), knockout fall (3 frames — stagger/buckle/flat), victory celebration (2 frames — arms raised/flex). Super Puzzle Fighter II Turbo art style, crisp black outlines, rich saturated colors, expressive chibi proportions."*

#### Per-Fighter Visual Descriptions (for sprite generation)

| Fighter | Visual Description for Sprite Prompt |
| :--- | :--- |
| **Adrien Broner** | Medium-brown skin, short fade haircut, gold chains around neck, red trunks with gold trim, gold boxing gloves. Signature Philly Shell stance (lead hand low, rear glove at chin). |
| **Deen The Great** | Light-brown skin, black buzzcut, blue trunks with white trim, cyan boxing gloves, lean muscular build. High guard southpaw stance. |
| **Ryan Garcia** | Light olive skin, slicked-back dark hair, white trunks with red trim, red gloves, visible tattoo sleeves. Orthodox stance. |
| **Ray J** | Medium-brown skin, short waves haircut, gold trunks with blue trim, blue gloves, designer sunglasses on forehead. Relaxed orthodox stance. |
| **N3ON** | Light skin, blonde messy hair, neon green trunks with yellow trim, green gloves, slim build. Hyperactive bouncing stance. |
| **Blueface** | Dark-brown skin, short dreads with blue tips, blue trunks, blue gloves, face tattoos (simplified pixel pattern). Wide brawler stance. |
| **Chrisean Rock** | Medium-brown skin, long braids, pink sports bra top and pink trunks, yellow gloves, face tattoo dots. Aggressive forward-leaning stance. |
| **Rampage Jackson** | Dark-brown skin, bald head, red MMA shorts with gold pattern, red gloves, extremely muscular build. Wide MMA power stance. |
| **Adin Ross** | Light skin, dark curly hair, purple trunks with gold trim, red gloves, lean build. Tentative upright stance. |
| **Charleston White** | Medium-brown skin, bald head, yellow trunks with red stripe, red gloves, average build, gold chain. Animated loose stance. |
| **Walid Sharks** | Olive skin, dark short hair, cyan trunks with pink trim, blue gloves, athletic build. Fast orthodox counter-stance. |
| **Antonio Brown** | Dark-brown skin, platinum blonde mohawk, gold trunks with cyan trim, gold gloves, muscular NFL build. Confident showboat stance. |
| **Gervonta Davis** | Dark-brown skin, short dreads, all-red trunks and red gloves, compact powerful build, championship belt around waist. Explosive southpaw stance. |
| **Floyd Mayweather** | Medium-brown skin, short hair, all-gold trunks and gold gloves, lean defined build, TMT logo on trunks. Perfect Philly Shell defensive posture. |

### 2.5 Gem Sprite Sheet Specification

All gem types are contained in a single **256 × 64 px** sprite sheet:

```
┌────────────────────────────────────────────────────────┐
│  GEM SPRITE SHEET  (256 × 64 px)  —  8 cols × 2 rows  │
│  Each cell: 32 × 32 px                                 │
│                                                        │
│  Row 0 (Normal Gems):  Red | Blue | Green | Yellow     │
│  Row 0 (Crash Gems):   Red | Blue | Green | Yellow     │
│  Row 1 (Power border): Gold fused border tile          │
│  Row 1 (Counter Gem):  Gray shield + countdown overlay │
│  Row 1 (Detonation):   4-frame explosion particle      │
└────────────────────────────────────────────────────────┘
```

- **Normal Gems**: Faceted jewel with inner bevel highlight and 1px black outline.
- **Crash Gems**: Glowing radial gradient orb with pulsing 2-frame animation (alternate between bright core and dim core every 500ms).
- **Power Gem Border**: Gold/amber fused border tile drawn around merged 2×2+ blocks.
- **Counter Gem Overlay**: Semi-transparent gray shield drawn over the gem color, with white bold countdown number rendered via `ctx.fillText()`.

### 2.6 Particle & VFX System

All VFX are procedurally generated on the `fighters` canvas — zero external assets needed.

| Effect | Trigger | Implementation |
| :--- | :--- | :--- |
| **Hit Spark** | Any attack lands | 8–12 small white/yellow squares spawned at impact point, velocities fanning outward in a 90° cone toward the defender. Each particle shrinks over 200ms then dies. |
| **Screen Shake** | Power Gem detonation, SUPER, KO | Offset the entire `#arena-viewport` container via `transform: translate(shakeX, shakeY)`. Shake magnitude starts at ±8px, decays exponentially: `magnitude *= 0.85` per frame. Duration: 300ms. |
| **SUPER Aura** | SUPER meter hits 100% | Golden particle fountain rising from fighter sprite. 20 particles per second, each a 4px gold square with upward velocity + random horizontal drift, fading alpha over 800ms. Loops until SUPER is used. |
| **Chain Combo Text** | Chain 2+ cascade | Floating text ("CHAIN ×2!", "CHAIN ×3!") appears above puzzle board, rises 40px over 600ms with `ease-out`, scales from 1.0→1.4→1.0 (bounce), then fades. Gold color, Teko font, 28px. |
| **KO Flash** | Match end | Full-screen white overlay at 80% opacity, fades to 0% over 400ms. Triggers simultaneously with KO bell audio. |
| **Gem Detonation Burst** | Crash Gem explodes | 6 colored fragments (matching gem color) burst radially from the detonated cell position. Each fragment is a 6px square that travels 40px outward and fades over 250ms. |

---

## 3. GAME FLOW & SCREEN ARCHITECTURE

### 3.1 Complete Screen Flow State Machine

```
                    ┌───────────────────┐
                    │                   │
                    ▼                   │
              ┌──────────┐             │
              │  TITLE   │──(START)──▶┌──────────────┐
              │  SCREEN  │            │  CHARACTER   │
              └──────────┘            │  SELECT      │
                    ▲                 └──────┬───────┘
                    │                        │ (CONFIRM)
              (PLAY AGAIN)                   ▼
                    │                 ┌──────────────┐
              ┌──────────┐           │  ROUND INTRO │
              │ RESULTS  │◀──(KO)──  │  "ROUND 1"   │
              │ SCREEN   │           │  "FIGHT!"    │
              └──────────┘           └──────┬───────┘
                                            │
                                            ▼
                                     ┌─────────────┐
                                     │   ACTIVE    │
                                     │   BATTLE    │──(SUPER)──▶ [ SUPER CINEMATIC ]
                                     │   (60 FPS)  │◀───────────
                                     └─────────────┘
```

### 3.2 Screen Specifications

#### Title Screen
- **Background**: Parallax arena at rest (centered camera, no drift), spotlights slowly oscillating color temperature.
- **Fighter Preview**: Broner (left) and Deen (right) in continuous 4-frame idle stance animations on the ring floor.
- **Typography**: "RING RUSH" in Teko 900 weight, 72px, gold (#fbbf24) with 3px text-stroke black and `text-shadow: 0 0 30px rgba(251, 191, 36, 0.6)`. "PUZZLE BOXING" subtitle in 32px Teko 600, cyan (#06b6d4).
- **CTA Button**: "PRESS START" — gold gradient button, 58px height, 14px radius, pulsing `box-shadow` glow animation (0.8s ease-in-out infinite alternate).
- **Audio Toggle**: Top-right icon button, 🔊/🔇 state.

#### Character Select Screen
- **Layout**: Scrollable grid of fighter cards (4 columns on mobile, 5 on desktop). Each card shows fighter avatar circle (initials + theme color border), name, and nickname.
- **Selection Detail Panel**: Below the grid — selected fighter's full stats (HP bar, Speed bar, Power bar, Super Rate bar) rendered as animated fill bars. Passive ability name + description. SUPER finisher name + description. Counter Gem drop pattern visualized as 6 colored squares.
- **P2 Selection**: AI opponent auto-selected as random rival (or tap a second card to choose). Displayed in mirrored panel on right (desktop) or below (mobile).
- **Confirm Button**: "FIGHT!" — red gradient, 58px height, triggers match intro.

#### Round Intro Sequence (1.5 seconds)
1. **0ms–600ms**: "ROUND 1" text scales from 0→1.2→1.0 (overshoot ease), centered on screen, white Teko 900 80px with black stroke.
2. **600ms–1200ms**: "ROUND 1" fades out, "FIGHT!" scales in with same animation, gold color.
3. **1200ms–1500ms**: "FIGHT!" fades out. Arena camera centers. Game loop begins.

#### Active Battle Screen (Primary Gameplay)
- **Top Zone** (0–30% of viewport): Parallax arena with fighter sprites, HP bars, SUPER meters, fighter names.
- **Mid Zone** (30–80% of viewport): Dual 6×12 puzzle grids side by side. P1 left, P2 right. NEXT piece preview boxes above each grid. Chain combo text floats here.
- **Bottom Zone** (80–100%): Mobile touch controls (D-pad left/right, Rotate, Soft Drop, Hard Drop, SUPER button). Desktop: keyboard only, this zone collapses.

#### Results / Victory Screen
- **Overlay**: Full-screen dark backdrop (rgba(0,0,0,0.88)) with backdrop-filter blur.
- **Victory Card**: Gold-bordered card (3px border, 20px radius, `box-shadow: 0 0 45px rgba(255, 190, 41, 0.48)`) containing:
  - "KNOCKOUT!" in 52px Teko gold.
  - Winner's name in 28px Outfit 800 white.
  - Stats table: Max Chain, Total Clears, Match Time.
  - "PLAY AGAIN" button and "SHARE" button (generates fight card image via `canvas.toDataURL()`).

---

## 4. COMPLETE PUZZLE ENGINE SPECIFICATION

### 4.1 Grid Architecture

- **Grid Size**: 6 Columns × 12 Rows per player board.
- **Cell Size**: Dynamically calculated: `cellSize = floor(min(availableHeight / 12, availableWidth / 6))`. Typically 28–32px on mobile, 36–42px on desktop.
- **Coordinate System**: `(col, row)` where `col ∈ [0..5]`, `row ∈ [0..11]`. Row 0 is the top (spawn zone). Row 11 is the floor.
- **Spawn Position**: Pivot gem at `(col=2, row=0)`, Satellite gem at `(col=2, row=1)`.

### 4.2 Falling Pair Mechanics

- **Rotation**: 90° clockwise around the pivot gem. 4 rotation states:
  - `0`: Satellite below (dy=+1)
  - `1`: Satellite left (dx=-1)
  - `2`: Satellite above (dy=-1)
  - `3`: Satellite right (dx=+1)
- **Wall Kick**: If rotation is blocked by wall or occupied cell, attempt shifting pivot ±1 column. If both fail, rotation is denied.
- **Gravity**: Passive drop at `dropInterval = max(200, 800 - (level × 60))` ms per row. Soft drop = 1 row immediately. Hard drop = instant raycast to lowest valid position + lock.
- **Lock Delay**: 0ms after hard drop. 200ms grace period after passive drop lands before auto-locking (allows last-second rotation/slide).

### 4.3 Gem Types

| Gem | Appearance | Behavior |
| :--- | :--- | :--- |
| **Normal** | Faceted jewel — Red, Blue, Green, Yellow | Stacks. Forms Power Gems when 4+ same-color normals form a solid rectangle. |
| **Crash** | Glowing orb with pulsing core | On landing, if adjacent (4-directional) to any same-color Normal or Power Gem → detonates that color cluster. Crash Gem is consumed. |
| **Power** | Multi-cell fused block with gold border | Auto-forms from 2×2+ rectangles of same-color normals. Detonation yields 2.5× damage multiplier. |
| **Counter** | Gray-shielded gem with countdown number (5→0) | Sent to rival's board as garbage. Cannot be detonated or fused until timer reaches 0. Decrements 1 per turn. At 0, becomes Normal Gem of its underlying color. |

### 4.4 Power Gem Fusion Algorithm

After every piece lock and after every gravity settle:

```
For width W from 6 down to 2:
    For height H from 12 down to 2:
        For each (col, row) where a W×H rectangle fits:
            If ALL cells in rectangle are same-color Normal Gems (not already part of a Power Gem):
                Fuse into Power Gem (anchor at top-left, dimensions W×H)
                Mark all cells as belonging to this Power Gem
```

Largest possible rectangles are detected first (greedy), preventing sub-optimal small fusions.

### 4.5 Crash Detonation & Chain Cascade

1. **Crash Check**: After gravity settles, scan all Crash Gems. For each Crash Gem, check 4 adjacent cells. If any adjacent cell contains a same-color Normal or Power Gem → trigger detonation.
2. **Flood Fill**: From the Crash Gem, flood-fill to destroy all connected same-color gems (Normal, Power, and other Crash gems). Counter Gems with timer > 0 block the flood.
3. **Chain Cascade**: After detonation, apply gravity. After gravity, check for new Crash Gem adjacencies. If new detonations occur, increment chain counter. Repeat until stable.
4. **Damage Calculation** (per chain step):

$$\text{Counter Gems Sent} = \left\lfloor \left( (\text{Cleared} \times 0.75) + \text{PowerBonus} \right) \times \text{ChainMult} \right\rfloor$$

| Chain Level | Multiplier |
| :--- | :--- |
| 1 (initial) | 1.0× |
| 2 | 1.5× |
| 3 | 2.2× |
| 4+ | 3.5× |

| Power Gem Size | Bonus |
| :--- | :--- |
| 2×2 | +4 |
| 3×3 | +10 |
| 4×4+ | +18 |

### 4.6 Counter Gem Delivery

When counter gems are sent, they are placed onto the opponent's board using the attacker's **6-column drop pattern** (defined per character in Section 5). Counter gems fill from the top of each column downward. If a column is full, overflow spills to adjacent columns.

### 4.7 Top-Out / Loss Condition

If, after locking a piece, either spawn cell `(2, 0)` or `(2, 1)` is occupied and a new piece cannot be spawned → that player loses. The opponent wins by KO.

---

## 5. FIGHTER ROSTER — AUTHENTIC 2026 KICK STREAM GUESTS

### 5.1 Counter Gem Drop Patterns

```
Adrien Broner:     [ Gold | Gold |  Red |  Red | Gold | Gold ]   (Heavy Block)
Deen The Great:    [ Blue | Cyan | Blue | Cyan | Blue | Cyan ]   (Stair Step)
Ryan Garcia:       [  Red | Cyan |  Red | Cyan |  Red | Cyan ]   (Flash Cross)
Ray J:             [ Gold | Blue | Gold | Blue | Gold | Blue ]   (Tech Grid)
N3ON:              [Green |Green |Yellw |Yellw |Green |Green ]   (Twin Spikes)
Blueface:          [ Rand | Rand | Rand | Rand | Rand | Rand ]   (Random Noise)
Chrisean Rock:     [  Red |  Red |  Red |  Red |Yellw |Yellw ]   (Brawler Wall)
Rampage Jackson:   [  Red | Gold |  Red | Gold |  Red | Gold ]   (MMA Slam)
Adin Ross:         [ Gold |  Red | Gold |  Red | Gold |  Red ]   (Checkerboard)
Charleston White:  [Yellw |  Red |Yellw |  Red |Yellw |  Red ]   (Rant Grid)
Walid Sharks:      [  Red | Blue |Green |Yellw |  Red | Blue ]   (Rainbow)
Antonio Brown:     [ Gold | Cyan | Gold | Cyan | Gold | Cyan ]   (Business)
Gervonta Davis:    [  Red |  Red |  Red |  Red |  Red |  Red ]   (Mono Wall)  [BOSS]
Floyd Mayweather:  [ Gold | Gold | Gold | Gold | Gold | Gold ]   (Gold Wall)  [GRAND BOSS]
```

### 5.2 Complete Balance Matrix

| Fighter | Relation | HP | Speed | Power | Super Rate | Passive | SUPER Finisher |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Adrien Broner** | Stream Host | 1,100 | 1.0× | 1.25× | 1.0× | **Philly Armor**: −15% incoming Counter Gems. Power Gems +30% dmg. | **Can't Play With Me**: 600 dmg + 5-row red drop |
| **Deen The Great** | Stream Host | 950 | 1.3× | 1.0× | 1.25× | **Chain Surge**: Chain multipliers scale 1.5× faster. Soft drops +3% Super. | **Misfits Blitz**: 520 dmg + stair drop |
| **Ryan Garcia** | Warehouse Guest | 1,050 | 1.4× | 1.2× | 1.1× | **KingRy Speed**: Clearing red gems grants +15% damage burst. | **Flash Left Hook**: 620 dmg + flash cross |
| **Ray J** | Warehouse Guest | 1,020 | 1.05× | 1.1× | 1.25× | **Tech Pitch**: Soft drops +2% Super and convert 1 Counter Gem. | **Raytroniks Overload**: 520 dmg + tech grid |
| **N3ON** | Stream Collab | 900 | 1.4× | 0.95× | 1.1× | **Fast Countdown**: Counter Gems sent have 3-turn timers (not 5). | **Twitch Agitation**: 480 dmg + twin spikes |
| **Blueface** | Talent Show | 1,050 | 0.95× | 1.35× | 0.9× | **Brawl Chaos**: Counter Gems use random colors. | **Thotiana KO**: 580 dmg + random noise |
| **Chrisean Rock** | Boxing Guest | 1,080 | 1.1× | 1.3× | 0.95× | **Brawling Impulse**: +10% dmg taken, but single detonations +40% dmg. | **South Beach Brawl**: 590 dmg + brawler wall |
| **Rampage Jackson** | Warehouse Guest | 1,150 | 0.9× | 1.4× | 0.9× | **MMA Slam**: Power Gem detonations +35% dmg + screen shake. | **Slam KO**: 640 dmg + MMA slam |
| **Adin Ross** | Kick Collab | 1,000 | 1.1× | 1.0× | 1.4× | **Hype Cash-In**: All drops +2% Super per gem. | **Brand Risk**: 500 dmg + checkerboard |
| **Charleston White** | Rant Guest | 940 | 1.35× | 1.15× | 1.2× | **Crash Out Rant**: 4+ gem clears force 1 extra row of Counter Gems. | **Mace & Mic**: 510 dmg + rant grid |
| **Walid Sharks** | Deen's Rival | 950 | 1.35× | 1.05× | 1.2× | **Reflex Counter**: Clearing while hit converts 1 incoming Counter→Crash. | **Flash Uppercut**: 510 dmg + rainbow |
| **Antonio Brown** | Stream Guest | 1,060 | 1.2× | 1.15× | 1.1× | **Business Boomin'**: Hard drops +30% score and +1 Counter Gem sent. | **84 Catch KO**: 560 dmg + business grid |
| **Gervonta Davis** | BOSS | 1,250 | 1.1× | 1.45× | 1.0× | **Knockout Power**: Power Gem detonations 3× dmg + screen shake. | **Tank Uppercut**: 700 dmg + mono wall |
| **Floyd Mayweather** | GRAND BOSS | 1,300 | 1.2× | 1.2× | 1.1× | **The Best Ever**: Auto-converts 2 Counter Gems→Normal every 10s. | **TBE Masterclass**: 680 dmg + gold wall |

---

## 6. FIGHTER ANIMATION STATE MACHINE & TIMING

### 6.1 Animation States

The fighter sprite renderer maintains a finite state machine. Each state maps to a row/column range on the sprite sheet and a specific frame timing sequence.

```
                ┌──────────┐
                │   IDLE   │◀──────────────────────────────┐
                └────┬─────┘                               │
                     │                                     │
         (puzzle event detected)                    (animation complete)
                     │                                     │
          ┌──────────┼──────────┐                          │
          ▼          ▼          ▼                          │
     ┌────────┐ ┌────────┐ ┌──────────┐                   │
     │  JAB   │ │  HOOK  │ │ UPPERCUT │───────────────────┘
     └────────┘ └────────┘ └──────────┘
                                                           │
     ┌────────┐ ┌────────┐ ┌──────────┐                   │
     │ FLINCH │ │   KO   │ │  SUPER   │───────────────────┘
     └────────┘ └────┬───┘ └──────────┘
                     │
                     ▼
               ┌───────────┐
               │  WIN POSE │ (only on match end)
               └───────────┘
```

### 6.2 Frame Timing Matrix

All animations run at discrete step rates (no interpolation) for the classic arcade feel.

| State | Frames | Per-Frame Timing | Total Duration | Trigger Condition |
| :--- | :--- | :--- | :--- | :--- |
| **Idle** | 4 | 90ms each | 360ms (loop) | Default / return state |
| **Jab** | 3 | 60 / 120 / 80 ms | 260ms | 1–2 gems cleared |
| **Hook** | 3 | 80 / 140 / 80 ms | 300ms | 3–5 gems cleared |
| **Uppercut** | 4 | 80 / 100 / 140 / 80 ms | 400ms | Power Gem detonation |
| **Super** | 4 | 80ms each | 320ms | SUPER finisher activated |
| **Flinch** | 3 | 120 / 100 / 80 ms | 300ms | Receiving counter gems |
| **KO Fall** | 3 | 140ms each | 420ms | HP reaches 0 |
| **Win Pose** | 2 | 200ms each | 400ms (loop) | Opponent KO'd |
| **Guard** | 2 | 100ms each | 200ms | Blocking (AI idle defense) |
| **Taunt** | 2 | 150ms each | 300ms | Chain 4+ combo |

### 6.3 Sprite Rendering Code Contract

```typescript
function drawFighter(
    ctx: CanvasRenderingContext2D,
    sheet: HTMLImageElement,
    state: AnimationState,
    frameIndex: number,
    destX: number,
    destY: number,
    flipX: boolean
): void {
    const col = SPRITE_MAP[state].startCol + frameIndex;
    const row = SPRITE_MAP[state].row;
    const sx = col * 128;
    const sy = row * 256;

    ctx.save();
    if (flipX) {
        ctx.translate(destX + 128, destY);
        ctx.scale(-1, 1);
        ctx.drawImage(sheet, sx, sy, 128, 256, 0, 0, 128, 256);
    } else {
        ctx.drawImage(sheet, sx, sy, 128, 256, destX, destY, 128, 256);
    }
    ctx.restore();
}
```

---

## 7. SUPER FINISHER CINEMATIC SYSTEM

When a player's SUPER meter reaches 100% and they activate it, the following cinematic sequence plays:

### 7.1 SUPER Sequence Timeline (1.2 seconds total)

| Time | Event | Visual | Audio |
| :--- | :--- | :--- | :--- |
| **0ms** | Freeze frame | Game loop pauses. Both puzzle boards and fighters freeze. | — |
| **0–200ms** | Dark flash | Screen darkens to 60% opacity overlay. Attacker sprite gets golden outline glow (8px `shadowBlur`). | SUPER chime begins (ascending arpeggio). |
| **200–500ms** | SUPER attack | Attacker plays SUPER animation (4 frames × 80ms). Camera shakes at ±12px magnitude. Hit sparks explode on defender. | Punch impact SFX × 4 (rapid fire). |
| **500–800ms** | Counter Gem rain | 5 rows of Counter Gems cascade onto opponent's board with staggered row delays (60ms per row). | Crash detonation SFX per row. |
| **800–1200ms** | Resume | Dark overlay fades out. Defender plays flinch animation. Game loop resumes. | — |

---

## 8. AI OPPONENT SYSTEM

### 8.1 AI Difficulty Tiers

| Difficulty | Drop Speed | Decision Quality | Aggression |
| :--- | :--- | :--- | :--- |
| **Easy** | 1.5× slower than player | Random placement with slight bias toward color grouping. | Never uses SUPER proactively. |
| **Normal** | Same as player | Scans for Crash Gem adjacency matches. Builds 2×2 Power Gems intentionally. | Uses SUPER when meter is full and HP < 60%. |
| **Hard** | 1.2× faster than player | Optimal placement: maximizes chain potential, avoids fragmentation. | Uses SUPER strategically at chain 3+ for maximum Counter Gem rain. |

### 8.2 AI Decision Loop (runs every piece spawn)

```
1. Generate list of all valid (column, rotation) placements.
2. For each placement, simulate: lock → gravity → fusion → detonation.
3. Score each placement:
     score = (clearedGems × 10)
           + (powerGemsFormed × 50)
           + (chainPotential × 30)
           - (heightPenalty × 5)    // penalize tall stacks
           - (fragmentation × 8)   // penalize color scatter
4. Add random noise: score += random(-noise, +noise)
     where noise = { Easy: 80, Normal: 30, Hard: 5 }
5. Select highest-scoring placement.
6. Execute: move pair to target column, set target rotation, hard drop.
```

---

## 9. SOUND DESIGN — ZERO-DEPENDENCY WEB AUDIO SYNTHESIZER

All audio is procedurally generated using the Web Audio API. Zero external files.

| Sound | Oscillator | Frequency | Duration | Envelope |
| :--- | :--- | :--- | :--- | :--- |
| **Gem Drop** | Sine | 320→120 Hz sweep | 80ms | Fast attack, exponential decay |
| **Crash Detonation** | Square + noise | 240→60 Hz + white noise LP@800Hz | 300ms | Hard attack, sustained noise tail |
| **Jab Impact** | Triangle + noise | 180→40 Hz + noise burst | 140ms | Instant attack, fast decay |
| **Heavy Impact** | Sawtooth + noise | 120→30 Hz + noise burst | 220ms | Instant attack, medium decay with sub-bass rumble |
| **SUPER Chime** | Sine arpeggio | 440→554→659→880 Hz (4 notes) | 400ms | Each note 100ms, slight overlap |
| **KO Bell** | Sine × 2 | 800 Hz + 1200 Hz simultaneous | 1200ms | Hard attack, long exponential decay (metallic ring) |
| **Counter Gem Land** | Square | 200→100 Hz | 60ms | Staccato thud |
| **Chain Combo Chime** | Sine | pitch = 440 × (1 + chainLevel × 0.25) | 150ms | Rising pitch per chain level |

---

## 10. MOBILE ERGONOMICS & TOUCH SYSTEM

### 10.1 Touch Control Layout

```
┌─────────────────────────────────────────────────────────┐
│                    GAME AREA                             │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  ◄  │  ↻  │  ►  │           │  ▼  │ ⚡DROP │ 🔥SUPER  │
│ 58px  58px  58px              58px   70px     70px       │
│  ◄────── D-PAD ──────►       ◄──── ACTION BUTTONS ────► │
│  gap: 8px                    gap: 8px                    │
│                                                          │
│  bottom: max(env(safe-area-inset-bottom) + 12px, 14px)  │
└─────────────────────────────────────────────────────────┘
```

### 10.2 Touch Requirements

- **Minimum target size**: 58px × 58px (WCAG AAA / Apple HIG compliant).
- **Border radius**: 14px with 2px gold (#fbbf24) border.
- **Active feedback**: `transform: scale(0.92)` on `:active` pseudo-class (or pointerdown).
- **Event delegation**: ALL touch handlers attached to `#app` container via single `pointerdown` listener using `event.target.closest('[data-action]')`. No per-button listeners. This prevents iOS Safari dropped-tap issues after DOM mutations.
- **SUPER button**: Only enabled (red glow + pulse animation) when SUPER meter = 100%. Grayed out otherwise.

---

## 11. TECHNICAL ARCHITECTURE

```
ring-rush/
├── GDD.md                          # This document
├── index.html                      # Entry point, canvas stack, viewport meta
├── package.json                    # vite, typescript, vitest
├── tsconfig.json                   # strict mode
├── vite.config.ts
├── public/
│   └── assets/
│       ├── arena/
│       │   ├── arena-far.png       # Far crowd parallax (3072×512)
│       │   ├── arena-mid.png       # Ring ropes/posts (2048×400)
│       │   └── ring-floor.png      # Ring canvas mat (1024×256)
│       ├── fighters/
│       │   ├── broner.png          # 1024×1024 sprite sheet
│       │   ├── deen.png
│       │   ├── ... (14 sheets total)
│       │   └── floyd.png
│       └── gems/
│           └── gems.png            # 256×64 gem sprite sheet
├── src/
│   ├── main.ts                     # Boot, state machine, game loop
│   ├── style.css                   # Design tokens, layout, touch controls
│   ├── engine/
│   │   ├── types.ts                # All interfaces & type definitions
│   │   ├── puzzle.ts               # Pure functional puzzle matrix engine
│   │   ├── fighters.ts             # 14-fighter roster data registry
│   │   ├── ai.ts                   # AI decision engine
│   │   └── audio.ts                # Web Audio synthesizer
│   ├── render/
│   │   ├── arena.ts                # 3-layer parallax arena renderer
│   │   ├── board.ts                # 6×12 gem grid canvas renderer
│   │   ├── fighters.ts             # Sprite sheet animation renderer
│   │   ├── particles.ts            # Hit sparks, aura, combo text, KO flash
│   │   └── camera.ts               # Camera drift & screen shake controller
│   └── ui/
│       ├── screens.ts              # Title, Select, Intro, Results screen builders
│       ├── hud.ts                  # HP bars, SUPER meters, timer
│       └── controls.ts             # Touch & keyboard input delegation
└── test/
    ├── puzzle.test.ts              # Grid, gravity, fusion, detonation, garbage
    ├── ai.test.ts                  # AI placement scoring
    └── camera.test.ts              # Parallax drift math
```

---

## 12. PRODUCTION MILESTONES

| Milestone | Deliverables | Acceptance Criteria |
| :--- | :--- | :--- |
| **M1: Engine Core** | `puzzle.ts`, `types.ts`, `fighters.ts`, `puzzle.test.ts` | 100% unit test pass. Pure functions, zero DOM dependency. |
| **M2: Arena & Sprites** | 3-layer parallax arena, 2 fighter sprite sheets (Broner + Deen), gem sheet | Arena renders with camera drift. Fighters animate idle/jab/flinch. |
| **M3: Playable Battle** | Full game loop, controls, audio, HUD, AI (Easy) | Single match playable: title→select→battle→KO→results. |
| **M4: Full Roster** | All 14 fighter sprite sheets, fighter-specific abilities, AI Normal/Hard | All characters selectable with unique drop patterns and passives. |
| **M5: Polish & Viral** | SUPER cinematics, share card generation, chain VFX, screen shake tuning | "One more match" feel. Shareable results. Sub-100ms input latency. |

---

## 13. EXECUTION DIRECTIVES FOR AI CODING AGENTS

1. **Pure Engine Logic**: All puzzle state transformations in `src/engine/puzzle.ts` MUST be pure functions (input→output, no side effects). Always run `npm test` before presenting work.
2. **Container Event Delegation**: ALL interactive elements (buttons, cards, controls) MUST use a single persistent `pointerdown` listener on `#app`. Never attach listeners to dynamically created elements directly.
3. **Canvas Layer Separation**: Never draw arena backgrounds, fighters, puzzle gems, and UI on the same canvas. Use the 4-canvas stack defined in Section 2.1.
4. **Sprite Sheet Compliance**: Fighter sprites MUST use the 8×4 grid layout (128×256 cells) defined in Section 2.4. The animation renderer MUST index into this grid — never load individual frame images.
5. **Parallax Math**: Camera drift MUST use `lerp(current, target, 0.08)` with the 3 parallax speeds (0.15×, 0.5×, 1.0×) defined in Section 2.2. Screen shake MUST use exponential decay (`magnitude *= 0.85`).
6. **No Placeholder Art**: Use `generate_image` to create actual sprite sheets and arena assets. Never ship colored rectangles or text placeholders as fighter visuals.
7. **Mobile-First**: Touch controls MUST meet the 58px minimum and safe-area compliance defined in Section 10. Test on 19.5:9 viewport (390×844px) before desktop.
