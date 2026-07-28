# Ring Rush 2.5D Vertical Slice Plan

## Product decision

Build a portrait-first mobile puzzle-fighting game with full-size hand-pixeled late-1990s arcade boxer sprites composited over a real-time 3D arena. The working title is **Ring Rush**.

The vertical slice is one polished Player-vs-AI match featuring Adrien Broner and Deen the Great. It ships first as an installable PWA and retains a direct iOS/Android path through Capacitor. Friend-code multiplayer and paid content packs are planned through interfaces only; neither is part of the first playable slice.

The accepted visual reference is `docs/concepts/ring-rush-core-screens-v4-broner-parallax.png`. V1 through V3 remain in the repository as non-destructive comparison points.

## Repository reset and foundation

1. Connect the local empty Git repository to `officebeats/beats-social-media-boxer-game`, fetch `main`, and create `codex/vertical-slice`.
2. Remove every tracked file from the Antigravity/PICO-8 attempt. Preserve it only in Git history.
3. Create a clean Babylon.js 9, TypeScript, Vite, Vitest, Playwright, PWA, and Capacitor 8 project with a locked dependency file.
4. Use a single Babylon canvas. Do not add React or another application framework.
5. Establish reproducible commands for development, linting, type checking, unit tests, browser tests, production build, PWA validation, and Capacitor synchronization.

## Runtime architecture

Keep puzzle rules independent from Babylon and platform services.

- `GameCommand`: rotate, move, soft drop, hard drop, activate super, pause, and rematch inputs.
- `PuzzleState`: board, active pair, queue, counters, chain state, meter, and top-out status.
- `MatchState`: both puzzle states, fighter states, timer, round result, RNG seed, and rules version.
- `GameEvent`: gem landed, clear, chain, attack sent, damage, super, top-out, and result events.
- `ArenaCue`: camera, lighting, particles, sprite animation, sound, hit-stop, and haptic cues derived from game events.
- `Replay`: rules version, seed, fighter IDs, content versions, and ordered command stream.

Use a fixed-step deterministic simulation and seeded random generator. The renderer, AI, audio, and future networking consume state and events without owning gameplay rules.

## Core screen flow

1. **Title:** Ring Rush logo, Broner and Deen faceoff, Fight and Options.
2. **Fighter Select:** two selectable fighters plus locked, non-commercial future roster silhouettes.
3. **Match Intro:** short in-engine camera push and fighter introductions; not a separate interactive screen.
4. **Gameplay:** 3D arena in the upper 38 percent, large six-column player board, compact opponent board, next piece, chain indicator, meters, and Super button.
5. **Pause:** Resume, Controls, Audio, and Quit over dimmed live gameplay.
6. **Results:** winner pose, maximum chain, gems cleared, match time, Rematch, and Home.

Landscape and tablet layouts expand to two equal boards with the arena centered. Portrait remains the primary design and acceptance target.

## Puzzle and combat slice

- Six-column by twelve-row visible board plus hidden spawn area.
- Falling two-gem pieces with left/right movement, rotation, soft drop, and hard drop.
- Same-color groups, rectangular power gems, crash gems, rainbow clears, timed counter gems, chains, garbage patterns, and top-out.
- Original jewel designs and terminology where needed; no extracted art, audio, fonts, UI, or branded assets from existing games.
- Player clears emit attack events. The opposing fighter reacts, attacks, blocks, or takes damage while counter gems are delivered.
- Meter is earned through clears and chains.
- Broner super converts up to four oldest counter gems into normal gems.
- Deen super adds two locked turns to the next garbage packet.
- One Normal-difficulty heuristic AI prioritizes survival, crash opportunities, power-gem construction, chains, attack value, and tactical super use with humanized reaction delays.
- First to top out loses. Results support instant rematch.

All timings, meter values, garbage tables, AI weights, and fighter abilities live in versioned data configuration.

## 2D fighter pipeline

Use Codex with built-in ImageGen and the audited, commit-pinned Agent Sprite Forge `generate2dsprite` skill. Apply OpenAI Game Studio's sprite-pipeline rules as the quality policy.

