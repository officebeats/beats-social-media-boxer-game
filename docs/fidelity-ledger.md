# V4 implementation fidelity ledger

Accepted concept: `docs/concepts/ring-rush-core-screens-v4-broner-parallax.png`

Latest checked mobile gameplay render: `docs/screenshots/mobile-gameplay.png`

| Comparison point | Concept evidence | Browser evidence | Result |
| --- | --- | --- | --- |
| Fighter art | Large retro pixel sprites with Broner in black/gold and Deen in blue/red | Production strips preserve the same silhouettes, palettes, faces, beard, braids, tattoos, and crisp pixel edges | Matched |
| Fighter facing | Broner faces inward from the left and Deen faces inward from the right | Side-aware sprite wrappers enforce screen-right for the left fighter and screen-left for the right fighter without reversing Deen's visible name | Matched |
| 2D-on-3D depth | Flat sprites over a dimensional neon boxing ring | Far venue, ring midground, fighter plane, foreground rope/post, Babylon lights, and independent offset ratios are live | Matched |
| Gameplay hierarchy | Arena above a dominant player board with compact rival board | Portrait render keeps the ring/fighters in the upper 36 percent and gives the player board roughly twice the rival width | Matched |
| Puzzle treatment | Glossy faceted red, blue, green, yellow, and purple jewels | Code-native jewels use multi-stop lighting, inset facets, highlights, glow, crash/rainbow/counter variants | Matched with simplified facet geometry |
| Interface | Navy-black panels, gold framing, condensed italic typography, hexagonal buttons | Title, select, pause, results, HUD, Super, and controls share the same black/gold/blue system | Matched |
| Screen flow | Title, select, pause, gameplay, action, and results states | Title → select → match → pause/resume → real top-out → results → rematch was exercised in-browser | Matched |
| Mobile behavior | Portrait-first, readable touch interface | Verified at 390 × 844 with no horizontal overflow, clipped primary controls, or unreadable labels | Matched |

## Intentional vertical-slice deviations

- The concept's dense boards are illustrative mid-match states; a new real match correctly starts with an empty field.
- V4 shows more jewel cuts and impact effects than the first playable implementation. The current renderer keeps the same color, glow, hierarchy, and special-gem language but uses simpler runtime geometry.
- The environment uses separable high-resolution 3D-rendered layers plus Babylon ambient geometry. A fully modeled GLB arena remains a later production milestone.
- The initial sprite strips provide idle, punch, hurt, and win states. Full multi-frame animation atlases remain the next art-production pass.
