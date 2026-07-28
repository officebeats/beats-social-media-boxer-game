# Ring Rush Core Screens V2 — Deen Likeness Correction

## Method

Localized identity-preserving ImageGen edit of the V1 concept. Two current photographic references for Deen the Great were used for facial structure, grooming, hairstyle, and build. The references remain outside the repository and are not redistributed with the project.

## Final prompt

```text
Use case: identity-preserve
Asset type: final localized Deen likeness correction
Input images: Image 1 is the edit target. Images 2 and 3 are identity references for Deen the Great.
Primary request: edit only three existing Deen depictions in the lower row of Image 1: (A) the full-body Deen fighter standing on the right side of the bottom-left gameplay arena, (B) the small DEEN HUD portrait at the upper-right of that bottom-left gameplay panel, and (C) the small DEEN HUD portrait at the upper-right of the bottom-middle super panel. Make those three instances match the already-correct Deen in the top-left title panel and top-middle fighter-select card and match Images 2 and 3.

For only those three Deen instances:
- youthful softer oval face, broad smooth forehead, shaped brows, hooded almond eyes, medium straight nose with rounded tip, full lips
- narrow mustache and short chin goatee, no full beard
- neat scalp cornrows continuing into slim jaw-to-neck-length braids with warm brown/blond tips; no upright spikes, no high twist crown
- lean athletic lightweight-boxer proportions
- preserve red gloves, blue-and-crimson DEEN trunks, exact pose, scale, lighting, and cel-shaded 2D sprite style

Absolute invariants:
- preserve the entire top row exactly, including corrected Deen art and the correctly restored Broner HUD portrait on the Pause screen
- preserve the full Broner fighter and Broner HUD portrait in both lower gameplay panels
- preserve the entire bottom-right Broner WINNER/results panel exactly
- preserve every puzzle gem, board, arena element, effect, meter, number, label, button, border, color, and layout
- preserve all text exactly
- do not add or remove characters
- do not alter anything outside the three specified Deen depictions
- no logos or visual elements from the photo references, no watermark
```

## Acceptance

- Visual-verdict score: 94/100
- Threshold: 90/100
- Verdict: pass
- Remaining limitation: the smallest HUD portraits necessarily simplify facial detail at their rendered size.
