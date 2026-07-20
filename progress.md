Original prompt: proceed with the plan and build and test it through a full end to end playthrough and fix any bugs or issues that you find. Then tell me when it's ready for me to play a full polished version of the game

# Locked-In Ring Progress

## Status

Release candidate complete on July 18, 2026. The cartridge, `.p8.png`, responsive HTML export, automated test drivers, and public-safe documentation are present under `locked-in-ring/`.

## Delivered

- Six selectable fictional fighters: two leads and four public-safe guest archetypes.
- Continuous footwork with three derived distance bands, contact-gated head/body boxing, guard, slip, counters, stamina, hype, AI, knockdowns, decisions, corners, results, rematch, and title return.
- Warehouse pixel-art presentation, portrait HUD, card UI, effects, and PICO-8 SFX.
- Physical PICO controls plus responsive portrait/landscape mobile touch controls.

## Final Verification

- Static release check: pass.
- Deterministic desktop victory as A.B. Problem: pass through five training beats, four cards, focus reroll, knockout, and rematch.
- Deterministic desktop loss as D. Great: pass through five training beats, four cards, rest path, knockout loss, and title return.
- Normal-speed campaign: pass with production 13-second prep windows and 45-second round clock.
- Mobile portrait: touch-only full campaign pass at `390x844`; 371px square canvas and controls do not overlap.
- Mobile landscape: startup/input pass at `844x390`; canvas is centered between controls.
- Balance: 100 fixed-seed AI matches, `54` A.B. wins and `46` D. Great wins.
- Visual verdict: `92/100`, pass against the exact live impact frame.
- Independent in-app browser: title render pass with no console errors.

## Environment

- PICO-8 0.2.7: `C:\Program Files (x86)\PICO-8\pico8.exe`
- Aseprite: not installed; final art uses palette-constrained PICO-8 primitives
- Browser build: `http://127.0.0.1:4173/`

## Second Production Pass

User request: improve fighter sprite fidelity toward the generated reference, let players choose or skip each training session with fight consequences, and deepen the boxing mechanics.

Baseline audit:

- Current visual fidelity reset to `61/100`; fighters are readable but undersized and under-detailed relative to the reference.
- Training is currently a fixed five-beat sequence rather than player-directed camp planning.
- Combat already has range, high/low guard, slips, counters, stamina, guard breaks, and signatures, but needs clearer feedback, input buffering, combo structure, and strategic feints.

Completed second pass:

- Each of five camp days now offers Roadwork, Pad Calls, or Noise Check; players can skip immediately with `X`.
- Every skipped day adds visible ring rust and reduces fight stamina, guard, lock-in, and outgoing damage.
- Combat now includes `up + O` feints, jab-to-rear links, late-input buffering, timed slips, whiff counters, clean-power-punch range changes, fatigue damage scaling, shared combo chains, and full-hype cash-outs.
- Fighters were enlarged and redrawn with thicker outlined limbs, larger gloves and heads, planted stances, beard/braid profiles, shirt/bare-chest contrast, and deeper purple versus green/yellow color blocking.
- The user-supplied target is preserved as `reference/art-direction-lock.png` and is the canonical reference for future art work.

Second-pass verification:

- Exact exported desktop campaigns: trained path and five-skip path pass with natural outcomes and no browser errors.
- Exact exported mobile campaign: portrait `390x844`, landscape `844x390`, and real two-finger feint input pass with no overlap or browser errors.
- Production-speed campaign: pass through full camp and a natural round-one win.
- Generated diagnostic balance cart: `53` A.B. wins and `47` D. Great wins over 100 fixed-seed matches.
- Visual verdict: `92/100`, pass against `reference/art-direction-lock.png` at native PICO-8 scale.
- Static release and public-name checks: pass.

## Third Production Pass

User request: make the fighters physically meet before a hit can register, tighten their ring spacing, and push the native silhouettes closer to the approved art reference.

Completed third pass:

