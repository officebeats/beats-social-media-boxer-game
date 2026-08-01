import { BoardMatrix, Gem, GemColor, FallingPair } from './types';

export const COLS = 6;
export const ROWS = 12;

const GEM_COLORS: GemColor[] = ['red', 'blue', 'green', 'yellow'];

/**
 * Creates an empty 12-row x 6-column board matrix initialized to null.
 */
export function createEmptyBoard(): BoardMatrix {
  const board: BoardMatrix = [];
  for (let r = 0; r < ROWS; r++) {
    const row: (Gem | null)[] = [];
    for (let c = 0; c < COLS; c++) {
      row.push(null);
    }
    board.push(row);
  }
  return board;
}

let gemIdCounter = 0;
export function generateRandomGem(forceCrashProbability = 0.25): Gem {
  gemIdCounter++;
  const color = GEM_COLORS[Math.floor(Math.random() * GEM_COLORS.length)];
  const isCrash = Math.random() < forceCrashProbability;
  return {
    id: `gem_${gemIdCounter}_${Date.now()}`,
    color,
    type: isCrash ? 'crash' : 'normal'
  };
}

export function createFallingPair(pivot?: Gem, satellite?: Gem): FallingPair {
  return {
    pivot: pivot || generateRandomGem(0.2),
    satellite: satellite || generateRandomGem(0.2),
    x: 2,
    y: 0,
    rotation: 0 // 0: satellite below (y+1), 1: left (x-1), 2: above (y-1), 3: right (x+1)
  };
}

/**
 * Returns relative offset (dx, dy) of the satellite gem relative to pivot based on rotation state.
 */
export function getSatelliteOffset(rotation: number): { dx: number; dy: number } {
  switch (rotation % 4) {
    case 0: return { dx: 0, dy: 1 };  // Below
    case 1: return { dx: -1, dy: 0 }; // Left
    case 2: return { dx: 0, dy: -1 }; // Above
    case 3: return { dx: 1, dy: 0 };  // Right
    default: return { dx: 0, dy: 1 };
  }
}

/**
 * Checks whether a cell is within valid board boundaries and currently unoccupied.
 */
export function isCellFree(board: BoardMatrix, x: number, y: number): boolean {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
  return board[y][x] === null;
}

/**
 * Validates if the falling pair is in a valid, uncollided position.
 */
export function isValidPairPosition(board: BoardMatrix, pair: FallingPair): boolean {
  if (!isCellFree(board, pair.x, pair.y)) return false;
  const offset = getSatelliteOffset(pair.rotation);
  const satX = pair.x + offset.dx;
  const satY = pair.y + offset.dy;
  return isCellFree(board, satX, satY);
}

/**
 * Attempts to rotate the falling pair 90 degrees clockwise around the pivot gem.
 * Includes horizontal wall-kick allowance if blocked.
 */
export function rotatePair(board: BoardMatrix, pair: FallingPair): FallingPair {
  const newRotation = (pair.rotation + 1) % 4;
  let candidate: FallingPair = { ...pair, rotation: newRotation };

  if (isValidPairPosition(board, candidate)) {
    return candidate;
  }

  // Wall-kick test (shift left or right by 1 column)
  const kickLeft: FallingPair = { ...candidate, x: pair.x - 1 };
  if (isValidPairPosition(board, kickLeft)) {
    return kickLeft;
  }

  const kickRight: FallingPair = { ...candidate, x: pair.x + 1 };
  if (isValidPairPosition(board, kickRight)) {
    return kickRight;
  }

  // If rotation blocked even with wall kicks, return original pair
  return pair;
}

/**
 * Moves pair left, right, or down if valid.
 */
export function movePair(board: BoardMatrix, pair: FallingPair, dx: number, dy: number): { pair: FallingPair; moved: boolean } {
  const candidate: FallingPair = { ...pair, x: pair.x + dx, y: pair.y + dy };
  if (isValidPairPosition(board, candidate)) {
    return { pair: candidate, moved: true };
  }
  return { pair, moved: false };
}

/**
 * Raycasts downward to instantly place pair at lowest valid row.
 */
