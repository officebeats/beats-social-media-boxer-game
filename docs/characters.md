# Characters & attack patterns

## Roster (MVP)

| ID | Public name | Private name | Subtitle | Super (flavor) |
| --- | --- | --- | --- | --- |
| `gold` | Gold Problem | Adrien Broner | The Problem | Gold Rush |
| `crash` | Great Crashout | Deen the Great | Crashout King | Full Crashout |

Toggle `private_names` in the cart for local builds.

## Visual kits

### Gold Problem

- **Palette:** gold (10), pink (14), navy/dark (1), white (7), skin (15/4)
- **Props:** gold chain, shiny trunks, swagger idle
- **Anim tiers:** jab → flashy combo → gold-rush super pose
- **Personality:** showboat, taunt on medium hits, kiss-glove win

### Great Crashout

- **Palette:** orange (9), dark red (8), black (0), amber (9/10), skin
- **Props:** aggressive crouch, haymaker super
- **Anim tiers:** jab → wild flurry → full-send super
- **Personality:** pressure, roar on big sends, crashout win flex

## Drop patterns

Counters are placed left→right, wrapping, using the pattern string as a
repeating stream. Colors: `1` red, `2` green, `3` blue, `4` yellow.

### Gold Problem — staggered bands (Ken-ish)

```
row cycle:
  1 3 1 3 1 3
  4 2 4 2 4 2
  1 3 1 3 1 3
  4 2 4 2 4 2
```

Stream (reading rows):  
`1,3,1,3,1,3, 4,2,4,2,4,2` repeated.

**Intent:** alternating colors make neat monochrome towers hard; experts
can still set bridges. Chip damage is annoying but convertible.

### Great Crashout — multi-color chip storm (Felicia-ish)

```
row cycle:
  1 2 3 4 1 2
  3 4 1 2 3 4
  2 1 4 3 2 1
  4 3 2 1 4 3
```

Stream:  
`1,2,3,4,1,2, 3,4,1,2,3,4, 2,1,4,3,2,1, 4,3,2,1,4,3` repeated.

**Intent:** high disruption on small sends; large dumps can hand the
opponent setups if they survive — risk/reward.

## Pattern application algorithm

```
for i = 1 to attack_count:
  color = pattern[(pattern_index + i - 1) % #pattern]
  place counter of color with timer 5 in next free top slot
    scanning columns 0..5 starting at (i-1) % 6
after all placed: gravity
attacker.pattern_index += attack_count
```

## Animation size thresholds (cosmetic)

| Outgoing counters | Anim |
| --- | --- |
| 1–3 | Jab / light |
| 4–8 | Special |
| 9+ | Super |

On receive: hitstun frame; on win/lose: result poses.