- Replaced abstract range stepping with independent continuous positions, a 28-pixel non-overlap boundary, and distance bands derived from actual separation.
- Unified gameplay and rendering around one reach table for jab, rear hand, body jab, hook, and uppercut; damage, block reactions, hit sparks, and pushback cannot occur before glove contact.
- Added step-in punches, contact whiffs, knockdown position resets, and visible power-shot pushback.
- Rebuilt arms and legs as thick, two-segment limbs with visible elbows and knees; widened stances and trunks, exposed facial cues, and preserved the purple-versus-green rivalry palette.
- Simplified hidden Camp Hand complexity to protect PICO-8 cartridge budget: named guest cards remain in the deck but use readable suit stat packages, and opaque set-synergy bonuses were removed.
- Rebalanced fighter identities to a `54-46` split across 100 fixed-seed AI matches.

Third-pass verification:

- Exact desktop trained and five-skip campaigns: pass; both capture a real impact frame and complete result/restart flows without browser errors.
- Exact mobile campaign: portrait `390x844` and landscape `844x390` pass with unobstructed touch controls.
- Production-speed campaign: pass through camp, natural fight result, and restart with the final contact and balance model.
- Manual screenshot review: glove contact, tighter spacing, crouched silhouettes, ring framing, and mobile layout verified against `reference/art-direction-lock.png`.

## Atlas Art Pass

User objective: make the shipped game resemble `reference/art-direction-lock.png` as closely as possible while remaining a real PICO-8 cartridge.

Completed atlas pass:

- Replaced generic procedural bodies with a custom 128x128 PICO-8 atlas generated by `tools/build-fighter-atlas.py`.
- Authored separate A.B. and D. Great body silhouettes with smaller athletic head proportions, clothing folds, shoes, socks, trunks, torso shading, beard highlights, and trailing braids.
- Replaced procedural HUD faces with atlas-backed portrait busts.
- Kept procedural arms and gloves so guard, jab, rear hand, body shots, hooks, and uppercuts still use the collision system's shared reach table.
- Added the reference's environmental hierarchy: purple wall mark, red and blue hanging bags, boxer poster, overhead lights, crowd silhouettes, and red/white/blue ropes.
- Added a `--single` screenshot-iteration mode to the desktop playthrough driver.

Atlas-pass verification:

- Strict visual verdict: `92/100`, pass against `reference/art-direction-lock.png` using the exact exported impact frame.
- Exact desktop trained and five-skip campaigns: pass with captured contact frames and no browser errors.
- Mobile portrait `390x844` and landscape `844x390`: pass with the atlas scene unobstructed above touch controls.
- Fixed-seed balance: `54` A.B. wins and `46` D. Great wins over 100 bouts.
- Cartridge export, public-name check, Node syntax, Python atlas compilation, PowerShell parsing, and state JSON: pass.

## Recognizable Faces And Boxing Moves Pass

- Refined full-body and HUD faces with short-hair, eyebrow, eye, ear, cheek, beard, jaw, and highlighted-braid clusters.
- Made `X` an explicitly labeled long rear straight and allowed `up + X` uppercuts to be attempted from any range, with natural close-range reach limits.
- Strengthened directional dodge readability with a deeper pullback; successful head slips build hype and open a longer counter window, while body shots still land.
- Gave feints a visible half-jab pose and a longer next-punch speed/damage window.
- Added distinct windup and active poses for straight, body jab, bent-elbow body hook, and rising uppercut.
- Moved hit sparks to head or body height based on the punch that actually landed.
- Added temporary in-fight move labels and expanded GPIO diagnostics for deterministic move verification.
- Added `tools/move-check.cjs`, which asserts and captures dodge, feint, straight, body jab, body hook, and uppercut states from a real exported fight.

## Undisputed-Inspired Movement Pass

- Used Undisputed's official loose/flat-footed movement, directional punch, feint, and defensive-tool descriptions as design references without copying assets or controls.
- Replaced rigid one-pixel translation with acceleration, deceleration, stamina-scaled travel, and a speed-attribute modifier.
- Added alternate planted lower-body frames; the upper body can now slip, recoil, load, and transfer weight without sliding both feet.
- Split every punch into load, contact, early retraction, and guard-return poses. Straights rotate farther, hooks retain elbow bend, and uppercuts rise from a crouched load.
- Expanded the exported diagnostics and move test to assert forward movement, minimum separation, windup, contact, and halfway retraction.
- Verified desktop trained/skip campaigns, normal-speed campaign, portrait/landscape touch layouts, and focused move captures with no browser errors.
- Final deterministic balance: 49 A.B. wins and 51 D. Great wins over 100 bouts.

