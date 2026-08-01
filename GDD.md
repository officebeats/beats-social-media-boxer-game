# GAME DESIGN DOCUMENT: CRASH OUT: RING RUSH — PUZZLE BOXING

**Document Version:** 5.1.0 (AAA Production Standard — Dynamic Idle & Fidget Engine Spec)  
**Studio:** Antigravity Studios — Executive Production Division  
**Lead Game Producer:** AAA Competitive Game Systems Producer  
**Principal Game Designer:** Senior Puzzle-Fighter & 2D Combat Systems Architect  
**Art Director:** Pixel Art & UI/UX Visual Production Lead  
**Target Platform:** Mobile Web (iOS Safari / Android Chrome), Desktop Browsers, Gamepad (Bluetooth / USB)  
**Aspect Ratios:** 19.5:9 (iPhone 16 Pro), 20:9 (Galaxy S24), 16:9 (Desktop)  
**Tech Stack:** TypeScript, Vite, HTML5 Canvas (layered multi-canvas), Web Audio API, Vitest, Playwright  
**Target FPS:** 60 FPS render / 12 FPS sprite step rate  

---

## 1. EXECUTIVE SUMMARY & DESIGN PILLARS

### 1.1 Elevator Pitch

**Crash Out: Ring Rush** is a fast-session arcade versus puzzle-fighter that fuses the head-to-head mechanics of Capcom's *Super Puzzle Fighter II Turbo* with the viral spectacle of the 2026 Kick warehouse streams ("Locked In-A-Thon" / "Crash Out Boyz") hosted by **Adrien "The Problem" Broner** and **Deen The Great**. Players choose from 14 celebrity fighters — all real guests from the Broner & Deen streams — then drop, fuse, and detonate gems to trigger real-time punches, counter-attacks, and cinematic SUPER finishers against a parallax-scrolling 3-layer boxing arena rendered entirely inside a stacked HTML5 Canvas system.

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

## 3. GAME FLOW, MENUS & SCREEN ARCHITECTURE

Every screen in Crash Out: Ring Rush is navigable via **touch**, **gamepad**, or **keyboard/mouse**. All interactive elements participate in a unified **focus cursor** system: a visible gold highlight ring (3px `outline`, `outline-offset: 4px`, color `#fbbf24`) that wraps the currently focused element. This cursor is driven by the input abstraction layer (Section 10) so all three input methods share identical navigation topology.

### 3.1 Complete Screen Flow State Machine

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│   ┌──────────┐        ┌──────────┐       ┌──────────────┐                 │
│   │  BOOT /  │──────▶│  TITLE   │──────▶│  MAIN MENU   │                 │
│   │  SPLASH  │        │  SCREEN  │ START │              │                 │
│   └──────────┘        └──────────┘       └──────┬───────┘                 │
│        (1.5s auto)       (any input)            │                         │
│                                                  │                         │
│                ┌─────────────────────────────────┼─────────────┐           │
│                ▼                                 ▼             ▼           │
│         ┌──────────────┐                 ┌────────────┐ ┌───────────┐     │
│         │ SINGLE PLAYER│                 │  SETTINGS  │ │  HOW TO   │     │
│         │ ARCADE MODE  │                 │            │ │  PLAY     │     │
│         └──────┬───────┘                 └────────────┘ └───────────┘     │
│                │                               ▲              ▲           │
│                ▼                               │ BACK         │ BACK      │
│         ┌──────────────┐                       │              │           │
│         │ FIGHTER      │ (Choose P1)           │              │           │
│         │ SELECT       │                       │              │           │
│         └──────┬───────┘                       │              │           │
│                │ CONFIRM                       │              │           │
│                ▼                               │              │           │
│         ┌──────────────┐                       │              │           │
│         │ ARCADE MAP / │                       │              │           │
│         │ LADDER (7 STG)                       │              │           │
│         └──────┬───────┘                       │              │           │
│                │ CONFIRM STAGE                 │              │           │
│                ▼                               │              │           │
│         ┌──────────────┐                       │              │           │
│         │ ROUND INTRO  │                       │              │           │
│         │ "ROUND 1"    │                       │              │           │
│         └──────┬───────┘                       │              │           │
│                │ (auto 1.5s)                   │              │           │
│                ▼                               │              │           │
│         ┌──────────────┐                       │              │           │
│         │ ACTIVE BATTLE│──▶ SUPER ──────────┐  │              │           │
│         │ (60 FPS)     │◀───────────────────┘  │              │           │
│         └──────┬───────┘        PAUSE ──────▶┌──────────┐     │           │
│                │                             │ PAUSE    │     │           │
│                │ KO                          │ MENU     │     │           │
│                ▼                             └──────────┘     │           │
│         ┌──────────────┐                                      │           │
│         │ STAGE CLEAR /│──(NEXT STAGE)──▶ Arcade Ladder        │           │
│         │ CHAMPIONSHIP │──(MAIN MENU)──▶ Main Menu            │           │
│         │ VICTORY CARD │──(SHARE)─────▶ Share Card Gen        │           │
│         └──────────────┘                                      │           │
└────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Screen-by-Screen Specification

---

#### 3.2.1 Boot / Splash Screen

**Duration**: 1.5 seconds (auto-advance, not skippable).

```
┌──────────────────────────────────────┐
│                                      │
│                                      │
│          ⚡ ANTIGRAVITY ⚡           │
│              STUDIOS                 │
│                                      │
│           ▓▓▓▓░░░░░░░░              │
│           (loading bar)              │
│                                      │
└──────────────────────────────────────┘
```

- Studio logo fades in over 600ms, holds 600ms, fades out 300ms.
- Loading bar shows asset preload progress (arena PNGs, sprite sheets, gem sheet).
- Web Audio context is created here (needs user gesture on iOS — handled by Title Screen).

---

#### 3.2.2 Title Screen

```
┌──────────────────────────────────────┐
│  [🔊]                          [⚙️]  │  ← Top Bar (48px)
│                                      │
│          C R A S H  O U T           │  ← Red/Gold 3D Bevel, 56px
│            R I N G  R U S H          │  ← Teko 900, 72px, Gold
│           P U Z Z L E               │
│            B O X I N G               │  ← Teko 600, 32px, Cyan
│                                      │
│   ┌──────────────────────────────┐   │
│   │   [BRONER]   VS   [DEEN]    │   │  ← Sparring Plane (180px)
│   │   (idle anim)  (idle anim)  │   │    Fighters in 4-frame idle loop
│   └──────────────────────────────┘   │
│                                      │
│         ▶ PRESS START ◀              │  ← Gold pulsing CTA (58px)
│                                      │
│     🎮 Controller Detected           │  ← Shows if gamepad connected
│                                      │
└──────────────────────────────────────┘
```

**Navigation Focus Order**: `PRESS START` (only one focusable element).

| Input | Action |
| :--- | :--- |
| Touch: Tap anywhere / Tap START | Proceed to Main Menu + unlock Web Audio |
| Gamepad: Any button (A/B/X/Y/Start) | Proceed to Main Menu |
| Keyboard: Enter / Space / any key | Proceed to Main Menu |

**Visual Details**:
- Background: Parallax arena at rest, spotlights slowly cycling amber/cyan hue.
- "PRESS START" button pulses with `box-shadow: 0 0 20px rgba(251, 191, 36, 0.5)` on 0.8s infinite alternate.
- If a gamepad is connected, a subtle "🎮 Controller Detected" label appears below the CTA.
- Audio toggle (🔊) in top-left; Settings gear (⚙️) in top-right — both 44px touch targets.

