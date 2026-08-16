# Knockdown 10-Count Puzzle Survival Plan

## Goal
Implement a dramatic boxing knockdown mechanic where reaching 0 HP triggers a referee 10-count and a high-stakes puzzle survival challenge to get back on your feet before the count of 10.

---

## Tasks
- [ ] Task 1: Add `KNOCKDOWN` state and referee 10-count timer to `index.html` → Verify: Hitting 0 HP enters `KNOCKDOWN` with ref audio count "1... 2... 3..."
- [ ] Task 2: Implement "Get-Up Stamina" puzzle objective (detonate 3 color pairs or 1 power gem) → Verify: Gem clears fill the Get-Up meter from 0% to 100%
- [ ] Task 3: Add "He Gets Up!" recovery cutscene and second-wind HP boost (+25% HP) → Verify: Filling meter before count 10 resumes match with fighter standing
- [ ] Task 4: Add 10-count KO trigger on count 10 expiration → Verify: Reaching count 10 triggers referee wave-off and standard KO screen
- [ ] Task 5: Implement Three-Knockdown TKO rule per round (1st KD: normal speed, 2nd KD: 1.3x speed, 3rd KD: instant TKO) → Verify: 3rd knockdown triggers immediate TKO
- [ ] Task 6: Integrate with 7-Stage Campaign Ladder and AI knockdown reactions → Verify: CPU opponents also experience knockdowns with chance-to-recover scaling by stage difficulty
- [ ] Task 7: End-to-end playtest and verification in headless browser → Verify: Run match, trigger knockdown, test both get-up recovery and 10-count KO

---

## Done When
- [ ] Fighter HP dropping to 0 enters dramatic 10-count survival instead of instant dead stop.
- [ ] Player can actively puzzle-solve under pressure to beat the count and stand back up.
- [ ] 3-Knockdown rule awards authentic boxing TKOs.
- [ ] Seamlessly integrated into the 7-stage 30-minute single-player campaign.

---

## Notes
- **Audio Cue**: Referee count voice/SFX at each integer ("ONE!", "TWO!", "THREE!").
- **Adrenaline Visuals**: Vignette edges pulse red and crowd chants "GET UP! GET UP!" during the count.
- **AI Scaling**: Early stage CPUs (N3ON, Adin) rarely beat the count (20% chance); Bosses (Tank, Floyd) have high heart/grit (75% chance to beat count 1).
