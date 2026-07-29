# Ring Rush mock-fidelity design QA

## Comparison target

- Source visual truth: `C:/Users/admin-beats/AppData/Local/Temp/codex-clipboard-c3ea570e-70b8-48b0-b549-432cd2c90bbb.png`
- Source pixels: 1536 × 1024 at 1× density.
- Source structure: six-screen concept collage. Individual panels are approximately square and communicate art direction rather than one production viewport.
- Implementation screenshots:
  - `docs/screenshots/qa-mobile-title.png`
  - `docs/screenshots/qa-mobile-select.png`
  - `docs/screenshots/qa-mobile-match-play.png`
  - `docs/screenshots/qa-mobile-pause.png`
  - `docs/screenshots/qa-mobile-results.png`
- Combined comparison evidence: `docs/screenshots/mock-comparison-board.png`
- Current quality-pass comparison: `.omx/qa/quality-comparison.png`
- Puzzle Fighter staging reference: `.omx/qa/puzzle-fighter-reference-3.jpg` (official Nintendo store capture, 1280 × 720).
- Current sprite-staging comparison: `.omx/qa/sprite-stage-comparison.png`
- Current sprite-staging capture: `.omx/qa/sprite-stage-pass-1/shot-0.png`
- Aspect-ratio correction comparison: `.omx/qa/aspect-proportion-comparison.png`
- Corrected 590 × 559 captures:
  - `.omx/qa/aspect-fix-final-select/shot-0.png`
  - `.omx/qa/aspect-fix-final-match/shot-0.png`
- Corrected responsive contact sheet: `.omx/qa/aspect-responsive-contact-sheet.png`
- Current live-match captures:
  - `.omx/qa/quality-intro/shot-0.png`
  - `.omx/qa/quality-pass-1/shot-0.png`
  - `.omx/qa/quality-pause/shot-0.png`
- Implementation viewport: 390 × 844 CSS pixels, device scale factor 1.
- Implementation pixels: 390 × 844 per mobile capture.
- Additional responsive evidence:
  - `.omx/qa/responsive-320x568/shot-0.png`
  - `.omx/qa/responsive-430x932/shot-0.png`
  - `.omx/qa/responsive-844x390/shot-0.png`
  - `.omx/qa/sprite-stage-320x568/shot-0.png`
  - `.omx/qa/sprite-stage-430x932/shot-0.png`
  - `.omx/qa/sprite-stage-844x390/shot-0.png`
- States: title, fighter select, ROUND 1 / FIGHT intro, active match after input, paused match, and Deen victory results.
- Normalization: implementation captures remain at their exact mobile viewport. The concept collage is scaled as one board in the comparison image because its square panels are not a literal 390 × 844 specification. Findings judge composition, hierarchy, frame language, typography, palette, image treatment, and responsive adaptation rather than pixel-identical panel geometry.

## Full-view comparison evidence

`docs/screenshots/mock-comparison-board.png` places the supplied concept and all five verified implementation states in one image. The implementation now preserves the concept's two-fighter faceoff, bright ring lighting, black/gold shell, blue rival accents, compact faceted gems, large metallic controls, screen-edge frame, and late-1990s arcade hierarchy.

`.omx/qa/quality-comparison.png` places the original six-screen concept directly beside the current 390 × 844 live match. The quality pass preserves that static fidelity while adding motion and responsive behavior without changing the approved visual direction.

`.omx/qa/sprite-stage-comparison.png` places an official 1280 × 720 Super Puzzle Fighter II Turbo gameplay capture beside the revised 390 × 844 Ring Rush match. The comparison is scoped to fighter scale, shared baseline, negative space, and relationship to the puzzle wells; the phone layout intentionally stacks the fighter stage above the wells rather than reproducing the arcade cabinet's horizontal layout.

## Focused region comparison evidence

