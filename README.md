# Locked-In Ring

`Locked-In Ring` is a public-safe PICO-8 arcade boxing game about discipline versus spectacle. Choose one of two fictional fighters and enter a three-round rivalry bout immediately.

## Play

Browser build: [http://127.0.0.1:4173/](http://127.0.0.1:4173/)

- Desktop or PICO handheld: D-pad plus the standard PICO-8 `O` and `X` buttons.
- Mobile portrait: the canvas stays above a large D-pad and `O/X` touch panel.
- Mobile landscape: the canvas stays centered between the two touch panels.
- `F`: fullscreen in the HTML wrapper.

### Boxing controls

- `left/right`: step toward or away; double-tap deliberately for a stamina-costing quick-step. Tap either direction during an opponent windup to dodge a head strike and earn a counter window. Hold back through contact to block high; body shots punish slips.
- `up/down`: high or body guard. Add `back` to plant and lean behind the matching block.
- `O`: jab; `down + O`: body jab.
- `X`: rear straight; `down + X`: body hook.
- `up + O`: feint with a half-jab animation; the next punch starts faster and hits harder.
- `up + X`: uppercut. It can be thrown anywhere but only reaches at close range.

Hold `up` to block head punches or `down` to block body punches. Holding back also raises the high guard, while `down + back` protects the body. A planted matching block leans away from impact; timing the guard just before contact produces a perfect block and the strongest counter window.

Clean contact opens short boxing-combo links. The primary route is `O` jab, `X` straight, `down + X` body hook, then `up + X` uppercut. Jab can also link into body jab, and body jab can link into straight. Linked punches start faster, recover faster, and take a small contact-safe step without passing through the opponent; a whiff or successful dodge ends the route.

Fighters accelerate into steps, brake firmly on release, and become more flat-footed as stamina falls. Edge-tracked directional input prevents held directions from creating accidental repeated dashes. Forward pressure is slightly faster than retreat, while deliberate double taps create short boxing quick-steps that can flow into committed punches. A four-beat planted shuffle shifts weight through compressed knees and a lifted heel while slips, blocks, and punches move the torso over that base. Lead jabs and body jabs use the front glove; rear straights, hooks, and uppercuts rotate the shoulder line and pivot the stance. Punches interpolate through anticipation, contact, impact hold, and recovery; power shots add stronger hit-stop without dropping buffered follow-up input.

Clean hits now produce positive frame advantage, allowing confirmed links without making whiffed punches safe. Interrupting an opponent during startup creates a counter-hit, cancels the incoming punch, and adds hitstun. Weight-based pushback separates isolated power shots while confirmed combo routes retain enough range to continue. A held matching block absorbs the shot, a planted lean block reduces chip and guard wear, and a late matching block creates a stronger perfect-return window. A whiff, slip, or successful block slows the exposed attacker to half-speed action timing and reduced foot speed for one second. Starting a punch during that counter window commits its tier through startup so the advantage cannot expire before contact. Damage only resolves when the rendered glove reaches the opponent.

The fight HUD uses a fixed broadcast order for both corners: red health, blue stamina, then yellow guard. The center stack shows round, clock, and the player's compact hype value.

## Release Files

- `locked-in-ring.p8`: editable PICO-8 source.
- `dist/locked-in-ring.p8.png`: cartridge image for PICO-8 and compatible handhelds.
- `dist/web/index.html`: mobile/desktop browser build.

## Build

PICO-8 0.2.7 is installed at `C:\Program Files (x86)\PICO-8\pico8.exe`.

```powershell
.\build.ps1
```

The build creates the cartridge label when needed, exports `.p8.png` and HTML, waits for OneDrive writes to settle, and injects the responsive touch/test bridge.

The source is kept below PICO-8's 8192-token ceiling through shared fighter resets and compact test-timing helpers. Native `.p8.png` and HTML export success is the release gate because this PICO-8 installation does not report an exact token count in the non-interactive build output.

## Verification

```powershell
.\tools\release-check.ps1
node .\tools\playthrough.cjs http://127.0.0.1:4173 .\output\playthrough
node .\tools\move-check.cjs http://127.0.0.1:4173 .\output\moves
node .\tools\defense-check.cjs http://127.0.0.1:4173 .\output\defense
node .\tools\animation-check.cjs http://127.0.0.1:4173 .\output\animation
node .\tools\combo-check.cjs http://127.0.0.1:4173 .\output\combo
node .\tools\ui-check.cjs http://127.0.0.1:4173 .\output\ui
node .\tools\playthrough.cjs http://127.0.0.1:4173 .\output\normal --normal
node .\tools\mobile-check.cjs http://127.0.0.1:4173 .\output\mobile
node .\tools\arcade-feel-check.cjs http://127.0.0.1:4173
.\tools\run-balance-check.ps1
```

The shipped art uses a custom default-palette fighter atlas for bodies and HUD portraits, with procedural arms retained so every rendered punch stays aligned to gameplay reach. Fight layers render at their native 40-pixel atlas width with no runtime downscaling. The two leads now use an original 1990s arcade-rival contrast: a dark-haired counter fighter with a red headband, white trunks, red gloves, and white boots versus a swept-blond pressure fighter with red-and-gold trunks, dark gloves, black boots, and a lighter skin ramp. Explicit eyes, ears, noses, jaws, chest planes, rib shading, glove cuffs, trunk panels, knees, socks, and boots keep both fighters lean and readable instead of rounded or minimal. [`reference/arcade-rivals-sprite-direction.png`](reference/arcade-rivals-sprite-direction.png) is the current sprite target, while [`reference/art-direction-lock.png`](reference/art-direction-lock.png) remains the venue target. Regenerate the atlas after source edits with `python .\tools\build-fighter-atlas.py`.

[Backstreet Warriors](https://sebagamesdev.itch.io/backstreet-warriors) is a motion reference for compressed anticipation, oversized active gloves, strong key poses, hit-stop, camera kick, and combo-finisher impact. [Bruisers 2D Boxing](https://store.steampowered.com/app/3740090/Bruisers_2D_Boxing/) is a boxing-composition reference for long arm lines, lead/rear weight distribution, tight infighting posture, and layered spectators. [Ready 2 Rumble Boxing on Game Boy Color](https://www.mobygames.com/game/75245/ready-2-rumble-boxing/) remains a handheld readability reference for limited-color dither, thick rope bands, compressed crowds, and oversized gloves. The current fight presentation instead uses a classic side-view arcade composition with an original warehouse stage. The game translates general techniques into original PICO-8 art and code; no source art, animation frames, characters, names, logos, ring graphics, or audio from those titles are included.

The arena uses a flat side-view action line inside the lock-in warehouse: a dark loading door, hanging heavy bags, layered spectators, perspective floor marks, bold horizontal ropes, and purple/teal rivalry colors. A top arcade HUD gives each fighter a portrait plus red health, blue stamina, and yellow guard, with the round and clock centered between them.

The public build uses fictional names, original text, and parody-coded silhouettes. Public figures remain private research references; no real names, logos, copied audio, footage, catchphrases, or exact portraits ship in the cartridge.
