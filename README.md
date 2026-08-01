# CRASH OUT: RING RUSH — PUZZLE BOXING

<div align="center">

![Crash Out Ring Rush Title Screen](assets/title_screen_mockup_1785555675601.jpg)

**The Ultimate Arcade Versus Puzzle-Fighter of Modern Influencer & Championship Boxing**

[![Version](https://img.shields.io/badge/version-7.0.0-gold.svg)](https://github.com/officebeats/beats-social-media-boxer-game/releases/tag/v7.0.0)
[![Tech Stack](https://img.shields.io/badge/stack-TypeScript%20%7C%20Vite%20%7C%20HTML5%20Canvas%20%7C%20Web%20Audio-cyan.svg)](https://github.com/officebeats/beats-social-media-boxer-game)
[![Target Platforms](https://img.shields.io/badge/platforms-Mobile%20Web%20%7C%20Desktop%20%7C%20Gamepad-red.svg)](https://github.com/officebeats/beats-social-media-boxer-game)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

</div>

---

## 🥊 EXECUTIVE SUMMARY & GAME DEFINITION

**Crash Out: Ring Rush** is an arcade versus puzzle-fighter that fuses the head-to-head mechanics of Capcom’s *Super Puzzle Fighter II Turbo* with the viral spectacle of the 2026 Kick warehouse streams ("Locked In-A-Thon" / "Crash Out Boyz") hosted by **Adrien "The Problem" Broner** and **Deen The Great**.

Players select from 14 authentic stream guest celebrities—including **Ryan Garcia, Ray J, N3ON, Blueface, Chrisean Rock, Rampage Jackson, Adin Ross, Charleston White, Walid Sharks, Antonio Brown, Gervonta Davis, and Floyd Mayweather**—dropping, fusing, and detonating gem pairs to trigger real-time punches, counter-attacks, and cinematic SUPER finishers inside a 3-layer parallax boxing arena.

---

## 🌟 KEY DESIGN PILLARS

1. **Super Puzzle Fighter II Parity**: 6×12 grid, candidate pair rotations with wall-kicks, 2×2+ Power Gem fusion, glowing Crash Orb color-match detonations, character-specific Counter Gem drop patterns, and cascading chain combos.
2. **Tactile Arcade Impact**: Real-time combat visualizer linking puzzle actions directly to animated 16-bit fighter stances, hit spark directional flashes, screen shake impulse curves, and procedural synth audio.
3. **Authentic 2026 Stream Roster**: Features celebrities who actually appeared on Adrien Broner & Deen The Great's 2026 Kick warehouse marathons.
4. **Unified Active Battle Aesthetic**: Every screen in the game—from menus and mode ladders to tutorials—is built around the high-energy visual splash, 16-bit Capcom pixel art, electric neon lighting, and gold/cyan 3D metallic bevel style of the Active Battle View.
5. **Sub-100ms Ergonomics & Multi-Input**: Mobile touch controls (58px+ targets), full Gamepad API support (Xbox, PlayStation, Switch Pro), and Desktop Keyboard/Mouse input with automatic detection.

---

## 🎮 GAME MODES & SCREEN WALKTHROUGH

### 1. Title Screen & Title Sparring Plane
The entryway to the game features metallic red and gold 3D bevel typography for **CRASH OUT: RING RUSH** with a cyan neon **PUZZLE BOXING** subtitle. In the background plane, 16-bit chibi sprites of **Adrien Broner** and **Deen The Great** shadowbox on the ring mat under volumetric spotlights.

![Title Screen](assets/title_screen_mockup_1785555675601.jpg)

---

### 2. Main Menu
Mode selection framed in glowing metallic gold cards with electric neon outlines against the dark arena venue backdrop.

![Main Menu](assets/main_menu_mockup_1785555687774.jpg)

- **SINGLE PLAYER ARCADE MODE**: Gauntlet solo campaign against 7 stream opponents.
- **VERSUS CPU**: Quick match against configurable AI difficulty (Easy, Normal, Hard).
- **HOW TO PLAY**: Visual tutorial on gem mechanics, Power Gems, and SUPER finishers.
- **SETTINGS**: Audio volume sliders, screen shake toggle, FPS counter, and controller mapping.

---

### 3. Single Player Arcade Mode ("Locked-In Warehouse Championship")
The core solo campaign features a 7-stage battle ladder framed by glowing boxing ring ropes. Players select their fighter and climb through stream guests to claim the Kick Warehouse Championship Belt.

![Single Player Arcade Mode Ladder](assets/arcade_mode_mockup_1785555697837.jpg)

#### Gauntlet Ladder Stages
- **Stage 1**: N3ON *(Twin Spike Countdown Rain)*
- **Stage 2**: Ray J *(Tech Grid Scanner)*
- **Stage 3**: Blueface *(Randomized Noise Barrage)*
- **Stage 4**: Ryan Garcia *(KingRy Flash Cross)*
- **Stage 5**: Adrien Broner *(Philly Armor Heavy Block)*
- **Stage 6 [BOSS]**: Gervonta "Tank" Davis *(Solid Monochromatic Red Wall)*
- **Stage 7 [GRAND BOSS]**: Floyd "Money" Mayweather *(Pure Gold Wall)*

*Defeating Stage 6 and Stage 7 permanently unlocks Tank Davis and Floyd Mayweather as playable roster choices.*

---

### 4. Character Select Screen
Grid of 14 strict 16-bit Capcom arcade chibi pixel art portrait cards. Selecting a card updates the bottom stat panel with animated progress bars (HP, Power, Speed, Super Charge Rate), passive ability callouts, and Counter Gem drop pattern previews.

![Character Select Screen](assets/character_select_mockup_1785555825691.jpg)

---

### 5. Active Battle View (The Core Visual Benchmark)
The primary gameplay screen splits into three visual and interactive layers:
- **Top Arena Zone (30%)**: 3-layer parallax boxing ring where 16-bit pixel fighters animate jabs, hooks, uppercuts, and hit sparks in real time.
- **Mid Puzzle Zone (50%)**: Dual 6×12 puzzle boards with faceted gems, 2×2 fused Power Gems, glowing Crash Orbs, and floating combo callouts (`CHAIN ×3!`).
- **Bottom Touch Zone (20%)**: Elevated 58px+ touch controls (D-Pad, rotate, soft drop, hard drop, SUPER button) with gold bevel borders.

![Active Battle View](assets/battle_screen_mockup_1785554702942.jpg)

---

### 6. Pause Menu Overlay
Dimmed 60% dark blurred overlay over the frozen active battle view, displaying a centered gold-bordered metallic modal card with RESUME, RESTART, SETTINGS, and QUIT MATCH buttons.

![Pause Menu Overlay](assets/pause_menu_mockup_1785555910596.jpg)

---

### 7. Results & Victory Screen
Gold-bordered victory presenter card framed with intense gold and cyan neon ambient glow, displaying winner name, match stats (Max Chain, Total Clears, Match Duration), and the glowing **SHARE FIGHT CARD** generator button.

![Victory Screen](assets/victory_screen_mockup_1785555728023.jpg)

---

### 8. How To Play Tutorial
Interactive tutorial screen detailing gem matching, 2×2 Power Gem fusion, glowing Crash Orb detonations, and SUPER finisher activation.

![How To Play Tutorial](assets/how_to_play_mockup_1785555737435.jpg)

---

## 🥊 COMPLETE 14-FIGHTER ROSTER & SPRITE SHEET CATALOG

Every fighter uses an **8-column × 4-row grid** (32 cells total, 128×256 px per cell) containing their base rhythm bounce (`IDLE_BOUNCE`), persona fidget quirks (`FIDGET_A` & `FIDGET_B`), punch combos, signature SUPER finisher, hurt recoil, KO fall, and victory poses.

### 1. Adrien "The Problem" Broner (Stream Host)
- **Idle**: *Philly Hairbrush Bounce* (pulls out gold hairbrush and brushes beard every 2nd loop).
- **SUPER Finisher**: *"Can't Play With Me"* — Flashes cash stack to camera, yells catchphrase, charges 3-punch combo with gold bill particle explosions (600 Dmg + 5-row Heavy Red Block).

![Adrien Broner Sprite Sheet](assets/broner_sprite_sheet_1785554714478.jpg)

---

### 2. Deen The Great (Stream Host)
- **Idle**: *Misfits High Guard Bounce* (adjusts headband with right glove).
- **SUPER Finisher**: *"Misfits Combo Blitz"* — 360° spin step into a 6-hit light speed combo with cyan speed ribbons (520 Dmg + Alternating Stair Drop).

![Deen The Great Sprite Sheet](assets/deen_sprite_sheet_1785555207273.jpg)

---

### 3. Ryan Garcia (Warehouse Guest)
- **Idle**: *KingRy Flash Stance* (touches gold cross necklace, micro shadow-jabs).
- **SUPER Finisher**: *"KingRy Flash Left Hook"* — Screen flashes white, Ryan teleports across canvas for a time-stopping left hook (620 Dmg + Flash Cross pattern).

![Ryan Garcia Sprite Sheet](assets/ryan_sprite_sheet_1785555218620.jpg)

---

### 4. Ray J (Warehouse Guest)
- **Idle**: *Raytroniks Glasses Push* (taps blue LED glasses, adjusts jacket).
- **SUPER Finisher**: *"Raytroniks Tech Overload"* — Aims blue laser scanner at rival board, converting rows into tech gems (520 Dmg + Gold/Blue Tech Grid).

![Ray J Sprite Sheet](assets/rayj_sprite_sheet_1785555982110.jpg)

---

### 5. N3ON (Stream Collaborator)
- **Idle**: *Twitch Chat Fidget* (adjusts gaming headset/mic, checks stream chat).
- **SUPER Finisher**: *"Twitch Chat Agitation"* — Red stream chat spam fills screen as N3ON launches a frantic slap flurry (480 Dmg + Twin Spike Countdown Rain).

![N3ON Sprite Sheet](assets/n3on_sprite_sheet_1785555993704.jpg)

---

### 6. Blueface (Talent Show Guest)
- **Idle**: *Off-Beat Brawler Sway* (shoulder shrugs out of rhythm, taps face tattoo).
- **SUPER Finisher**: *"Thotiana Off-Beat Knockout"* — Off-beat dance step into a wide right haymaker with deep blue flame trails (580 Dmg + Random Noise Barrage).

![Blueface Sprite Sheet](assets/blueface_sprite_sheet_1785556005149.jpg)

---

### 7. Chrisean Rock (Boxing Match Guest)
- **Idle**: *South Beach Aggro Stinger* (chews gum, cracks knuckles, double-taps canvas).
- **SUPER Finisher**: *"South Beach Crash Out Brawl"* — Roars and charges with a flying tackle-punch, causing screen shake and rope warp (590 Dmg + Brawler Wall).

![Chrisean Rock Sprite Sheet](assets/chrisean_sprite_sheet_1785556014771.jpg)

---

### 8. Rampage Jackson (Warehouse Guest)
- **Idle**: *MMA Chain Howl* (holds thick metal neck chain, slaps chest, howls).
- **SUPER Finisher**: *"Rampage Cage Slam"* — Lifts opponent overhead and slams them onto the ring canvas mat (640 Dmg + Heavy Slam pattern).

![Rampage Jackson Sprite Sheet](assets/rampage_sprite_sheet_1785556023544.jpg)

---

### 9. Adin Ross (Kick Collab Host)
- **Idle**: *Streamer Hype Chair Spin* (180° spin on gaming chair with purple mic).
- **SUPER Finisher**: *"Brand Risk Overload"* — Yells "IS THAT A W?!", purple stream frame flashes, Adin throws a lucky overhand right (500 Dmg + Checkerboard).

![Adin Ross Sprite Sheet](assets/adin_sprite_sheet_1785556035356.jpg)

---

### 10. Charleston White (Stream Rant Guest)
- **Idle**: *Crash Out Rant* ("LISTEN HERE!" speech bubbles pop, checks pepper spray).
- **SUPER Finisher**: *"Mace & Mic Crash Out"* — Sprays yellow mace cloud to stun rival, followed by a heavy mic club swing (510 Dmg + Rant Grid).

![Charleston White Sprite Sheet](assets/charleston_sprite_sheet_1785556045716.jpg)

---

### 11. Walid Sharks (Deen's Rival)
- **Idle**: *Speed Bag Reflex Shuffle* (fluid bob-and-weave with rapid micro shadow punches).
- **SUPER Finisher**: *"Flash Counter Uppercut"* — Slips incoming punch with back-bend dodge, exploding into a soaring rainbow-trail uppercut (510 Dmg + Rainbow Array).

![Walid Sharks Sprite Sheet](assets/walid_sprite_sheet_1785556053613.jpg)

---

### 12. Antonio Brown / AB (Stream Guest)
- **Idle**: *Business Boomin Shrug* (points to 84 on chest, shoulder-shrug dance).
- **SUPER Finisher**: *"84 Business Boomin Catch KO"* — Leaps high as if catching a touchdown pass, spikes punch downward with money explosions (560 Dmg + Business Grid).

![Antonio Brown Sprite Sheet](assets/ab_sprite_sheet_1785556065270.jpg)

---

### 13. Gervonta "Tank" Davis [BOSS]
- **Idle**: *Southpaw Hood Stare* (menacing southpaw posture under hoodie, adjusts gold belt).
- **SUPER Finisher**: *"Tank Explosive Uppercut"* — Red vignette fills screen with `thump-thump` heartbeat audio; slow-motion left uppercut sends rival flying off-screen (700 Dmg + Solid Red Wall).

![Gervonta Davis Sprite Sheet](assets/tank_sprite_sheet_1785555228672.jpg)

---

### 14. Floyd "Money" Mayweather [GRAND BOSS]
- **Idle**: *TBE Philly Roll & Coin Toss* (untouchable Philly Shell shoulder roll, flips gold coin).
- **SUPER Finisher**: *"TBE 50-0 Masterclass"* — Dodges 3 punches in slow-motion matrix style, delivering a 5-punch surgical masterclass combination (680 Dmg + Pure Gold Wall).

![Floyd Mayweather Sprite Sheet](assets/floyd_sprite_sheet_1785555239394.jpg)

---

## 🛠️ TECHNICAL ARCHITECTURE

```
crash-out-ring-rush/
├── GDD.md                          # Comprehensive Game Design Document (v7.0.0)
├── README.md                       # This File (Production Catalog & Manual)
├── index.html                      # Clean HTML5 Entry Point & Canvas Stack
├── package.json                    # Vite + TypeScript + Vitest Setup
├── assets/                         # Production Screen Mockups & Sprite Sheets
├── src/
│   ├── main.ts                     # Boot, State Machine & Core Loop
│   ├── style.css                   # Dark Arcade Aesthetics & Touch Ergonomics
│   ├── engine/
│   │   ├── types.ts                # Interfaces (Gems, Board, Fighter, Actions)
│   │   ├── puzzle.ts               # Pure Functional Puzzle Matrix Engine
│   │   ├── fighters.ts             # 14-Fighter Roster Registry & Abilities
│   │   ├── ai.ts                   # 3-Tier AI Placement Scoring Engine
│   │   └── audio.ts                # Zero-Dependency Web Audio Synthesizer
│   ├── render/
│   │   ├── arena.ts                # 3-Layer Parallax Arena Renderer
│   │   ├── board.ts                # Dual 6×12 Gem Board Canvas Renderer
│   │   ├── fighters.ts             # Sprite Sheet Animation & Fidget Controller
│   │   ├── particles.ts            # Hit Sparks, Aura, Combo Text, KO Flash
│   │   └── camera.ts               # Camera Drift & Screen Shake Controller
│   └── ui/
│       ├── screens.ts              # UI Screen Builders (Title, Menu, Arcade, Select)
│       ├── hud.ts                  # HP Bars, SUPER Meters, Timer
│       └── controls.ts             # Touch, Gamepad & Keyboard Delegation Layer
└── test/
    ├── puzzle.test.ts              # Unit Tests for Gravity, Fusion & Detonation
    ├── ai.test.ts                  # Unit Tests for AI Placement Scoring
    └── camera.test.ts              # Unit Tests for Parallax Camera Drift
```

---

## 🚀 GETTING STARTED

### Prerequisites
- Node.js 18+ & npm

### Development Setup
```bash
# Clone the repository
git clone https://github.com/officebeats/beats-social-media-boxer-game.git
cd beats-social-media-boxer-game

# Install dependencies
npm install

# Start Vite development server
npm run dev

# Run Vitest suite
npm test
```

---

## 📜 PRODUCTION CREDITS

- **Executive Production**: Antigravity Studios
- **Game Design & Engineering**: Lead Competitive Puzzle & Fighting Game Systems Architect
- **Art Direction**: 16-Bit Capcom Arcade Pixel Art & Dark Esports UI Division
- **Audio Architecture**: Procedural Web Audio Arcade Synthesizer

---

<div align="center">

**Crash Out: Ring Rush** — Copyright © 2026 Antigravity Studios. All Rights Reserved.

</div>
