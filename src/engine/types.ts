/**
 * Crash Out: Ring Rush — Core Type Definitions
 *
 * All interfaces, enums, and type aliases used across the engine.
 * This file has ZERO runtime dependencies — it's purely type-level.
 */

// ─── Gem Types ─────────────────────────────────────────────────────────────────

/** The 5 standard gem colors plus special types */
export enum GemColor {
    RED = 'RED',
    BLUE = 'BLUE',
    GREEN = 'GREEN',
    YELLOW = 'YELLOW',
    PURPLE = 'PURPLE',
}

/** Special gem types that don't follow normal color matching */
export enum SpecialGemType {
    /** Garbage gem — placed by opponent's attacks. Has countdown timer. */
    COUNTER = 'COUNTER',
    /** Crash gem (diamond) — detonates ALL gems of the color it touches */
    CRASH = 'CRASH',
}

/** A single cell in the puzzle grid */
export interface Gem {
    /** Standard color (null for special gems) */
    color: GemColor | null;
    /** Special gem type (null for normal gems) */
    special: SpecialGemType | null;
    /** Power gem group ID — if part of a fused power gem block. null = normal 1×1 gem. */
    powerGroup: string | null;
    /** Counter gem countdown turns remaining (only for COUNTER type) */
    counterTurns: number;
    /** Position in the grid */
    row: number;
    col: number;
}

/** An empty cell in the grid */
export type Cell = Gem | null;

/** The full puzzle grid — 12 rows × 6 columns */
export type Board = Cell[][];

// ─── Power Gem ─────────────────────────────────────────────────────────────────

/** A fused power gem block (2×2 or larger same-color rectangle) */
export interface PowerGem {
    /** Unique identifier for this power gem group */
    id: string;
    /** Color of all gems in this power gem */
    color: GemColor;
    /** Top-left row */
    row: number;
    /** Top-left column */
    col: number;
    /** Width in cells */
    width: number;
    /** Height in cells */
    height: number;
}

// ─── Gem Pair (Active Falling Piece) ───────────────────────────────────────────

/** Orientation of the gem pair */
export enum PairOrientation {
    /** Primary gem on left, secondary on right */
    HORIZONTAL = 'HORIZONTAL',
    /** Primary gem on top, secondary on bottom */
    VERTICAL_DOWN = 'VERTICAL_DOWN',
    /** Primary gem on right, secondary on left */
    HORIZONTAL_REVERSE = 'HORIZONTAL_REVERSE',
    /** Primary gem on bottom, secondary on top */
    VERTICAL_UP = 'VERTICAL_UP',
}

/** The currently falling 2-gem pair controlled by the player */
export interface GemPair {
    /** Primary gem color */
    primaryColor: GemColor;
    /** Secondary gem color */
    secondaryColor: GemColor;
    /** Current row of the primary gem */
    row: number;
    /** Current column of the primary gem */
    col: number;
    /** Current orientation */
    orientation: PairOrientation;
}

// ─── Match & Chain Results ─────────────────────────────────────────────────────

/** A group of matched gems to be cleared */
export interface MatchGroup {
    /** Color that matched */
    color: GemColor;
    /** Positions of all gems in this match group */
    positions: Array<{ row: number; col: number }>;
    /** Whether this match includes a power gem (bonus damage) */
    includesPowerGem: boolean;
    /** Total gem count in this match */
    count: number;
}

/** Result of a chain cascade step */
export interface ChainStep {
    /** Chain link number (1 = initial match, 2+ = cascade) */
    chainLink: number;
    /** Match groups cleared in this step */
    matches: MatchGroup[];
    /** Total gems cleared in this step */
    gemsCleared: number;
    /** Board state after this step (post-gravity) */
    boardAfter: Board;
}

/** Complete result of processing a gem pair drop */
export interface DropResult {
    /** Final board state after all chains resolve */
    finalBoard: Board;
    /** All chain steps that occurred */
    chainSteps: ChainStep[];
    /** Total chain count */
    totalChains: number;
    /** Total gems cleared across all chains */
    totalGemsCleared: number;
    /** Garbage gems to send to opponent */
    garbageToSend: number;
    /** SUPER meter charge gained */
    superCharge: number;
    /** Power gems formed */
    powerGemsFormed: PowerGem[];
}

// ─── Garbage Payload ───────────────────────────────────────────────────────────

/** Garbage gems to place on opponent's board */
export interface GarbagePayload {
    /** Number of garbage rows to drop */
    rows: number;
    /** Pattern: which columns get garbage (for partial rows) */
    pattern: number[];
    /** Countdown turns before garbage converts to normal gems */
    counterTurns: number;
}

