# CRASH OUT: RING RUSH — PICO-8 PUZZLE BOXING

**Version:** `v3.5.0` (Unique Fighter Idles, Pelvic Fix, Deen Starter & Visual Critique Release)

![Title Screen](assets/pico8_title.jpg)

**Crash Out: Ring Rush** is an 8-bit arcade versus puzzle-fighter developed for the **PICO-8 Fantasy Console**. It fuses the competitive mechanics of Capcom's *Super Puzzle Fighter II Turbo* with the viral Kick warehouse boxing stream culture hosted by **Adrien "The Problem" Broner** and **Deen The Great**.

## 🎮 Play Live (v3.5.0)

- ⚡ **Play Live in Browser (GitHub Pages)**: **[officebeats.github.io/beats-social-media-boxer-game](https://officebeats.github.io/beats-social-media-boxer-game/)**
- 🕹️ **Native PICO-8 Cartridge**: Load [`crash_out.p8`](crash_out.p8) directly inside PICO-8 using `pico8 -run crash_out.p8`.

### Controls
- **Arrow Left / Right**: Move falling gem pair
- **Arrow Down**: Soft drop
- **Arrow Up**: Hard drop (Instant lock)
- **Z**: Rotate Counter-Clockwise
- **X**: Rotate Clockwise / Confirm / Trigger SUPER (when 100%)
- **Y / C / Touch Badge**: Switch Fighter Outfit (Classic vs Alt Viral Skin)
- **B**: View Fighter Bio (Character Select)

---

## 🌟 New in v3.5.0
- 🥊 **Sprite Pelvic Fix & Natural Shorts Hem Wave**:
  - Eliminated the vertical $75\%$ waistline slice in `createTransparentCanvas` that caused unnatural pelvic bulging.
  - Slices whole body as a coherent kinematic unit paired with a **natural horizontal shorts hem ripple** on Frames 1 & 3.
- 🌟 **14 Unique Character-Specific Idle Animation Signatures**:
  - Every fighter now exhibits a bespoke procedural idle stance matching their boxing style and stream persona:
    - **Adrien Broner**: Philly shell shoulder shrug + chin tuck + smirk bounce.
    - **Deen The Great**: Southpaw ball-of-feet bounce + lightning lead hand flick.
    - **Ryan Garcia**: Ultra-fast left hook coil + quiff hair sway.
    - **N3ON**: Hyper streamer glove tap + head bob.
    - **Ray J**: Sunglasses adjust gesture + wide swagger sway.
    - **Blueface**: Low-guard wild groove sway.
    - **Chrisean Rock**: Peekaboo tight guard bobbing.
    - **Rampage Jackson**: Heavyweight tank stomp + monster chain beat.
    - **Adin Ross**: Loose hands stream hype bounce.
    - **Charleston White**: Erratic pointing taunt gesture + head cock.
    - **Coach Bang**: Deep grounded trainer stance + chest expansion.
    - **Antonio Brown (AB)**: Showboat dance shimmy.
    - **Fousey**: G7 aggressive forward pulse.
    - **Sneako**: Technical sparring weave.
- 🏆 **Progressive Character Unlocks & Deen The Great Starter**:
  - Clean game starts feature **Deen The Great** as the default playable starter character (`unlockedFighters: ['deen']`).
  - Defeating each opponent in the 7-Stage Road to Gold unlocks them in the roster:
    - Stage 1 $\rightarrow$ **N3ON**
    - Stage 2 $\rightarrow$ **ADIN ROSS**
    - Stage 3 $\rightarrow$ **BLUEFACE**
    - Stage 4 $\rightarrow$ **COACH BANG**
    - Stage 5 $\rightarrow$ **RYAN GARCIA**
    - Stage 6 $\rightarrow$ **RAMPAGE JACKSON**
    - Stage 7 $\rightarrow$ **ADRIEN BRONER** & all secret guests (**CHRISEAN, CHARLESTON, AB, FOUSEY, SNEAKO, RAY J**).
  - Character Select renders locked characters as dark silhouettes with `🔒` icons and unlock stage hints, preventing locked selections.
- 🦶 **Ring Floor Grounding & Contact Plane Fix**:
  - Both fighters stand flat on the ring floor at exact mat coordinate $Y=90$ on the floor plane ($Y=88..113$), with dark elliptical contact shadows eliminating any floating appearance.
- 🛡️ **Permanent 11-Module Automated E2E Regression Suite (`tests/e2e_regression_suite.py`)**:
  - Added **Module 11 (Automated Visual Critique, Floor Grounding & Progressive Unlocks)** with CDP automated screenshot capture and pixel analysis.
  - Full suite passes 11/11 modules with 0 failures, 0 console errors, and locked 60 FPS performance.
- 🥊 **4-Frame Athletic Boxing Idle Stances**:
  - Replaced static wobbles with authentic $192\times 48\text{px}$ linear 4-frame animation strips playing at 7.5 FPS.
  - **Frame 0**: Neutral High-Guard Athletic Stance (weight centered, chin tucked).
  - **Frame 1**: Elastic Dip & Knee Flexion (torso dips 1px, hands pump downward, athletic coil).
  - **Frame 2**: Spring Extension & Head Bob (bouncing up on balls of feet, torso rises 1px, boots grounded).
  - **Frame 3**: Guard Reset & Lead Glove Rhythm Twitch (lead glove flick and guard reset).
- 🎽 **14 Verified Stream Guests & Alternative Outfits (Skins)**:
  - Added 2nd outfit/skin to all 14 fighters toggleable in Character Select (`Y` key / Gamepad `Y` / `SELECT` / touching the outfit badge):
    - **Adrien Broner**: Classic Gold Trunks ↔ **Bleached Blonde Wave & White/Neon Green Trunks** (*Viral July/August 2026 Stream Look*).
    - **Deen The Great**: Misfits Black Afro & Gold ↔ **Bleached Blonde Afro & Chrome Silver/Hot Pink Trunks** (*Wave Check Stream Look*).
    - **Ryan Garcia**: Black Quiff ↔ **Golden Crown & White/Gold Silk Stream Robe**.
    - **N3ON**: Crashout Blue ↔ **Padded Headgear & Neon Orange Gym Gear**.
    - **Ray J**: Emerald Trunks ↔ **Gold Aviator Sunglasses & Luxury Platinum Silk Robe**.
    - **Blueface**: Famous Blue ↔ **Street Brawl Cash Bandana & Chino Pants**.
    - **Chrisean Rock**: Baddie Pink ↔ **Braided Crown & Camo Combat Trunks**.
    - **Rampage Jackson**: Tank Black ↔ **Pride FC Camo Trunks & Silver Monster Chain**.
    - **Adin Ross**: 777 Hoodie ↔ **White Designer Tee & High Roller Vegas Gold Trunks**.
    - **Charleston White**: Fedora Hat ↔ **Cowboy Hat & Southern Leather Vest**.
    - **Coach Bang**: Coach Grey ↔ **Corner Tracksuit & Digital Stopwatch**.
    - **Antonio Brown (AB)**: CT Showboat ↔ **Retro Football Jersey & Platinum Helmet Cap**.
    - **Fousey**: G7 Headband ↔ **Spiritual Mala Beads & Black Gym Tank**.
    - **Sneako**: Matrix Sparrer ↔ **Red Pill Hoodie & Stealth Black Sparring Gear**.
- 💥 **Game Mechanics & Combat Game Feel Polish**:
  - **360° Super Move Meter Bursts**: Full radial burst particle rings triggering on 100% meter and super attack activation.
  - **Dynamic Floating Combo Cascade Banners**: Floating banners for `COMBO x2`, `COMBO x3`, and `SUPER CASCADE!`.
  - **Pulsating Power Gem & Counter Badges**: High-contrast stone countdown blocks (3 $\rightarrow$ 2 $\rightarrow$ 1) with crack particle bursts and pulsing gold outlines for fused power gems.
  - **Tightened Drop Latency**: Instant soft drop lock-in at ground plane with full wall-kick and floor-kick rotation priority.
- 🔴 **Arcade Home Screen Showcase**:
  - Live Kick Stream Status Marquee Ticker with flashing red recording LED (`LIVE 148K  KICK.COM/BRONER`).
  - Dynamic Hero Boxer Exhibition featuring animated Adrien Broner and Deen The Great bouncing in 4-frame idle animation in center ring.
  - Integrated arcade cheat-sheet controls prompt.
- 🏟️ **9 Dynamic Animated Arenas (Expanded from 6)**:
  1. **Kick Warehouse (Austin, TX)**: Pulsing animated Kick green neon sign + forklift strobe beacon + live stream chat ticker.
  2. **Vegas Casino Arena (Las Vegas, NV)**: Dual golden spotlights sweeping across sky + gold coin sparkles on knockdowns.
  3. **Misfits London Arena (London, UK)**: Cyan/blue laser light beams + flashing paparazzi flashbulbs.
  4. **Miami Stream Mansion (Miami, FL)**: Sunset pink gradient glow + swaying neon palm tree + turquoise pool water ripple reflections.
  5. **TMT Vegas Gym (Las Vegas, NV)**: Floyd's solid gold heavy bag + green cash stack accents + ceiling spotlights.
  6. **Cincinnati Problem Gym (Cincinnati, OH)**: Red brick wall + flashing red warning siren beacon + heavy bag chain sway.
  7. **[NEW] Dubai Penthouse Helipad (Dubai, UAE)**: Rotating Burj Khalifa aerial beacon spotlight + gold rope tassels.
  8. **[NEW] Underground Fight Cage (Atlanta, GA)**: Steel fight cage chainlink lattice + rising floor steam vents.
  9. **[NEW] Tokyo Neon Dome (Tokyo, JP)**: High-speed scrolling Japanese kanji LED ticker (`TOKYO RUSH`) + magenta laser grid.
- 🛡️ **Permanent 10-Module Automated E2E Regression Suite (`tests/e2e_regression_suite.py`)**:
  - Comprehensive CDP automated test harness covering all 10 modules with 0 failures, 0 console errors, and locked 60 FPS performance.
## 🌟 New in v3.3.3
- 🏆 **Strict 7-Stage Tournament Campaign & Anti-Skip Guard**:
  - Implemented strict stage clearance tracking (`clearedStages: [false x 7]`), mathematically preventing players from skipping to Champion without defeating all 7 opponents in sequence.
  - `VICTORY_END` (World Championship 50-0 Belt) is strictly guarded and **CAN ONLY** be awarded after clearing all 7 stages:
    1. Stage 1: **N3ON** *(The Warmup Brawl)*
    2. Stage 2: **ADIN ROSS** *(Miami Stream Raid)*
    3. Stage 3: **BLUEFACE** *(Street Brawl Grudge)*
    4. Stage 4: **COACH BANG** *(Problem Gym Brawl)*
    5. Stage 5: **RYAN GARCIA** *(London Contender Bout)*
    6. Stage 6: **RAMPAGE JACKSON** *(Semi-Final Boss: Tank Power)*
    7. Stage 7: **FLOYD MAYWEATHER** *(World Championship Final Boss: 50-0 Legend)*
  - **Post-Championship Auto-Reset**: Automatically clears completed saves from `localStorage` upon winning the belt, ensuring subsequent runs start cleanly at Stage 1.
  - **Safe Campaign Progression (`advanceCampaignStage`)**: Dedicated stage advancement helper prevents double-incrementing stages or skipping bouts on rapid button taps.
- 🥊 **In-Ring 16-Bit Boxer Sprites 100% Restored**:
  - Direct $48\times 48\text{px}$ pre-scaled sprite blits for both P1 and P2 across all 14 fighters.
- 🛡️ **Permanent 8-Module Automated E2E Regression Suite (`tests/e2e_regression_suite.py`)**:
  - CI/CD test harness enforcing anti-skip guards, 7-stage tournament ladder, knockdown rules, touch ergonomics, and locked 60 FPS performance.
  - **48px Sprite Direct Blitting**: Fixed `drawBoxerAvatar` to sample the native $48\times 48\text{px}$ sprite canvas directly in cutscenes.
  - **Zero Text Truncation**: Shortened press conference header to **`PRESS CONFERENCE`** (16 chars, 79px), eliminating left/right edge cutoff on 128px viewports.
  - **Zero Dialogue Overlap**: Expanded interview dialogue box to $Y=76..114$ with dynamic `nextY` layout, completely separating the post-fight quote from the stage purse earnings.
  - **Clean GBA Select Pill**: Removed text string injection into `#btnMode`, preserving the clean 3D rubber GBA SELECT pill styling.
- 🚀 **Native 48×48px Sprite Pre-Scaling (99.8% Texture Bandwidth Reduction)**: Pre-rendered native sprite canvases for zero-downsampling 60 FPS combat.
- ⚡ **Cached Crowd Dither Pattern**: Replaced 345 individual draw calls per frame with 1 static cached blit.
- ⏱️ **Fixed 60 FPS Timestep Accumulator**: Smooth 60 FPS animation across all 60Hz and 120Hz displays.
- 🥊 **Punch-Out Style 2-Phase Victory Cutscene & Ranking Ladder Climb**: Post-fight press conference followed by tournament ladder climb with red `K.O.` stamp.
- 🎙️ **Authentic 2026 Kick Warehouse Stream Catchphrases**: Real stream lines across all 7 stages (*"ABOUT BILLIONS!"*, *"LIGHTNING STRAIGHT!"*, *"CRASHING OUT!"*).
  5. **Arctic White** (Clean Snow White & Slate Blue)
  6. **Flame Red** (SP Classic Gloss Red & Gold)
  7. **Cobalt Blue** (Deep Metallic Blue & Yellow)
  8. **Platinum Silver** (Brushed Metal & Crimson)
  9. **Cyber Neon** (Miami 80s Synthwave Magenta & Cyan)
  10. **Retro DMG 1989** (Original Game Boy Gray & Maroon)
  11. **Tiger Orange** (Cincinnati Problem Edition)
  12. **Emerald Jade** (Pokemon Rayquaza Jade & Gold)
- 🎬 **Unified Authentic Capcom Boxer Sprites in All Cutscenes**: Replaced primitive block avatars with the exact 16-bit Capcom arcade fighter sprites used in combat across all cutscenes (`STAGE_INTRO`, `STAGE_VICTORY_CUTSCENE`, `LADDER_SHOP`, and `VICTORY_END`).
- 🏆 **Post-Fight Press Conference Cutscenes (`STAGE_VICTORY_CUTSCENE`)**: Upon winning each Road to Gold bout, view the post-fight press conference cutscene with the standing winner flexing, defeated opponent down on canvas, viral stream quotes, and stage purse breakdown before entering the Trainer Gym Shop.
- 🥊 **7-Stage 'Road to Gold' Tournament Campaign (28–35 Min)**: Full tournament ladder progressing through N3ON, Adin Ross, Blueface, Walid Sharks, Ryan Garcia, Semi-Final Boss **Gervonta 'Tank' Davis**, and Final Boss **Floyd 'Money' Mayweather**.
- 🥊 **Knockdown 10-Count Puzzle Survival**: Dropping to 0 HP triggers an authentic referee 10-count. Mash **\`Z\` / \`X\` / \`Space\` / \`Enter\` or tap screen** to fill the **Get-Up Stamina Meter** and score a second-wind recovery (+28 HP) before count 10!
- 🥊 **Three-Knockdown TKO Rule**: Authentic boxing rules where a 3rd knockdown in the same round triggers an immediate technical knockout.
- 🏅 **Multi-Round Best 2-of-3 Engine**: Matches require 2 round victories, tracked via golden glove win indicators (⭐ ⭐) on the HUD.
- 🏪 **Trainer Gym Upgrade Shop (`LADDER_SHOP`)**: Spend stage fight purses on persistent upgrades: **Heavy Hands (PWR Lv 1-3)**, **Iron Chin (DEF Lv 1-3)**, **Fast Hands (SPD Lv 1-3)**, **Diamond Seed Perk**, and **Super Rush Perk**.
- 💾 **Persistent Save & Resume System**: Auto-saves campaign state, purse, and purchased upgrades to `localStorage` so 30-minute runs can be resumed anytime from Mode Select.
- 🔄 **Universal Back & Home Navigation**: Pressing `Escape` or clicking top-left `<` returns smoothly all the way back to the Title/Home screen from any menu.
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
