export const BOARD_WIDTH = 6;
export const BOARD_HEIGHT = 12;

export const GEM_COLORS = ["red", "blue", "green", "yellow", "purple"] as const;
export type GemColor = (typeof GEM_COLORS)[number];
export type GemKind = "normal" | "crash" | "rainbow" | "counter";

export interface PowerGemBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  relX: number;
  relY: number;
}

export interface Gem {
  color: GemColor;
  kind: GemKind;
  turns?: number;
  powerGem?: PowerGemBounds;
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
  locked: ResolvedCell[];
  steps: ResolutionStep[];
}

export interface ResolvedCell {
  x: number;
  y: number;
  gem: Gem;
}

export interface ResolutionStep {
  chain: number;
  cells: ResolvedCell[];
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
  return gem ? { ...gem, powerGem: gem.powerGem ? { ...gem.powerGem } : undefined } : null;
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

export function detectPowerGems(board: Board): void {
  let powerGemCounter = 0;
  for (let y = 0; y < BOARD_HEIGHT; y += 1) {
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      if (board[y][x]) delete board[y][x]!.powerGem;
    }
  }

  const used = Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from<boolean>({ length: BOARD_WIDTH }).fill(false),
  );

  for (let y = 0; y < BOARD_HEIGHT; y += 1) {
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      const gem = board[y][x];
      if (!gem || gem.kind !== "normal" || used[y][x]) continue;

      let maxW = 1;
      while (
        x + maxW < BOARD_WIDTH &&
        board[y][x + maxW]?.kind === "normal" &&
        board[y][x + maxW]?.color === gem.color &&
        !used[y][x + maxW]
      ) {
        maxW += 1;
      }

      if (maxW < 2) continue;

      for (let w = maxW; w >= 2; w -= 1) {
        let maxH = 1;
        while (y + maxH < BOARD_HEIGHT) {
          let validRow = true;
          for (let dx = 0; dx < w; dx += 1) {
            const checkGem = board[y + maxH][x + dx];
            if (
              !checkGem ||
              checkGem.kind !== "normal" ||
              checkGem.color !== gem.color ||
              used[y + maxH][x + dx]
            ) {
              validRow = false;
              break;
            }
          }
          if (!validRow) break;
          maxH += 1;
        }

        if (maxH >= 2) {
          powerGemCounter += 1;
          const id = `power_${gem.color}_${x}_${y}_${powerGemCounter}`;
          for (let dy = 0; dy < maxH; dy += 1) {
            for (let dx = 0; dx < w; dx += 1) {
              used[y + dy][x + dx] = true;
              board[y + dy][x + dx]!.powerGem = {
                id,
                x,
                y,
                width: w,
                height: maxH,
                relX: dx,
                relY: dy,
              };
            }
          }
          break;
        }
      }
    }
  }
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
  dropPattern: GemColor[] = ["red", "blue", "green", "yellow", "purple", "red"];

  constructor(seed: number, dropPattern?: GemColor[]) {
    this.random = new SeededRandom(seed);
    if (dropPattern) this.dropPattern = dropPattern;
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
    if (!this.active) return { cleared: 0, chain: 0, attack: 0, locked: [], steps: [] };
    while (this.active) {
      const moved: ActivePair = { ...this.active, y: this.active.y + 1 };
      if (!this.canPlace(moved)) break;
      this.active = moved;
      this.score += 1;
    }
    return this.lockAndResolve();
  }

  private lockAndResolve(): Resolution {
    if (!this.active) return { cleared: 0, chain: 0, attack: 0, locked: [], steps: [] };
    const locked = pairCells(this.active).map(({ x, y, gem }) => ({ x, y, gem: { ...gem } }));
    for (const { x, y, gem } of locked) {
      this.board[y][x] = { ...gem };
    }
    this.active = null;
    detectPowerGems(this.board);
    const resolution = this.resolve();
    this.tickCounters();
    this.spawn();
    return { ...resolution, locked };
  }

  private resolve(): Resolution {
    let totalCleared = 0;
    let chainCount = 0;
    let totalAttack = 0;
    const steps: ResolutionStep[] = [];

    while (true) {
      detectPowerGems(this.board);
      const removal = this.findRemovalSet();
      if (removal.size === 0) break;
      chainCount += 1;
      totalCleared += removal.size;

      const powerGemsSeen = new Set<string>();
      let powerGemBonus = 0;

      const cells: ResolvedCell[] = [];
      for (const key of removal) {
        const [y, x] = key.split(":").map(Number);
        const gem = this.board[y][x];
        if (gem) {
          cells.push({ x, y, gem: { ...gem } });
          if (gem.powerGem && !powerGemsSeen.has(gem.powerGem.id)) {
            powerGemsSeen.add(gem.powerGem.id);
            const size = gem.powerGem.width * gem.powerGem.height;
            powerGemBonus += size >= 9 ? 8 : size >= 6 ? 5 : 3;
          }
        }
        this.board[y][x] = null;
      }
      steps.push({ chain: chainCount, cells });

      const stepAttack = Math.max(
        0,
        Math.floor((removal.size + powerGemBonus) * (chainCount === 1 ? 0.7 : chainCount * 1.2)),
      );
      totalAttack += stepAttack;

      this.applyGravity();
    }

    detectPowerGems(this.board);
    this.chain = chainCount;
    this.maxChain = Math.max(this.maxChain, chainCount);
    this.cleared += totalCleared;
    this.score += totalCleared * 100 * Math.max(chainCount, 1);
    this.meter = Math.min(100, this.meter + totalCleared * 3 + Math.max(0, chainCount - 1) * 12);

    return {
      cleared: totalCleared,
      chain: chainCount,
      attack: totalAttack,
      locked: [],
      steps,
    };
  }

  private findRemovalSet(): Set<string> {
    const removal = new Set<string>();
    const crashes: Array<{ x: number; y: number; gem: Gem }> = [];
    const rainbows: Array<{ x: number; y: number }> = [];

    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
      for (let x = 0; x < BOARD_WIDTH; x += 1) {
        const gem = this.board[y][x];
        if (!gem) continue;
        if (gem.kind === "crash") crashes.push({ x, y, gem });
        if (gem.kind === "rainbow") rainbows.push({ x, y });
      }
    }

    for (const { x, y, gem } of crashes) {
      const matchingNeighbors = this.neighbors(x, y).filter(({ x: nx, y: ny }) => {
        const neighbor = this.board[ny][nx];
        return neighbor && neighbor.color === gem.color && neighbor.kind !== "counter";
      });

      if (matchingNeighbors.length > 0) {
        removal.add(`${y}:${x}`);
        this.collectColorCluster(x, y, gem.color, new Set()).forEach((cellKey) =>
          removal.add(cellKey),
        );
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
      const targetColor = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      if (targetColor) {
        for (let y = 0; y < BOARD_HEIGHT; y += 1) {
          for (let x = 0; x < BOARD_WIDTH; x += 1) {
            if (this.board[y][x]?.color === targetColor) removal.add(`${y}:${x}`);
          }
        }
      }
      rainbows.forEach(({ x, y }) => removal.add(`${y}:${x}`));
    }

    const powerGemIdsToInclude = new Set<string>();
    for (const key of removal) {
      const [y, x] = key.split(":").map(Number);
      const gem = this.board[y][x];
      if (gem?.powerGem) powerGemIdsToInclude.add(gem.powerGem.id);
    }

    if (powerGemIdsToInclude.size > 0) {
      for (let y = 0; y < BOARD_HEIGHT; y += 1) {
        for (let x = 0; x < BOARD_WIDTH; x += 1) {
          const gem = this.board[y][x];
          if (gem?.powerGem && powerGemIdsToInclude.has(gem.powerGem.id)) {
            removal.add(`${y}:${x}`);
          }
        }
      }
    }

    const counterGemsToRemove = new Set<string>();
    for (const key of removal) {
      const [y, x] = key.split(":").map(Number);
      for (const { x: nx, y: ny } of this.neighbors(x, y)) {
        if (this.board[ny][nx]?.kind === "counter") {
          counterGemsToRemove.add(`${ny}:${nx}`);
        }
      }
    }
    counterGemsToRemove.forEach((key) => removal.add(key));

    return removal;
  }

  private collectColorCluster(
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

  addCounterGems(amount: number, customPattern?: GemColor[]): ResolvedCell[] {
    const pattern = customPattern ?? this.dropPattern;
    const placed: ResolvedCell[] = [];
    for (let i = 0; i < amount; i += 1) {
      const column = this.lowestColumn();
      const targetY = this.firstEmptyFromBottom(column);
      if (targetY < 0) {
        this.topOut = true;
        return placed;
      }
      const gemColor = pattern[column % pattern.length];
      const gem: Gem = {
        color: gemColor,
        kind: "counter",
        turns: 3,
      };
      this.board[targetY][column] = gem;
      placed.push({ x: column, y: targetY, gem: { ...gem } });
    }
    detectPowerGems(this.board);
    return placed;
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
    detectPowerGems(this.board);
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
    detectPowerGems(this.board);
    return true;
  }
}

