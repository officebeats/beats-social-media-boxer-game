export type GemColor = 'red' | 'blue' | 'green' | 'yellow';

export type GemType = 'normal' | 'crash' | 'power' | 'counter';

export interface Gem {
  id: string;
  color: GemColor;
  type: GemType;
  // For Power Gems: 2x2, 3x3, etc. width and height in grid units
  width?: number;
  height?: number;
  // Top-left anchor coordinates for multi-cell Power Gems
  anchorX?: number;
  anchorY?: number;
  // Countdown timer for Counter Gems (5 -> 0)
  timer?: number;
}

export type GridCell = Gem | null;

export type BoardMatrix = GridCell[][]; // 12 rows x 6 columns

export interface FallingPair {
  pivot: Gem;     // Spawns at (col=2, row=0)
  satellite: Gem; // Spawns at (col=2, row=1) [starts directly below pivot in vertical preview]
  x: number;      // Column index (0 to 5)
  y: number;      // Row index (0 to 11)
  rotation: number; // 0 = satellite below, 1 = satellite left, 2 = satellite above, 3 = satellite right
}

export interface FighterStats {
  id: string;
  name: string;
  nickname: string;
  division: 'Pro Contender' | 'Lightweight Champ' | 'Crossover Heavy' | 'Misfits Pioneer' | 'High-Flyer' | 'Southpaw Genius' | 'Content Creator' | 'Agitating Speedster' | 'Chaos Brawler' | 'Reflex Technician' | 'Unhinged Rusher' | 'Long Reach Hitman' | 'Legacy Cruiserweight' | 'P4P Power' | 'Grand Boss (50-0)';
  health: number;
  maxHealth: number;
  moveSpeed: number;        // Multiplier
  attackMultiplier: number;
  superChargeRate: number;
  passiveName: string;
  passiveDesc: string;
  superName: string;
  superDesc: string;
  superDamage: number;
  counterDropPattern: GemColor[]; // Exactly 6 elements representing columns 0-5
  themeColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface PlayerState {
  id: 'p1' | 'p2';
  fighter: FighterStats;
  board: BoardMatrix;
  fallingPair: FallingPair | null;
  nextPair: { pivot: Gem; satellite: Gem };
  health: number;
  superMeter: number; // 0 to 100
  isSuperReady: boolean;
  score: number;
  maxChain: number;
  totalClears: number;
  pendingCounterGems: number;
  stance: 'idle' | 'jab' | 'heavy' | 'super' | 'flinch' | 'ko' | 'victory';
  stanceFrame: number;
  stanceTimer: number;
}

export interface AttackEvent {
  attackerId: 'p1' | 'p2';
  damage: number;
  counterGemsSent: number;
  chainCount: number;
  isPowerGemDetonation: boolean;
  isSuperFinisher: boolean;
}

export type GameScreen = 'title' | 'select' | 'round-intro' | 'battle' | 'results';