## Blocking And Counter Pass

- Added planted diagonal guards: `back + up` leans behind a high block and `back + down` leans behind a body block without walking backward.
- Normal blocks now apply meaningful chip, guard wear, and short block recovery; lean blocks reduce both; late matching blocks negate chip and produce the strongest counter tier.
- Counter opportunities now carry a tier and commit to a punch when it starts, preserving startup advantage and bonus damage through contact.
- AI can brace while defending and prioritizes plausible return punches during counter windows.
- Added guard-impact torso recoil, defensive contact rings, lean-block silhouettes, perfect-return messaging, and counter-specific startup labels.
- Added `tools/defense-check.cjs` to verify normal, lean, and perfect blocks plus the complete committed-counter chain.
- Consolidated the three training timing implementations into one cue engine to stay below PICO-8's 8192-token limit; selected drills still apply their distinct camp stats and retain separate labels.
- Final exported results: normal block `3 HP / 8 guard`, high and body lean blocks `1 HP / 2 guard`, perfect block `0 HP` with a 17-frame tier-three return, and the verified straight counter dealt 14 damage.
- Desktop trained/skip campaigns, normal-speed campaign, mobile portrait/landscape layouts, move suite, defense suite, and release boot all pass; current 100-bout balance is 44 A.B. wins to 56 D. Great wins.

## Arcade Animation Pass

- Translated high-readability fighting-game motion principles into the PICO-8 budget: planted silhouettes, visible anticipation, decisive contact, short impact holds, and staged recovery.
- Expanded footwork to a four-beat shuffle with two authored lower-body poses, alternating compression, and a lifted rear heel while preserving a boxing-width stance.
- Added continuous windup and recovery interpolation, subtle idle hand movement, stronger stun lean, and a restrained straight-punch smear at full extension.
- Added impact hit-stop scaled by punch/counter strength. Inputs pressed during the freeze are buffered so the added weight does not make controls feel unresponsive.
- Added `tools/animation-check.cjs` to verify four distinct walk poses, a three-frame clean-straight freeze, bounded recovery motion, and a jab buffered during hit-stop.
- Removed decorative training-menu icons and an unused hidden bonus to keep the cartridge below PICO-8's 8192-token ceiling without cutting training choices, boxing moves, or the Camp Hand system.
- Final deterministic balance remains close at `45` A.B. wins to `55` D. Great wins across 100 fixed-seed bouts.

## Broadcast UI Pass

- Reworked the fight HUD into a fixed red health, blue stamina, and yellow guard stack for both fighters; the center panel retains round, clock, and a compact player-hype readout.
- Removed the debug-style distance label from the live HUD so every persistent element now represents a player-controlled resource or match state.
- Rebuilt fighter select with a dedicated top heading and separate corner-color name bands, eliminating portrait, name, and body overlap.
- Simplified the active training header to day, drill, score, misses, and seconds remaining; camp choice and card screens retain their established selected-card hierarchy.
- Added `tools/ui-check.cjs` to capture fighter select, training choice, active drill, cards, fight, and an isolated title frame from the exported browser cartridge.
- Strict screenshot verdict: `94/100`, pass against `reference/art-direction-lock.png` at native PICO-8 composition.
- Exported UI, animation, move, defense, trained/skip campaign, normal-speed campaign, mobile portrait/landscape, release, and 100-bout balance checks all pass; final balance remains `45-55`.

## Token Budget Optimization Pass

- Added one shared round-reset path for both fighters, removing duplicated position, motion, attack, defense, and round-stat assignments.
- Removed an unused boxer-render argument and two dead render locals while preserving the gameplay alignment field used by combat and AI.
- Consolidated repeated Camp Hand advancement into one transition helper and reduced the three fast-test timing branches to direct return expressions.
- Reduced `locked-in-ring.p8` from `60,753` to `53,419` bytes after physically removing the card and training subsystems. The active Lua section is now `18,603` characters; exact PICO-8 token count is not exposed by the installed non-interactive toolchain, so successful native cartridge and HTML exports remain the ceiling gate.
- Re-ran contact-move, defense/counter, animation, trained/skip campaign, and UI checks. All six final UI captures are byte-identical to the approved broadcast UI baseline.

## Fighting-Only Flow Pass