export function hardDropPair(board: BoardMatrix, pair: FallingPair): FallingPair {
  let current = pair;
  while (true) {
    const { pair: next, moved } = movePair(board, current, 0, 1);
    if (!moved) break;
    current = next;
  }
  return current;
}

/**
 * Locks falling pair into the board matrix.
 */
export function lockPairToBoard(board: BoardMatrix, pair: FallingPair): BoardMatrix {
  const newBoard = board.map(row => [...row]);
  const offset = getSatelliteOffset(pair.rotation);

  if (pair.y >= 0 && pair.y < ROWS && pair.x >= 0 && pair.x < COLS) {
    newBoard[pair.y][pair.x] = pair.pivot;
  }
  const satX = pair.x + offset.dx;
  const satY = pair.y + offset.dy;
  if (satY >= 0 && satY < ROWS && satX >= 0 && satX < COLS) {
    newBoard[satY][satX] = pair.satellite;
  }

  return newBoard;
}

/**
 * Applies gravity to all settled gems on the board (gems fall into empty space underneath).
 */
export function applyGravity(board: BoardMatrix): { board: BoardMatrix; movedAny: boolean } {
  let movedAny = false;
  const newBoard = board.map(row => [...row]);

  for (let c = 0; c < COLS; c++) {
    for (let r = ROWS - 2; r >= 0; r--) {
      const gem = newBoard[r][c];
      if (gem !== null) {
        let targetRow = r;
        while (targetRow + 1 < ROWS && newBoard[targetRow + 1][c] === null) {
          targetRow++;
        }
        if (targetRow !== r) {
          newBoard[targetRow][c] = gem;
          newBoard[r][c] = null;
          movedAny = true;
        }
      }
    }
  }

  return { board: newBoard, movedAny };
}

/**
 * Detects 2x2, 3x3, etc. rectangular regions of identical normal gems and fuses them into Power Gems.
 */
export function fusePowerGems(board: BoardMatrix): BoardMatrix {
  const newBoard = board.map(row => [...row]);

  // Scan for 2x2 blocks of normal gems of identical color
  for (let r = 0; r < ROWS - 1; r++) {
    for (let c = 0; c < COLS - 1; c++) {
      const g1 = newBoard[r][c];
      const g2 = newBoard[r][c + 1];
      const g3 = newBoard[r + 1][c];
      const g4 = newBoard[r + 1][c + 1];

      if (
        g1 && g2 && g3 && g4 &&
        (g1.type === 'normal' || g1.type === 'power') &&
        g1.color === g2.color &&
        g1.color === g3.color &&
        g1.color === g4.color
      ) {
        // Form a fused Power Gem anchor at top-left (r, c)
        gemIdCounter++;
        const fusedGem: Gem = {
          id: `power_${gemIdCounter}_${Date.now()}`,
          color: g1.color,
          type: 'power',
          width: 2,
          height: 2,
          anchorX: c,
          anchorY: r
        };
        newBoard[r][c] = fusedGem;
        newBoard[r][c + 1] = fusedGem;
        newBoard[r + 1][c] = fusedGem;
        newBoard[r + 1][c + 1] = fusedGem;
      }
    }
  }

  return newBoard;
}

/**
 * Evaluates Crash Gem detonations. A Crash Gem detonates if it sits adjacent (up, down, left, right)
 * to any normal or power gem of matching color. Detonating a gem triggers connected same-color gems.
 */
