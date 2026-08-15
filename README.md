# CRASH OUT: RING RUSH — PICO-8 PUZZLE BOXING

**Version:** `v1.8.0` (Comprehensive 56-Quadrant Punch Normalization & Forensic QA Release)

![Title Screen](assets/pico8_title.jpg)

**Crash Out: Ring Rush** is an 8-bit arcade versus puzzle-fighter developed for the **PICO-8 Fantasy Console**. It fuses the competitive mechanics of Capcom's *Super Puzzle Fighter II Turbo* with the viral Kick warehouse boxing stream culture hosted by **Adrien "The Problem" Broner** and **Deen The Great**.

---

## 🎮 Play Live (v1.8.0)

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

## 🌟 New in v1.8.0
- 🥊 **56-Quadrant Punch Engine Normalization**: 100% of all 4 punches (Jab, Straight, Hook, Uppercut) across all 14 fighters on disk forensically normalized to extend rightward $\to$, guaranteeing every single punch connects directly into the opponent's chest on both Player 1 and Player 2 sides of the ring.
- 🥊 **Stream Regular Added**: **BANG WILLIAMS** (`bang` / Coach Bang), longtime Kick warehouse boxing trainer, added with custom 16-bit Capcom pixel art idle sprite and 4-quadrant punch grid.
- 🥊 **Proportional Fousey G7 Overhaul**: Completely re-proportioned Fousey's idle sprite and punch sheet to match the authentic 16-bit Capcom arcade boxer build (eliminating the oversized chibi head mismatch).
- 💥 **14 Unique Special Moves & Cut-Ins**: Every character now features signature punch animations, custom damage scaling, and board-clearing effects (e.g. *Bang Body Combo*, *G7 Crash Out*, *Red Pill Counter*, *Flash Left Hook*, *About Billions*).
- 🏟️ **6 Dynamic Arenas**: Kick Warehouse (pulsing neon), Vegas Strip (moving searchlights), London Misfits 00X (stadium floodlights), Miami Stream Mansion (pool & dusk), Mayweather TMT Gym, and Detroit Problem Gym.
- 🎨 **Authentic Deen the Great Likeness**: Golden-caramel light-skinned Black complexion with sharp buzz cut.
- 👁️ **100% Direction-Normalized Sprites**: All 14 fighters natively face right, ensuring Player 1 and Player 2 always face each other eye-to-eye.
- 💎 **Pure Puzzle Fighter Core Engine**: 3D beveled gems, power gem multi-cell fusion, pulsating circular crash breaker orbs, stone countdown timers, and real-time garbage offsetting.
- 🔤 **100% Native 4x5 Pixel Font Engine**: Direct bitmap font matrix delivering razor-sharp retro typography across all screens with zero blur.
- 🔴 **Zero Foot Artifacts**: Clean alpha transparency with grounded boots on the ring canvas floor at $Y=90$ and elliptical drop shadows.
- 📺 **Live Broadcast Stream HUD**: Real-time Kick chat ticker with viewer counters and donation alerts.

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