- Title: `qa-mobile-title.png` retains the stacked white/gold logo, centered faceoff, oversized FIGHT control, and ring-depth composition.
- Select: `qa-mobile-select.png` retains two outlined fighter cards, warm/cool selection colors, future roster slots, and a large confirm control.
- Match: `qa-mobile-match-play.png` retains fighter portraits, opposing health treatments, two compact 6 × 12 boards, center rail, jewel facets, supers, and touch controls.
- Match opening: `.omx/qa/quality-intro/shot-0.png` shows the guarded FIGHT callout, dimmed playfield, inward-facing fighters, and readable touch controls before simulation begins.
- Fighter staging: `.omx/qa/sprite-stage-pass-1/shot-0.png` shows compact inward-facing fighters on one ring baseline, with the stage ending before the wells begin.
- Fighter geometry: `.omx/qa/aspect-proportion-comparison.png` shows the reported horizontally stretched select and match states beside the corrected native-frame rendering at the same 590 × 559 viewport.
- Idle motion: `.omx/qa/idle-motion-sequence/shot-1.png` and `shot-2.png` show the staggered breathing/weight-shift cycle at two different animation phases.
- Pause: `qa-mobile-pause.png` retains the centered black/gold modal and adds a compact controls reminder without obscuring the match.
- Results: `qa-mobile-results.png` retains the oversized winner heading, victory sprite, three-stat strip, rematch, and home hierarchy.

## Required fidelity surfaces

- Fonts and typography: display text uses a condensed, heavy, italic arcade treatment with strong hierarchy and close mock-relative sizing. Small HUD and stat labels remain legible at 390 pixels. The code-rendered logo is less brush-like than the concept but remains an acceptable P3 difference.
- Spacing and layout rhythm: match fighters now preserve each source sheet's native frame aspect ratio, share one feet baseline, and occupy a compact 27-30% stage band before the wells. Title/select card proportions, board geometry, center rail, pause modal, and results spacing track the approved mock. Persistent controls remain visible with safe-area padding at 320 × 568, 390 × 844, 430 × 932, and 844 × 390.
- Colors and visual tokens: black/navy surfaces, gold player emphasis, cyan rival emphasis, red/blue apparel, warm button highlights, and arena glows are consistent across all states.
- Image quality and asset fidelity: the same high-resolution pixel-art fighter sheets and three arena layers are used throughout. Fighters face each other during competition, and solo victory art uses its natural orientation so apparel lettering remains readable.
- Copy and content: RING RUSH, PUZZLE BOXING, FIGHT, SELECT FIGHTER, fighter names, YOU/RIVAL, SUPER, PAUSED, WINNER, REMATCH, and HOME are present and correctly prioritized.

## Interaction and runtime evidence

- FIGHT transitioned synchronously from title to select on the first click.
- ENTER THE RING started a match behind a 1.3 second ROUND 1 / FIGHT input guard.
- Left, right, rotate, and hard-drop inputs changed deterministic game state.
- Escape opened pause; RESUME returned to play.
- Top-out reached results; REMATCH created a fresh match.
- Pause → QUIT returned to title.
- The required web-game Playwright driver captured text state and screenshots at each major state.
- The live match screen and both board nodes remained identity-stable across timer ticks; HUD and board state now patch in place instead of replacing the screen.
- Parallax now interpolates once per animation frame rather than applying a long CSS transition to every pointer/orientation event.
- Idle fighters use a 1.6-second stepped breathing and weight-shift cycle with offset timing; attack and hurt poses replace the idle animation rather than running on top of it.
- Reduced-motion mode collapses continuous idle motion to the existing static stance.
- Babylon's default vertex and fragment shaders are preloaded before arena materials initialize; the in-app browser reported no warnings or errors after the preload fix.
- Broner and Deen now share one source-frame-ratio sizing path across selection cards and the match stage; computed select-card ratios changed from approximately 1.54:1 to 0.586:1 and 0.624:1.
- Localhost unregisters old Ring Rush workers and clears Ring Rush caches before development modules settle, preventing cached pre-fix geometry from reappearing during visual iteration.
- Browser console warnings/errors checked: none.

## Comparison history

### Iteration 1 — 68/100

- Findings: thin flat framing, stretched desktop gems, dark arena, weak HUD hierarchy, and excessive empty separation.
- Fixes: square-cell boards, centered competitive desktop grid, layered arcade frames, brighter arena glows, metallic controls, stronger HUD, and larger fighter composition.
- Evidence: `.omx/qa/visual-pass-1-title`, `visual-pass-1-select`, and `visual-pass-1-match`.

### Iteration 2 — 87/100

- Findings: HUD portraits were full-body thumbnails; pause/results evidence was missing.
- Fixes: face-oriented portrait crops and complete mobile flow capture.
- Evidence: `.omx/qa/mobile-pass-2-*`.

### Iteration 3 — 94/100

- Findings: mirrored Deen waistband lettering remained in the victory pose.
- Fix: tested winner-specific correction placement.
- Evidence: `.omx/qa/mobile-pass-3-results/shot-5.png`.