---

#### 3.2.3 Main Menu

```
┌──────────────────────────────────────┐
│  [🔊]   CRASH OUT: RING RUSH    [⚙️] │  ← Top Bar
│                                      │
│        ┌──────────────────┐          │
│        │ ▶ SINGLE PLAYER  │ ◀ focus  │  ← Main Mode (Arcade Gauntlet)
│        │   ARCADE MODE    │          │
│        └──────────────────┘          │
│        ┌──────────────────┐          │
│        │    VERSUS CPU    │          │  ← Quick Match vs AI
│        └──────────────────┘          │
│        ┌──────────────────┐          │
│        │    HOW TO PLAY   │          │  ← Tutorial
│        └──────────────────┘          │
│        ┌──────────────────┐          │
│        │    SETTINGS      │          │  ← Settings
│        └──────────────────┘          │
│                                      │
│    ◄/► D-Pad  ⓐ Select  ⓑ Back     │
└──────────────────────────────────────┘
```

**Navigation Focus Order**: `SINGLE PLAYER ARCADE` → `VERSUS CPU` → `HOW TO PLAY` → `SETTINGS`.

---

#### 3.2.4 Single Player Arcade Mode ("Locked-In Warehouse Championship")

**Overview**: Single Player Arcade Mode is the core solo campaign. The player selects their fighter, then battles through a 7-stage gauntlet of stream guests to earn the Kick Warehouse Championship Belt.

```
┌──────────────────────────────────────────────────────────────┐
│  [◀ BACK]     WAREHOUSE CHAMPIONSHIP LADDER      [⚙️]        │
│                                                              │
│  STAGE 7: [GRAND BOSS] FLOYD MAYWEATHER  (Pure Gold Wall)   │  🔒
│  STAGE 6: [BOSS] GERVONTA "TANK" DAVIS   (Mono Red Wall)    │  🔒
│  STAGE 5: ADRIEN BRONER                  (Philly Heavy)     │  🔒
│  STAGE 4: RYAN GARCIA                    (Flash Cross)      │  🔒
│  STAGE 3: BLUEFACE                       (Brawl Noise)      │  🔒
│  STAGE 2: RAY J                          (Tech Grid)        │  🔒
│  STAGE 1: N3ON ◀ CURRENT STAGE           (Twin Spikes)      │  ⚡
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ YOUR FIGHTER: DEEN THE GREAT    SCORE: 000,000        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│              ┌──────────────────────────────┐                │
│              │    ▶ START STAGE 1 ◀         │                │
│              └──────────────────────────────┘                │
└──────────────────────────────────────────────────────────────┘
```

**Arcade Rules**:
1. **7 Sequential Stages**: Progression saves locally. Clearing a stage unlocks the next rung on the ladder.
2. **Boss Unlocks**: Defeating Stage 6 (Tank Davis) and Stage 7 (Floyd Mayweather) permanently unlocks them as playable roster choices on the Character Select screen.
3. **Cumulative High Score**: Points are awarded for speed, max chain combos, and remaining HP. High scores persist on a local Leaderboard screen.
4. **Continue Screen**: On KO loss, player gets a 10-second arcade countdown ("CONTINUE? 9... 8...") with 3 continues allowed per run.

| Input | Action |
| :--- | :--- |
| Touch: Tap menu item | Select that item |
| Gamepad: D-Pad Up/Down or Left Stick | Move focus cursor up/down |
| Gamepad: A / Cross (×) | Confirm focused item |
| Gamepad: B / Circle (○) | Back to Title Screen |
| Keyboard: ↑/↓ or W/S | Move focus cursor up/down |
| Keyboard: Enter / Space | Confirm focused item |
| Keyboard: Escape / Backspace | Back to Title Screen |
| Mouse: Hover over item | Move focus to that item |
| Mouse: Click item | Select that item |

