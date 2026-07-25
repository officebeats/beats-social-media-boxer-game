# Combat theater — animation research for Ring Rush

How SPF2T sells “fighting” with pure cosmetics, and what to steal from
**Ryu** (tiered martial arts) and **Balrog** (pure boxer) for Broner / Deen.

---

## 1. How SPF2T actually works (the system we must match)

From Capcom’s design (arcade / GBA / HD Remix):

1. Chibi fighters stand **between the wells** and act out a comic bout.
2. **Every time you send Counter Gems**, your character plays a fighting action.
3. **Magnitude of garbage → “size” of the move** (taunt / light → special → super).
4. Animations are **100% cosmetic** — they do not change gem physics.
5. Their job is to **read the match state**: chip pressure vs big KO setups.

That is the contract for Ring Rush: puzzle decides the winner; theater sells the drama.

---

## 2. Universal fighting-game punch phases (Ryu & Balrog both use this)

Every meaningful punch is built from the same skeleton:

| Phase | What it is | Visual | Feel |
| --- | --- | --- | --- |
| **Idle / ready** | Guard up, bounce, breathing | Loop 2 frames | Alive even when “nothing” happens |
| **Startup (windup)** | Chamber the punch | Shoulder load, glove pulls back | Telegraphs size of hit |
| **Active** | Hit frames | Glove fully extended | Moment of contact |
| **Hitstop** | Freeze both characters ~2–8 frames | Impact flash, freeze pose | *Makes the hit land* |
| **Hit reaction (defender)** | Recoil / stun | Head snap, stumble, guard break | Opponent “took it” |
| **Recovery** | Return to guard | Pull glove back | Closes the string |
| **Whiff** (optional) | Missed | Full recovery, no hitstop | Only if we ever show empty swings |

**Rule for polish:** bigger attacks = longer windup + longer hitstop + bigger FX + longer recovery on the *defender*.

Without hitstop + defender reaction, punches feel like wallpaper.

---

## 3. What to steal from Ryu (tiered martial kit)

Ryu is the template for **“same character, many intensities.”**

### 3.1 Normal punches (LP / MP / HP ladder)

| Strength | Body language | Use as theater |
| --- | --- | --- |
| **Light** | Short jab, small step | Chip garbage (1–3 counters) |
| **Medium** | Shoulder turn, deeper step | Medium dump (4–7) |
| **Heavy** | Full hip rotation, long recovery look | Heavy dump (8–11) |

Even with only 3–4 keyframes, **pose scale** sells the tier (arm length, lean, foot plant).

### 3.2 Specials (signature “named” moves)

Classic Ryu ladder:

| Move | Silhouette | Maps well to |
| --- | --- | --- |
| **Hadoken** | Projectile leave-hand | Medium–large attack + gem “wave” FX toward enemy well |
| **Shoryuken** | Vertical rising upper | Chain / power-gem clear (big vertical energy) |
| **Tatsumaki** | Spinning kick flurry | Multi-hit chain (2+ chain depth) |

### 3.3 Super / cinematic

| Move | Feel | Maps to |
| --- | --- | --- |
| **Shinku Hadoken** | Full-screen beam | Diamond / huge dump (12+) |
| **Shin Shoryuken** | Multi-hit upper + freeze | Top-out kill / match-ending dump |

### Ryu lesson for Ring Rush

- **Identity is a ladder**, not one punch reused louder.
- Always have a **projectile-style** FX path (even boxers can throw a “gold flash” or “haymaker shockwave”).
- Always have a **vertical super** for big clears.
- Idle should look **disciplined** (tight guard) so specials read as bursts of style.

---

## 4. What to steal from Balrog (the pure boxer)

Balrog is the best Street Fighter reference for **boxing animation variety**. Almost his whole kit is punches with different *shapes*.

### 4.1 Core move families (map 1:1 into theater tiers)

| Move | Motion | Read | Theater use |
| --- | --- | --- | --- |
| **Jab / normal punch** | Short straight | Chip | Tier 0–1 |
| **Dash Straight** | Rush forward + cross | Pressure | Tier 2 special |
| **Dash Upper** | Rising uppercut | Anti-air feel | Chain / power gem |
| **Dash Low Straight / Smash** | Crouch / body shot | Dirty pressure | Counters landing (body work) |
| **Dash Swing Blow** | Wide overhead arc | Mix-up flavor | Side-switch / big single color |
| **Buffalo Headbutt** | Leap + head | Reversal / invuln vibe | Sousai (you cancel their garbage) |
| **Turn Punch (TAP)** | Charge → spin → blow | Charge levels 1–7 | **Meter of buildup** → release size |
| **Crazy Buffalo** | Multi dash-punch super | Combo flurry | Super dump / multi-chain |
| **Gigaton Blow** | One huge straight | Ultimate | KO / top-out finisher |

