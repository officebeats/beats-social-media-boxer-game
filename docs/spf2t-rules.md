# Ring Rush — SPF2T-style rules (acceptance)

These rules are the contract for “plays like Super Puzzle Fighter II Turbo.”

**Do not implement the old web prototype.** That project used match-4 clears and
HP bars. This cart uses crash gems and top-out only.

## Board

- Size: **6 columns × 12 rows**.
- Columns indexed **0–5** left→right; rows **0–11** top→bottom (row 11 = floor).
- **Danger / kill column:** column **3** (4th from left). Match ends if a new
  pair cannot spawn because that column is blocked at the spawn row.
- Pieces spawn as a **vertical or horizontal pair** above / into the kill column
  area (implementation: spawn at col 2–3, row 0–1).

## Pieces

- Falling **pairs** of gems (two cells).
- Colors: **4** (red, green, blue, yellow — palette indices in art bible).
- Pair types:
  - Two normal gems (any color combo)
  - One normal + one **crash** of a color
  - Rare: **diamond** (every 25th piece for that player)
- Controls: left, right, soft drop, hard drop, rotate (pair rotates around pivot).

## Clears — crash gems (not match-4)

- A **crash gem** of color C, when locked and resolved, **flood-clears** all
  orthogonally connected **normal** and **power** gems of color C that touch
  the crash (and recursively through same-color groups).
- The crash gem is consumed.
- After a clear, gravity applies; new connections can chain in the same resolve
  if additional crashes trigger (or cascading power setups — MVP: resolve all
  crashes that exist after each gravity settle until stable).

## Power gems

- When same-color normal gems form a filled rectangle **≥ 2×2**, they fuse into
  a **power gem** of that size.
- Clearing power gem cells increases **attack power** of that clear (MVP:
  each power cell counts as 2 for attack math).

## Counter gems (garbage)

- Clearing sends **counter gems** to the opponent.
- Counters land with **timer = 5** and a **color** from the attacker’s
  **drop pattern**.
- Each time **you** lock a new pair, every counter on **your** board ticks
  down by 1. At 0 they become **normal gems** of their color.
- Counters adjacent to a cleared same-color group can be destroyed early
  when a crash of that color fires (MVP: any counter of color C adjacent to
  a cell cleared by crash C is also cleared).

## Attack amount (MVP formula)

```
base = gems_cleared + power_bonus
attack = max(0, base - 2) + (chain_depth - 1) * 2
diamond_attack = flr(attack * 0.6)   -- if diamond clear
```

Tune after playtest. Power bonus = number of power cells in the clear.

## Sousai (countering)

- Outgoing attack first reduces **pending incoming** garbage.
- Remainder is queued as **pending out** and applied to the opponent after
  the resolve animation beat (or immediately in wireframe).

## Diamond

- Every **25th** piece for a player is a diamond (+ random second gem or solo
  diamond pair — MVP: diamond + random normal).
- On lock, diamond destroys **all** gems of the color it lands on (the gem
  under / touching the diamond’s color reference — MVP: color of the other
  half of the pair if normal; else color under diamond after settle).
- Simpler MVP: diamond clears the color of the non-diamond half of the pair
  when the pair contains diamond+color; if diamond alone lands on a stack,
  clear that stack’s top color under it.

## Win

- Opponent **tops out** (cannot spawn in danger column) → you win.
- No HP bars.

## Forbidden

- Match-N clears without crash.
- Winning by draining HP.
- Random garbage with no character pattern (patterns may be simple but must
  exist per fighter).