**Visual Details**:
- Menu items are 280px wide (mobile) / 360px wide (desktop), centered, 58px height.
- Background: `var(--bg-card)` (#12131c) with 2px border `rgba(255,255,255,0.12)`.
- Focused item: Border becomes gold (#fbbf24), glow `box-shadow: 0 0 16px var(--gold-glow)`, subtle `scale(1.03)` transform.
- Input legend at bottom auto-detects active input method: shows gamepad glyphs when gamepad is active, keyboard shortcuts when keyboard is active, hidden on touch-only.

---

#### 3.2.4 Character Select Screen

```
┌──────────────────────────────────────────────────────────────┐
│  [◀ BACK]         CHOOSE YOUR FIGHTER         [⚙️]          │
│                                                              │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                        │
│  │ AB │ │DEEN│ │RYAN│ │RAYJ│ │N3ON│    ← Row 1 (5 cols)    │
│  └────┘ └────┘ └────┘ └────┘ └────┘                        │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                        │
│  │BLUE│ │CHRI│ │RAMP│ │ADIN│ │CHAR│    ← Row 2             │
│  └────┘ └────┘ └────┘ └────┘ └────┘                        │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                               │
│  │WALI│ │ AB │ │🔒GD│ │🔒FM│              ← Row 3 (bosses) │
│  └────┘ └────┘ └────┘ └────┘                               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  ADRIEN BRONER  "The Problem"     HP ████████░░ 1100│    │
│  │  Stream Host / COB                PWR ██████████ 1.25│   │
│  │                                   SPD █████░░░░░ 1.0 │   │
│  │  PASSIVE: Philly Armor            SUP █████░░░░░ 1.0 │   │
│  │  −15% Counter Gems, Power +30%                       │    │
│  │                                                       │    │
│  │  DROP: [Gold][Gold][Red][Red][Gold][Gold]             │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│   P1: ADRIEN BRONER        P2: (random) DEEN THE GREAT      │
│                                                              │
│              ┌──────────────────────┐                        │
│              │     ▶ FIGHT! ◀       │  ← Confirm (58px)     │
│              └──────────────────────┘                        │
│                                                              │
│    ◄/►/▲/▼ Navigate  ⓐ Select  ⓑ Back  Ⓨ Toggle P2       │
└──────────────────────────────────────────────────────────────┘
```

**Navigation Focus Order**: 2D grid navigation (rows × columns) for fighter cards. Focus wraps horizontally within each row. D-Pad down from last row reaches the FIGHT! button. BACK button is accessible via B/Escape/Backspace.

| Input | Action |
| :--- | :--- |
| Touch: Tap fighter card | Select P1 fighter (auto-assigns random P2 rival) |
| Touch: Tap selected P1 card again | Deselect |
| Touch: Long-press a card (500ms) | Select as P2 opponent instead |
| Touch: Tap FIGHT! | Confirm and proceed to Difficulty Select |
| Gamepad: D-Pad / Left Stick (4-way) | Navigate fighter grid (2D cursor) |
| Gamepad: A / Cross (×) | Select highlighted fighter as P1 |
| Gamepad: Y / Triangle (△) | Toggle: select highlighted fighter as P2 |
| Gamepad: B / Circle (○) | Back to Main Menu |
| Gamepad: Start | Confirm selection (same as FIGHT!) |
| Keyboard: Arrow keys / WASD | Navigate fighter grid (2D cursor) |
| Keyboard: Enter / Space | Select highlighted fighter as P1 |
| Keyboard: Tab | Toggle: select highlighted fighter as P2 |
| Keyboard: Escape / Backspace | Back to Main Menu |
| Mouse: Hover card | Focus moves to hovered card |
| Mouse: Click card | Select as P1 |
| Mouse: Right-click card | Select as P2 |

**Visual Details**:
- Fighter cards: 100px × 120px (mobile), 110px × 130px (desktop). Contains avatar circle (56px diameter), name (13px Outfit 700), nickname (10px gold).
- Selected P1 card: Gold border, `scale(1.06)`, gold glow shadow.
- Selected P2 card: Cyan border, `scale(1.06)`, cyan glow shadow.
- Locked boss cards (🔒): Grayscale filter, lock icon overlay, tooltip on hover "Beat Hard AI to unlock."
- Stats panel fills dynamically based on focused card — animated fill bars ease-out over 300ms.
- Drop pattern row: 6 × 24px colored squares matching the fighter's Counter Gem pattern.

---

#### 3.2.5 Difficulty Select

```
┌──────────────────────────────────────┐
│  [◀ BACK]      DIFFICULTY            │
│                                      │
│        ┌──────────────────┐          │
│        │  ▶ EASY          │ ◀ focus  │
│        │  "Learn the ropes"│          │
│        └──────────────────┘          │
│        ┌──────────────────┐          │
│        │    NORMAL        │          │
│        │  "Fair fight"    │          │
│        └──────────────────┘          │
│        ┌──────────────────┐          │
│        │    HARD          │          │
│        │  "You sure?"     │          │
│        └──────────────────┘          │
│                                      │
│  ADRIEN BRONER  vs  DEEN THE GREAT   │  ← Fighter preview
│    [idle anim]      [idle anim]      │
│                                      │
└──────────────────────────────────────┘
```

**Navigation**: Same vertical list pattern as Main Menu. Confirm → Round Intro. Back → Character Select.

---

#### 3.2.6 Round Intro Sequence (1.5 seconds, non-interactive)

| Time | Visual | Audio |
| :--- | :--- | :--- |
| **0–600ms** | "ROUND 1" scales 0→1.2→1.0 (overshoot ease), centered, white Teko 900 80px, 3px black stroke. Arena fades in behind. | Low rumble sweep (80Hz → 40Hz, 600ms). |
| **600–1200ms** | "ROUND 1" fades out. "FIGHT!" scales in same animation, gold color + gold glow. | Synth bell sting (800Hz + 1200Hz, 200ms). |
| **1200–1500ms** | "FIGHT!" fades out. Camera centers. HP bars fill from 0→100%. | — |

All input is ignored during this sequence. Game loop starts at 1500ms.

---

#### 3.2.7 Active Battle Screen (Primary Gameplay)

```
┌──────────────────────────────────────────────────────────────┐
│  [II]  BRONER 1100/1100  ████████████  SUPER ██░░░░  [🔊]  │ ← HUD Top
│        DEEN    950/950   ████████████  SUPER ██░░░░        │
│                                                              │
│  ┌────────────────── PARALLAX ARENA ──────────────────┐      │
│  │                                                     │      │
│  │      [BRONER]              [DEEN]                   │      │ ← Fighter Plane
│  │      (idle)                (idle)                   │      │
│  │  ════════════ RING FLOOR ═══════════════            │      │
│  └─────────────────────────────────────────────────────┘      │
│                                                              │
│  ┌─NEXT─┐                              ┌─NEXT─┐            │
│  │ [R]  │  ┌──────────────┐            │ [B]  │             │
│  │ [B]  │  │              │ ┌────────┐ │ [G]  │             │
│  └──────┘  │   P1 BOARD   │ │P2 BOARD│ └──────┘             │
│            │   6 × 12     │ │ 6 × 12 │                      │
│            │              │ │        │                      │
│            │              │ │        │                      │
│            └──────────────┘ └────────┘                      │
│                                                              │
│  ┌──── D-PAD ─────┐    ┌────── ACTIONS ──────┐              │ ← Touch Controls
│  │  ◄  │  ↻  │  ► │    │  ▼  │ ⚡DROP │🔥SUP │              │   (mobile only)
│  │ 58px  58px 58px│    │ 58px  70px    70px  │              │
│  └────────────────┘    └─────────────────────┘              │
│   bottom: max(env(safe-area-inset-bottom) + 12px, 14px)     │
└──────────────────────────────────────────────────────────────┘
```

**Layout Zones**:

| Zone | Viewport % | Content |
| :--- | :--- | :--- |
| **HUD Top** | 0–7% | Fighter names, HP bars, SUPER meters, pause button, audio toggle |
| **Arena** | 7–32% | 3-layer parallax arena with fighter sprites |
| **Puzzle Zone** | 32–82% | Dual 6×12 gem grids + NEXT preview boxes + chain text |
| **Controls** | 82–100% | Mobile touch panel (collapses on desktop/gamepad) |

**Pause Behavior**: Tapping the ⏸ button (top-left), pressing Start on gamepad, or pressing Escape on keyboard opens the Pause Menu overlay.

---

#### 3.2.8 Pause Menu (Overlay)

```
┌──────────────────────────────────────┐
│  ░░░░░░░░░░ (dimmed game) ░░░░░░░░░ │
│                                      │
│        ┌──────────────────┐          │
│        │    ▶ RESUME      │ ◀ focus  │
│        └──────────────────┘          │
│        ┌──────────────────┐          │
│        │    RESTART       │          │
│        └──────────────────┘          │
│        ┌──────────────────┐          │
│        │    SETTINGS      │          │
│        └──────────────────┘          │
│        ┌──────────────────┐          │
│        │    QUIT MATCH    │          │
│        └──────────────────┘          │
│                                      │
│    ⓐ Select   ⓑ Resume              │
└──────────────────────────────────────┘
```

- Background: `rgba(0, 0, 0, 0.80)` overlay with `backdrop-filter: blur(6px)` over the frozen game state.
- Game loop is fully paused (no gravity drops, no AI moves, no timers tick).
- Navigation: Same vertical list pattern. B / Escape always resumes.
- RESUME: Close overlay, unpause game loop.
- RESTART: Confirmation prompt ("Are you sure?"), then restart match with same fighters.
- SETTINGS: Opens Settings sub-screen (same as Main Menu settings, overlaid).
- QUIT MATCH: Confirmation prompt, then return to Main Menu.

---

#### 3.2.9 Results / Victory Screen

```
┌──────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░ (dark overlay 88%) ░░░░░░░░░░░░░░░░░░░ │
│                                                              │
│         ╔══════════════════════════════════╗                  │
│         ║                                  ║                  │
│         ║      ⭐  K N O C K O U T !  ⭐   ║  ← 52px Gold    │
│         ║                                  ║                  │
│         ║     ADRIEN BRONER WINS!          ║  ← 28px White   │
│         ║                                  ║                  │
│         ║     Max Chain ........... 4×     ║                  │
│         ║     Total Clears ........ 87     ║                  │
│         ║     Match Time ......... 1:23    ║                  │
│         ║                                  ║                  │
│         ║   ┌───────────┐ ┌───────────┐   ║                  │
│         ║   │▶PLAY AGAIN│ │  📤 SHARE │   ║  ← 2 buttons     │
│         ║   └───────────┘ └───────────┘   ║                  │
│         ║   ┌─────────────────────────┐   ║                  │
│         ║   │      🏠 MAIN MENU      │   ║                  │
│         ║   └─────────────────────────┘   ║                  │
│         ║                                  ║                  │
│         ╚══════════════════════════════════╝                  │
│              3px gold border, 20px radius                    │
│           box-shadow: 0 0 45px gold glow                     │
└──────────────────────────────────────────────────────────────┘
```

**Navigation Focus Order**: `PLAY AGAIN` → `SHARE` → `MAIN MENU` (horizontal on first row, then wrap to second row).

| Input | Action |
| :--- | :--- |
| Touch: Tap button | Execute that action |
| Gamepad: D-Pad ←/→/↓ | Navigate between buttons |
| Gamepad: A / Cross (×) | Confirm focused button |
| Keyboard: ←/→/↓ / Tab | Navigate between buttons |
| Keyboard: Enter / Space | Confirm focused button |

- **PLAY AGAIN**: Returns to Character Select with previous fighters pre-selected.
- **SHARE**: Generates a 1080×1920 fight card image via offscreen canvas → `canvas.toDataURL('image/png')` → triggers native share sheet (`navigator.share()`) or downloads PNG.
- **MAIN MENU**: Returns to Main Menu.

---

#### 3.2.10 Settings Screen

```
┌──────────────────────────────────────┐
│  [◀ BACK]        SETTINGS            │
│                                      │
│  SOUND           ┌──────────────┐    │
│                   │  ██████░░ 80%│   │  ← Slider (drag/D-Pad ←/→)
│                   └──────────────┘    │
│                                      │
│  MUSIC           ┌──────────────┐    │
│                   │  ████░░░░ 50%│   │  ← Slider
│                   └──────────────┘    │
│                                      │
│  SCREEN SHAKE    ┌──────┐            │
│                   │  ON  │  OFF      │  ← Toggle
│                   └──────┘            │
│                                      │
│  SHOW FPS        ┌──────┐            │
│                   │  OFF │   ON      │  ← Toggle
│                   └──────┘            │
│                                      │
│  INPUT DISPLAY   ┌──────┐            │
│                   │ AUTO │ TOUCH │   │  ← Selector
│                   │GMPD │  KB   │   │
│                   └──────┘            │
│                                      │
│  CONTROLS        ▶ VIEW BINDINGS     │  ← Opens bindings sub-screen
│                                      │
└──────────────────────────────────────┘
```

**Navigation**: Vertical focus through setting rows. ←/→ adjusts sliders and toggles. Confirm opens sub-screens. Back returns to previous screen.

Settings persist to `localStorage` under the key `crashout_ringrush_settings`.

---

#### 3.2.11 How To Play Screen

```
┌──────────────────────────────────────┐
│  [◀ BACK]      HOW TO PLAY           │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  PAGE 1/4: BASICS            │    │  ← Carousel slides
│  │                               │    │
│  │  Drop gem pairs into the     │    │
│  │  6×12 grid. Match colors to  │    │
│  │  build Power Gems.           │    │
│  │                               │    │
│  │  [animated gem diagram]       │    │
│  │                               │    │
│  └──────────────────────────────┘    │
│                                      │
│       ◄  ● ○ ○ ○  ►                │  ← Page dots + arrows
│                                      │
│     ◄/► Pages   ⓑ Back              │
└──────────────────────────────────────┘
```

**Pages**: 4 tutorial slides:
1. **BASICS** — Drop pairs, stack, gravity.
2. **POWER GEMS** — 2×2+ fusion, detonation multiplier.
3. **CRASH & CHAINS** — Crash Orb detonation, chain cascade combos.
4. **SUPER & COUNTER** — SUPER meter, Counter Gem garbage, fighter abilities.

Each page has an animated diagram showing the mechanic in action (rendered via a small looping canvas animation).

**Navigation**: ←/→ to page through. B/Escape to go back.

---

### 3.3 Screen Transition Choreography

All screen transitions use a consistent **wipe** system for premium feel:

| Transition | Animation | Duration |
| :--- | :--- | :--- |
| **Forward (deeper into menus)** | Current screen slides left + fades to 0. New screen slides in from right + fades to 1. | 250ms, `ease-out` |
| **Back (returning up)** | Current screen slides right + fades to 0. Previous screen slides in from left + fades to 1. | 250ms, `ease-out` |
| **To Battle (from Difficulty Select)** | Full-screen black wipe (left→right diagonal) | 400ms |
| **KO → Results** | White flash (100% opacity → 0% over 400ms), then results card scales in from 0.8→1.0 with `ease-out-back`. | 600ms total |
| **Modal overlays (Pause, Settings)** | Backdrop darkens 0→80% opacity. Content scales in from 0.95→1.0 + fades in. | 200ms, `ease-out` |

### 3.4 Input Legend System

Every screen with interactive elements displays a contextual **input legend bar** at the bottom. The legend auto-detects the active input method and shows the correct glyphs:

| Context | Touch (hidden by default) | Gamepad | Keyboard |
| :--- | :--- | :--- | :--- |
| **Menu navigation** | *(no legend shown)* | `◄/► D-Pad` `ⓐ Select` `ⓑ Back` | `↑/↓ Navigate` `↵ Select` `Esc Back` |
| **Fighter Select** | *(no legend shown)* | `◄/►/▲/▼ Navigate` `ⓐ P1` `Ⓨ P2` `ⓑ Back` `Start Fight` | `↑/↓/←/→ Navigate` `↵ P1` `Tab P2` `Esc Back` |
| **Battle** | *(touch buttons are the legend)* | `◄/► Move` `▲ Rotate` `▼ Drop` `ⓐ Hard Drop` `Ⓨ SUPER` `Start Pause` | `←/→ Move` `↑/X Rotate` `↓ Soft` `Space Drop` `Z SUPER` `Esc Pause` |

The legend uses 12px Outfit 600, color `rgba(255, 255, 255, 0.5)`, and fades in/out over 200ms when the input method changes.

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

### 5.3 Persona-Authentic Idle Animations & Signature SUPER Finisher Breakdown

Each fighter's visual design, idle animation loop, and signature SUPER finisher are directly modeled after their real-life personality, stream memes, and Kick warehouse stream moments ("Locked In-A-Thon" / "Crash Out Boyz").

---

#### 1. Adrien "The Problem" Broner
- **Stream Context**: Main host of the Kick stream house, multi-division champion known for his brush meme, Philly shell defense, and "Can't Play With Me" catchphrase.
- **Unique Idle Animation ("Philly Hairbrush Bounce")**: 4-frame loop. Broner holds a low Philly Shell guard, dipping his left shoulder. On frame 4 of every second loop, he quickly reaches down, pulls out a gold hairbrush, brushes his hair/beard twice, and snaps back to guard.
- **Signature SUPER Finisher ("About Billions / Can't Play With Me")**:
  - *Cinematic*: Broner flashes a stack of cash into the camera, yells "CAN'T PLAY WITH ME!", then charges with a 3-punch combination (Jab → Body Hook → Overhand Right).
  - *Visual Effects*: Gold money bill particles burst on impact; camera shakes ±14px.
  - *Audio Cue*: Synth voice burst + hard bass thud.
  - *Puzzle Effect*: 600 Damage + drops a 5-row solid Red/Gold Heavy Block onto opponent board.

---

#### 2. Deen The Great
- **Stream Context**: Co-host of Kick stream events, Misfits Boxing champion, hyper-athletic southpaw known for rapid combos and headband flair.
- **Unique Idle Animation ("Misfits High Guard Bounce")**: 4-frame high-frequency bounce. Southpaw stance with tight gloves at forehead. Frame 3 features a quick head-twitch and headband adjustment with his right glove, eyes never leaving the rival.
- **Signature SUPER Finisher ("Misfits Combo Blitz")**:
  - *Cinematic*: Deen executes a 360° spin step, lunging across the ring mat with a 6-hit light speed combo (Jab-Cross-Hook-Upper-Hook-Cross).
  - *Visual Effects*: Neon cyan speed ribbons trail his gloves; text "MISFITS!" flashes above opponent.
  - *Audio Cue*: Rapid-fire high-pitch punch chimes (6 hits in 300ms).
  - *Puzzle Effect*: 520 Damage + drops an Alternating Stair Step (Blue/Cyan) Counter Gem pattern.

---

#### 3. Ryan Garcia
- **Stream Context**: Warehouse stream guest, world champion boxer, viral social media figure known for lightning-fast left hooks and cross necklace taps.
- **Unique Idle Animation ("KingRy Flash & Cross Touch")**: Flamboyant orthodox posture. Taps his gloves together, quickly touches his gold cross necklace, and performs a lightning micro-jab shadowbox.
- **Signature SUPER Finisher ("KingRy Flash Left Hook")**:
  - *Cinematic*: Screen freezes, flashes pure white for 100ms. Ryan teleports across the canvas and delivers a single, devastating left hook that stops time for 200ms.
  - *Visual Effects*: Bright yellow/red flash cross spark overlay; screen shakes exponentially.
  - *Audio Cue*: High-voltage electrical arc SFX + heavy sub-bass thud.
  - *Puzzle Effect*: 620 Damage + drops the KingRy Flash Cross pattern.

---

#### 4. Ray J
- **Stream Context**: Tech entrepreneur stream guest, famous for introducing wild tech gadgets, Raytroniks glasses, and hilarious stream pitches.
- **Unique Idle Animation ("Raytroniks Glasses Push & Pitch")**: Wears futuristic blue LED glasses on his forehead. Every 3rd idle loop, Ray J taps the side of his glasses (they light up blue), adjusts his jacket lapel, and winks at the arena camera.
- **Signature SUPER Finisher ("Raytroniks Tech Overload")**:
  - *Cinematic*: Ray J pulls out a glowing blue tech scanner device, aims it at the rival board, scanning it with a vertical laser grid.
  - *Visual Effects*: Futuristic digital matrix grid overlay on rival's puzzle board; blue energy particles.
  - *Audio Cue*: Synth digital laser sweep (440Hz → 1760Hz).
  - *Puzzle Effect*: 520 Damage + converts 2 random rows into Gold/Blue Tech Grid Counter Gems.

---

#### 5. N3ON
- **Stream Context**: Collaborator and Kick streamer known for hyperactive reactions, chat chaos, and dramatic stream moments.
- **Unique Idle Animation ("Twitch Chat Twitch & Headset Fix")**: Unstable, energetic stance. Constantly fidgeting, adjusting his gaming headset/microphone, taking quick steps back and forth while looking up at invisible stream chat overlay.
- **Signature SUPER Finisher ("Twitch Chat Agitation")**:
  - *Cinematic*: N3ON clutches his head and screams, as the screen fills with red and green stream chat spam ("W N3ON", "L N3ON", "CRASH OUT!"). He rushes forward with a frantic multi-hit slap barrage.
  - *Visual Effects*: Floating stream chat text particles scrolling upward across both puzzle boards.
  - *Audio Cue*: High-frequency glitch synth noise burst.
  - *Puzzle Effect*: 480 Damage + drops Twin Spike columns of 3-turn fast Countdown Gems.

---

#### 6. Blueface
- **Stream Context**: Talent show guest and rapper/boxer known for his off-beat rhythm memes, face tattoos, and wild brawl style.
- **Unique Idle Animation ("Off-Beat Brawler Sway")**: Asymmetric wide stance. Shrugs shoulders out of rhythm with the background music, taps his cheek face tattoo, and flexes his left arm with a cocky grin.
- **Signature SUPER Finisher ("Thotiana Off-Beat Knockout")**:
  - *Cinematic*: Blueface hits an off-beat dance step, then throws an unorthodox, looping wide right haymaker from out of frame.
  - *Visual Effects*: Deep blue flame trails behind his fist; bass wave distortion ripple on screen.
  - *Audio Cue*: Heavy off-beat bass drop synth thud (30Hz low end).
  - *Puzzle Effect*: 580 Damage + drops a completely Randomized Noise barrage of Counter Gems.

---

#### 7. Chrisean Rock
- **Stream Context**: Stream boxing match participant, known for raw power, South Beach stream moments, and unfiltered brawling energy.
- **Unique Idle Animation ("South Beach Aggro Stinger")**: Forward-leaning aggressive posture. Chews gum aggressively, cracks her knuckles every 2nd loop, and forcefully double-taps the canvas with her lead foot.
- **Signature SUPER Finisher ("South Beach Crash Out Brawl")**:
  - *Cinematic*: Chrisean lets out a roar, charges across the ring with a flying tackle-punch, slamming the opponent into the ring ropes.
  - *Visual Effects*: Red aura burst; ring ropes warp violently; max-amplitude screen shake (±16px).
  - *Audio Cue*: Heavy impact crunch + roar distortion SFX.
  - *Puzzle Effect*: 590 Damage + drops a 4-column Brawler Wall (Red/Yellow).

---

#### 8. Rampage Jackson
- **Stream Context**: MMA legend and warehouse stream guest, famous for his iconic door-breaking chain howl, heavy slams, and power persona.
- **Unique Idle Animation ("MMA Chain Howl & Slam Stance")**: Heavy, broad MMA stance. Wears his famous thick metal chain around his neck. Frame 4 of loop: tilts head back, howls at the ceiling spotlights, and slaps his chest with both gloves.
- **Signature SUPER Finisher ("Rampage Cage Slam")**:
  - *Cinematic*: Rampage grabs the opponent sprite by the waist (visual animation lock), lifts them overhead, and slams them straight down onto the ring canvas floor mat.
  - *Visual Effects*: Radial ground shockwave crack texture on canvas floor; screen shake decay (400ms).
  - *Audio Cue*: Low-frequency explosive explosion synth (60Hz → 20Hz).
  - *Puzzle Effect*: 640 Damage + drops a Heavy Red/Gold MMA Slam pattern.

---

#### 9. Adin Ross
- **Stream Context**: Main Kick collab streamer, stream host who brought huge audiences to the warehouse sessions, known for hype stream callouts.
- **Unique Idle Animation ("Streamer Hype Lean & Chair Spin")**: Stands upright with a purple Kick microphone in his left glove. Every 3rd loop, does a quick 180° spin on an invisible gaming chair, pointing at the camera with a hype grin.
- **Signature SUPER Finisher ("Brand Risk Overload")**:
  - *Cinematic*: Adin yells "IS THAT A W?!", a purple Kick stream frame flashes over the match, and Adin lunges with a lucky, wildly animated overhand right.
  - *Visual Effects*: Purple and gold coin particles stream from impact point; "W!" text pops over opponent.
  - *Audio Cue*: Ascending hype chime + coin sound burst.
  - *Puzzle Effect*: 500 Damage + drops a Gold/Red Checkerboard pattern.

---

#### 10. Charleston White
- **Stream Context**: Stream rant guest famous for viral stream rants, holding a microphone, and hilarious pepper spray/mace references.
- **Unique Idle Animation ("Crash Out Rant & Mace Touch")**: Frantic, highly expressive stance. Constantly talking with small animated speech bubble bursts popping near his head ("LISTEN HERE!"), holding a small yellow spray bottle in his left pocket.
- **Signature SUPER Finisher ("Mace & Mic Crash Out")**:
  - *Cinematic*: Charleston pulls out a yellow mace bottle, sprays a cloud of yellow mist across the ring (stunning the opponent sprite), then swings a heavy microphone like a club.
  - *Visual Effects*: Yellow cloud fog particle overlay on opponent; star sparks on impact.
  - *Audio Cue*: Hissing spray SFX + loud metallic mic thud.
  - *Puzzle Effect*: 510 Damage + forces a Yellow/Red Rant Grid drop onto opponent.

---

#### 11. Walid Sharks
- **Stream Context**: Deen The Great's main stream boxing rival, known for rapid speed bag reflexes, flashy footwork, and rainbow-styled gear.
- **Unique Idle Animation ("Speed Bag Reflex Shuffle")**: Highly fluid bob-and-weave stance. Moves side-to-side while throwing rapid micro shadow-punches into the air as if hitting an invisible speed bag.
- **Signature SUPER Finisher ("Flash Counter Uppercut")**:
  - *Cinematic*: Walid slips an incoming punch with a crisp back-bend dodge, then explodes upward into the air with a soaring skyward uppercut.
  - *Visual Effects*: Rainbow light trail follows his glove from bottom to top of screen; airborne particle trail.
  - *Audio Cue*: Rising multi-pitch synth sweep (440Hz → 880Hz → 1760Hz).
  - *Puzzle Effect*: 510 Damage + drops a full Rainbow Array of Counter Gems.

---

#### 12. Antonio Brown (AB)
- **Stream Context**: NFL star turned stream personality guest, famous for his "Business Is Boomin'" catchphrase and viral shoulder-shrug dance.
- **Unique Idle Animation ("Business Boomin' Shrug")**: Showboat stance wearing gold gloves and gold chains. Periodically points to his chest ("84"), does his viral shoulder-shrug dance gesture, and taps his gloves with a gold sparkle effect.
- **Signature SUPER Finisher ("84 Business Boomin' Catch KO")**:
  - *Cinematic*: AB leaps high into the air as if catching a touchdown pass in the back of the end zone, spikes a heavy punch downward onto the rival, and hits a touchdown dance pose.
  - *Visual Effects*: Gold money bills and dollar signs explode in a 360° burst around the ring floor.
  - *Audio Cue*: Stadium horn whistle synth + heavy punch crash.
  - *Puzzle Effect*: 560 Damage + drops a Gold/Cyan Business Grid pattern.

---

#### 13. Gervonta "Tank" Davis [BOSS]
- **Stream Context**: Multi-division champion, mentee of Adrien Broner, stream guest boss character known for devastating one-punch knockout power.
- **Unique Idle Animation ("Tank Southpaw Stare & Hood Adjust")**: Compact, menacing southpaw posture. Wears an all-red boxing outfit. Slowly shifts weight back and forth, eyes narrowed under his hood, adjusting his championship belt with a calm, lethal composure.
- **Signature SUPER Finisher ("Tank Explosive Uppercut")**:
  - *Cinematic*: Screen darkens to a deep red vignette. Heartbeat sound plays twice (`thump-thump`). Tank bursts forward in slow motion, launching an unblockable left uppercut that sends the rival sprite flying off the top of the canvas.
  - *Visual Effects*: Blood-red flash overlay; heavy screen shake (±18px); opponent sprite flies upward off-screen.
  - *Audio Cue*: Double heartbeat thud → explosive cannon-fire synth burst.
  - *Puzzle Effect*: 700 Damage + drops a Solid Monochromatic Red Wall (5 rows).

---

#### 14. Floyd "Money" Mayweather [GRAND BOSS]
- **Stream Context**: 50-0 hall of fame boxing legend, ultimate grand boss of the stream roster, famous for pristine defense, shoulder roll, and TMT brand.
- **Unique Idle Animation ("TBE Philly Roll & Coin Toss")**: Pristine, untouchable Philly Shell stance. Rolls his shoulders with zero effort. Frame 3: casually flips a gold coin into the air with his right glove, catches it, and smiles at the camera without dropping guard.
- **Signature SUPER Finisher ("TBE 50-0 Masterclass")**:
  - *Cinematic*: Floyd dodges 3 incoming punches in slow motion (Philly roll matrix effect), then delivers a 5-punch surgical masterclass combination, ending with a straight right hand to the chin.
  - *Visual Effects*: Golden aura rings expand from Floyd; gold "50-0" text flashes on screen; golden light beams emit from hit points.
  - *Audio Cue*: Pristine chime arpeggio + 5 crisp metallic punch impacts.
  - *Puzzle Effect*: 680 Damage + drops a Pure Gold Wall (5 rows of gold Counter Gems).


---

## 6. DYNAMIC FIGHTER ANIMATION ENGINE & RANDOMIZED IDLE SYSTEM

To prevent fighter sprites from appearing static or robotic during puzzle play, **Crash Out: Ring Rush** implements a **Randomized Dynamic Idle Engine**. Fighters are never frozen in place; their idle stance is a multi-layered state machine combining continuous rhythm bouncing with weighted persona-authentic fidget triggers and reactive taunts.

```
                         ┌───────────────────────┐
                         │   IDLE_BOUNCE BASE    │
                         │ (4-frame 12 FPS loop) │
                         └───────────┬───────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │ Weighted Random Timer (3s–6s)   │
                    ▼                                 ▼
         ┌───────────────────┐               ┌───────────────────┐
         │   FIDGET_A LOOP   │               │   FIDGET_B LOOP   │
         │ (Persona Quirk A) │               │ (Persona Quirk B) │
         └──────────┬────────┘               └────────┬──────────┘
                    │                                 │
                    └────────────────┬────────────────┘
                                     │ (Return to base)
                                     ▼
                         ┌───────────────────────┐
                         │   IDLE_BOUNCE BASE    │
                         └───────────────────────┘
```

### 6.1 Dynamic Idle Sub-States

1. **`IDLE_BOUNCE` (Base Rhythm, Frames 0–3)**: Continuous 4-frame weight-shift bounce at 12 FPS (90ms per frame). Keeps the sprite visually active with chest breathing, foot shuffling, and glove pulsing.
2. **`FIDGET_A` (Persona Quirk A, Frames 4–5)**: A fast persona-authentic action (e.g. hairbrushing, headband fix, cross necklace tap) triggered randomly every **3,000ms – 5,000ms**.
3. **`FIDGET_B` (Persona Quirk B, Frames 6–7)**: A showboat or chat-react action (e.g. money stack flash, chair spin, mace bottle check, coin toss) triggered randomly every **4,000ms – 6,000ms**.
4. **`TAUNT_INTERRUPT` (Reactive Taunt)**: Immediately interrupts idle state whenever the player lands a 3+ chain combo or 2×2 Power Gem detonation.

### 6.2 Complete 14-Fighter Idle & Fidget Catalog

| Fighter | Base Bounce (`IDLE_BOUNCE`) | Fidget Variant A (`FIDGET_A`) | Fidget Variant B (`FIDGET_B`) |
| :--- | :--- | :--- | :--- |
| **Adrien Broner** | Low Philly Shell shoulder-dip bounce. | Pulls out gold hairbrush, brushes beard twice. | Flashes money stack to camera, winks. |
| **Deen The Great** | High-guard southpaw rhythm shuffle. | Adjusts blue headband with right glove. | Taps gloves together, points at rival. |
| **Ryan Garcia** | Flamboyant orthodox stance bounce. | Touches gold cross necklace, shadow-jabs. | Taps gloves to chin, winks at camera. |
| **Ray J** | Relaxed stance with blue LED glasses. | Taps glasses (glow blue LED pulse). | Adjusts jacket lapels, pitches to camera. |
| **N3ON** | Hyperactive step-shuffle fidget. | Adjusts gaming headset/mic, checks chat. | Screams up at stream chat, jumps twice. |
| **Blueface** | Asymmetric off-beat shoulder shrug. | Taps cheek face tattoo, flexes bicep. | Off-beat shoulder-roll dance move. |
| **Chrisean Rock** | Forward-leaning brawler stance. | Chews gum, double-taps canvas with foot. | Cracks knuckles, roars at rival. |
| **Rampage Jackson**| Heavy broad MMA stance. | Holds heavy metal neck chain, tilts head. | Slaps chest with gloves, howls at ceiling. |
| **Adin Ross** | Upright stance with purple Kick mic. | Spins 180° on invisible gaming chair. | Yells "IS THAT A W?!", points at camera. |
| **Charleston White**| Frantic expressive talker stance. | Speech bubble ("LISTEN HERE!") pops. | Pulls out yellow mace spray, checks cap. |
| **Walid Sharks** | Fluid bob-and-weave shuffle. | Rapid micro speed-bag shadow punch. | Slips backward, snaps back into stance. |
| **Antonio Brown** | Showboat stance with gold chains. | Points to chest "84", shrugs shoulders. | Viral shoulder-shrug dance gesture. |
| **Gervonta Davis** | Menacing southpaw hood-up stance. | Adjusts gold championship belt around waist. | Narrows eyes under hood, weight shift. |
| **Floyd Mayweather**| Untouchable Philly Shell roll. | Flips gold coin into air, catches it. | Smooth 360° shoulder-roll matrix dodge. |

### 6.3 Frame Timing & State Matrix

All animations run at discrete step rates (no linear interpolation) for authentic 16-bit Capcom arcade responsiveness.

| State | Frames | Per-Frame Timing | Total Duration | Trigger Condition |
| :--- | :--- | :--- | :--- | :--- |
| **Idle Bounce** | 4 | 90ms each | 360ms (loop) | Default stance loop |
| **Fidget A** | 2 | 120ms each | 240ms | Random timer (3s–5s) |
| **Fidget B** | 2 | 150ms each | 300ms | Random timer (4s–6s) |
| **Jab** | 3 | 60 / 120 / 80 ms | 260ms | 1–2 gems cleared |
| **Hook** | 3 | 80 / 140 / 80 ms | 300ms | 3–5 gems cleared |
| **Uppercut** | 4 | 80 / 100 / 140 / 80 ms | 400ms | Power Gem detonation |
| **SUPER** | 4 | 80ms each | 320ms | SUPER finisher activated |
| **Flinch** | 3 | 120 / 100 / 80 ms | 300ms | Receiving counter gems |
| **KO Fall** | 3 | 140ms each | 420ms | HP reaches 0 |
| **Win Pose** | 2 | 200ms each | 400ms (loop) | Opponent KO'd |
| **Guard** | 2 | 100ms each | 200ms | Blocking (AI defense) |
| **Taunt** | 2 | 150ms each | 300ms | Chain 3+ combo |

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

## 10. UNIFIED INPUT SYSTEM — MOBILE, GAMEPAD & DESKTOP

Crash Out: Ring Rush supports three simultaneous input methods. The active method is auto-detected based on which device sends input most recently. The game seamlessly switches UI hints (input legends, focus cursor visibility, touch control panel visibility) without any manual configuration.

### 10.1 Input Abstraction Layer

All input methods are normalized into a single **Action** enum consumed by the game state machine. No game system ever reads raw keyboard/gamepad/touch events directly — everything passes through this abstraction.

```typescript
enum InputAction {
    // Navigation (menus)
    NAV_UP, NAV_DOWN, NAV_LEFT, NAV_RIGHT,
    CONFIRM, BACK, 
    // Gameplay (battle)
    MOVE_LEFT, MOVE_RIGHT,
    ROTATE_CW, ROTATE_CCW,
    SOFT_DROP, HARD_DROP,
    ACTIVATE_SUPER,
    PAUSE,
    // System
    TOGGLE_AUDIO
}
```

**Detection Priority**: If multiple input devices are active, the most recently used one determines UI display mode (legend glyphs, touch panel visibility). There is no conflict — all inputs feed the same action queue.

### 10.2 Mobile Touch Controls

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│                         GAME AREA                            │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────── D-PAD ────────┐     ┌──────── ACTIONS ────────┐  │
│  │                        │     │                          │  │
│  │  ┌──────┐              │     │              ┌────────┐  │  │
│  │  │  ↻   │   ROTATE     │     │              │  ⚡    │  │  │
│  │  │ 58px │              │     │              │  DROP  │  │  │
│  │  └──────┘              │     │              │  70px  │  │  │
│  │  ┌──────┐   ┌──────┐  │     │  ┌──────┐   └────────┘  │  │
│  │  │  ◄   │   │  ►   │  │     │  │  ▼   │   ┌────────┐  │  │
│  │  │ 58px │   │ 58px │  │     │  │ 58px │   │  🔥    │  │  │
│  │  └──────┘   └──────┘  │     │  │      │   │ SUPER  │  │  │
│  │          8px gap       │     │  └──────┘   │  70px  │  │  │
│  └────────────────────────┘     │              └────────┘  │  │
│                                  └────────────────────────┘  │
│   ◄─ thumb arc left ─►             ◄─ thumb arc right ─►    │
│                                                              │
│   bottom: max(env(safe-area-inset-bottom) + 12px, 14px)     │
└──────────────────────────────────────────────────────────────┘
```

#### Button Specifications

| Button | Size | Label | Style | Action |
| :--- | :--- | :--- | :--- | :--- |
| **◄ Left** | 58 × 58 px | `◄` | Gold border, dark bg | `MOVE_LEFT` |
| **► Right** | 58 × 58 px | `►` | Gold border, dark bg | `MOVE_RIGHT` |
| **↻ Rotate** | 58 × 58 px | `↻` | Gold border, dark bg | `ROTATE_CW` |
| **▼ Soft Drop** | 58 × 58 px | `▼` | Gold border, dark bg | `SOFT_DROP` |
| **⚡ Hard Drop** | 70 × 58 px | `⚡ DROP` | Gold border, amber bg | `HARD_DROP` |
| **🔥 SUPER** | 70 × 58 px | `🔥 SUPER` | Red gradient when ready, gray when locked | `ACTIVATE_SUPER` |

#### Touch Engineering Requirements

- **Minimum target**: 58px × 58px (WCAG AAA / Apple HIG / Material Design minimum).
- **Border radius**: 14px with 2px gold (#fbbf24) border.
- **Active press feedback**: `transform: scale(0.92)` applied on `pointerdown`, released on `pointerup`.
- **Event delegation**: A single persistent `pointerdown` listener on the `#app` container routes events via `event.target.closest('[data-action]')`. No per-button listeners. This prevents iOS Safari dropped-tap bugs after DOM mutations.
- **Repeat fire**: ◄ and ► support hold-to-repeat after 180ms initial delay, then 80ms repeat interval (DAS/ARR matching competitive puzzle fighters).
- **SUPER button states**:
  - **Locked** (meter < 100%): `opacity: 0.4`, `pointer-events: none`, gray gradient background.
  - **Ready** (meter = 100%): Red gradient (`#ef4444` → `#b91c1c`), pulsing `box-shadow: 0 0 18px rgba(239, 68, 68, 0.6)` at 0.6s infinite alternate, `pointer-events: auto`.
- **Safe area**: Bottom padding uses `bottom: max(calc(env(safe-area-inset-bottom) + 12px), 14px)` for iPhone home indicator clearance.
- **Landscape detection**: If `window.innerWidth > window.innerHeight × 1.3`, controls split to left and right edges of screen (D-pad on far left, actions on far right) for landscape thumb ergonomics.
- **Visibility**: Touch controls panel is hidden when gamepad or keyboard is the active input method. Re-appears instantly on any touch event.

### 10.3 Gamepad / Controller Support

The Gamepad API (`navigator.getGamepads()`) is polled every frame inside the game loop. The system supports **any standard mapping gamepad** (Xbox, PlayStation, Switch Pro, generic Bluetooth controllers).

#### Gamepad Button Mapping

| Gamepad Button | Standard Index | Menu Action | Battle Action |
| :--- | :--- | :--- | :--- |
| **D-Pad Up** | `buttons[12]` | `NAV_UP` | `ROTATE_CW` |
| **D-Pad Down** | `buttons[13]` | `NAV_DOWN` | `SOFT_DROP` |
| **D-Pad Left** | `buttons[14]` | `NAV_LEFT` | `MOVE_LEFT` |
| **D-Pad Right** | `buttons[15]` | `NAV_RIGHT` | `MOVE_RIGHT` |
| **A / Cross (×)** | `buttons[0]` | `CONFIRM` | `HARD_DROP` |
| **B / Circle (○)** | `buttons[1]` | `BACK` | `ROTATE_CW` |
| **X / Square (□)** | `buttons[2]` | — | `ROTATE_CCW` |
| **Y / Triangle (△)** | `buttons[3]` | Toggle P2 select | `ACTIVATE_SUPER` |
| **Left Bumper (LB)** | `buttons[4]` | — | `ROTATE_CCW` |
| **Right Bumper (RB)** | `buttons[5]` | — | `ACTIVATE_SUPER` |
| **Start** | `buttons[9]` | `CONFIRM` (title) | `PAUSE` |
| **Select / Back** | `buttons[8]` | `BACK` | `PAUSE` |
| **Left Stick** | `axes[0]`, `axes[1]` | Same as D-Pad (deadzone 0.3) | Same as D-Pad |

#### Gamepad Engineering Requirements

- **Polling**: Read `navigator.getGamepads()` once per `requestAnimationFrame` tick.
- **Deadzone**: Analog stick deadzone = 0.3 (ignore values between −0.3 and +0.3).
- **Digital conversion**: Analog stick values beyond ±0.5 are converted to digital press events with the same DAS/ARR repeat logic as keyboard (180ms delay, 80ms repeat).
- **Connection events**: Listen for `gamepadconnected` / `gamepaddisconnected` events. On connect, flash "🎮 Controller Connected" toast (bottom-center, 2s duration, fade). On disconnect during battle, auto-pause.
- **Vibration** (if supported): `gamepad.vibrationActuator.playEffect()` on Power Gem detonation (200ms, 0.5 intensity) and SUPER activation (400ms, 1.0 intensity). Gated by Settings toggle.
- **Multi-gamepad**: First gamepad = P1. Second gamepad = P2 (enables local couch versus — future milestone). Currently, P2 is always AI.

### 10.4 Desktop Keyboard & Mouse

#### Keyboard Mapping

| Key | Menu Action | Battle Action |
| :--- | :--- | :--- |
| **← Arrow Left** | `NAV_LEFT` | `MOVE_LEFT` |
| **→ Arrow Right** | `NAV_RIGHT` | `MOVE_RIGHT` |
| **↑ Arrow Up** | `NAV_UP` | `ROTATE_CW` |
| **↓ Arrow Down** | `NAV_DOWN` | `SOFT_DROP` |
| **W** | `NAV_UP` | `ROTATE_CW` |
| **A** | `NAV_LEFT` | `MOVE_LEFT` |
| **S** | `NAV_DOWN` | `SOFT_DROP` |
| **D** | `NAV_RIGHT` | `MOVE_RIGHT` |
| **X** | — | `ROTATE_CW` |
| **Z** | — | `ACTIVATE_SUPER` |
| **Space** | `CONFIRM` | `HARD_DROP` |
| **Enter** | `CONFIRM` | `HARD_DROP` |
| **Escape** | `BACK` | `PAUSE` |
| **Backspace** | `BACK` | — |
| **Tab** | Toggle P2 select | — |
| **M** | `TOGGLE_AUDIO` | `TOGGLE_AUDIO` |

#### Keyboard Engineering Requirements

- **DAS (Delayed Auto Shift)**: For `MOVE_LEFT` and `MOVE_RIGHT` — initial delay 180ms, then repeat every 80ms while held. This matches competitive puzzle fighter standards (Tetris Guideline DAS).
- **Key repeat suppression**: Use `event.repeat` to detect OS key repeat and suppress it. DAS is implemented internally using timestamps, not OS repeat.
- **Simultaneous keys**: Left + Right pressed simultaneously = no movement (cancel). Down + Left/Right = diagonal soft drop + slide (both actions fire).
- **Prevent defaults**: Arrow keys, Space, Tab, and Escape have `event.preventDefault()` called during gameplay to prevent page scroll, tab-focus-ring, and back-navigation.

#### Mouse Support

| Mouse Action | Menu Behavior | Battle Behavior |
| :--- | :--- | :--- |
| **Hover** | Moves focus cursor to hovered element | No effect |
| **Left Click** | `CONFIRM` on focused/hovered element | Clicks touch control buttons if visible |
| **Right Click** | Select as P2 (Character Select only) | No effect |
| **Scroll Wheel** | Scrolls fighter grid (if overflowed) | No effect |

- Mouse movement causes the touch control panel to hide (switches to keyboard mode).
- Moving the mouse over a menu item instantly moves the focus cursor to that item (no delay).
- Clicking a button triggers its action — identical to tapping on mobile.

### 10.5 Input Method Auto-Detection

```
Active Input Method = most recently used device

On any touch event:        → activeInput = 'touch'
    Show touch control panel. Hide input legend. Hide focus cursor outline.

On any gamepad button:     → activeInput = 'gamepad'
    Hide touch control panel. Show gamepad input legend. Show focus cursor.

On any keyboard keypress:  → activeInput = 'keyboard'
    Hide touch control panel. Show keyboard input legend. Show focus cursor.

On any mouse movement:     → activeInput = 'keyboard' (mouse uses keyboard mode)
    Hide touch control panel. Show keyboard input legend. Show focus cursor.
```

Transitions between input methods are instant (single frame). No confirmation dialogs or settings required.

### 10.6 Focus Cursor System

The focus cursor is a visible gold highlight ring rendered around the currently focused interactive element:

- **Style**: `outline: 3px solid #fbbf24; outline-offset: 4px; border-radius: inherit;`
- **Animation**: Subtle pulse `outline-color` between `#fbbf24` and `#fde047` at 1.2s infinite alternate.
- **Visibility**: Only visible when `activeInput` is `'gamepad'` or `'keyboard'`. Hidden during touch (touch has its own `:active` press feedback).
- **Movement**: Focus moves instantly (no tween). A brief `scale(1.03)` pulse plays on the newly focused element over 150ms `ease-out`.
- **Wrapping**: Focus wraps at list boundaries (bottom of list → top, right of grid → next row left).
- **Memory**: Each screen remembers which element was last focused. Returning to a screen restores the previous focus position.

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
