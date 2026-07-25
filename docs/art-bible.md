# Art bible — GBA Puzzle Fighter × boxing

## Reference intent (study, don’t copy)

Study public screenshots of **Super Puzzle Fighter II Turbo** (GBA / arcade):

- Dual tall wells with shiny 4-color gems
- Large **chibi** fighters with oversized heads and expressive faces
- Attack animations are **theater** only — intensity scales with garbage sent
- Busy Capcom-style UI: nameplates, next piece, round energy
- GBA: slightly tighter pixels, high saturation, readable at small size

**Never** paste Capcom sprites or trace real-person photos. Original chibi
caricatures only.

## PICO-8 palette (custom remap of system colors)

Use these semantic roles (indices are default PICO-8 unless remapped in cart):

| Index | Role |
| --- | --- |
| 0 | Void / outline |
| 1 | Deep navy stage |
| 2 | Purple shadow |
| 3 | Dark green (unused / stage accent) |
| 4 | Skin shadow / brown |
| 5 | Dirt / rope dark |
| 6 | Gray UI |
| 7 | White highlight / text |
| 8 | **Gem red** / crash red |
| 9 | **Gem amber** / gold accents (also yellow gem if 10 busy) |
| 10 | **Gem yellow / gold** |
| 11 | **Gem green** |
| 12 | **Gem blue** |
| 13 | Indigo UI |
| 14 | Pink / Gold Problem accent |
| 15 | Light skin / peach |

Gem colors in code: `1=red(8), 2=green(11), 3=blue(12), 4=yellow(10)`.

## Gem design

- Cell size: **6×6** px
- Normal: rounded square, dark outline, light specular pixel top-left
- Crash: same body + white “burst” / glove star in center
- Counter: darker fill + countdown digit (1–5) in center
- Power: thicker inner border or double highlight
- Diamond: white/cyan diamond shape (2 frames sparkle)

## Chibi boxer proportions

```
  #####      head ~8–10 px
 ##o o##
  # v #      face
   ###
  #####      gloves / shoulders
  #   #      torso short
  ## ##      legs tiny
```

Target height **18–22 px** for center-stage fighters so both fit between wells.

## Stage

- Boxing ring floor stripe
- Two rope lines (pink/white or red/white)
- Dark crowd silhouettes at top
- Center logo mark optional

## UI chrome

- Well frame: 1 px dark + 1 px light edge
- Nameplate bar under names
- NEXT box 2 gem slots
- KO flash full-screen text
