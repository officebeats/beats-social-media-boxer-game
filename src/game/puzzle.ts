export const BOARD_WIDTH = 6;
export const BOARD_HEIGHT = 12;

export const GEM_COLORS = ["red", "blue", "green", "yellow", "purple"] as const;
export type GemColor = (typeof GEM_COLORS)[number];
export type GemKind = "normal" | "crash" | "rainbow" | "counter";

export interface Gem {
  color: GemColor;
  kind: GemKind;
  turns?: number;
}

export type Board = Array<Array<Gem | null>>;
export type Orientation = 0 | 1 | 2 | 3;

export interface ActivePair {
  x: number;
  y: number;
  orientation: Orientation;
  pivot: Gem;
  satellite: Gem;
}

export interface PuzzleSnapshot {
  board: Board;
  active: ActivePair | null;
  next: [Gem, Gem];
  score: number;
  meter: number;
  chain: number;
  maxChain: number;
  cleared: number;
  topOut: boolean;
}

export interface Resolution {
  cleared: number;
  chain: number;
  attack: number;
}

export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0 || 0x9e3779b9;
  }

  next(): number {
    let value = this.state;
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    this.state = value >>> 0;
    return this.state / 0x1_0000_0000;
  }

  int(max: number): number {
    return Math.floor(this.next() * max);
  }
}

export function createBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from<Gem | null>({ length: BOARD_WIDTH }).fill(null),
  );
}

function cloneGem(gem: Gem | null): Gem | null {
  return gem ? { ...gem } : null;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map(cloneGem));
}

export function pairCells(pair: ActivePair): Array<{ x: number; y: number; gem: Gem }> {
  const offsets: Record<Orientation, [number, number]> = {
    0: [0, -1],
    1: [1, 0],
    2: [0, 1],
    3: [-1, 0],
  };
  const [dx, dy] = offsets[pair.orientation];
  return [
    { x: pair.x, y: pair.y, gem: pair.pivot },
    { x: pair.x + dx, y: pair.y + dy, gem: pair.satellite },
  ];
}

export class PuzzleGame {
  readonly board = createBoard();
  readonly random: SeededRandom;
  active: ActivePair | null = null;
  next: [Gem, Gem];
  score = 0;
  meter = 0;
  chain = 0;
  maxChain = 0;
  cleared = 0;
  topOut = false;
  pieces = 0;

  constructor(seed: number) {
    this.random = new SeededRandom(seed);
    this.next = this.makePair();
    this.spawn();
  }

  private makeGem(index: number): Gem {
    const color = GEM_COLORS[this.random.int(GEM_COLORS.length)];
    if (index > 0 && index % 24 === 0) return { color, kind: "rainbow" };
    if (index > 0 && index % 8 === 0) return { color, kind: "crash" };
    return { color, kind: "normal" };
  }

  private makePair(): [Gem, Gem] {
    return [this.makeGem(this.pieces + 1), this.makeGem(this.pieces + 2)];
  }

  spawn(): void {
    if (this.topOut) return;
    const [pivot, satellite] = this.next;
    this.pieces += 2;
    this.next = this.makePair();
    const candidate: ActivePair = {
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 1,
      orientation: 0,
      pivot: { ...pivot },
      satellite: { ...satellite },
    };
    if (!this.canPlace(candidate)) {
      this.topOut = true;
      this.active = null;
      return;
    }
    this.active = candidate;
  }

  snapshot(): PuzzleSnapshot {
    return {
      board: cloneBoard(this.board),
      active: this.active
        ? {
            ...this.active,
            pivot: { ...this.active.pivot },
            satellite: { ...this.active.satellite },
          }
        : null,
      next: [{ ...this.next[0] }, { ...this.next[1] }],
      score: this.score,
      meter: this.meter,
      chain: this.chain,
      maxChain: this.maxChain,
      cleared: this.cleared,
      topOut: this.topOut,
    };
  }