- Removed the complete Camp Hand implementation: deck generation, shuffling, offers, rerolls, rests, load/focus state, card bonuses, input handling, rendering, result-screen remnants, and the temporary feature flag.
- The five-day training plan advances directly into the fight, and fight/corner/result now use contiguous game modes with no dormant camp state.
- Removed card-only GPIO fields and test hooks while preserving all combat diagnostics used by desktop and mobile verification.
- Added a release assertion that fails if the removed card-system symbols return to the public cartridge.
- Verified trained, five-skip, production-speed, portrait-touch, landscape-touch, move, defense, animation, and UI paths; fixed-seed balance remains `45-55` and all unchanged UI captures are byte-identical.

## Direct Fight Flow Pass

- Removed drill selection, drill timing, training stat bonuses, skipping, ring-rust penalties, training rendering, training GPIO fields, and the prep game mode.
- The complete shipped flow is now title, fighter select, fight, corner, and result; selecting a fighter or choosing rematch starts round one immediately.
- Replaced trained/skip automation with direct full-bout coverage for both fighters and added release assertions that reject removed training symbols.
- Verified both fighters, immediate rematch, title return, production-speed play, portrait/landscape touch, moves, defense, animation, UI, and `45-55` fixed-seed balance.

## Fighting-Game Motion Pass

- Rebuilt punch posing around boxing anatomy: jabs use the lead glove while straights, body hooks, and uppercuts use the rear glove with shoulder rotation and a planted lower-body pivot.
- Shortened and differentiated startup/recovery frame data, strengthened power-shot hit-stop and hit reactions, widened input buffering, and accelerated follow-up recovery after clean combinations.
- Added double-tap boxing quick-steps with stamina cost, faster acceleration, firmer braking, visible floor streaks, and short forward commitment on punches.
- Added larger contact sparks and separate light/power motion smears while retaining the shared glove-reach collision table.
- Rebalanced faster footwork against the counterpuncher identity; final fixed-seed result is `44` A.B. wins to `56` D. Great wins.

## Guest Roster And Combo Motion Pass

- Expanded fighter select to six data-driven slots: A.B. Problem, D. Great, Callout King, Studio Guest, Legend Coach, and Tall Lightweight.
- Kept real people in private research notes while shipping fictional names, palette-coded silhouettes, role labels, and no exact portraits.
- Added the contact-confirmed route `jab > straight > body hook > uppercut`, plus jab-to-body-jab and body-jab-to-straight branches. Whiffs and slips break the route.
- Added linked step-ins that preserve the 28-pixel body boundary, faster startup/recovery, combo labels, and exported combo diagnostics.
- Used official Ken material as a motion-study reference: quick jab snap, rear-shoulder straight drive, deep uppercut compression, rising shoulder line, and a vertical uppercut smear without copying character art or non-boxing attacks.
- Added `tools/combo-check.cjs` and expanded fighter-select QA to cycle every roster slot and verify guest opponent pairing.
- Final verification: four-hit route reduced the frozen opponent from `100` to `58` HP, desktop and normal-speed matches reached results, portrait/landscape touch layouts passed, no browser errors were reported, and fixed-seed balance finished `52-48` across 100 bouts.

## Backstreet And Bruisers Visual Pass

- Studied the public Backstreet Warriors showcase for metasprite construction, compressed windups, oversized active fists, sharp contact poses, impact hold, screen kick, and finisher knockback without copying assets or animation frames.
- Added a four-hit combo finisher with stronger hit-stop, camera shake, concentrated hit sparks, restrained full-composition streaks, recoil, and knockback. The verified route now reduces the frozen opponent from `100` to `56` HP.
- Studied the official Bruisers 2D Boxing screenshots for long arm readability, planted lead/rear weight, compact infighting posture, side-broadcast ring framing, and layered audience depth.
- Added a distance-driven close-range stance with compressed knees and cheek-level gloves, heavier outlined posts, perspective rope returns, a worn raised-canvas edge, and a denser phone-lit warehouse crowd.
- Reworked the fighters after screenshot review: narrowed both atlas layers, tightened shoulder anchors, replaced circular gloves and elbows with clipped pixel clusters, sharpened D. Great's bare-shoulder planes, and changed oval foot shadows to hard-edged stance shadows.
- Replaced the blocky trunk shapes with one-pixel waistbands, longer separate leg panels, deep center splits, side piping, and small belt details so both outfits read as boxing shorts at native and phone scale.
- Redrew both fight heads and HUD portraits from current public-photo studies: A.B. now uses a compact fade, strong brow, cheek/nose highlights, and a jaw-following full beard; D. Great uses visible cornrow rows, trailing braid ends, a tapered clean jaw, sharper eye/nose pixels, and a small goatee.
- Preserved the lock-in venue identity with brick, beams, heavy bags, camera equipment, gym poster art, purple wall graphics, and the purple/teal fighter split.
- Desktop movement, five punch poses, four-hit combo, lean/perfect blocks, committed counters, both full-bout paths, rematch, six-fighter roster, portrait touch, landscape touch, cartridge export, release checks, and public-name scan all pass with no browser errors.
- Final fixed-seed balance is `52-48` over 100 bouts. The exported cartridge is `24,007` bytes and the source cart is `58,963` bytes.