### 4.2 Turn Punch is the secret sauce for variety

Turn Punch charges through **levels** (longer charge = bigger damage/knockdown).  
For puzzle theater, translate charge → **puzzle buildup**:

| Puzzle situation | “Charge level” feel |
| --- | --- |
| Quiet stacking, no attack | Level 0 — idle bounce, glove kiss |
| Small chip | Level 1 TAP — quick turn punch |
| Saved power gem, still holding | Level 2–3 — longer chamber, spark on gloves |
| Diamond incoming / huge setup | Level 4–5 — full spin windup |
| Match-winning dump | Max TAP / Gigaton |

**Lesson:** variety is not “more random punches.” It is **same boxing language, different charge / step / height**.

### 4.3 Combo rhythm (Crazy Buffalo)

Crazy Buffalo = **string of dash punches ending on a turn punch**.  
For animation:

1. Step-in jab  
2. Cross  
3. Body  
4. Upper or final straight  
5. Freeze + big impact  

Use this for **chain depth ≥ 3** or **total attack ≥ 12**.

---

## 5. Mapping puzzle events → fight theater (Ring Rush)

### 5.1 Attack tier table (attacker)

| Counters sent (after sousai) | Chain depth | Suggested anim | FX |
| --- | --- | --- | --- |
| 0 (cancelled fully) | any | **Guard / parry / headbutt absorb** | Sparks only, no travel FX |
| 1–3 | 1 | **Jab** (LP) | Small impact star |
| 4–7 | 1 | **Cross / Dash Straight** | Speed lines, dust |
| 8–11 | 1–2 | **Upper / Heavy** | Screen shake 1–2px |
| 12–18 | 2+ | **Named special** (character) | Color trail + shake 3 |
| 19+ | 3+ or diamond | **Super / Gigaton** | Full flash, freeze, big shake |
| Top-out kill | — | **Finisher** | Slow-mo pose, KO text |

### 5.2 Defender reactions (mirror table)

| Received | Anim | Notes |
| --- | --- | --- |
| 1–3 | Guard flinch | Gloves up, slight lean |
| 4–7 | Hitstun | Head snap, step back |
| 8–11 | Stumble | One knee / off-balance |
| 12–18 | Guard break | Gloves drop, open mouth |
| 19+ / kill | Launch / crumple | Classic SF hard knockdown pose |

### 5.3 Extra triggers (variety beyond dump size)

| Puzzle event | Theater beat |
| --- | --- |
| Power gem formed (not yet crashed) | Attacker **charges** (Turn Punch wind) |
| Crash gem locks | Windup starts **before** gems clear |
| Chain step 2, 3, 4… | Combo string continues (Crazy Buffalo rhythm) |
| Diamond drop | “Super flash” freeze both, then beam/upper |
| Sousai (you erase their pending) | **Buffalo Headbutt / parry** — you look cool for denying |
| Counters ticking on your board | Nervous idle / wipe sweat (danger) |
| Kill column ≥ 9 filled | Panic idle / shell-up |
| Match win | Win pose + quote |
| Match lose | KO crumple |

---

## 6. Character kits for Ring Rush

### 6.1 Adrien Broner / Gold Problem — “flashy technician” (Ryu ladder + showboat)

| Tier | Anim name | Description |
| --- | --- | --- |
| Idle | Shoulder roll | Bounce, gold chain sway, smirk |
| Chip | **Shoulder jab** | Quick lead, glove kiss after |
| Medium | **Flash cross** | Pink glove blur, lean back pose |
| Heavy | **Philly shell pivot** | Shoulder roll into heavy right |
| Special | **Gold Rush straight** | Dash-in Balrog-style cross + gold trail |
| Chain | **Bling combo** | Jab–cross–upper string |
| Super | **Still Undefeated** | Turn-punch spin → massive straight + gold explosion |
| Sousai | **Catch & smirk** | Parry, point at opponent |
| Win | Glove kiss / chain flex | |
| Lose | “What?” shrug / sit | |

**Personality rule:** even big hits look *controlled and cocky*, not wild.

### 6.2 Deen the Great / Great Crashout — “pressure boxer” (Balrog kit)

