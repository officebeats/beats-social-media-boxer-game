# Production asset-generation record

All current game art was generated with Codex built-in ImageGen and then saved into the repository. Chroma-key sources remain under `source-assets/imagegen`; alpha-extracted runtime files live under `public/assets`.

## Fighter state strips

Each fighter prompt requested exactly four equal full-body cells—idle, straight punch, hurt, and win—on a flat `#00ff00` background. It locked the approved V4 likeness, build, hair, facial hair, costume, tattoo coverage, native pixel density, bottom-center anchor, and late-1990s arcade cluster/shading rules. It prohibited copied commercial characters, extra poses, borders, labels, UI, shadows, and cropping.

The runtime treats facing as placement data rather than character identity: the left-side fighter faces screen-right and the right-side fighter faces screen-left. Deen's code-native waistband correction remains readable when his strip is flipped for a right-side faceoff.

- `public/assets/fighters/broner-states.png`
- `public/assets/fighters/deen-states.png`

## Arena layers

The arena prompts split the approved V4 venue into independently movable bands:

- `public/assets/arena/venue-far.png`: opaque crowd bowl, LED ribbons, trusses, skyline, and atmospheric depth.
- `public/assets/arena/ring-mid.png`: alpha-extracted premium black/navy/gold ring with open fighter space.
- `public/assets/arena/ring-foreground.png`: alpha-extracted close corner post, rope, and sparse ringside bokeh.

All arena prompts prohibited fighters, puzzle boards, UI, logos, text, watermarks, and copied commercial stages. The runtime applies bounded `0.10`, `0.65`, and `1.0` motion ratios to communicate depth without moving gameplay UI.
