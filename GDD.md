# GAME DESIGN DOCUMENT: CRASH OUT: RING RUSH — PICO-8 PUZZLE BOXING

**Document Version:** 0.1.0 (PICO-8 Reboot / Initial Vertical Slice Specification)  
**Studio:** Antigravity Studios — Retro & Arcade Division  
**Lead Game Producer:** Senior PICO-8 Systems Architect  
**Principal Game Designer:** Puzzle-Fighter & 8-Bit Combat Systems Lead  
**Art Director:** PICO-8 16-Color Pixel Art & UI Lead  
**Target Platform:** PICO-8 Fantasy Console (`.p8` / `.p8.png` Cartridge), Web HTML5 Export, Handheld Consoles (Miyoo Mini, Anbernic, Steam Deck, TrimUI, Powkiddy)  
**Native Display:** 128 × 128 Pixels (1:1 Aspect Ratio)  
**Color Palette:** Fixed PICO-8 16-Color Palette  
**Target Frame Rate:** 30 FPS (`_update()`) / 60 FPS (`_update60()`)  
**Controls:** PICO-8 8-Button Layout (D-Pad + 🅾️ / ❎)  

---

## 1. EXECUTIVE SUMMARY & DESIGN PILLARS

### 1.1 Elevator Pitch

**Crash Out: Ring Rush** is a fast-session 8-bit arcade versus puzzle-fighter built specifically for the **PICO-8 Fantasy Console**. Fusing the head-to-head mechanics of Capcom's *Super Puzzle Fighter II Turbo* with viral Kick warehouse boxing stream culture hosted by **Adrien "The Problem" Broner** and **Deen The Great**, players choose from 14 authentic real-life stream guest fighters, drop, fuse, and detonate color gems on dual 6×12 boards to trigger real-time chiptune punches, counter-attacks, and dramatic pixelated KO finishers on a 128×128 screen.

### 1.2 Authentic Real-Life Stream Guest Verification Rule

> [!IMPORTANT]
> **Strict Roster Rule**: Every single playable fighter on the roster must be a verified real-life guest or host who actually visited and appeared on the Adrien Broner & Deen The Great Kick streams ("Locked In-A-Thon" / Warehouse Streams in 2026). No fictional characters, no generic arcade clones, and no unverified celebrities.

### 1.3 Technical Constraints & Budget

| Constraint | Limit | Implementation |
| :--- | :--- | :--- |
| **Display Resolution** | 128 × 128 pixels | Fixed 1:1 square viewport. Custom dual-board layout with center fighter stage. |
| **Color Palette** | 16 Colors (Fixed) | Color mapping applied across gems, skin tones, ring ropes, and UI highlights. |
| **Controls** | D-Pad + 🅾️ + ❎ | D-Pad (move/drop), 🅾️ (rotate CCW), ❎ (rotate CW / SUPER trigger). |
| **Cartridge Code** | 8,192 Lua Tokens | Modular Lua architecture (`main`, `board`, `fighter`, `ui`, `sfx`). |
| **Compressed Size** | 32 KB | Efficient tile & sprite re-use for 14 verified fighters. |
| **Sprite Memory** | 128 × 128 px (256 8×8 tiles) | Split: 64 tiles for gems/UI, 128 tiles for fighter frames, 64 for FX/fonts. |
| **Audio Synthesizer** | 4 Sound Channels | Ch 0: Melody, Ch 1: Bass, Ch 2: Gem SFX, Ch 3: Punch/KO SFX. |

---

## 2. UNIFIED VISUAL STYLE SPECIFICATION

To ensure complete visual consistency across all characters, arenas, and menus without style drift, all pixel production must adhere to the following rules:

### 2.1 PICO-8 16-Color Palette Mapping

```
 0: #000000 (Black)       - 1px outlines, board backdrops, drop shadows
 1: #1D2B53 (Dark Blue)   - Arena night background, P2 trunks, Blue Counter Shield
 2: #7E2553 (Dark Purple) - Vignette edges, special aura, Ray J outfit
 3: #008751 (Dark Green)  - Dark Green gems, ring post cushions
 4: #AB5236 (Brown)       - Dark skin tones (Broner, Rampage, Davis), leather gloves
 5: #5F574F (Dark Gray)   - Ring corner posts, metal borders, counter shield icons
 6: #C2C3C7 (Light Gray)  - Ring ropes, white gloves, sparkling hit sparks
 7: #FFF1E8 (White)       - Highlighting, timer text, canvas mat top, teeth
 8: #FF004D (Red)         - Red gems, P1 HP bar, KO text, Ryan Garcia gloves
 9: #FFA300 (Orange)      - Orange/Yellow gems, punch impact spark particles
10: #FFEC27 (Yellow)      - Power gem borders, SUPER meter, Gold gloves/trunks
11: #00E436 (Green)       - High HP health bars, N3ON trunks
12: #29ADFF (Blue)        - Blue gems, Deen gloves, stamina gauge
13: #83769C (Lavender)    - Shadow accents, lavender glove variants
14: #FF77A8 (Pink)        - Chrisean Rock top, impact flash, special gems
15: #FFCCAA (Peach)       - Light skin tones (Ryan Garcia, Adin Ross, Walid Sharks)
```