## Ready 2 Rumble GBC Presentation Pass

- Studied captured gameplay from the separate Game Boy Color adaptation for high-angle ring staging, dither density, thick tri-color ropes, flat crowd bands, oversized glove readability, and a portrait-led bottom HUD.
- Rebuilt the ring as a widening trapezoid so the canvas owns the action area while the fighters retain the approved lean anatomy, split boxing trunks, and distinct A.B./D. Great face silhouettes.
- Recompressed the lock-in warehouse into a dark loading door, red heavy bag, boxer poster, two phone-lit spectator rows, and an original yellow lock mark rather than copying the reference game's arena art or branding.
- Moved health and stamina to the bottom HUD and retained compact yellow guard strips so blocking and counter decisions remain readable on a PICO handheld or phone.
- Increased glove cluster size and highlight definition without changing the contact-authoritative reach model.
- Visual verdict reached `93/100` against GBC gameplay frames and the canonical original art reference after desktop contact and portrait-mobile screenshot inspection.
- Final verification passed release/static checks, all five move poses, four walk frames, quick-step distance, hit-stop and buffered attacks, normal/lean/body/perfect blocks, a `16`-damage committed counter, desktop UI, portrait and landscape touch layouts, a natural-speed result/restart, and zero browser errors.
- Fixed-seed balance remains `52-48` over 100 bouts. The revised source cart is `58,075` bytes and the exported cartridge is `23,630` bytes.

## One-Second Counter Slowdown

- A whiff, slip, normal block, lean block, or perfect block now puts the exposed attacker into a symmetric `30`-frame counter slowdown.
- The slowed fighter's startup and recovery clocks advance at half speed while footwork target speed drops to `35%`, giving the defender a reliable one-second opening without changing punch reach or damage.
- Attack inputs received on skipped slowdown frames are buffered and start on the next eligible frame rather than being lost.
- Browser diagnostics export both slowdown timers. Defense QA asserts all `30` frames, counter tier commitment, zero perfect-block chip, and a landed `16`-damage counter.
- Raised the veteran counterpuncher's defensive-read rating from `56` to `64` after the first balance pass shifted to `41-59`; final fixed-seed balance is `51-49` across 100 bouts with zero browser errors.
- The final source cart is `58,286` bytes and the exported cartridge is `24,173` bytes.

## Native-Scale Fighter Polish Pass

- Removed the runtime `40`-to-`36` pixel downscale so authored body and face pixels now render at native atlas width.
- Raised the upper-body layer by two pixels for taller proportions while preserving feet, glove endpoints, contact reach, and the `28`-pixel body boundary.
- Redrew A.B.'s fight head with an explicit eye and ear, shorter nose profile, cheek highlights, separated beard planes, neck transition, tailored shirt shoulders, sleeve seams, and chest folds.
- Redrew D. Great's fight head and torso with separated braid strands, explicit eye and ear, tapered jaw, small goatee, collarbones, pectorals, sternum, ribs, and abdominal shadows.
- Replaced cross-shaped elbows with rounded three-tone joints, added glove cuffs, and deepened both lower-body atlases with layered waistbands, side panels, hem highlights, inner seams, thigh shading, socks, and boot tops.
- Strict screenshot review reached `92/100` across desktop neutral, straight windup, uppercut contact, perfect block, counter impact, portrait mobile, and landscape mobile frames.
- Final release, movement, animation, combo, defense, mobile, natural-bout, restart, and balance checks pass with zero browser errors. Balance remains `51-49`; the source cart is `58,499` bytes and the exported cartridge is `24,402` bytes.

