# Work Plan: Unique Fighter Idle Animations, Pelvic Sprite Fix, Campaign Unlocks, Floor Grounding & Visual Screenshot Critique

## 1. Requirements Summary
- **Fix Sprite Pelvic/Trunk Distortion**: Remove vertical splitting across the waistline in `createTransparentCanvas` (`index.html:2937-2942`) that causes unnatural bulging/pinching. Implement organic whole-body athletic kinematics with subtle horizontal shorts hem sway instead of vertical pelvic stretching.
- **14 Unique Character-Specific Idle Animations**: Implement distinct custom idle animation styles for every fighter on the roster (e.g., Broner Philly Shell shoulder shrug, Deen Southpaw rhythm pulse, Ryan Garcia quick-twitch hook prep, N3ON streamer bounce, Ray J swagger, Rampage tank stomp).
- **Progressive Campaign Character Unlocking (Deen Starter)**: Start the game with **Deen The Great** as the default playable starter character. Defeating each opponent in the 7-Stage Tournament Campaign unlocks that fighter in the roster. Store unlocked fighters in `localStorage` (`ringrush_unlocked_roster`).
- **Fix Boxer Ring Floor Grounding & Floating**: Align boot anchor geometry in `drawBoxer` (`index.html:3104-3260`) and `createTransparentCanvas` so fighter shoe soles contact the flat ring mat plane precisely at $Y=90$, supported by realistic ground contact shadows.
- **Automated Visual Critique & Screenshot Validation in Regression Suite**: Integrate screenshot capture and automated pixel-level critique directly into `tests/e2e_regression_suite.py` and `tests/visual_likeness_critique.py`. Every validation run must capture contact sheets of in-ring grounding, idle frames, and character select screens, verify ground contact shadow pixels, and output visual critique contact sheets to `docs/screenshots/regression_critique/` before declaring completion.

---

## 2. Acceptance Criteria (Testable & Visual Verification)
- [ ] **Criterion 1 (Pelvic Fix)**: `createTransparentCanvas` generates 4-frame strips without vertical waistline slicing artifacts or pelvic bulging. The shorts' bottom edge exhibits clean horizontal movement.
- [ ] **Criterion 2 (Unique Idles)**: Each of the 14 roster fighters has a distinct procedural animation signature in `generateFighterIdleFrame` / `BoxerIdleController` with individual bounce rates, limb offsets, and head bobs.
- [ ] **Criterion 3 (Deen Starter)**: Fresh game launches initialize with only `deen` unlocked (`window.unlockedFighters = ['deen']`). Selecting a locked fighter in Character Select is prevented, and locked cards render with a lock icon and stage unlock requirement.
- [ ] **Criterion 4 (Campaign Unlocks)**: Clearing Stage 1 (N3ON) unlocks N3ON; clearing Stage 2 unlocks Adin; clearing Stage 3 unlocks Blueface; clearing Stage 4 unlocks Coach Bang; clearing Stage 5 unlocks Ryan Garcia; clearing Stage 6 unlocks Rampage; clearing Stage 7 unlocks Adrien Broner and all secret guests.
- [ ] **Criterion 5 (Floor Grounding & Contact Shadow)**: In-ring fighter sprites for both P1 and P2 have their lowest solid boot pixels anchored at $Y=90$ on the floor plane ($Y=88..113$), with no floating gaps and with solid elliptical contact shadows.
- [ ] **Criterion 6 (Automated Screenshot Critique Module in E2E Suite)**: `tests/e2e_regression_suite.py` includes **Module 11: Automated Visual Critique & In-Ring Grounding Screenshot Verification**, capturing and inspecting screenshot pixels for boot contact alignment at $Y=90$, contact shadows, and locked character silhouettes.
- [ ] **Criterion 7 (Full 11-Module E2E Test Suite Pass)**: All 11 modules in `tests/e2e_regression_suite.py` pass with 0 failures, 0 console errors, and locked 60 FPS performance.

---

## 3. Implementation Steps

### Step 1: Fix Sprite Pelvic Deformation & Implement Shorts Hem Sway
- **File**: `index.html` (lines 2920-2960)
- **Changes**:
  - In `createTransparentCanvas`, replace vertical upper/lower split (`upperH = bounds.h * 0.75`) with coherent full-body translation (`dy + 1`, `dy - 1`).
  - Add horizontal shorts hem wave: identify the trunks bottom edge ($relY \approx 0.68..0.74$) and apply a subtle 1px horizontal wave on Frames 1 & 3 without vertical stretching.
  - Anchor the lowest boot pixels exactly at cell bottom $Y=48$.

