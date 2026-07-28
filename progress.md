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