  canPlace(pair: ActivePair): boolean {
    return pairCells(pair).every(
      ({ x, y }) =>
        x >= 0 &&
        x < BOARD_WIDTH &&
        y >= 0 &&
        y < BOARD_HEIGHT &&
        this.board[y][x] === null,
    );
  }

  move(dx: -1 | 1): boolean {
    if (!this.active) return false;
    const moved = { ...this.active, x: this.active.x + dx };
    if (!this.canPlace(moved)) return false;
    this.active = moved;
    return true;
  }

  rotate(clockwise = true): boolean {
    if (!this.active) return false;
    const orientation = ((this.active.orientation + (clockwise ? 1 : 3)) % 4) as Orientation;
    const kicks = [0, -1, 1];
    for (const kick of kicks) {
      const rotated = { ...this.active, x: this.active.x + kick, orientation };
      if (this.canPlace(rotated)) {
        this.active = rotated;
        return true;
      }
    }
    return false;
  }

  softDrop(): Resolution | null {
    if (!this.active) return null;
    const moved = { ...this.active, y: this.active.y + 1 };
    if (this.canPlace(moved)) {
      this.active = moved;
      return null;
    }
    return this.lockAndResolve();
  }

  hardDrop(): Resolution {
    if (!this.active) return { cleared: 0, chain: 0, attack: 0 };
    while (this.active) {
      const moved: ActivePair = { ...this.active, y: this.active.y + 1 };
      if (!this.canPlace(moved)) break;
      this.active = moved;
      this.score += 1;
    }
    return this.lockAndResolve();
  }

  private lockAndResolve(): Resolution {
    if (!this.active) return { cleared: 0, chain: 0, attack: 0 };
    for (const { x, y, gem } of pairCells(this.active)) {
      this.board[y][x] = { ...gem };
    }
    this.active = null;
    const resolution = this.resolve();
    this.tickCounters();
    this.spawn();
    return resolution;
  }

  private resolve(): Resolution {
    let total = 0;
    let chain = 0;
    while (true) {
      const removal = this.findRemovalSet();
      if (removal.size === 0) break;
      chain += 1;
      total += removal.size;
      for (const key of removal) {
        const [y, x] = key.split(":").map(Number);
        this.board[y][x] = null;
      }
      this.applyGravity();
    }

    this.chain = chain;
    this.maxChain = Math.max(this.maxChain, chain);
    this.cleared += total;
    this.score += total * 100 * Math.max(chain, 1);
    this.meter = Math.min(100, this.meter + total * 3 + Math.max(0, chain - 1) * 12);
    return {
      cleared: total,
      chain,
      attack: total === 0 ? 0 : Math.max(0, total - 3) + Math.max(0, chain - 1) * 4,
    };
  }

  private findRemovalSet(): Set<string> {
    const removal = new Set<string>();
    const visited = new Set<string>();
    const crashes: Array<{ x: number; y: number; gem: Gem }> = [];
    const rainbows: Array<{ x: number; y: number }> = [];

    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
      for (let x = 0; x < BOARD_WIDTH; x += 1) {
        const gem = this.board[y][x];
        if (!gem) continue;
        if (gem.kind === "crash") crashes.push({ x, y, gem });
        if (gem.kind === "rainbow") rainbows.push({ x, y });
        const key = `${y}:${x}`;
        if (visited.has(key) || gem.kind === "counter" || gem.kind === "rainbow") continue;
        const group = this.collectColorGroup(x, y, gem.color, visited);
        if (group.length >= 4) group.forEach((cell) => removal.add(cell));
      }
    }

    for (const { x, y, gem } of crashes) {
      const neighborMatches = this.neighbors(x, y).some(({ x: nx, y: ny }) => {
        const neighbor = this.board[ny][nx];
        return neighbor && neighbor.color === gem.color && neighbor.kind !== "counter";
      });
      if (neighborMatches) {
        this.collectColorGroup(x, y, gem.color, new Set()).forEach((cell) => removal.add(cell));
      }
    }