### 2.2 Character Chibi Sprite Rules (16 × 16 px Target)

1. **Proportions**: Head height = 8 px (50%), Body + Legs = 8 px (50%). Bold, readable 8-bit silhouette.
2. **Outlines**: Mandatory 1-pixel solid black outline (Color 0) around the entire exterior silhouette.
3. **Shading**: Maximum of 2 color shades per surface (Base tone + 1 shadow shade from PICO-8 palette).
4. **Gloves & Trunks**: Gloves must be oversized (4×4 px per glove) to clearly communicate punches during gem detonations.

### 2.3 Board & Stage Rules

1. **Gem Cells**: 6 × 8 pixels per cell. Outer 1px black border, 1px highlight line on top-left edge.
2. **Center Arena**: X = 41..86, Y = 15..113 (46px wide). Dark blue background (Color 1) with 3 horizontal ropes (Color 6) at Y = 45, 65, 85.
3. **UI Overlay**: Top HUD (Y = 0..15) with 5px HP bars and 3×5 pixel PICO-8 typography.

---

## 3. VERTICAL SLICE VISUAL TARGET REFERENCES

The following screen mockups serve as the exact visual targets for the vertical slice implementation:

### 3.1 Title Screen Target
![Title Screen](assets/pico8_title.jpg)
- **Target**: 8-bit logo banner, glowing "PRESS X TO START" prompt, 16-color dark blue/red palette.

### 3.2 Character Select Target
![Character Select](assets/pico8_char_select.jpg)
- **Target**: 14-portrait grid, 8-bit name banners ("BRONER", "DEEN"), P1 yellow cursor, P2 cyan cursor.

### 3.3 Fighter Profile Bio Target
![Fighter Profile](assets/pico8_fighter_bio.jpg)
- **Target**: 32×32 pixel portrait of selected stream guest, PWR/SPD/DEF stat bars, special move description.

### 3.4 Arena Stage Select Target
![Arena Stage Select](assets/pico8_arena_select.jpg)
- **Target**: Kick Warehouse, Mayweather Gym, Broner Gym, and Vegas Arena selection map.

### 3.5 Arcade Tournament Ladder Target
![Arcade Ladder](assets/pico8_ladder.jpg)
- **Target**: Vertical 7-stage tournament path leading to Boss Gervonta Davis & Boss Floyd Mayweather.

### 3.6 Active Battle Target — P1 BRONER vs P2 DEEN
![Active Battle Broner vs Deen](assets/pico8_battle_broner_deen.jpg)
- **Target**: Dual 6×12 gem grids (36×96 px), P1 Broner landing jab on P2 Deen in center ring stage, 5px HP bars.

### 3.7 Rivalry Battle Target — DEEN vs WALID SHARKS
![Rivalry Battle Deen vs Walid](assets/pico8_battle_deen_walid.jpg)
- **Target**: Stream rivalry stage, Deen southpaw straight vs Walid Sharks in Kick Warehouse arena.

### 3.8 Boss Fight Target — BRONER vs FLOYD MAYWEATHER
![Boss Fight Floyd Mayweather](assets/pico8_battle_boss_floyd.jpg)
- **Target**: Stage 7 Boss Fight, Floyd Mayweather in all-gold TMT trunks using Philly Shell defense.

### 3.9 K.O. & SUPER Finisher Target
![KO Finisher](assets/pico8_ko_finisher.jpg)
- **Target**: Flashing "K.O.!" text splash, screen shake, defeated fighter flat on canvas, winner celebration pose.

---

## 4. VERIFIED REAL-LIFE STREAM GUEST FIGHTER ROSTER