## Athletic Arcade Anatomy Correction

- Replaced the broad rib-to-waist envelopes with narrower V-shaped torsos while preserving the higher-detail A.B. and D. Great face clusters.
- Shortened both fighters' trunks above the knee, deepened the center split, and retained tailored waistbands so the clothing reads as boxing trunks instead of a single rounded lower-body block.
- Rebuilt neutral and movement legs around separate thigh, knee, calf, ankle, sock, and boot masses. Thighs carry the stance, knees break the silhouette, calves taper, and longer toe boxes keep each pose planted.
- Applied the same lower-body construction to all four walking frames, quick steps, punch windups, contact poses, blocks, and counters without changing glove endpoints, the `28`-pixel body boundary, or hit detection.
- Strict reference review passed at `91/100` after desktop neutral, straight windup, counter impact, and portrait-mobile screenshot inspection.
- Release, move, animation, combo, defense, mobile, natural-bout, restart, and 100-bout balance checks pass with zero browser errors. Balance remains `51-49`; the source cart is `58,499` bytes and the exported cartridge is `24,436` bytes.

## Side-On Boxing Stance Pass

- Rotated both base silhouettes into a three-quarter side-on guard by compressing the far shoulder and rear hip while retaining the lead-side chest and leg mass.
- Raised the rear glove onto the cheek line, extended the lead glove slightly into range, and narrowed the shoulder anchors so the arms no longer read as a frontal mirrored pose.
- Shifted the rear thigh inward, kept the lead leg forward, and angled the waistbands and movement trunks to reinforce staggered hips and feet throughout neutral and walking frames.
- Preserved punch reach, body collision, contact-authoritative damage, block geometry, and counter timing; the stance change is visual and positional only.
- Desktop neutral, straight windup, lean block, and portrait-mobile screenshot review passed at `92/100`.
- Release, movement, combo, defense, mobile, natural-bout, restart, and 100-bout balance checks pass with zero browser errors. Balance remains `51-49`; the source cart is `58,500` bytes and the exported cartridge is `24,428` bytes.

## Side-View Arcade Fight Overhaul

- Replaced the rejected high-angle ring and bottom status band with a flat side-view warehouse stage, horizontal ropes, perspective floor, layered crowd, foreground apron, and top portrait/life HUD.
- Deleted the obsolete warehouse renderer to keep the cartridge below PICO-8's ceiling after the new stage and combat rules were added.
- Added positive hit advantage, weight-based blockstun and pushback, startup counter-hits, slightly faster forward pressure, and combo-aware spacing so landed punches create deliberate follow-up decisions.
- Replaced repeating `btnp()` direction handling with edge-tracked input. Held directions no longer cause involuntary quick-steps; fresh taps dodge, deliberate double taps dash, held back blocks high, and down-back protects the body.
- Added `arcade-feel-check.cjs` to verify that hold-back blocking reduces damage and startup counter-hits interrupt cleanly without trading.
- Desktop neutral, straight contact, lean block, and portrait-mobile screenshot review passed at `90/100` for the side-view arcade-fighter category.
- Release, movement, animation, combo, defense, arcade-feel, UI, mobile, natural-bout, restart, and 100-bout balance checks pass with zero browser errors. Balance is `52-48`; the source cart is `58,355` bytes and the exported cartridge is `24,010` bytes.

## Bruisers-Inspired Boxing And Flat-Face Pass