export function checkAndDetonate(board: BoardMatrix): {
  board: BoardMatrix;
  clearedCount: number;
  hasPowerGemDetonation: boolean;
  powerGemBonus: number;
} {
  const newBoard = board.map(row => [...row]);
  const toDetonate = new Set<string>();
  let hasPowerGemDetonation = false;
  let powerGemBonus = 0;

  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 }
  ];

  // Helper to flood fill matching same-color contiguous gems
  function floodFillColor(startR: number, startC: number, color: GemColor) {
    const stack: { r: number; c: number }[] = [];
    for (const dir of directions) {
      const nr = startR + dir.dr;
      const nc = startC + dir.dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        stack.push({ r: nr, c: nc });
      }
    }

    while (stack.length > 0) {
      const { r: curR, c: curC } = stack.pop()!;
      const key = `${curR},${curC}`;
      if (toDetonate.has(key)) continue;

      const g = newBoard[curR][curC];
      if (!g || g.color !== color) continue;
      if (g.type === 'counter' && g.timer && g.timer > 0) continue; // Counter gems blocked until timer 0

      toDetonate.add(key);
      if (g.type === 'power') {
        hasPowerGemDetonation = true;
        powerGemBonus = Math.max(powerGemBonus, 4);
      }

      for (const dir of directions) {
        const nr = curR + dir.dr;
        const nc = curC + dir.dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          if (!toDetonate.has(`${nr},${nc}`)) {
            stack.push({ r: nr, c: nc });
          }
        }
      }
    }
  }

  // Scan all cells for Crash Gems
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const gem = newBoard[r][c];
      if (gem && gem.type === 'crash') {
        let adjacentMatch = false;
        for (const dir of directions) {
          const nr = r + dir.dr;
          const nc = c + dir.dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            const adj = newBoard[nr][nc];
            if (adj && adj.color === gem.color && (adj.type === 'normal' || adj.type === 'power')) {
              adjacentMatch = true;
              break;
            }
          }
        }
        if (adjacentMatch) {
          toDetonate.add(`${r},${c}`);
          floodFillColor(r, c, gem.color);
        }
      }
    }
  }

  const clearedCount = toDetonate.size;
  if (clearedCount > 0) {
    toDetonate.forEach(key => {
      const [r, c] = key.split(',').map(Number);
      newBoard[r][c] = null;
    });
  }

  return {
    board: newBoard,
    clearedCount,
    hasPowerGemDetonation,
    powerGemBonus
  };
}

/**
 * Decrements Counter Gem countdown badges across the board when a turn ends.
 */
export function decrementCounterGems(board: BoardMatrix): BoardMatrix {
  return board.map(row =>
    row.map(gem => {
      if (gem && gem.type === 'counter' && gem.timer !== undefined) {
        const newTimer = gem.timer - 1;
        if (newTimer <= 0) {
          // Converts to Normal Gem when timer reaches 0
          return {
            ...gem,
            type: 'normal',
            timer: undefined
          };
        }
        return {
          ...gem,
          timer: newTimer
        };
      }
      return gem;
    })
  );
}

/**
 * Calculates garbage counter gems sent to opponent using GDD formula:
 * Counter Gems Sent = floor( ((Cleared Gems * 0.75) + PowerGemBonus) * ChainMultiplier )
 */
export function calculateGarbage(clearedGems: number, powerGemBonus: number, chainIndex: number): number {
  if (clearedGems === 0) return 0;

  const chainMultipliers = [1.0, 1.5, 2.2, 3.5];
  const mult = chainMultipliers[Math.min(chainIndex, chainMultipliers.length - 1)];

  const base = (clearedGems * 0.75) + powerGemBonus;
  return Math.floor(base * mult);
}

/**
 * Spawns garbage counter gems on top of board using character's 6-column drop pattern.
 */
export function dropGarbage(board: BoardMatrix, count: number, pattern: GemColor[]): BoardMatrix {
  if (count <= 0) return board;
  const newBoard = board.map(row => [...row]);

  let placed = 0;
  // Fill top rows with Counter Gems based on 6-column pattern
  for (let r = 0; r < ROWS && placed < count; r++) {
    for (let c = 0; c < COLS && placed < count; c++) {
      if (newBoard[r][c] === null) {
        gemIdCounter++;
        const color = pattern[c % pattern.length];
        newBoard[r][c] = {
          id: `counter_${gemIdCounter}_${Date.now()}`,
          color,
          type: 'counter',
          timer: 5
        };
        placed++;
      }
    }
  }

  return newBoard;
}

/**
 * Checks if the board has topped out at spawn cell (row=1, col=2).
 */
export function isBoardToppedOut(board: BoardMatrix): boolean {
  return board[1][2] !== null || board[0][2] !== null;
}