| Fighter ID | Name | Real-Life Stream Context | Stance & Visual Style | Special Move / Finisher |
| :-: | :--- | :--- | :--- | :--- |
| **01** | **Adrien "The Problem" Broner** | Co-Host of Kick Warehouse Stream | Philly Shell defence, brown skin (#4), red trunks (#8), gold gloves (#10). | **Philly Shell Counter** |
| **02** | **Deen The Great** | Co-Host of Kick Warehouse Stream | Southpaw speed brawler, brown skin (#4), blue trunks (#12), cyan gloves (#12). | **Lightning Left Straight** |
| **03** | **Ryan Garcia** | Guest Boxer at Warehouse Stream | Orthodox stance, peach skin (#15), dark hair, white trunks (#7), red gloves (#8). | **Flash Left Hook** |
| **04** | **N3ON** | Streamer Guest locked in warehouse | Hyper active bouncing, peach skin (#15), neon green trunks (#11), green gloves (#11). | **Crash Out Spam** |
| **05** | **Ray J** | Celebrity Stream Guest | Slick defense, brown skin (#4), purple trunks (#2), sunglasses pixel. | **Glasses Flash Counter** |
| **06** | **Blueface** | Rapper/Boxer Stream Guest | Wild brawler, brown skin (#4), blue trunks (#1), blue gloves (#12), face tattoos. | **Famous Hook** |
| **07** | **Chrisean Rock** | Stream Guest & Personality | Aggressive presser, brown skin (#4), pink top (#14), yellow gloves (#10). | **Baddie Overhand** |
| **08** | **Rampage Jackson** | MMA Legend & Stream Guest | Power slammer, brown skin (#4), red shorts (#8), red gloves (#8). | **Rampage Slam** |
| **09** | **Adin Ross** | Kick Streamer & Collaborator | Balanced stance, peach skin (#15), purple trunks (#2), red gloves (#8). | **Stream Raid Bomb** |
| **10** | **Charleston White** | Iconic Stream Guest | Erratic taunt counter, brown skin (#4), yellow trunks (#10), red gloves (#8). | **Microphone Rant** |
| **11** | **Walid Sharks** | Stream Guest & Deen Rival | Fast counter-puncher, peach skin (#15), cyan trunks (#12), pink trim (#14). | **Shark Attack Combo** |
| **12** | **Antonio Brown** | NFL Star & Stream Guest | Showboat posture, brown skin (#4), gold trunks (#10), gold gloves (#10). | **CT KO Dance** |
| **13** | **Gervonta "Tank" Davis (Boss)** | Champion Boxer & Stream Visitor | Southpaw explosive power, brown skin (#4), all-red trunks (#8), red gloves (#8). | **Tank Uppercut KO** |
| **14** | **Floyd "Money" Mayweather (Boss)**| Boxing Legend & Stream Guest | Philly Shell defense, brown skin (#4), all-gold TMT trunks (#10), gold gloves (#10). | **50-0 Shoulder Roll** |

---

### 4.5 Dual Detonation System & Balancing Rules

To prevent players from getting stuck waiting for Crash Orbs while maintaining strategic depth, the game uses a **Dual-Detonation System**:

1. **Primary Detonation (Crash Orbs & Power Gems)**:
   - Triggered when a Crash Orb or Rainbow Diamond touches a matching color.
   - **Damage & Garbage**: 100% full attack power + 1.6× Power Gem multiplier + 100% Garbage Counter Gem payload sent to opponent.
2. **Secondary Detonation (4+ Contiguous Cluster Auto-Pop)**:
   - Triggered when 4 or more normal gems of the same color connect in a contiguous cluster without a Crash Orb.
   - **Balancing**: Auto-pops after drop lock-down, dealing 50% attack power and sending 50% Garbage payload to opponent (`garbage = floor(clearCount / 2)`).
   - **Strategic Choice**: Players can let clusters auto-pop for quick board clears, or hold them to drop a Crash Orb for massive 100% damage!

---

## 5. CODE STRUCTURE & CARTRIDGE ARCHITECTURE (.p8)

```lua
-- main.p8
function _init()
  state = 0 -- 0:title, 1:select, 2:ladder, 3:battle, 4:ko
  init_title()
end

function _update()
  if (state==0) update_title()
  if (state==1) update_select()
  if (state==2) update_ladder()
  if (state==3) update_battle()
  if (state==4) update_ko()
end

function _draw()
  cls(0)
  if (state==0) draw_title()
  if (state==1) draw_select()
  if (state==2) draw_ladder()
  if (state==3) draw_battle()
  if (state==4) draw_ko()
end
```