The production art target is premium late-1990s arcade pixel animation: hand-placed pixel clusters, crisp stair-stepped silhouettes, selective dark outlines, compact five-to-seven-tone ramps, limited dithering, exaggerated readable boxing anatomy, and nearest-neighbor scaling. Do not use smooth digital painting, vector characters, 3D fighter renders, low-effort pixel filters, or copied characters and costumes from existing fighting games. Only fighters and fighter portraits use this retro sprite treatment; arenas, effects, puzzle gems, typography, and interface panels remain modern and high-resolution.

1. Build an approved likeness/model sheet for each fighter from authorized references.
2. Lock face, build, tattoos, hair, gloves, trunks, sprite resolution, pixel grid, palette, silhouette, standing height, and foot anchor. Broner's lock specifically preserves his compact welterweight proportions, rounded face, close waves, broad nose, full lips, dense boxed beard, and upper-body tattoo coverage; do not inflate him into a generic heavyweight silhouette.
3. Generate separate multi-row grids for each action rather than one mixed atlas.
4. Keep fighter body frames separate from hit sparks, trails, dust, and super effects.
5. Normalize every grounded action through one shared scale profile and bottom-center/feet anchor.
6. Run strict clipping, scale-drift, anchor-drift, transparency, and identity checks.
7. Assemble approved frames into lossless PNG atlases and JSON animation manifests; display them with nearest-neighbor sampling and integer-friendly scale.
8. Preview every action inside the real arena before acceptance.

Vertical-slice animations:

- Idle: 6 frames looping.
- Intro: 8 frames.
- Jab/light attack: 5 frames.
- Heavy attack: 7 frames.
- Block: 3 frames.
- Hurt: 4 frames.
- Knockdown/KO: 8 frames.
- Super: 10–12 frames.
- Win: 8 frames.

Every visual iteration must pass the visual-verdict gate at 90 or higher. Production likenesses require user approval before animation expansion.

## 3D arena and effects

Create one original underground streaming fight venue in Blender and export it as optimized GLB.

- Modeled ring, ropes, corner posts, light trusses, LED walls, crowd tiers, fog cards, and city backdrop.
- Baked environment lighting with a small number of real-time accent lights.
- Build the venue as independently movable depth bands: close foreground ropes and ringside silhouettes, fixed fighter plane, ring midground, crowd/LED background, and far venue/city layer.
- Drive subtle lateral and vertical parallax from one bounded camera input. Initial tuning targets are `1.0` foreground, `0.65` ring midground, `0.25` crowd/LED background, and `0.10` far architecture; tune by device and motion preference.
- Slow camera drift during play; short bounded pushes and shakes for chains and supers. Camera effects alter arena depth bands only and never move screen-space puzzle UI.
- Fighters remain on a fixed combat plane and always read as flat illustrated sprites.
- Puzzle boards are screen-space and cannot move, tilt, blur, or become obscured by arena cinematics.
- Use perspective, scale falloff, selective occlusion, volumetric haze, reflections, and particles at different depths so the flat retro sprites remain visually grounded in the 3D ring.
- Use separate particles for jewel breaks, impact sparks, trails, smoke, and crowd flashes.
- Use KTX2/compressed environment textures, GLB assets, level-of-detail meshes, and adaptive effects.

Quality profiles control render scale, shadows, crowd density, bloom, particles, and reflections. WebGL2 is the baseline; no gameplay-critical effect depends on WebGPU.

## Music and audio direction

Use original or properly licensed instrumental dark melodic trap: 75–95 BPM, spacious synth textures, clean sliding 808s, crisp hats, and restrained cinematic impacts. The target is current Atlanta trap energy without copying any artist, recording, melody, vocal cadence, or producer signature.

- The accepted temporary soundtrack and license workflow live in `docs/audio-direction.md`.
- Use the CC0 track `Try me!` for title and fighter select.
- Use the CC0 track `The Mafia Game` for match gameplay.
- Keep short adaptive overlays for pressure, chains, and supers separate from the base tracks.
- Music must remain subordinate to puzzle feedback, hit cues, announcer lines, and accessibility signals.
- Keep lossless source masters outside the public runtime directory.
- For the temporary soundtrack, prefer CC0/public-domain tracks and archive the source URL, author, download date, exact filename, and license snapshot.
- Keep track IDs and mix behavior data-driven so a future commissioned soundtrack can replace stock music without gameplay changes.

