Original prompt: Build a polished, mobile-friendly Ring Rush vertical slice that replaces the old PICO-8/Antigravity prototype. Use retro Street Fighter/Marvel vs. Capcom-style 2D sprites for Adrien Broner and Deen the Great over a modern 3D boxing-ring background with parallax. Match classic competitive falling-gem puzzle-fighter feel with original assets. Use Try Me on the title screen and The Mafia Game in matches. Preserve seams for future multiplayer and paid DLC without prioritizing either.

## 2026-07-27

- Fetched `origin/main` and created `codex/vertical-slice` from commit `800b10b`.
- Removed the tracked PICO-8/web-export prototype while preserving it in Git history.
- Preserved approved V4 concepts, audio assets, license records, and vertical-slice plan.
- Generated and alpha-extracted production-oriented Broner and Deen four-state sprite strips.
- Generated separate far venue, 3D ring midground, and close foreground parallax layers.
- Started clean TypeScript/Vite/Babylon/PWA project foundation.
- Implemented deterministic six-by-twelve puzzle rules, special gems, chains, garbage/counters, supers, seeded AI, top-out, and match events.
- Implemented title, select, match, pause, results, home, and rematch with keyboard, touch buttons, and swipe/tap controls.
- Integrated the approved music manifest and runtime track switching.
- Integrated independent venue, ring, fighter, and foreground layers with bounded pointer/device-orientation parallax.
- Added lazy-loaded Babylon ambient rendering without blocking the title screen.
- Verified desktop and 390 × 844 portrait layouts in the in-app browser.
- Ran the required deterministic Playwright game driver through move, rotate, soft-drop, and hard-drop action bursts; text state and screenshots matched.
- Visual verdict iteration 9: 92/100, pass.
- Added a side-aware facing rule so both fighters always look toward one another; iteration 10 visual verdict: 94/100, pass.

## Current TODO

- Playtest and tune fall speed, attack tables, AI, meter gain, and super balance.
- Expand four-state art strips into full multi-frame animation atlases.
- Add jewel break/hit particles and haptics after timing is locked.
- Add Capacitor Android/iOS projects after the PWA vertical slice is approved.
- Multiplayer and paid content remain interface-level future work only.

## 2026-07-28 mock-fidelity pass

- New request: capture screenshots while testing the basic game flow and revise the implementation toward the approved six-screen arcade mock.
- Baseline visual verdict: 68/100. Character and arena art are directionally correct; board geometry, frame density, metallic controls, contrast, and desktop composition need revision.
- First target: constrain square puzzle cells, strengthen arcade framing and HUD hierarchy, brighten the ring, and capture title/select/match/pause/results evidence.
- Reproduced the deployed FIGHT action successfully, but found navigation rendering was deferred to `requestAnimationFrame` and the PWA used a stale-prone cache-first navigation policy. Navigation now renders synchronously, and service-worker navigations are network-first with an offline fallback.
- Revised the shared screen frame, title hierarchy, fighter-select cards, HUD portraits, health/timer chrome, board proportions, faceted gems, center rail, SUPER control, pause modal, and results styling toward the approved mock.
- Captured and visually inspected 390 × 844 title, select, active match, pause, and results screenshots with the required game driver.
- Exercised title → select → match → pause → resume → results → rematch and pause → quit → title with no browser console errors.
- Final visual verdict: 96/100, pass. Design QA is recorded in `design-qa.md`.

## 2026-07-28 mobile motion and match-start polish

- Reproduced the reported match jank and traced it to a full match-screen DOM rebuild every 100 milliseconds.
- Refactored live play so the match shell, fighters, boards, controls, listeners, and CSS animation state remain mounted; only board cells, timer, next pair, chain, meter, poses, and impact text update in place.
- Added a guarded 1.3 second ROUND 1 / FIGHT opening so simulation and controls begin after an intentional visual handoff.
- Added persistent fighter breathing, directional attack/recoil motion, active-gem motion, screen transitions, hover/press feedback, and requestAnimationFrame-interpolated parallax.
- Removed the fixed 560/420 pixel minimum-height constraints and added dedicated 320-pixel portrait and short-landscape game layouts.
- Verified gameplay at 320 × 568, 390 × 844, 430 × 932, and 844 × 390 with visible boards and touch controls and no console errors.
- Confirmed the match screen and board DOM nodes stay stable across live timer ticks.
- Passed lint, TypeScript, 5 deterministic puzzle tests, and the production Vite build.
- Final visual verdict for the motion pass: 94/100, pass. Remaining character-animation depth depends on future multi-frame sprite atlases rather than DOM/CSS fixes.

## 2026-07-28 Puzzle Fighter sprite staging and idle pass

- Used an official Super Puzzle Fighter II Turbo gameplay capture to measure fighter scale, baseline, negative space, and relationship to the puzzle wells.
- Added fighter identity classes and preserved Broner and Deen's native per-frame aspect ratios instead of stretching both into the same percentage box.
- Reduced the match fighters to a compact stage band, placed both feet on one ring baseline, and separated the stage from the board frames.
- Replaced the barely visible idle bob with a 1.6-second stepped breathing and weight-shift cycle, offset between fighters; attack and hurt poses still override idle.
- Preserved reduced-motion behavior so continuous idle movement collapses to the static stance when the OS/browser requests it.
- Verified the revised staging at 320 × 568, 390 × 844, 430 × 932, and 844 × 390. Touch controls remained visible and active pieces responded correctly.
- Explicitly preloaded Babylon's default shaders before arena material creation, eliminating an in-app-browser shader initialization race and its console errors.
- Visual verdict iteration 9: 94/100, pass.

## 2026-07-28 fighter aspect-ratio correction

- Reproduced the reported 590 × 559 select screen and measured both card fighter containers at approximately 1.54:1, versus native frame ratios of 0.586:1 for Broner and 0.624:1 for Deen.
- Replaced the negative horizontal card inset with centered height-based sizing and moved both source-frame ratios into shared fighter identity tokens used by select and match screens.
- Added a bounded near-square match breakpoint so corrected fighters retain stage presence without overlapping the puzzle wells.
- Added localhost-only worker and Ring Rush cache cleanup so stale production PWA modules cannot mask current development styling.
- Captured and inspected before/after evidence at 590 × 559 plus 320 × 568, 390 × 844, and 844 × 390 select and match states.
- Visual verdict iteration 12: 95/100, pass.
