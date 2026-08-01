/**
 * Crash Out: Ring Rush — Battle Scene
 *
 * The core gameplay scene. Manages the active puzzle-boxing match:
 * - Two puzzle boards (P1 and P2)
 * - Two fighter sprites on the parallax arena
 * - HUD (HP bars, SUPER meters, timer)
 * - Input processing and game loop
 * - AI opponent control
 * - Chain resolution and garbage exchange
 * - SUPER activation and cinematics
 * - KO detection and transition to Results
 *
 * Per GDD v8.0.0 Sections 3-6.
 */
import Phaser from 'phaser';
import {
    MatchPhase,
    MatchState,
    PlayerState,
    GemPair,
    PairOrientation,
    InputAction,
    FighterData,
    Board,
    AIDifficulty,
} from '../engine/types';
import {
    createBoard,
    spawnGemPair,
    moveGemPair,
    rotateGemPair,
    lockGemPair,
    resolveChains,
    calculateGarbage,
    placeGarbage,
    tickCounterGems,
    checkLoss,
    calculateSuperCharge,
    hardDropPair,
} from '../engine/puzzle';
import { getAIPlacement } from '../engine/ai';
import { getFighter, FIGHTER_ROSTER } from '../engine/fighters';
import { audioManager, SFX } from '../engine/audio';
import { InputManager } from '../utils/input';
import { CameraController } from '../utils/camera';
import { ParallaxArena } from '../objects/ParallaxArena';
import { FighterSprite } from '../objects/FighterSprite';
import { GemGrid } from '../objects/GemGrid';
import { GemPairDisplay } from '../objects/GemPair';
import { HUD } from '../objects/HUD';
import { TouchControls } from '../objects/TouchControls';
import {
    GAME_WIDTH,
    GAME_HEIGHT,
    GRAVITY_TICK_MS,
    SOFT_DROP_TICK_MS,
    LOCK_DELAY_MS,
    ROUND_TIMER_SECONDS,
    MAX_HP,
    SUPER_METER_MAX,
    SUPER_DAMAGE,
    BASE_GARBAGE_DAMAGE,
    CHAIN_DAMAGE_MULTIPLIER,
} from '../config';

/** Data passed to BattleScene on start */
interface BattleSceneData {
    p1Fighter: FighterData;
    p2Fighter: FighterData;
    mode: 'arcade' | 'versus';
    aiDifficulty?: AIDifficulty;
}

/**
 * BattleScene — The heart of Crash Out: Ring Rush.
 */
export class BattleScene extends Phaser.Scene {
    // ─── Systems ───────────────────────────────────────────────────────
    private inputManager!: InputManager;
    private cameraController!: CameraController;

    // ─── Visual Objects ────────────────────────────────────────────────
    private arena!: ParallaxArena;
    private p1Fighter!: FighterSprite;
    private p2Fighter!: FighterSprite;
    private p1Grid!: GemGrid;
    private p2Grid!: GemGrid;
    private p1PairDisplay!: GemPairDisplay;
    private p2PairDisplay!: GemPairDisplay;
    private hud!: HUD;
    private touchControls!: TouchControls;

    // ─── Game State ────────────────────────────────────────────────────
    private matchState!: MatchState;
    private sceneData!: BattleSceneData;

    // ─── Timing ────────────────────────────────────────────────────────
    private gravityTimer = 0;
    private lockTimer = 0;
    private roundTimer = 0;
    private resolveTimer = 0;
    private introTimer = 0;
    private isLocking = false;
    private isResolving = false;
    private isSoftDropping = false;

    // ─── AI ────────────────────────────────────────────────────────────
    private aiTimer = 0;
    private aiMoveInterval = 300; // ms between AI moves
    private aiTargetCol = 0;
    private aiTargetOrientation: PairOrientation = PairOrientation.VERTICAL_DOWN;
    private aiHasPlaced = false;

    constructor() {
        super({ key: 'BattleScene' });
    }

    init(data: BattleSceneData): void {
        this.sceneData = data;
    }