| Tier | Anim name | Description |
| --- | --- | --- |
| Idle | Crouch bounce | Low center, angry brow, heat |
| Chip | **Body jab** | Short, mean, forward pressure |
| Medium | **Dash Straight** | Full rush step + cross |
| Heavy | **Dash Upper** | Rising haymaker |
| Special | **Full Send** | Swing blow / wide overhand |
| Chain | **Crazy Crashout** | Multi dash punches (Balrog super rhythm) |
| Super | **Gigaton Send** | One nuke straight + red shockwave |
| Sousai | **Buffalo headbutt** | Leap deny — perfect for crashout energy |
| Win | Roar / arms wide | |
| Lose | Face-down / “full send failed” | |

**Personality rule:** aggression and volume — more steps forward, more multi-hit strings.

---

## 7. Animation state machine (implementation shape)

```
idle ──on attack──► windup ──► active ──hitstop──► recover ──► idle
                      │                      │
                      │                      └── defender: hitstun / crumple
                      │
                 if chain continues
                      └── next hit in string (no full idle)

idle ──danger──► panic_idle (kill col high)
idle ──power gem built──► charge_loop (TAP feel)
attack ──sousai──► parry/headbutt variant
```

### Frame budgets (PICO-8, 30fps feel ≈ 1–2 game frames per art frame)

| Anim | Windup | Active | Hitstop | Recover | Total ~ |
| --- | --- | --- | --- | --- | --- |
| Jab | 2 | 2 | 2 | 4 | 10 |
| Cross | 3 | 2 | 3 | 6 | 14 |
| Special | 4 | 3 | 4 | 8 | 19 |
| Super | 6 | 4 | 6 | 12 | 28 |
| Finisher | 8 | 4 | 8 | hold | until result |

Priority: **higher tier interrupts lower** if a bigger dump happens mid-anim.

---

## 8. Effects stack (makes punches “cool”)

Layer these per tier (from SPF2T / SF juice):

1. **Impact star / flash** at glove contact point  
2. **Speed lines** on dash punches  
3. **Screen shake** scaled to tier  
4. **Hitstop freeze** (both chibis + briefly pause gem settle if needed)  
5. **Color trail** matching gem color of the clear (SPF2T HD Remix elemental crashes: red fire, blue water…)  
6. **Dust / grit** at feet on dash-in  
7. **Afterimage** on super only  
8. **Sound**: jab click → punch thud → upper whoosh → super sting  

FX should travel **from attacker toward defender well** so the board and the fight feel linked.

---

## 9. Minimum sprite sheet (per character)

| Slot | Frames | Notes |
| --- | --- | --- |
| Idle | 2 | Loop |
| Jab | 3 | wind / active / recover |
| Cross / dash | 4 | include step |
| Upper | 4 | |
| Special unique | 4–5 | Gold Rush / Full Send |
| Super | 5–6 | |
| Hitstun | 2 | |
| Guard flinch | 2 | |
| Charge | 2 | TAP loop |
| Win / Lose | 1–2 each | |

**Shared FX sprites:** impact stars (S/M/L), speed lines, dust, shockwave.

On PICO-8: prefer **sprite sheet + flip** over pure procedural once token budget allows; procedural only for prototypes.

---

## 10. Acceptance checklist (animation quality)

A match “feels like SPF2T + boxing” when:

- [ ] Chip attacks never use the super animation  
- [ ] Big dumps always use special/super silhouette  
- [ ] Defender always reacts (no one-sided puppet show)  
- [ ] Hitstop is visible on medium+  
- [ ] Chains look like multi-hit strings (Balrog), not one pose looped  
- [ ] Sousai has its own “deny” anim (not a normal punch)  
- [ ] Each fighter’s idle/special is identifiable in a still frame  
- [ ] KO has a distinct finisher, not a recycled jab  

---

## 11. Sources (design reference)

- Super Puzzle Fighter II Turbo: counter magnitude → move size (cosmetic theater)  
- Street Fighter attack phases: startup / active / recovery + hitstop  
- Balrog: Dash Straight / Upper / Low / Swing, Buffalo Headbutt, Turn Punch levels, Crazy Buffalo, Gigaton Blow  
- Ryu: LP–HP ladder, Hadoken / Shoryuken / Tatsu, Shinku / Shin supers as tier tops  

---

## 12. Next implementation order

1. Wire **tier table** to real `atk` + `chain` (already partially present).  
2. Add **defender reaction** state (currently weak).  
3. Add **hitstop** frames + impact FX.  
4. Expand from 4 anim IDs → full kit above per fighter.  
5. Sprite pass: idle / jab / dash / upper / super / hit for AB & Deen.  
6. Screenshot fight mid-match and compare to SPF2T reference again.
