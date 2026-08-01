/**
 * Crash Out: Ring Rush — Game Constants & Design Tokens
 *
 * Central configuration for grid dimensions, timing, colors, and game balance.
 * All magic numbers live here. Engine modules import from this file.
 */

// ─── Grid Dimensions ───────────────────────────────────────────────────────────

/** Number of columns in the puzzle grid */
export const GRID_COLS = 6;

/** Number of rows in the puzzle grid */
export const GRID_ROWS = 12;

/** Column index where new gem pairs spawn (0-indexed, center) */
export const SPAWN_COL = 2;

/** Row index where new gem pairs spawn (0 = top) */
export const SPAWN_ROW = 0;

// ─── Sprite Sheet Layout ───────────────────────────────────────────────────────

/** Sprite sheet grid columns */
export const SHEET_COLS = 8;

/** Sprite sheet grid rows */
export const SHEET_ROWS = 4;

/** Individual sprite cell width in pixels */
export const CELL_WIDTH = 128;

/** Individual sprite cell height in pixels */
export const CELL_HEIGHT = 256;

/** Full sprite sheet width in pixels */
export const SHEET_WIDTH = 1024;

/** Full sprite sheet height in pixels */
export const SHEET_HEIGHT = 1024;

// ─── Timing (milliseconds) ─────────────────────────────────────────────────────

/** Base gravity tick — gem pair drops one row every N ms */
export const GRAVITY_TICK_MS = 500;

/** Faster gravity during soft drop */
export const SOFT_DROP_TICK_MS = 50;

/** Lock delay — time after landing before gem pair locks */
export const LOCK_DELAY_MS = 300;

/** DAS (Delayed Auto Shift) initial delay */
export const DAS_DELAY_MS = 170;

/** DAS repeat rate */
export const DAS_REPEAT_MS = 50;

/** Match clear animation duration */
export const MATCH_CLEAR_MS = 300;

/** Chain cascade delay between chain links */
export const CHAIN_DELAY_MS = 400;

/** Counter gem countdown: turns until it converts to normal gem */
export const COUNTER_GEM_TURNS = 5;

/** Round timer in seconds */
export const ROUND_TIMER_SECONDS = 99;

// ─── Sprite Animation Timing ───────────────────────────────────────────────────

/** Fighter sprite animation frame rate */
export const SPRITE_FPS = 12;

/** Idle fidget minimum interval (ms) */
export const FIDGET_MIN_INTERVAL_MS = 2000;

/** Idle fidget maximum interval (ms) */
export const FIDGET_MAX_INTERVAL_MS = 6000;

// ─── Combat Balance ────────────────────────────────────────────────────────────

/** Maximum HP per fighter */
export const MAX_HP = 100;

/** Base damage per garbage gem row sent */
export const BASE_GARBAGE_DAMAGE = 8;

/** Damage multiplier per chain link */
export const CHAIN_DAMAGE_MULTIPLIER = 1.5;

/** SUPER meter: total charge needed (in gems cleared) */
export const SUPER_METER_MAX = 50;

/** SUPER finisher damage */
export const SUPER_DAMAGE = 35;

// ─── Camera & Parallax ─────────────────────────────────────────────────────────

/** Camera drift lerp factor */
export const CAMERA_LERP = 0.08;

/** Camera drift per attack (pixels toward opponent) */
export const CAMERA_DRIFT_PER_ATTACK = 30;

/** Maximum camera drift range (±pixels from center) */
export const CAMERA_MAX_DRIFT = 60;

/** Camera idle decay timeout (ms without attacks) */
export const CAMERA_IDLE_TIMEOUT_MS = 1500;

/** Far background parallax speed multiplier */
export const PARALLAX_FAR = 0.15;

/** Mid background parallax speed multiplier */
export const PARALLAX_MID = 0.5;

/** Screen shake decay factor */
export const SHAKE_DECAY = 0.85;

// ─── Visual / Game Resolution ──────────────────────────────────────────────────

/** Base game width (mobile-first, 19.5:9) */
export const GAME_WIDTH = 390;

/** Base game height (mobile-first, 19.5:9) */
export const GAME_HEIGHT = 844;

/** Minimum touch target size in pixels */
export const MIN_TOUCH_TARGET = 58;

// ─── Design Tokens (Colors) ────────────────────────────────────────────────────

export const COLORS = {
    /** Deep arena background */
    ARENA_BG: 0x0a0a12,
    /** Midnight purple accent */
    PURPLE_DARK: 0x1a1030,
    /** Gold spotlight / accent */
    GOLD: 0xfbbf24,
    /** Cyan neon accent */
    CYAN: 0x22d3ee,
    /** HP bar fill */
    HP_FILL: 0xfbbf24,
    /** HP bar damage flash */
    HP_DAMAGE: 0xef4444,
    /** SUPER meter fill */
    SUPER_FILL: 0x22d3ee,
    /** SUPER meter glow (100%) */
    SUPER_GLOW: 0x67e8f9,
    /** Gem colors */
    GEM_RED: 0xef4444,
    GEM_BLUE: 0x3b82f6,
    GEM_GREEN: 0x22c55e,
    GEM_YELLOW: 0xeab308,
    GEM_PURPLE: 0xa855f7,
    /** Counter gem (garbage) */
    GEM_COUNTER: 0x6b7280,
    /** Crash gem (diamond) */
    GEM_CRASH: 0xffffff,
    /** Text primary */
    TEXT_PRIMARY: 0xffffff,
    /** Text secondary */
    TEXT_SECONDARY: 0x9ca3af,
} as const;

// ─── Arcade Mode ───────────────────────────────────────────────────────────────

/** Number of fights in arcade ladder */
export const ARCADE_FIGHTS = 7;

/** AI difficulty progression for arcade mode */
export const ARCADE_DIFFICULTY = [
    'easy', 'easy', 'normal', 'normal', 'hard', 'hard', 'hard',
] as const;