    create(): void {
        audioManager.init();
        audioManager.resume();

        // ─── Initialize Systems ────────────────────────────────────────
        this.inputManager = new InputManager(this);
        this.cameraController = new CameraController(this);

        // ─── Create Arena ──────────────────────────────────────────────
        this.arena = new ParallaxArena(this);

        // ─── Cell size and grid positioning ─────────────────────────────
        const cellSize = 28; // Fits 6 columns in ~170px
        const gridWidth = 6 * cellSize;
        const gridHeight = 12 * cellSize;
        const gridY = 240; // Below top arena zone

        // P1 grid on the left
        this.p1Grid = new GemGrid(this, 10, gridY, cellSize);
        this.p1Grid.setDepth(3);
        this.add.existing(this.p1Grid);

        // P2 grid on the right
        this.p2Grid = new GemGrid(this, GAME_WIDTH - gridWidth - 10, gridY, cellSize);
        this.p2Grid.setDepth(3);
        this.add.existing(this.p2Grid);

        // ─── Gem Pair Displays ─────────────────────────────────────────
        this.p1PairDisplay = new GemPairDisplay(this, this.p1Grid, cellSize);
        this.p1PairDisplay.setDepth(4);
        this.add.existing(this.p1PairDisplay);

        this.p2PairDisplay = new GemPairDisplay(this, this.p2Grid, cellSize);
        this.p2PairDisplay.setDepth(4);
        this.add.existing(this.p2PairDisplay);

        // ─── Fighters in Top Arena Zone (30% area) ─────────────────────
        const fighterY = 175;
        this.p1Fighter = new FighterSprite(
            this,
            GAME_WIDTH * 0.28,
            fighterY,
            this.sceneData.p1Fighter,
            false,
        );
        this.p1Fighter.setDepth(2);
        this.p1Fighter.setScale(0.6);

        this.p2Fighter = new FighterSprite(
            this,
            GAME_WIDTH * 0.72,
            fighterY,
            this.sceneData.p2Fighter,
            true,
        );
        this.p2Fighter.setDepth(2);
        this.p2Fighter.setScale(0.6);

        // ─── HUD ───────────────────────────────────────────────────────
        this.hud = new HUD(this, GAME_WIDTH);
        this.hud.setFighterNames(this.sceneData.p1Fighter.displayName, this.sceneData.p2Fighter.displayName);
        this.hud.setDepth(5);
        this.add.existing(this.hud);

        // ─── Touch Controls ────────────────────────────────────────────
        this.touchControls = new TouchControls(this, this.inputManager);
        this.touchControls.setDepth(6);
        this.add.existing(this.touchControls);

        // ─── Initialize Match State ────────────────────────────────────
        this.initMatchState();

        // ─── Start with intro ──────────────────────────────────────────
        this.matchState.phase = MatchPhase.INTRO;
        this.introTimer = 2000; // 2 second intro
        this.hud.showRoundIntro(this.matchState.round);
        audioManager.play(SFX.ROUND_BELL);
    }

    /** Initialize/reset the match state */
    private initMatchState(): void {
        const p1Fighter = this.sceneData.p1Fighter;
        const p2Fighter = this.sceneData.p2Fighter;
        const aiDiff = this.sceneData.aiDifficulty || 'normal';

        const createPlayerState = (fighter: FighterData, isAI: boolean, difficulty: AIDifficulty): PlayerState => ({
            fighter,
            hp: MAX_HP,
            superMeter: 0,
            superReady: false,
            board: createBoard(),
            activePair: spawnGemPair(),
            nextPair: spawnGemPair(),
            pendingGarbage: [],
            currentChain: 0,
            totalGemsCleared: 0,
            isAI,
            aiDifficulty: difficulty,
        });

        this.matchState = {
            phase: MatchPhase.INTRO,
            p1: createPlayerState(p1Fighter, false, 'easy'),
            p2: createPlayerState(p2Fighter, true, aiDiff),
            timer: ROUND_TIMER_SECONDS,
            round: 1,
            p1Wins: 0,
            p2Wins: 0,
            roundsToWin: 2,
            cameraDrift: 0,
        };

        // Sync visual displays
        this.p1Grid.updateBoard(this.matchState.p1.board);
        this.p2Grid.updateBoard(this.matchState.p2.board);
        this.p1PairDisplay.updatePair(this.matchState.p1.activePair);
        this.p2PairDisplay.updatePair(this.matchState.p2.activePair);
        this.hud.updateHP('p1', MAX_HP, MAX_HP);
        this.hud.updateHP('p2', MAX_HP, MAX_HP);
        this.hud.updateSuper('p1', 0, SUPER_METER_MAX);
        this.hud.updateSuper('p2', 0, SUPER_METER_MAX);
        this.hud.updateTimer(ROUND_TIMER_SECONDS);
    }

