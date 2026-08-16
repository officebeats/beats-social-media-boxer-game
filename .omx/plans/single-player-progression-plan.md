# Single-Player 30-Minute Campaign Progression Plan
**Project:** CRASH OUT: RING RUSH (v2.1.0 Roadmap)  
**File Target:** `C:\Users\admin-beats\Documents\antigravity\lucid-fermi\index.html`  
**Goal:** Transform the single-match 1P mode into a full 7-stage arcade tournament campaign delivering 25–35 minutes of structured, escalating gameplay with persistent meta-progression, boss fights, pre-fight story cutscenes, and an RPG upgrade shop.

---

## 1. Executive Summary & Core Progression Architecture

Currently, `1P VS CPU` in `index.html` triggers a single standalone 1-round match against a random fighter that ends in 60–90 seconds. To deliver an authentic **~30-minute arcade campaign experience**, the game will implement:

1. **7-Stage "Road to Gold" Tournament Ladder (`LADDER_BRACKET`)**:
   * Staged progression climbing through viral stream guests, gym rivals, contenders, and 2 unique boss bouts.
2. **Match Structure: Best 2-out-of-3 Rounds**:
   * Each bout requires 2 round victories (with round win glove icons ⭐ ⭐ displayed on HUD).
   * 7 Stages × 2–3 rounds = 14–21 total rounds = **28 to 35 minutes** of active gameplay.
3. **Trainer Gym & RPG Upgrade Shop (`LADDER_SHOP`)**:
   * Earn fight purses ($KO bonuses, chain bonuses, health preservation).
   * Spend between stages on persistent upgrades (PWR, Iron Chin DEF, Fast Hands SPD, Diamond Seeder, Super Rush).
4. **Pre-Fight Trash Talk Dialogues (`STAGE_CUTSCENE`)**:
   * Character portrait face-offs with authentic viral Kick stream dialogue lines before each bout.
5. **Two-Phase Championship Boss Bouts**:
   * **Stage 6 (Semi-Final Boss)**: Gervonta "Tank" Davis (Power gem crusher, high counter payload).
   * **Stage 7 (Final Boss)**: Floyd "Money" Mayweather (Phase 1: 50-0 Philly Shell Defense $\rightarrow$ Phase 2: TMT Gold Rush aura at <50% HP).
6. **Persistent Save & Resume System (`localStorage`)**:
   * Automatically saves campaign stage, purse, purchased upgrades, and score so runs survive browser reloads.

---

## 2. 7-Stage Ladder Breakdown & Pacing

| Stage | Arena | Opponent | AI Speed & Behavior | Pacing & Duration |
| :---: | :--- | :--- | :--- | :--- |
| **1** | Kick Warehouse | **N3ON / Charleston White** | Drop: 48f, Think: 24f, Basic drops | ~3.0 mins (2 rounds) |
| **2** | Miami Stream Mansion | **Adin Ross / Ray J** | Drop: 42f, Think: 20f, Basic color groups | ~3.5 mins (2 rounds) |
| **3** | Kick Warehouse | **Blueface / Chrisean Rock** | Drop: 36f, Think: 16f, Power gem fusion | ~4.0 mins (2-3 rounds) |
| **4** | Detroit Problem Gym | **Walid Sharks / Antonio Brown / Bang** | Drop: 30f, Think: 12f, Counter-drop timing | ~4.5 mins (2-3 rounds) |
| **5** | London Misfits Arena | **Ryan Garcia / Rampage / Deen / Broner** | Drop: 24f, Think: 10f, Fast chain attacks | ~5.0 mins (2-3 rounds) |
| **6** | Mayweather TMT Gym | **Gervonta "Tank" Davis (Boss)** | Drop: 20f, Think: 8f, Power gem crusher | ~5.5 mins (2-3 rounds) |
| **7** | Las Vegas Arena | **Floyd "Money" Mayweather (Final Boss)** | Drop: 16f, Think: 6f, 2-Phase TMT Gold Rush | ~6.5 mins (2-3 rounds) |
| **TOTAL** | — | **Full 7-Stage Campaign** | **Escalating difficulty & speed** | **~30 to 34 minutes** |

---

## 3. Game State Machine & Navigation Map

```
TITLE
  └── MODE_SELECT
        ├── 1. "CAMPAIGN (30 MIN)"  ──► CHAR_SELECT (P1 Only)
        │                                   └── LADDER_BRACKET (Stage Map)
        │                                         └── STAGE_INTRO (Trash Talk Cutscene)
        │                                               └── PLAYING (Best of 3 Rounds)
        │                                                     ├── Round Won ──► Next Round
        │                                                     ├── Match Won ──► LADDER_SHOP (Buy Upgrades) ──► Next Stage
        │                                                     └── Match Lost ──► CONTINUE_SCREEN (3 Continues)
        ├── 2. "QUICK MATCH (1P VS CPU)" (Single-round arcade exhibition)
        ├── 3. "2P LOCAL BATTLE" (2-player shared keyboard)
        └── 4. "ENDLESS SURVIVAL" (Unlocked post-game infinite gauntlet)
```