### Step 2: Implement 14 Unique Character-Specific Idle Animation Profiles
- **File**: `index.html` (lines 2800-2960 & lines 1290-1340)
- **Changes**:
  - Add `FIGHTER_IDLE_PROFILES` mapping each fighter to a unique procedural animation generator in `createTransparentCanvas`:
    1. `broner`: Philly shell shoulder shrug + chin tuck + smirk bounce.
    2. `deen`: Southpaw bouncing on balls of feet + explosive lead hand twitch.
    3. `ryan`: Ultra-fast stance bounce + left hook twitch + quiff hair sway.
    4. `n3on`: Hyper streamer bounce + rapid glove tapping + head bob.
    5. `rayj`: Sunglasses push + wide swagger sway.
    6. `blueface`: Loose low-guard wild groove sway.
    7. `chrisean`: Peekaboo tight guard bobbing.
    8. `rampage`: Heavyweight tank wide stomp.
    9. `adin`: Loose hands stream hype bounce.
    10. `charleston`: Erratic taunting point / head cock.
    11. `bang`: Deep grounded trainer stance + chest expansion.
    12. `abrown`: Showboat dance shimmy.
    13. `fousey`: G7 aggressive forward pulse.
    14. `sneako`: Technical sparring weave.
  - Update `BoxerIdleController` to incorporate fighter-specific timing and movement signatures.

### Step 3: Progressive Character Unlock & Deen Starter Engine
- **File**: `index.html` (lines 3510-3550, 4250-4360, 5000-5060)
- **Changes**:
  - Add `loadUnlockedFighters()` and `saveUnlockedFighters()` managing `unlockedFighters` array (`['deen']` by default on clean game start).
  - In `triggerMatchVictory`, when clearing a campaign stage, unlock the defeated fighter:
    - Stage 1 $\rightarrow$ `n3on`
    - Stage 2 $\rightarrow$ `adin`
    - Stage 3 $\rightarrow$ `blueface`
    - Stage 4 $\rightarrow$ `bang`
    - Stage 5 $\rightarrow$ `ryan`
    - Stage 6 $\rightarrow$ `rampage`
    - Stage 7 $\rightarrow$ `broner` + all secret guests (`chrisean`, `charleston`, `abrown`, `fousey`, `sneako`, `rayj`).
  - In `drawCharSelectScreen`, render locked character cells with dark silhouettes and lock icons (`🔒`), displaying `LOCKED: BEAT STAGE N TO UNLOCK` on the bio card.
  - Prevent locking in or selecting locked characters.

### Step 4: Ring Floor Grounding & Contact Shadow Alignment
- **File**: `index.html` (lines 3100-3270 & lines 4700-4750)
- **Changes**:
  - In `drawBoxer`, ensure `groundY = 90` consistently aligns with ring canvas floor ($Y=88..113$).
  - Draw ground contact ellipse directly beneath boot contact points (`ctx.ellipse(fx, 90, 11, 3)`).
  - Verify that both left fighter (P1) and right fighter (P2, flipped) stand flatly on the mat surface.

### Step 5: Integrate Automated Visual Screenshot Critique into E2E Regression Suite
- **File**: `tests/e2e_regression_suite.py` and `tests/visual_likeness_critique.py`
- **Changes**:
  - Add **Module 11: Automated Visual Critique & In-Ring Grounding Screenshot Verification** to `tests/e2e_regression_suite.py`.
  - Capture in-ring combat screenshots, evaluate pixel data at the boot/mat boundary ($Y=88..92$), verify shadow presence, evaluate locked character select silhouettes, and save critique contact sheets to `docs/screenshots/regression_critique/`.
  - Run full suite and confirm all 11 modules pass with 0 errors.

---

## 4. Verification Plan
1. **Automated 11-Module E2E Test Suite**:
   ```bash
   python tests/e2e_regression_suite.py
   ```
   *Expected Output*: `QA SUMMARY: 11/11 MODULES PASSED (0 FAILURES, 0 ERRORS)`.
2. **Visual Likeness & Alternative Outfit Screenshot Generation**:
   ```bash
   python tests/visual_likeness_critique.py
   ```
   *Expected Output*: Generates 28 character screenshots in `docs/screenshots/roster_critique/` with visual critique verdicts.
3. **60 FPS Combat Performance & Frame Pacing Benchmark**:
   ```bash
   python C:/tmp/benchmark_60fps_heavy_combat.py
   ```
   *Expected Output*: `FPS >= 58.0` with 0 dropped frames and 0 console errors.