    update(time: number, delta: number): void {
        const ms = delta;

        switch (this.matchState.phase) {
            case MatchPhase.INTRO:
                this.updateIntro(ms);
                break;
            case MatchPhase.PLAYING:
                this.updatePlaying(ms);
                break;
            case MatchPhase.RESOLVING:
                this.updateResolving(ms);
                break;
            case MatchPhase.KO:
                // Wait for animations, then transition to results
                break;
            case MatchPhase.PAUSED:
                break;
        }

        // Always update visuals
        this.cameraController.update();
        this.arena.update(this.cameraController.offset);
        this.p1Fighter.update(ms);
        this.p2Fighter.update(ms);
    }

    // ─── Phase: Intro ──────────────────────────────────────────────────

    private updateIntro(delta: number): void {
        this.introTimer -= delta;
        if (this.introTimer <= 0) {
            this.matchState.phase = MatchPhase.PLAYING;
            this.gravityTimer = 0;
            this.roundTimer = 0;
        }
    }

    // ─── Phase: Playing ────────────────────────────────────────────────

    private updatePlaying(delta: number): void {
        // Process P1 input
        this.processPlayerInput();

        // Process P2 AI
        this.processAI(delta);

        // Gravity tick
        this.updateGravity(delta);

        // Round timer
        this.updateRoundTimer(delta);

        // Check for pause
        const actions = this.inputManager.poll();
        if (actions.includes(InputAction.PAUSE)) {
            this.matchState.phase = MatchPhase.PAUSED;
            this.scene.launch('PauseScene');
            this.scene.pause();
            audioManager.play(SFX.PAUSE);
        }
    }

    /** Process P1 keyboard/touch/gamepad input */
    private processPlayerInput(): void {
        const actions = this.inputManager.poll();
        const state = this.matchState.p1;
        if (!state.activePair) return;

        for (const action of actions) {
            switch (action) {
                case InputAction.LEFT: {
                    const moved = moveGemPair(state.board, state.activePair, 'left');
                    if (moved) {
                        state.activePair = moved;
                        this.p1PairDisplay.updatePair(state.activePair);
                    }
                    break;
                }
                case InputAction.RIGHT: {
                    const moved = moveGemPair(state.board, state.activePair, 'right');
                    if (moved) {
                        state.activePair = moved;
                        this.p1PairDisplay.updatePair(state.activePair);
                    }
                    break;
                }
                case InputAction.DOWN: {
                    this.isSoftDropping = true;
                    break;
                }
                case InputAction.ROTATE_CW: {
                    state.activePair = rotateGemPair(state.board, state.activePair, 'cw');
                    this.p1PairDisplay.updatePair(state.activePair);
                    audioManager.play(SFX.GEM_ROTATE);
                    break;
                }
                case InputAction.ROTATE_CCW: {
                    state.activePair = rotateGemPair(state.board, state.activePair, 'ccw');
                    this.p1PairDisplay.updatePair(state.activePair);
                    audioManager.play(SFX.GEM_ROTATE);
                    break;
                }
                case InputAction.HARD_DROP: {
                    this.lockAndResolve('p1');
                    audioManager.play(SFX.HARD_DROP);
                    break;
                }
            }
        }
    }