// ─── Input Actions ─────────────────────────────────────────────────────────────

/** Unified input actions from any input source */
export enum InputAction {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
    DOWN = 'DOWN',
    ROTATE_CW = 'ROTATE_CW',
    ROTATE_CCW = 'ROTATE_CCW',
    HARD_DROP = 'HARD_DROP',
    PAUSE = 'PAUSE',
    CONFIRM = 'CONFIRM',
    BACK = 'BACK',
    /** D-pad up for menu navigation */
    UP = 'UP',
    /** Activate signature SUPER finisher */
    SUPER = 'SUPER',
}

// ─── Fighter Data ──────────────────────────────────────────────────────────────

/** AI difficulty tiers */
export type AIDifficulty = 'easy' | 'normal' | 'hard';

/** Drop pattern — color/column bias for gem generation */
export interface DropPattern {
    /** Color that appears more frequently for this fighter (null = balanced) */
    favoredColor: GemColor | null;
    /** Probability boost for favored color (0.0 to 1.0 extra weight) */
    colorBias: number;
    /** Preferred columns for AI placement (indices) */
    preferredColumns: number[];
}

/** Fighter passive ability */
export interface PassiveAbility {
    /** Display name */
    name: string;
    /** Description */
    description: string;
    /** Ability type for engine to apply */
    type: PassiveType;
    /** Numeric value for the ability effect */
    value: number;
}

/** Types of passive abilities */
export enum PassiveType {
    /** Counter gems tick down faster */
    FASTER_COUNTER_DECAY = 'FASTER_COUNTER_DECAY',
    /** Gems fall slightly slower */
    SLOWER_GRAVITY = 'SLOWER_GRAVITY',
    /** More SUPER charge per chain */
    BONUS_SUPER_CHARGE = 'BONUS_SUPER_CHARGE',
    /** Garbage rows are narrower (fewer columns) */
    NARROWER_GARBAGE = 'NARROWER_GARBAGE',
    /** Power gems form with fewer gems */
    EASIER_POWER_GEMS = 'EASIER_POWER_GEMS',
    /** Start with a partial SUPER charge */
    STARTING_SUPER = 'STARTING_SUPER',
    /** Deal bonus damage per chain link */
    CHAIN_DAMAGE_BONUS = 'CHAIN_DAMAGE_BONUS',
    /** Receive less HP damage from garbage */
    DAMAGE_REDUCTION = 'DAMAGE_REDUCTION',
    /** Crash gems appear more frequently */
    MORE_CRASH_GEMS = 'MORE_CRASH_GEMS',
    /** Faster DAS (quicker piece movement) */
    FASTER_DAS = 'FASTER_DAS',
    /** Counter gems placed have shorter countdown */
    SHORTER_COUNTER_TIMER = 'SHORTER_COUNTER_TIMER',
    /** See next 2 pairs instead of 1 */
    EXTENDED_PREVIEW = 'EXTENDED_PREVIEW',
    /** Immune to first garbage drop each round */
    GARBAGE_SHIELD = 'GARBAGE_SHIELD',
    /** Power gems deal 20% more damage */
    POWER_GEM_DAMAGE_BONUS = 'POWER_GEM_DAMAGE_BONUS',
}

/** SUPER finisher data */
export interface SuperFinisher {
    /** Display name of the SUPER move */
    name: string;
    /** Base damage */
    damage: number;
    /** Animation key prefix (e.g. 'broner-super') */
    animKey: string;
    /** Brief description for UI display */
    description: string;
}

/** Idle fidget configuration per fighter */
export interface FidgetConfig {
    /** Fidget A animation description */
    fidgetA: string;
    /** Fidget B animation description */
    fidgetB: string;
    /** Minimum interval between fidgets (ms) */
    minInterval: number;
    /** Maximum interval between fidgets (ms) */
    maxInterval: number;
}

/** Complete fighter data entry */
export interface FighterData {
    /** Internal ID (lowercase, no spaces) */
    id: string;
    /** Display name */
    displayName: string;
    /** Sprite sheet texture key */
    spriteKey: string;
    /** Tagline / catchphrase */
    tagline: string;
    /** Drop pattern bias */
    dropPattern: DropPattern;
    /** Passive ability */
    passive: PassiveAbility;
    /** SUPER finisher */
    superFinisher: SuperFinisher;
    /** Idle fidget config */
    fidget: FidgetConfig;
    /** Arcade mode boss flag */
    isBoss: boolean;
}

// ─── Game State ────────────────────────────────────────────────────────────────

