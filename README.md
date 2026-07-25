# Ring Rush Puzzle Fighters

PICO-8 boxing-themed homage to **Super Puzzle Fighter II Turbo**.

Dual wells, **crash gems**, power gems, countdown counters, diamond pieces,
character drop patterns, chibi boxers, and **top-out** wins — GBA puzzle-fighter
energy, themed around **Gold Problem** vs **Great Crashout**.

> This replaces the earlier “Locked-In Boxing” bag/versus prototype in this
> repo. That gameplay and art are gone on purpose.

## Latest release: **v1.0.0** (Ring Rush Puzzle Fighters)

## Play

| Where | URL |
| --- | --- |
| **GitHub Pages** | [https://officebeats.github.io/beats-social-media-boxer-game/](https://officebeats.github.io/beats-social-media-boxer-game/) |
| **Local browser** | [http://127.0.0.1:4173/](http://127.0.0.1:4173/) after `.\tools\serve.ps1` |
| **PICO-8 cart** | `ring-rush.p8` or `dist/ring-rush.p8.png` |

Click the canvas once (browser audio unlock), then play.

## Controls

| Input | Action |
| --- | --- |
| ← → | Move gem pair |
| ↓ | Soft drop |
| ❎ (Z / C) | Rotate pair |
| 🅾️ (X / V) | Hard drop |
| Enter / P | Pause (fight) / confirm (menus) |
| F (web) | Fullscreen |

## How to play

1. Drop pairs of gems into your 6×12 well.
2. **Crash gems** (star) wipe connected gems of that color.
3. Fuse same colors into **2×2+ power gems** for bigger attacks.
4. Clears send **countdown counters** onto the opponent (pattern depends on fighter).
5. Counters become normal gems after ticking down.
6. **Diamond** every 25 pieces wipes a whole color.
7. Top out the opponent’s **4th column** to win.

## Characters

| Public name | Theme |
| --- | --- |
| **Gold Problem** | Flashy gold boxer — staggered garbage bands |
| **Great Crashout** | Aggressive crashout energy — multi-color chip storm |

Set `private_names=true` at the top of `ring-rush.p8` for local name labels.

## Build (export web + cart PNG)

Requires [PICO-8](https://www.lexaloffle.com/pico-8.php) at  
`C:\Program Files (x86)\PICO-8\pico8.exe` (or pass `-Pico8Path`).

```powershell
.\build.ps1
```

Outputs:

- `dist/ring-rush.p8.png` — loadable cart image  
- `dist/web/index.html` + `index.js` — browser player (GitHub Pages source)

## Local test (no `cd` needed)

From **any** directory or the Run box:

```powershell
ring-rush
```

That starts `http://127.0.0.1:4173/`, opens your browser, and rebuilds the web export if it’s missing.

| Command | What it does |
| --- | --- |
| `ring-rush` | Serve + open browser |
| `ring-rush -Rebuild` | Force PICO-8 export first |
| `ring-rush -NoBrowser` | Serve only |

Also works as a double-click: `%USERPROFILE%\ring-rush.cmd`  
(or `%USERPROFILE%\.grok\bin\ring-rush.cmd`).

Inside the repo (optional):

```powershell
.\build.ps1
.\tools\serve.ps1
```

## GitHub Pages

Pushing `main` with changes under `dist/web/**` runs `.github/workflows/pages.yml`
and deploys the browser export.

Manual redeploy: **Actions → Deploy game to GitHub Pages → Run workflow**.

## Docs

- [docs/spf2t-rules.md](docs/spf2t-rules.md) — rules acceptance
- [docs/characters.md](docs/characters.md) — fighters & patterns
- [docs/art-bible.md](docs/art-bible.md) — visual direction
- [docs/layout.md](docs/layout.md) — 128×128 layout

## Project layout

```
ring-rush.p8              # source cartridge
build.ps1                 # PICO-8 export + post-process
dist/web/                 # GitHub Pages / local server root
docs/                     # design docs
tools/serve.ps1           # localhost static server
tools/post-export.mjs     # mobile shell + title
tools/ensure-label.mjs    # cart label for .p8.png
```