    if (rainbows.length > 0) {
      const counts = new Map<GemColor, number>();
      for (const row of this.board) {
        for (const gem of row) {
          if (gem && gem.kind !== "counter" && gem.kind !== "rainbow") {
            counts.set(gem.color, (counts.get(gem.color) ?? 0) + 1);
          }
        }
      }
      const target = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      if (target) {
        for (let y = 0; y < BOARD_HEIGHT; y += 1) {
          for (let x = 0; x < BOARD_WIDTH; x += 1) {
            if (this.board[y][x]?.color === target) removal.add(`${y}:${x}`);
          }
        }
      }
      rainbows.forEach(({ x, y }) => removal.add(`${y}:${x}`));
    }
    return removal;
  }

  private collectColorGroup(
    startX: number,
    startY: number,
    color: GemColor,
    visited: Set<string>,
  ): string[] {
    const found: string[] = [];
    const queue = [{ x: startX, y: startY }];
    while (queue.length > 0) {
      const current = queue.pop();
      if (!current) continue;
      const key = `${current.y}:${current.x}`;
      if (visited.has(key)) continue;
      const gem = this.board[current.y]?.[current.x];
      if (!gem || gem.color !== color || gem.kind === "counter" || gem.kind === "rainbow") continue;
      visited.add(key);
      found.push(key);
      queue.push(...this.neighbors(current.x, current.y));
    }
    return found;
  }

  private neighbors(x: number, y: number): Array<{ x: number; y: number }> {
    return [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
    ].filter((cell) => cell.x >= 0 && cell.x < BOARD_WIDTH && cell.y >= 0 && cell.y < BOARD_HEIGHT);
  }

  private applyGravity(): void {
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      let writeY = BOARD_HEIGHT - 1;
      for (let y = BOARD_HEIGHT - 1; y >= 0; y -= 1) {
        const gem = this.board[y][x];
        if (!gem) continue;
        if (writeY !== y) {
          this.board[writeY][x] = gem;
          this.board[y][x] = null;
        }
        writeY -= 1;
      }
    }
  }

  addCounterGems(amount: number): void {
    for (let i = 0; i < amount; i += 1) {
      const column = this.lowestColumn();
      const targetY = this.firstEmptyFromBottom(column);
      if (targetY < 0) {
        this.topOut = true;
        return;
      }
      this.board[targetY][column] = {
        color: GEM_COLORS[this.random.int(GEM_COLORS.length)],
        kind: "counter",
        turns: 3,
      };
    }
  }

  private lowestColumn(): number {
    let bestHeight = Number.POSITIVE_INFINITY;
    const choices: number[] = [];
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      const height = this.board.findIndex((row) => row[x] !== null);
      const normalized = height === -1 ? BOARD_HEIGHT : BOARD_HEIGHT - height;
      if (normalized < bestHeight) {
        bestHeight = normalized;
        choices.length = 0;
        choices.push(x);
      } else if (normalized === bestHeight) {
        choices.push(x);
      }
    }
    return choices[this.random.int(choices.length)];
  }

  private firstEmptyFromBottom(x: number): number {
    for (let y = BOARD_HEIGHT - 1; y >= 0; y -= 1) {
      if (!this.board[y][x]) return y;
    }
    return -1;
  }

  private tickCounters(): void {
    for (const row of this.board) {
      for (const gem of row) {
        if (!gem || gem.kind !== "counter") continue;
        gem.turns = Math.max(0, (gem.turns ?? 1) - 1);
        if (gem.turns === 0) gem.kind = "normal";
      }
    }
  }

  useSuper(): boolean {
    if (this.meter < 100) return false;
    this.meter = 0;
    let converted = 0;
    for (let y = 0; y < BOARD_HEIGHT && converted < 4; y += 1) {
      for (let x = 0; x < BOARD_WIDTH && converted < 4; x += 1) {
        const gem = this.board[y][x];
        if (gem?.kind === "counter") {
          gem.kind = "normal";
          delete gem.turns;
          converted += 1;
        }
      }
    }
    return true;
  }
}
