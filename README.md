# Locked-In Bag Break

`Locked-In Bag Break` is an original PICO-8 boxing bonus-stage game. Pick one of six fictional gym personalities, choose a piece of equipment, and destroy it before time expires through clean range, target selection, stamina management, and punch combinations.

## Play

- GitHub Pages: [https://officebeats.github.io/beats-social-media-boxer-game/](https://officebeats.github.io/beats-social-media-boxer-game/)
- Local browser build: [http://127.0.0.1:4173/](http://127.0.0.1:4173/)
- PICO-8 cartridge: `dist/locked-in-ring.p8.png`

The web export supports desktop keyboards, touch controls, iPhone portrait and landscape layouts, and fullscreen with `F`. PICO handhelds use the standard D-pad plus `O` and `X` buttons.

## Targets

- `Speed bag`: a 30-second rhythm challenge. Head punches score; body punches are too low.
- `Heavy bag`: a 40-second power challenge. Body punches do the most damage, but committed shots can leave you exposed to the return swing.
- `Wreck bag`: a 50-second durability challenge. Its flashing weak zone alternates between high and body targets.

Targets progress through intact, cracked, torn, and destroyed states. Accuracy, combinations, weak-zone hits, destruction speed, and remaining time determine the score and rank.

## Controls

- `left/right`: footwork. Double-tap for a stamina-costing quick step.
- `O`: jab.
- `X`: rear straight.
- `down + O`: body jab.
- `down + X`: body hook.
- `forward + O`: lead hook.
- `forward + X`: overhand.
- `up + O`: feint; the next linked punch starts faster and gains power.
- `up + X`: uppercut.

Punches only score when the rendered glove reaches the target. Each punch has a preferred distance; reaching or crowded contact does less damage. Clean hits open short links, while whiffs break the combination. Stamina affects movement, output, and how quickly another power shot can be thrown.

## Audio

The cartridge contains original PICO-8 tracker audio:

- three synchronized looping channels for kick/snare, trap hats, and bass;
- separate jab, power-hit, whiff, rebound, menu, bell, and destruction effects;
- effects routed independently from the music so impacts remain audible.

No commercial song, sample, or audio from another game is included.

## Build

PICO-8 0.2.7 is expected at `C:\Program Files (x86)\PICO-8\pico8.exe`.

```powershell
.\build.ps1
```

The build exports the cartridge and browser files, waits for OneDrive writes to settle, and injects the responsive touch, fullscreen, and test bridge into `dist/web/index.html`.

To run locally:

```powershell
.\tools\serve.ps1
```

## Verification

```powershell
.\tools\release-check.ps1
node .\tools\boot-check.cjs http://127.0.0.1:4173
node .\tools\bag-check.cjs http://127.0.0.1:4173 .\output\bag-systems
node .\tools\playthrough.cjs http://127.0.0.1:4173 .\output\playthrough
node .\tools\likeness-check.cjs http://127.0.0.1:4173 .\output\likeness
node .\tools\mobile-check.cjs http://127.0.0.1:4173 .\output\mobile
python C:\Users\admin-beats\pico8-mcp-server\shrinko8\shrinko8.py locked-in-ring.p8 --count
```

The release gate checks the native 8192-token ceiling, browser boot, all target behaviors, a complete destruction/rematch path, portrait and landscape touch controls, audio rows, public-name safety, and the GitHub Pages workflow. Physical PICO handheld testing remains separate from browser emulation and native cartridge export.

## Release

Pushes to `main` that change `dist/web` deploy through `.github/workflows/pages.yml`. The repository remains private, while GitHub Pages serves the generated browser artifact publicly. Pages availability for a private repository depends on the GitHub account plan.

The public build keeps fictional cartridge names and uses original pixel art, text, and audio. The two lead fighters use stylized appearance cues informed by public Broner and Deen training footage; no source photos, logos, catchphrases, copied portraits, animation frames, game assets, or commercial music ship in the cartridge.
