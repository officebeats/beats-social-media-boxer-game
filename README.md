# Locked-In Ring

`Locked-In Ring` is a public-safe PICO-8 arcade boxing game about discipline versus spectacle. Choose one of two fictional fighters and enter a three-round rivalry bout immediately.

## Play

Browser build: [http://127.0.0.1:4173/](http://127.0.0.1:4173/)

- Desktop or PICO handheld: D-pad plus the standard PICO-8 `O` and `X` buttons.
- Mobile portrait: the canvas stays above a large D-pad and `O/X` touch panel.
- Mobile landscape: the canvas stays centered between the two touch panels.
- `F`: fullscreen in the HTML wrapper.

### Boxing controls

- `left/right`: step toward or away; double-tap for a stamina-costing quick-step. Tap either direction during an opponent windup to dodge a head strike and earn a counter window. Body shots punish slips.
- `up/down`: high or body guard. Add `back` to plant and lean behind the matching block.
- `O`: jab; `down + O`: body jab.
- `X`: rear straight; `down + X`: body hook.
- `up + O`: feint with a half-jab animation; the next punch starts faster and hits harder.
- `up + X`: uppercut. It can be thrown anywhere but only reaches at close range.

Hold `up` to block head punches or `down` to block body punches. Add the direction away from the opponent while holding the matching block to plant and lean; timing the guard just before contact produces a perfect block and the strongest counter window.

Clean contact opens short boxing-combo links. The primary route is `O` jab, `X` straight, `down + X` body hook, then `up + X` uppercut. Jab can also link into body jab, and body jab can link into straight. Linked punches start faster, recover faster, and take a small contact-safe step without passing through the opponent; a whiff or successful dodge ends the route.

Fighters accelerate into steps, brake firmly on release, and become more flat-footed as stamina falls. Double-tap footwork creates a short boxing quick-step that can flow into a committed forward punch. A four-beat planted shuffle shifts weight through compressed knees and a lifted heel while slips, blocks, and punches move the torso over that base. Lead jabs and body jabs use the front glove; rear straights, hooks, and uppercuts rotate the shoulder line and pivot the stance. Punches interpolate through anticipation, contact, impact hold, and recovery; power shots add stronger hit-stop without dropping buffered follow-up input. A held matching block absorbs the shot, a planted lean block reduces chip and guard wear, and a late matching block creates a stronger perfect-return window. Starting a punch during any counter window commits its tier through startup so the advantage cannot expire before contact. Damage only resolves when the rendered glove reaches the opponent.

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
.\tools\run-balance-check.ps1
```

The shipped art uses a custom default-palette fighter atlas for bodies and HUD portraits, with procedural arms retained so every rendered punch stays aligned to gameplay reach. Both fighters remain identifiable by beard/braids, athletic crouches, trunks, footwear, shirt/bare-chest treatment, and purple/green glove colors. [`reference/art-direction-lock.png`](reference/art-direction-lock.png) is the canonical art target; regenerate the atlas after source edits with `python .\tools\build-fighter-atlas.py`.

The public build uses fictional names, original text, and parody-coded silhouettes. Public figures remain private research references; no real names, logos, copied audio, footage, catchphrases, or exact portraits ship in the cartridge.
