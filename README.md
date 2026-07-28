# Ring Rush

Ring Rush is a mobile-first 2.5D boxing puzzle fighter starring Adrien Broner and Deen the Great. It combines deterministic competitive falling-gem play with hand-pixeled late-1990s arcade fighter sprites, a modern layered arena, touch controls, AI, supers, music, pause, and rematch flow.

This branch replaces the earlier PICO-8/Antigravity prototype. That implementation remains available in Git history.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Play online

The current `main` branch deploys automatically to:

https://officebeats.github.io/beats-social-media-boxer-game/

## Controls

- Keyboard: arrows move/rotate/soft-drop, Space hard-drops, `S` activates Super, `Esc` pauses, and `F` toggles fullscreen.
- Touch: tap the player board to rotate, swipe horizontally to move, swipe down to hard-drop, or use the visible control bar.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Vertical-slice scope

- Title, fighter select, playable match, pause, results, home, and rematch.
- Deterministic six-by-twelve boards with normal, crash, rainbow, and timed counter gems.
- Chains, attacks, meter, fighter supers, seeded rival AI, and top-out.
- Separate far-venue, ring, fighter, and foreground layers with bounded pointer/device-orientation parallax.
- Babylon.js ambient rendering, lazy loaded after the code-native interface.
- Installable PWA shell and offline production caching.
- Temporary CC0 title and match music with archived provenance.

Multiplayer, app-store packaging, and paid content packs remain future seams, not active slice features. Commercial use of real-person likenesses requires the appropriate rights.