    /** Process P2 AI moves */
    private processAI(delta: number): void {
        const state = this.matchState.p2;
        if (!state.activePair) return;

        this.aiTimer += delta;

        // AI decides placement on first tick
        if (!this.aiHasPlaced && this.aiTimer > 200) {
            const placement = getAIPlacement(state.board, state.activePair, state.aiDifficulty);
            this.aiTargetCol = placement.targetCol;
            this.aiTargetOrientation = placement.targetOrientation;
            this.aiHasPlaced = true;
        }

        // AI moves toward target column
        if (this.aiHasPlaced && this.aiTimer >= this.aiMoveInterval) {
            this.aiTimer = 0;

            // First rotate to target orientation
            if (state.activePair.orientation !== this.aiTargetOrientation) {
                state.activePair = rotateGemPair(state.board, state.activePair, 'cw');
                this.p2PairDisplay.updatePair(state.activePair);
                return;
            }

            // Then move to target column
            if (state.activePair.col < this.aiTargetCol) {
                const moved = moveGemPair(state.board, state.activePair, 'right');
                if (moved) {
                    state.activePair = moved;
                    this.p2PairDisplay.updatePair(state.activePair);
                }
            } else if (state.activePair.col > this.aiTargetCol) {
                const moved = moveGemPair(state.board, state.activePair, 'left');
                if (moved) {
                    state.activePair = moved;
                    this.p2PairDisplay.updatePair(state.activePair);
                }
            } else {
                // At target — hard drop
                this.lockAndResolve('p2');
            }
        }
    }

    /** Gravity: drop the active pair down one row */
    private updateGravity(delta: number): void {
        const tickRate = this.isSoftDropping ? SOFT_DROP_TICK_MS : GRAVITY_TICK_MS;
        this.gravityTimer += delta;

        if (this.gravityTimer >= tickRate) {
            this.gravityTimer = 0;
            this.isSoftDropping = false;

            // Drop P1 pair
            this.dropPair('p1');
            // Drop P2 pair
            this.dropPair('p2');
        }
    }

    /** Drop a player's active pair one row */
    private dropPair(player: 'p1' | 'p2'): void {
        const state = player === 'p1' ? this.matchState.p1 : this.matchState.p2;
        if (!state.activePair) return;

        const moved = moveGemPair(state.board, state.activePair, 'down');
        if (moved) {
            state.activePair = moved;
            const pairDisplay = player === 'p1' ? this.p1PairDisplay : this.p2PairDisplay;
            pairDisplay.updatePair(state.activePair);
        } else {
            // Can't move down — lock after delay
            this.lockAndResolve(player);
        }
    }

    /** Lock the active pair into the board and resolve chains */
    private lockAndResolve(player: 'p1' | 'p2'): void {
        const state = player === 'p1' ? this.matchState.p1 : this.matchState.p2;
        if (!state.activePair) return;

        // Lock pair into board
        state.board = lockGemPair(state.board, state.activePair);
        audioManager.play(SFX.GEM_LAND);

        // Resolve chains
        const result = resolveChains(state.board);
        state.board = result.finalBoard;

        // Update visual board
        const grid = player === 'p1' ? this.p1Grid : this.p2Grid;
        grid.updateBoard(state.board);

        // Process results
        if (result.totalGemsCleared > 0) {
            audioManager.play(SFX.GEM_MATCH);

            // Play chain SFX
            for (let i = 1; i <= result.totalChains; i++) {
                this.time.delayedCall(i * 200, () => {
                    audioManager.playChain(i);
                });
            }

            // Show combo
            if (result.totalChains > 1) {
                const hud = this.hud;
                hud.showCombo(player, result.totalChains);
            }

            // Fighter jab animation
            const fighter = player === 'p1' ? this.p1Fighter : this.p2Fighter;
            fighter.playJab();
            this.cameraController.onAttack(player);

            // Calculate and send garbage to opponent
            const garbage = calculateGarbage(result);
            const opponent = player === 'p1' ? this.matchState.p2 : this.matchState.p1;
            if (garbage.rows > 0) {
                opponent.board = placeGarbage(opponent.board, garbage);
                const oppGrid = player === 'p1' ? this.p2Grid : this.p1Grid;
                oppGrid.updateBoard(opponent.board);
                audioManager.play(SFX.GARBAGE_DROP);

                // Opponent flinch
                const oppFighter = player === 'p1' ? this.p2Fighter : this.p1Fighter;
                oppFighter.playFlinch();

                // HP damage
                const damage = garbage.rows * BASE_GARBAGE_DAMAGE;
                opponent.hp = Math.max(0, opponent.hp - damage);
                this.hud.updateHP(
                    player === 'p1' ? 'p2' : 'p1',
                    opponent.hp,
                    MAX_HP,
                );
            }

            // SUPER charge
            const charge = calculateSuperCharge(result.totalGemsCleared, result.totalChains);
            state.superMeter = Math.min(SUPER_METER_MAX, state.superMeter + charge);
            state.superReady = state.superMeter >= SUPER_METER_MAX;
            this.hud.updateSuper(player, state.superMeter, SUPER_METER_MAX);

            if (state.superReady) {
                this.hud.flashSuperReady(player);
                audioManager.play(SFX.SUPER_READY);
            }

            // Update stats
            state.totalGemsCleared += result.totalGemsCleared;
            state.currentChain = result.totalChains;
        }

        // Tick counter gems
        state.board = tickCounterGems(state.board);
        grid.updateBoard(state.board);

        // Check for KO
        const opponent = player === 'p1' ? this.matchState.p2 : this.matchState.p1;
        if (opponent.hp <= 0) {
            this.triggerKO(player);
            return;
        }

        // Check for loss (board overflow)
        if (checkLoss(state.board)) {
            this.triggerKO(player === 'p1' ? 'p2' : 'p1');
            return;
        }

        // Spawn next pair
        state.activePair = state.nextPair;
        state.nextPair = spawnGemPair();
        const pairDisplay = player === 'p1' ? this.p1PairDisplay : this.p2PairDisplay;
        pairDisplay.updatePair(state.activePair);

        // Reset AI for P2
        if (player === 'p2') {
            this.aiHasPlaced = false;
            this.aiTimer = 0;
        }
    }