---

## 4. Feature Specifications

### 4.1 Best 2-out-of-3 Round System
* `p1RoundWins` and `p2RoundWins` tracked per match.
* When a player tops out or HP hits 0:
  * If winner has `< 2` round wins: Trigger "ROUND 1 OVER" $\rightarrow$ "ROUND 2 FIGHT!" banner with board reset while maintaining match score.
  * If winner reaches `2` round wins: Trigger match victory $\rightarrow$ award stage purse $\rightarrow$ transition to `LADDER_SHOP`.

### 4.2 Trainer Gym Upgrade Shop (`LADDER_SHOP`)
* **Purse Calculation**:
  $$\text{Stage Purse} = \$1000 + (\text{HP Remaining} \times 10) + (\text{Max Chain} \times 200) + (\text{Clean Sweep Bonus if 2-0: } \$500)$$
* **Available Upgrades**:
  1. 🥊 **Heavy Hands (PWR)** (Levels 1–3: $500, $1000, $2000): +10%/+20%/+35% clear damage + extra counter rows sent.
  2. 🛡️ **Iron Chin (DEF)** (Levels 1–3: $500, $1000, $2000): Reduces incoming garbage gem count by 15%/30%/45%.
  3. ⚡ **Fast Hands (SPD)** (Levels 1–3: $500, $1000, $2000): Faster soft drop and instant piece lock-in speed.
  4. 💎 **Diamond Seed Perk** ($1500): Spawns 1 guaranteed Rainbow Diamond on the 10th drop of every round.
  5. 💥 **Super Rush Perk** ($1200): Special Meter builds 30% faster from gem clears.

### 4.3 Pre-Fight Trash Talk Dialogues
* Pre-fight dialogue box rendered above stage preview.
* Features 2-line back-and-forth between player and opponent.
* Pressing `Enter` / `X` skips to fight.

### 4.4 Boss Mechanics (Tank Davis & Floyd Mayweather)
* **Tank Davis**:
  * Deals 1.4× garbage damage on Red/Yellow power gem detonations.
  * Drops special "Heavy Counter" blocks requiring 4 turns to count down instead of 3.
* **Floyd Mayweather**:
  * **Philly Shell Aura**: -25% damage taken from all normal gem clears.
  * **TMT Gold Rush (Phase 2 at <50% HP)**: Screen flashes gold, background plays TMT sirens, dropping Gold Breakers every 8 pieces.

---

## 5. Technical Implementation Steps in `index.html`

1. **Campaign Data & Ladder Configuration**:
   * Add `CAMPAIGN_STAGES` array defining opponents, arenas, AI parameters, dialogue lines, and purse rewards.
   * Add `CAMPAIGN_SAVE` state: `currentStage`, `purse`, `upgrades`, `continues`, `totalScore`, `startTime`.
2. **State Machine Expansion**:
   * Add states: `LADDER_BRACKET`, `STAGE_INTRO`, `LADDER_SHOP`, `CONTINUE_SCREEN`, `VICTORY_END`.
3. **Round Management Engine**:
   * Expand `startMatch()` to support multi-round resets without page reloads.
   * Render golden glove round victory counters beneath P1 and P2 health bars.
4. **AI Difficulty Scaling Engine**:
   * Scale AI think speed (`aiTimer`), column targeting accuracy, and drop speed per `CAMPAIGN_STAGES[currentStage].aiConfig`.
5. **Shop UI & Upgrade Apply Logic**:
   * Render retro pixel shop interface with purchase buttons, stat level meters, and purse counter.
   * Apply upgrade modifiers in `detonateGem()`, `receiveGarbage()`, and `triggerSuper()`.
6. **Local Storage Persistence**:
   * Auto-save after every stage clear; add "RESUME CAMPAIGN" button to Title/Mode Select screen.

---

## 6. Verification & Acceptance Criteria

* [ ] **30-Minute Target**: Full 7-stage run through Stage 7 takes between 26 and 36 minutes.
* [ ] **Best of 3 Rounds**: Matches require 2 round wins to advance; round transitions are seamless.
* [ ] **Scaling AI**: Stage 1 AI is beatable by beginners; Stage 6 (Tank) and Stage 7 (Floyd) require strategic power gems and diamond usage.
* [ ] **Persistent Upgrades**: Purchased PWR/DEF/SPD upgrades visibly alter damage, garbage reception, and meter charging.
* [ ] **Local Save/Resume**: Refreshing the browser at Stage 4 restores the exact stage, purse, and upgrades on "RESUME".
* [ ] **Zero Performance Regressions**: Maintains smooth 60 FPS rendering with zero memory leaks across all 7 stages.