- Deep-reviewed the official Bruisers Steam description, demo page, screenshots, manual, and update history for punch selection, head/body defense, parries, close-range timing, stamina pressure, foot positioning, and ring presentation.
- Added `forward + O` lead hook and `forward + X` overhand while retaining jab, straight, body jab, body hook, uppercut, feint, slips, quick-steps, high/body guards, and lean blocks on the two-button PICO-8 layout.
- Raised head-punch trajectories to visible cheek/temple contact, gave the lead hook a bent horizontal path, and gave the overhand a high load followed by a descending rear-hand path.
- Tightened hit range so damage resolves only when the rendered glove reaches the opponent. Body punches continue to drain stamina; close-range power punches gain an extra commitment frame.
- Renamed perfect-block feedback to `catch + shoot`; a late matching guard still grants the top counter tier and slows the attacker for `30` frames so the return punch can land.
- Replaced the rejected modeled noses with flat face planes in the 40x64 fighters and 16x16 portraits. A.B. and D. Great now rely on fade/beard/shirt/purple gear versus braids/bare torso/green gear for recognition.
- Refactored move routes and animation coordinates into compact tables after the first implementation exceeded the native cartridge limit. A two-button frame-and-push experiment was rejected at `8799 / 8192` tokens; the shipped directional-punch build boots natively.
- Verified all seven player move families, the four-hit combo, normal/lean/body/parry defense, a `16`-damage catch-and-shoot counter, six-fighter selection, desktop UI, and portrait/landscape mobile layouts with zero browser errors.
- Strict visual review passed at `92/100` after neutral, straight, lead-hook, fighter-select, and 390x844 iPhone screenshot inspection. The exported cartridge is `24,463` bytes.

## Next Polish Priorities

- Replace existing procedural pose code with authored transition frames for every punch, block, slip, knockdown, and corner idle without expanding the cartridge token count.
- Build a stronger audio mix: distinct glove/body/block impacts, crowd rises, bell tails, corner ambience, and restrained mobile haptics in the HTML wrapper.
- Add a short optional sparring tutorial, pause/control reference, remappable mobile layout, reduced-flash option, and clearer color-independent meter markers.
- Add round cards with damage, accuracy, defense, and knockdown summaries so decisions and training consequences are easier to understand.

## Tactical Exchange Pass

- Added per-punch preferred distances. A deterministic jab check now deals `6` damage at optimal range and `4` when crowded, while strikes beyond rendered glove reach still miss completely.
- Added rope consequences: clean pressure shots gain a modest damage bonus, and stamina regeneration drops while a fighter is pinned near either boundary.
- Replaced the universal counter slowdown with a readable skill ladder: normal block `12` frames, planted lean block `18`, slip `24`, and perfect catch-and-shoot `30`.
- Made the CPU react to repeated landed punches, choose the matching head/body guard when hurt, retreat unless trapped, pressure opponents near the ropes, and mix lead hooks and overhands into range-specific offense.
- Consolidated repeated fighter-state initialization and reset assignments into one compact helper after the first pass exceeded the native PICO-8 ceiling at `9346 / 8192` tokens. The revised cart boots natively without removing art, moves, or roster slots.
- Added `tools/range-check.cjs`, strengthened defense QA to assert the `12 < 18 < 30` slowdown hierarchy, and corrected the arcade-feel setup so backing blocks are tested at contact distance.
- Verified all move families, the four-punch combination, normal/lean/body/perfect defense, committed counters, deterministic range quality, portrait and landscape touch layouts, and a complete three-round iPhone touch bout with zero browser errors.
- Fixed-seed balance is `56-44` across 100 bouts. The exported cartridge is `25,077` bytes.

## Original Arcade Rivals Sprite Pass

User request: replace the disliked lead sprites with temporary original boxer archetypes that carry the immediate visual contrast of Ryu and Ken without copying Capcom art, names, or animation frames.

- Generated and preserved `reference/arcade-rivals-sprite-direction.png` as the new lead-fighter sprite reference.
- Rebuilt both 40x56 atlas silhouettes and 16x16 portraits with sharper side-profile faces, lean bare torsos, longer athletic legs, boxing trunks, real boot shapes, and distinct hair masses.
- The counter fighter now uses black upswept hair, a red headband with trailing ties, white/red equipment, and a darker skin ramp. The rival uses swept blond hair, red/gold trunks, dark gloves, black boots, and a lighter skin ramp.
- Added per-fighter skin palette remapping so atlas bodies, procedural punch arms, knockdown poses, and HUD portraits remain visually consistent.
- Strict visual verdict reached `93/100` after direct inspection of desktop straight-contact, lean-block, and portrait-mobile screenshots against the generated reference.
- Release, movement, five-move animation, combo, defense, arcade-feel, six-fighter UI, portrait/landscape mobile, full-bout restart, and 100-bout balance checks all pass with zero browser errors. Balance remains `52-48`; the source cart is `58,513` bytes and the exported cartridge is `24,096` bytes.