/** Current phase of a match */
export enum MatchPhase {
    /** Countdown before round starts */
    INTRO = 'INTRO',
    /** Active gameplay */
    PLAYING = 'PLAYING',
    /** Chain is resolving (player can't input) */
    RESOLVING = 'RESOLVING',
    /** SUPER cinematic playing */
    SUPER_CINEMATIC = 'SUPER_CINEMATIC',
    /** KO animation */
    KO = 'KO',
    /** Match over, showing results */
    RESULTS = 'RESULTS',
    /** Paused */
    PAUSED = 'PAUSED',
}

/** State for one player in a match */
export interface PlayerState {
    /** Fighter data */
    fighter: FighterData;
    /** Current HP (0 = KO) */
    hp: number;
    /** Current SUPER meter charge */
    superMeter: number;
    /** Whether SUPER is ready */
    superReady: boolean;
    /** Puzzle board */
    board: Board;
    /** Currently falling gem pair (null if none) */
    activePair: GemPair | null;
    /** Next gem pair preview */
    nextPair: GemPair | null;
    /** Pending garbage from opponent */
    pendingGarbage: GarbagePayload[];
    /** Current chain count (for display) */
    currentChain: number;
    /** Total gems cleared this match */
    totalGemsCleared: number;
    /** Is this player controlled by AI? */
    isAI: boolean;
    /** AI difficulty (if isAI) */
    aiDifficulty: AIDifficulty;
}

/** Full match state */
export interface MatchState {
    /** Current phase */
    phase: MatchPhase;
    /** Player 1 state */
    p1: PlayerState;
    /** Player 2 state */
    p2: PlayerState;
    /** Round timer remaining (seconds) */
    timer: number;
    /** Current round number */
    round: number;
    /** Rounds won by P1 */
    p1Wins: number;
    /** Rounds won by P2 */
    p2Wins: number;
    /** Rounds needed to win the match */
    roundsToWin: number;
    /** Camera drift offset (pixels) */
    cameraDrift: number;
}

// ─── AI Decision ───────────────────────────────────────────────────────────────

/** AI's chosen placement for a gem pair */
export interface AIPlacement {
    /** Target column for the primary gem */
    targetCol: number;
    /** Target orientation */
    targetOrientation: PairOrientation;
    /** Evaluated score for this placement */
    score: number;
}

// ─── Animation States ──────────────────────────────────────────────────────────

/** Fighter animation states (mapped to sprite sheet rows) */
export enum AnimationState {
    /** Row 0, frames 0-3: Idle bounce loop */
    IDLE = 'IDLE',
    /** Row 0, frames 4-5: Fidget A */
    FIDGET_A = 'FIDGET_A',
    /** Row 0, frames 6-7: Fidget B */
    FIDGET_B = 'FIDGET_B',
    /** Row 1, frames 0-2: Jab attack */
    JAB = 'JAB',
    /** Row 1, frames 3-4: Flinch (taking damage) */
    FLINCH = 'FLINCH',
    /** Row 1, frames 5-7: Knockdown (KO) */
    KNOCKDOWN = 'KNOCKDOWN',
    /** Row 2, frames 0-3: SUPER windup + activation */
    SUPER = 'SUPER',
    /** Row 2, frames 4-5: Victory celebration */
    VICTORY = 'VICTORY',
    /** Row 2, frames 6-7: Guard/block */
    GUARD = 'GUARD',
    /** Row 3, frames 0-1: Taunt */
    TAUNT = 'TAUNT',
}

/** Mapping from AnimationState to sprite sheet frame indices */
export const SPRITE_MAP: Record<AnimationState, { row: number; startFrame: number; endFrame: number }> = {
    [AnimationState.IDLE]:      { row: 0, startFrame: 0, endFrame: 3 },
    [AnimationState.FIDGET_A]:  { row: 0, startFrame: 4, endFrame: 5 },
    [AnimationState.FIDGET_B]:  { row: 0, startFrame: 6, endFrame: 7 },
    [AnimationState.JAB]:       { row: 1, startFrame: 0, endFrame: 2 },
    [AnimationState.FLINCH]:    { row: 1, startFrame: 3, endFrame: 4 },
    [AnimationState.KNOCKDOWN]: { row: 1, startFrame: 5, endFrame: 7 },
    [AnimationState.SUPER]:     { row: 2, startFrame: 0, endFrame: 3 },
    [AnimationState.VICTORY]:   { row: 2, startFrame: 4, endFrame: 5 },
    [AnimationState.GUARD]:     { row: 2, startFrame: 6, endFrame: 7 },
    [AnimationState.TAUNT]:     { row: 3, startFrame: 0, endFrame: 1 },
};