## Mobile, PWA, and app-store path

- Gesture controls: horizontal drag, tap/short swipe to rotate, downward drag for soft drop, downward flick for hard drop, and a dedicated Super button.
- Visible control-button fallbacks and a Controls overlay.
- Respect iOS/Android safe areas, reduced motion, vibration preference, audio interruption, background/resume, and orientation changes.
- Target 60 FPS on iPhone 12/Pixel 6-class hardware with a stable reduced-quality profile for older devices.
- Cache the shell and current match assets for offline play.
- Lazy-load high-resolution fighter and arena assets after the title screen.
- Package the same web build through Capacitor for Android and later iOS.

## Future multiplayer seam

Do not build a server in the vertical slice.

- Preserve deterministic commands, snapshots, replay hashes, and versioned rules.
- Keep local AI and human input behind the same command interface.
- Future friend-code matches use an authoritative server and exchange commands rather than rendered state.
- Match handshakes include rules, fighter, arena, and content-pack versions.
- Reconnect and desync recovery can restore from a verified snapshot plus command tail.
- Select a free-tier-compatible provider only when multiplayer work begins and after rechecking current limits.

## Future paid DLC seam

Do not add a storefront, payment SDK, account system, advertising, premium currency, subscriptions, or purchase UI now.

- Treat the base game and future fighters, arenas, music, announcers, and cosmetics as versioned `ContentPack` manifests.
- Give every fighter, arena, ability, localization bundle, and asset a stable ID and `sourcePackId`.
- Add a `ContentRegistry` during the core architecture so base and optional content resolve through the same path.
- Add an `EntitlementProvider` interface later with development, Apple StoreKit, Google Play Billing, and web adapters.
- Start with non-consumable fighter/stage bundles. No loot boxes or statistical upgrades.
- Paid fighters must be balanced sidegrades and cannot produce stronger universal rules.
- Entitlements gate selection, not rendering: clients must be able to download and display an opponent's paid fighter in multiplayer.
- Saves and replays retain unknown content IDs safely and fall back without corruption.
- Native purchases support restoration, server-side receipt verification, refunds/revocation, and optional account-based cross-platform synchronization.

Apple and Google store rules must be rechecked when monetization begins. Commercial use of real names or likenesses requires explicit merchandising and revenue rights.

## Verification and acceptance

- Unit tests cover every puzzle rule, rotation, collision, power-gem merge, crash, rainbow clear, counter timer, garbage pattern, super, and top-out.
- Determinism tests prove identical seeds and commands produce identical snapshots and replay hashes.
- Automated AI simulations complete thousands of matches without stalls, illegal moves, memory growth, or nondeterminism.
- Playwright tests cover the title-to-rematch flow, touch controls, pause/resume, offline start, and common phone viewports.
- Visual tests confirm the player board remains dominant, opponent information remains readable, and supers never obscure either board.
- Asset validation checks frame bounds, scale, anchors, animation transitions, atlas metadata, GLB loading, texture budgets, and missing provenance.
- Performance profiling covers sustained frame pacing, memory, thermal behavior, asset loading, and input latency on representative mobile hardware.
- Production builds must pass lint, typecheck, unit tests, browser tests, PWA audit, Android smoke build, and later iOS simulator/device testing.

## Delivery milestones

1. Clean repository foundation and deterministic board sandbox.
2. Complete puzzle rules with tests and debug replay viewer.
3. Portrait mobile gameplay using temporary approved-shape assets.
4. Player-vs-AI match and fighter-event choreography.
5. Canonical Broner and Deen art approval, then production sprite atlases.
6. Optimized 3D arena, camera, lighting, particles, audio, and haptics.
7. Full title-to-rematch screen flow matching the approved concept.
8. Performance, accessibility, PWA, Android, and regression hardening.
9. Vertical-slice release candidate.

## Constraints

- The user writes no code; agents implement and verify the project.
- The repository remains public.
- Real-person likenesses and paid use remain gated by documented rights.
- The game may reproduce genre mechanics and timing feel but must use original presentation, code, artwork, audio, branding, and writing.
- Multiplayer and monetization remain deferred until the single-player slice is fun, polished, stable, and performant.
