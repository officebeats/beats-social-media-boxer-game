# Locked-In Ring Cartridge Notes

## Controls

- `left/right`: range movement and camp/menu selection
- `up`: high guard or Camp Hand reroll
- `down`: body guard
- `o`: jab / confirm training
- `up + o`: feint
- `down + o`: body jab
- `x`: rear punch / skip training / rest or back
- `down + x`: body hook
- `up + x` at inside range: uppercut

The HTML export uses PICO-8's native multi-touch D-pad and `O/X` panels. Its wrapper adds viewport-safe scaling, disables scroll/zoom gestures during play, and preserves nearest-neighbor rendering.

## Hidden Test Surfaces

### GPIO output contract

The cartridge updates these GPIO bytes every frame with `poke(0x5f80+n,value)`:

- `0`: mode (`title=0`, `select=1`, `prep=2`, `camp=3`, `fight=4`, `corner=5`, `result=6`)
- `1`: training beat (`0..5`)
- `2`: camp decisions (`0..4`)
- `3`: round (`0..3`)
- `4`: player HP (`0..100`)
- `5`: opponent HP (`0..100`)
- `6`: result (`0 active`, `1 win`, `2 loss`, `3 decision`)
- `7`: current load
- `8`: current focus
- `9`: selected fighter (`1` or `2`)
- `10`: training phase (`0 choose`, `1 active`)
- `11`: selected training (`1 roadwork`, `2 pad calls`, `3 noise check`)
- `12`: skipped training count / ring rust (`0..5`)

### Optional GPIO input hooks

Defaults are zero and public play is unchanged:

- pin `127`: shortened prep and round timers
- pin `119`: guarantee one focus point in Camp Hand for reroll-path tests

The shipping cartridge does not contain balance-simulation code. `tools/make-balance-cart.mjs` creates a temporary, headless diagnostic cart from the release source; that cart uses pin `124` as its trigger and pins `120..123` for results. The final fixed-seed batch is `53-47`, within the planned `40-60` matchup gate.

## Automated Coverage

- `tools/playthrough.cjs`: trained and all-skip campaigns, Camp Hand branches, natural fight outcomes, rematch, and title-return paths
- `tools/playthrough.cjs --normal`: production-length training and fight timers
- `tools/mobile-check.cjs`: touch-only portrait campaign, a real two-finger feint chord, and landscape layout/input
- `tools/run-balance-check.ps1`: generated diagnostic cart, 100 AI-vs-AI matches, and 40-60 assertion
- `tools/release-check.ps1`: build artifacts, bridge, required sections, and public-name scan
