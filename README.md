# CRASH OUT: RING RUSH — PICO-8 PUZZLE BOXING

**Version:** `v2.1.0` (30-Minute Arcade Campaign & 10-Count Knockdown Survival Release)

![Title Screen](assets/pico8_title.jpg)

**Crash Out: Ring Rush** is an 8-bit arcade versus puzzle-fighter developed for the **PICO-8 Fantasy Console**. It fuses the competitive mechanics of Capcom's *Super Puzzle Fighter II Turbo* with the viral Kick warehouse boxing stream culture hosted by **Adrien "The Problem" Broner** and **Deen The Great**.

---

## 🎮 Play Live (v2.1.0)

- ⚡ **Play Live in Browser (GitHub Pages)**: **[officebeats.github.io/beats-social-media-boxer-game](https://officebeats.github.io/beats-social-media-boxer-game/)**
- 🕹️ **Native PICO-8 Cartridge**: Load [`crash_out.p8`](crash_out.p8) directly inside PICO-8 using `pico8 -run crash_out.p8`.

### Controls
- **Arrow Left / Right**: Move falling gem pair
- **Arrow Down**: Soft drop
- **Arrow Up**: Hard drop (Instant lock)
- **Z**: Rotate Counter-Clockwise
- **X**: Rotate Clockwise / Confirm / Trigger SUPER (when 100%)
- **B**: View Fighter Bio (Character Select)

---

## 🌟 New in v2.1.0
- 🏆 **7-Stage "Road to Gold" Arcade Campaign (28–35 Min)**: Full tournament ladder progressing through N3ON, Adin Ross, Blueface, Walid Sharks, Ryan Garcia, Semi-Final Boss **Gervonta "Tank" Davis**, and Final Boss **Floyd "Money" Mayweather** (Phase 1 50-0 Philly Shell & Phase 2 TMT Gold Rush).
- 🥊 **Knockdown 10-Count Puzzle Survival**: Dropping to 0 HP triggers an authentic referee 10-count. Fallen fighters actively drop and clear gems to fill the **Get-Up Stamina Meter** to score a dramatic second-wind recovery (+28 HP) before the count of 10!
- 🥊 **Three-Knockdown TKO Rule**: Authentic boxing rules where a 3rd knockdown in the same round triggers an immediate technical knockout.
- 🏅 **Multi-Round Best 2-of-3 Engine**: Matches require 2 round victories, tracked via golden glove win indicators (⭐ ⭐) on the HUD with round-over transitions.
- 🏪 **Trainer Gym Upgrade Shop (`LADDER_SHOP`)**: Spend stage fight purses on persistent upgrades: **Heavy Hands (PWR Lv 1-3)**, **Iron Chin (DEF Lv 1-3)**, **Fast Hands (SPD Lv 1-3)**, **Diamond Seed Perk**, and **Super Rush Perk**.
- 💬 **Pre-Fight Trash Talk Dialogues (`STAGE_INTRO`)**: Authentic character face-off cutscenes with viral Kick stream dialogue lines before each bout.
- 💾 **Persistent Save & Resume System**: Auto-saves campaign stage, purse, and purchased upgrades to `localStorage` so 30-minute runs can be resumed anytime from the Mode Select menu.
- 🥊 **Street Fighter Authentic Punch Animation Engine**: Full-body 4-quadrant sprite swaps with 3-phase strike kinematics (windup coil, extension hold with hit sparks/haptics, smoothstep recovery).
- 🧭 **100% Direction-Normalized 56-Punch Matrix**: Quadrant normalization ensures all 14 fighters strike forward toward the opponent.
- 🔴 **Zero Floating Sprites**: Tight auto-crop bounding boxes anchor every boxer's boots directly on the ring floor at $Y=90$ with grounded shadows.
- ⚡ **Natural Ducking & Defense Kinematics**: Eliminated sprite squashing in favor of authentic boxing slips, dips, and waist leans at full 100% resolution.
### Title Screen
![Title Screen](assets/pico8_title.jpg)

### Character Select (14 Verified Stream Guests)
![Character Select](assets/pico8_char_select.jpg)

### Fighter Profile & Bio (Ryan Garcia)
![Fighter Profile](assets/pico8_fighter_bio.jpg)

### Stream Arena Selection
![Arena Select](assets/pico8_arena_select.jpg)

### Arcade Tournament Ladder
![Arcade Ladder](assets/pico8_ladder.jpg)

### Active Battle View (P1 BRONER vs P2 DEEN)
![Active Battle Broner vs Deen](assets/pico8_battle_broner_deen.jpg)

### Stream Rivalry Matchup (DEEN vs WALID SHARKS)
![Rivalry Battle Deen vs Walid](assets/pico8_battle_deen_walid.jpg)

### Boss Fight (BRONER vs FLOYD MAYWEATHER)
![Boss Fight Floyd Mayweather](assets/pico8_battle_boss_floyd.jpg)

### K.O. & SUPER Finisher Screen
![KO Finisher](assets/pico8_ko_finisher.jpg)

---

## 🌟 Verified Real-Life Stream Guest Roster

Every character on the 14-fighter roster represents a verified host or guest from the 2026 Kick warehouse boxing streams:

1. **Adrien "The Problem" Broner** (Co-Host, Philly Shell Defense)
2. **Deen The Great** (Co-Host, Lightning Southpaw Straight)
3. **Ryan Garcia** (Warehouse Stream Guest, Flash Left Hook)
4. **N3ON** (Streamer Guest, Crash Out Spam)
5. **Ray J** (Celebrity Stream Guest, Glasses Flash Counter)
6. **Blueface** (Rapper/Boxer Stream Guest, Famous Hook)
7. **Chrisean Rock** (Stream Guest, Baddie Overhand)
8. **Rampage Jackson** (MMA Legend Stream Guest, Rampage Slam)
9. **Adin Ross** (Kick Collaborator, Stream Raid Bomb)
10. **Charleston White** (Iconic Stream Guest, Microphone Rant)
11. **Walid Sharks** (Stream Guest & Deen Rival, Shark Attack Combo)
12. **Antonio Brown** (NFL Star Stream Guest, CT KO Dance)
13. **Gervonta "Tank" Davis** (Boss, Tank Uppercut KO)
14. **Floyd "Money" Mayweather** (Final Boss, 50-0 Shoulder Roll)

---

## 🛠️ PICO-8 Technical Specifications

- **Native Resolution**: 128 × 128 Pixels (1:1 Aspect Ratio)
- **Palette**: PICO-8 Fixed 16-Color Palette
- **Frame Rate**: 30 FPS (`_update()`) / 60 FPS (`_update60()`)
- **Controls**: D-Pad + 🅾️ (Rotate CCW / Select) + ❎ (Rotate CW / SUPER)
- **Audio**: 4-channel native PICO-8 chiptune synthesizer
- **Target Budget**: ≤ 8,192 Lua Tokens, 32 KB compressed cart size

---

## 📄 Documentation

- **Game Design Document**: [`GDD.md`](GDD.md)