    /** Update round timer */
    private updateRoundTimer(delta: number): void {
        this.roundTimer += delta;
        if (this.roundTimer >= 1000) {
            this.roundTimer -= 1000;
            this.matchState.timer = Math.max(0, this.matchState.timer - 1);
            this.hud.updateTimer(this.matchState.timer);

            // Time's up — player with more HP wins
            if (this.matchState.timer <= 0) {
                const winner = this.matchState.p1.hp >= this.matchState.p2.hp ? 'p1' : 'p2';
                this.triggerKO(winner);
            }

            // Countdown beeps in last 10 seconds
            if (this.matchState.timer <= 10 && this.matchState.timer > 0) {
                audioManager.play(SFX.COUNTDOWN);
            }
        }
    }

    // ─── Phase: Resolving ──────────────────────────────────────────────

    private updateResolving(delta: number): void {
        this.resolveTimer -= delta;
        if (this.resolveTimer <= 0) {
            this.matchState.phase = MatchPhase.PLAYING;
        }
    }

    // ─── KO ────────────────────────────────────────────────────────────

    private triggerKO(winner: 'p1' | 'p2'): void {
        this.matchState.phase = MatchPhase.KO;
        audioManager.play(SFX.KO_HIT);
        this.cameraController.shake(10, 500);
        this.hud.showKO();

        // Winner celebration
        const winnerFighter = winner === 'p1' ? this.p1Fighter : this.p2Fighter;
        const loserFighter = winner === 'p1' ? this.p2Fighter : this.p1Fighter;
        winnerFighter.playVictory();
        loserFighter.playKnockdown();

        // Update round wins
        if (winner === 'p1') {
            this.matchState.p1Wins++;
        } else {
            this.matchState.p2Wins++;
        }

        // Delayed transition to results
        this.time.delayedCall(2500, () => {
            const winnerState = winner === 'p1' ? this.matchState.p1 : this.matchState.p2;
            const loserState = winner === 'p1' ? this.matchState.p2 : this.matchState.p1;

            this.scene.start('ResultsScene', {
                winner: winnerState.fighter,
                loser: loserState.fighter,
                stats: {
                    chainMax: winnerState.currentChain,
                    gemsCleared: winnerState.totalGemsCleared,
                    roundsWon: winner === 'p1' ? this.matchState.p1Wins : this.matchState.p2Wins,
                },
                mode: this.sceneData.mode,
                p1Fighter: this.sceneData.p1Fighter,
                p2Fighter: this.sceneData.p2Fighter,
            });
        });

        audioManager.play(SFX.CROWD_ROAR);
    }

    /** Called when PauseScene resumes this scene */
    resume(): void {
        this.matchState.phase = MatchPhase.PLAYING;
    }

    shutdown(): void {
        this.inputManager.destroy();
    }
}
