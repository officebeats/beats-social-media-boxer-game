# Ring Rush Audio Direction and Free-Music Shortlist

## Direction

The soundtrack should feel like current dark melodic Atlanta trap without copying a particular artist, recording, melody, vocal cadence, or producer tag.

- 75–95 BPM with a heavy half-time pocket.
- Deep sliding 808s with clean mono sub-bass.
- Sparse kicks, sharp snares, crisp hats, and occasional triplet bursts.
- Cold bells, detuned plucks, filtered pads, reversed textures, and restrained cinematic impacts.
- Instrumental only during gameplay so attack cues, gem breaks, announcer calls, and accessibility signals remain readable.
- Menacing and expensive rather than frantic EDM or retro chiptune.
- No uncleared samples, vocals, artist imitations, producer tags, or recognizable interpolations.

Future's current album at the time of research is *The Real Me*, released July 10, 2026. It is a directional reference only. Ring Rush must retain an original musical identity.

## Accepted temporary soundtrack

Both accepted tracks are CC0/public-domain music. CC0 permits copying, modification, distribution, performance, and commercial use without payment or required attribution.

### Title and fighter select

**Try me! — iamoneabe**

- Gritty instrumental trap
- 1:06
- Explicitly loopable
- CC0 / public domain
- Source: https://opengameart.org/content/try-me
- Runtime asset: `/assets/audio/music/try-me.mp3`
- Lossless source: `source-assets/audio/music/try-me.wav`

### Match gameplay

**The Mafia Game — NotMeat2020**

- 0:59
- 152 BPM with a 76 BPM half-time feel
- F minor, muted bass, hi-hat, snare, and dark atmosphere
- CC0 / public domain
- Source: https://freesound.org/people/NotMeat2020/sounds/851230/
- Runtime asset: `/assets/audio/music/the-mafia-game.mp3`

The checked-in Mafia Game file is Freesound's complete 48 kHz high-quality MP3 preview. Replace it in place with the original WAV-derived encode if a free Freesound account is available; the original download requires login.

The other researched tracks are not part of the active soundtrack.

## Integration requirements

- Keep original WAV masters outside the public runtime folder.
- Export normalized delivery files as Opus/WebM plus AAC or MP3 fallback.
- Target approximately -14 LUFS integrated for music, with peaks below -1 dBTP.
- Duck music 3–5 dB for announcer lines, supers, and accessibility-critical cues.
- Crossfade loops and state changes; never restart the beat on every chain.
- Save title, author, source URL, download date, license identifier, file hash, and source evidence under `docs/licenses/audio/`.
- Store music identity in data configuration so a later original soundtrack can replace licensed tracks without changing gameplay code.
- Keep lossless masters under a clearly documented source-assets path and ship compressed game-ready versions.
- Preserve an optional creator credit even though CC0 does not require it.

## Rejected sources

- **Pixabay as the production soundtrack:** the platform license can allow embedded use, but individual tracks may be Content ID registered and contributor descriptions can add conflicting commercial-use statements. It is acceptable for temporary internal mockups only after checking each track.
- **All other researched free tracks:** rejected by the user for this vertical slice.
- **Paid stock libraries:** unnecessary for a soundtrack that will intentionally be replaced.
- **Unverified “no copyright” uploads:** insufficient proof for App Store, Google Play, monetized trailers, or future publisher due diligence.
- **Direct artist imitation or AI clones:** creates unnecessary rights and brand risk and weakens Ring Rush's own identity.

## Replacement gate

When the temporary tracks are replaced:

1. Preserve the stable `title` and `match` music roles in the manifest.
2. Verify the replacement license before adding its binary.
3. Archive the source URL, license, and file hash.
4. Check the clean master for clipping, loop seams, metadata, and Content ID conflicts.