### Iteration 4 — 94/100

- Finding: corrected waistband label was aligned, but mirrored source lettering remained visible above it.
- Fix: solo winners now use their natural sprite orientation.
- Evidence: `.omx/qa/mobile-pass-4-results/shot-5.png`.

### Iteration 5 — 96/100

- Post-fix evidence: all five core states align with the mock's visual category and hierarchy; Deen's winner apparel reads correctly.

### Iteration 6 — 84/100

- Findings: the static design passed, but ten full match-screen rebuilds per second restarted fighter, gem, and impact animation; match start was abrupt; short phone landscape could crop controls; parallax event writes competed with long transitions.
- Fixes: stable in-place match updates, guarded ROUND 1 / FIGHT opening, persistent fighter/impact classes, interpolated parallax, responsive small-phone and short-landscape layouts.
- Evidence: `.omx/qa/quality-baseline/shot-0.png`.

### Iteration 7 — 94/100

- Post-fix evidence: `.omx/qa/quality-comparison.png`, `.omx/qa/quality-intro/shot-0.png`, `.omx/qa/quality-pass-1/shot-0.png`, and all three responsive breakpoint captures.
- The implementation preserves the reference hierarchy and art direction while the live match now feels continuous rather than repeatedly reconstructed.

### Iteration 8 — 82/100

- Findings: fighters were too large relative to the wells, their legs competed with the board frame, and the earlier one-pixel bob was not legible as an idle animation on a phone.
- Fixes: per-fighter native aspect ratios, compact shared-baseline staging, clearer separation between the ring and wells, and a stronger staggered breathing/weight-shift cycle.
- Evidence: `.omx/qa/quality-final/shot-0.png` and `.omx/qa/puzzle-fighter-reference-3.jpg`.

### Iteration 9 — 94/100

- Post-fix evidence: `.omx/qa/sprite-stage-comparison.png`, `.omx/qa/sprite-stage-pass-1/shot-0.png`, `.omx/qa/idle-motion-sequence/shot-1.png`, `.omx/qa/idle-motion-sequence/shot-2.png`, and the three revised responsive captures.
- The fighters now read as compact Puzzle Fighter-style stage actors while retaining the selected Street Fighter/MVC anatomical art direction.

### Iteration 10 — 64/100

- Findings: both select-card fighters were stretched to approximately 1.54:1 by a negative horizontal inset even though their source frames are approximately 0.586:1 and 0.624:1; the supplied match capture showed the superseded wide fighter rule.
- Evidence: `C:/Users/admin-beats/AppData/Local/Temp/codex-clipboard-c5d97884-3b80-41b7-aef5-0cd429b7b234.png`, `C:/Users/admin-beats/AppData/Local/Temp/codex-clipboard-91cb78f9-013b-49cd-8070-203746a328aa.png`, and `.omx/qa/aspect-baseline-select.png`.

### Iteration 11 — 88/100

- Fixes: removed the negative horizontal card inset, introduced one per-fighter source-frame ratio token, centered each card fighter by height, and added local worker/cache cleanup.
- Remaining finding: naturally proportioned fighters were slightly undersized at the reported near-square viewport.
- Evidence: `.omx/qa/aspect-fix-select/shot-0.png` and `.omx/qa/aspect-fix-match/shot-0.png`.

### Iteration 12 — 95/100

- Fix: added a bounded 520–759 pixel near-square breakpoint that uses 31% of viewport height for the stage without overlapping the wells.
- Post-fix evidence: `.omx/qa/aspect-proportion-comparison.png`, `.omx/qa/aspect-fix-final-select/shot-0.png`, `.omx/qa/aspect-fix-final-match/shot-0.png`, and `.omx/qa/aspect-responsive-contact-sheet.png`.
- Both fighters now preserve their original pixel-art anatomy and face one another across all tested breakpoints.

## Findings

No actionable P0, P1, or P2 visual mismatches remain.

## Follow-up polish

- [P3] Commission a dedicated transparent brush-lettered Ring Rush logo if exact mock typography is required.
- [P3] Capture organic high-chain match statistics for store or marketing imagery instead of forced top-out QA values.
- [P3] Expand the four-pose sheets into multi-frame animation atlases after timing is approved; the current pose-to-pose wrapper motion is smooth, but true frame animation remains an asset-production task.

## Final result

final result: passed
