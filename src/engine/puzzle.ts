import {
    Board,
    Gem,
    GemColor,
    SpecialGemType,
    Cell,
    GemPair,
    PairOrientation,
    MatchGroup,
    PowerGem,
    DropResult,
    ChainStep,
    GarbagePayload
} from './types';

import {
    GRID_ROWS,
    GRID_COLS,
    SPAWN_COL,
    SPAWN_ROW,
    COUNTER_GEM_TURNS
} from '../config';

/**
 * Creates an empty puzzle board.
 * @returns {Board} A new empty 6x12 grid.
 */
export function createBoard(): Board {
    const board: Board = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        const row: Cell[] = [];
        for (let c = 0; c < GRID_COLS; c++) {
            row.push(null);
        }
        board.push(row);
    }
    return board;
}

/**
 * Creates a standard normal gem.
 * @param color The color of the gem.
 * @param row The initial row.
 * @param col The initial column.
 * @returns {Gem} A new gem object.
 */
export function createGem(color: GemColor, row: number, col: number): Gem {
    return {
        color,
        special: null,
        powerGroup: null,
        counterTurns: 0,
        row,
        col
    };
}

/**
 * Creates a garbage counter gem.
 * @param row The initial row.
 * @param col The initial column.
 * @param turns Countdown turns until conversion.
 * @returns {Gem} A new counter gem object.
 */
export function createCounterGem(row: number, col: number, turns: number = COUNTER_GEM_TURNS): Gem {
    return {
        color: null,
        special: SpecialGemType.COUNTER,
        powerGroup: null,
        counterTurns: turns,
        row,
        col
    };
}

/**
 * Creates a crash (diamond) gem.
 * @param row The initial row.
 * @param col The initial column.
 * @returns {Gem} A new crash gem object.
 */
export function createCrashGem(row: number, col: number): Gem {
    return {
        color: null,
        special: SpecialGemType.CRASH,
        powerGroup: null,
        counterTurns: 0,
        row,
        col
    };
}

/**
 * Picks a random standard gem color.
 * @returns {GemColor} A random standard color.
 */
export function randomGemColor(): GemColor {
    const colors = [GemColor.RED, GemColor.BLUE, GemColor.GREEN, GemColor.YELLOW, GemColor.PURPLE];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Spawns a new random gem pair at the top center of the board.
 * @returns {GemPair} A new gem pair object.
 */
export function spawnGemPair(): GemPair {
    return {
        primaryColor: randomGemColor(),
        secondaryColor: randomGemColor(),
        row: SPAWN_ROW,
        col: SPAWN_COL,
        orientation: PairOrientation.VERTICAL_DOWN
    };
}

/**
 * Gets the secondary gem's position based on the primary gem's position and orientation.
 * @param pair The active gem pair.
 * @returns The secondary gem's row and column.
 */
export function getSecondaryPosition(pair: GemPair): { row: number; col: number } {
    let { row, col } = pair;
    switch (pair.orientation) {
        case PairOrientation.VERTICAL_DOWN:
            row -= 1;
            break;
        case PairOrientation.VERTICAL_UP:
            row += 1;
            break;
        case PairOrientation.HORIZONTAL:
            col += 1;
            break;
        case PairOrientation.HORIZONTAL_REVERSE:
            col -= 1;
            break;
    }
    return { row, col };
}

/**
 * Checks if a specific cell position is valid and empty.
 * @param board The puzzle board.
 * @param row The row to check.
 * @param col The column to check.
 * @returns True if valid and empty, false otherwise.
 */
function isValidCell(board: Board, row: number, col: number): boolean {
    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) return false;
    return board[row][col] === null;
}

/**
 * Attempts to move the falling pair left, right, or down.
 * @param board The puzzle board.
 * @param pair The falling gem pair.
 * @param direction The direction to move.
 * @returns A new pair with updated coordinates, or null if blocked.
 */
export function moveGemPair(board: Board, pair: GemPair, direction: 'left' | 'right' | 'down'): GemPair | null {
    let { row: r, col: c } = pair;
    if (direction === 'left') c -= 1;
    if (direction === 'right') c += 1;
    if (direction === 'down') r += 1;

    const testPair = { ...pair, row: r, col: c };
    const secPos = getSecondaryPosition(testPair);

    if (r >= 0 && !isValidCell(board, r, c)) return null;
    if (secPos.row >= 0 && !isValidCell(board, secPos.row, secPos.col)) return null;
    
    if (c < 0 || c >= GRID_COLS) return null;
    if (secPos.col < 0 || secPos.col >= GRID_COLS) return null;
    if (r >= GRID_ROWS || secPos.row >= GRID_ROWS) return null;

    return testPair;
}

/**
 * Attempts to rotate the gem pair, including basic wall kicks.
 * @param board The current board state.
 * @param pair The active gem pair.
 * @param direction 'cw' (clockwise) or 'ccw' (counter-clockwise).
 * @returns The new rotated pair, potentially kicked, or the original if blocked.
 */
export function rotateGemPair(board: Board, pair: GemPair, direction: 'cw' | 'ccw'): GemPair {
    const orientations = [
        PairOrientation.VERTICAL_DOWN,
        PairOrientation.HORIZONTAL,
        PairOrientation.VERTICAL_UP,
        PairOrientation.HORIZONTAL_REVERSE
    ];
    
    const currentIndex = orientations.indexOf(pair.orientation);
    const newIndex = direction === 'cw' ? (currentIndex + 1) % 4 : (currentIndex + 3) % 4;
        
    const newOrientation = orientations[newIndex];
    let testPair = { ...pair, orientation: newOrientation };
    
    let secPos = getSecondaryPosition(testPair);
    let valid = true;

    if (testPair.row >= 0 && !isValidCell(board, testPair.row, testPair.col)) valid = false;
    if (valid && secPos.row >= 0 && (!isValidCell(board, secPos.row, secPos.col) || secPos.col < 0 || secPos.col >= GRID_COLS || secPos.row >= GRID_ROWS)) valid = false;
    if (valid && (testPair.col < 0 || testPair.col >= GRID_COLS)) valid = false;

    if (!valid) {
        testPair = { ...pair, orientation: newOrientation, col: pair.col - 1 };
        secPos = getSecondaryPosition(testPair);
        valid = true;
        if (testPair.row >= 0 && !isValidCell(board, testPair.row, testPair.col)) valid = false;
        if (valid && secPos.row >= 0 && (!isValidCell(board, secPos.row, secPos.col) || secPos.col < 0 || secPos.col >= GRID_COLS || secPos.row >= GRID_ROWS)) valid = false;
        if (valid && (testPair.col < 0 || testPair.col >= GRID_COLS)) valid = false;

        if (!valid) {
            testPair = { ...pair, orientation: newOrientation, col: pair.col + 1 };
            secPos = getSecondaryPosition(testPair);
            valid = true;
            if (testPair.row >= 0 && !isValidCell(board, testPair.row, testPair.col)) valid = false;
            if (valid && secPos.row >= 0 && (!isValidCell(board, secPos.row, secPos.col) || secPos.col < 0 || secPos.col >= GRID_COLS || secPos.row >= GRID_ROWS)) valid = false;
            if (valid && (testPair.col < 0 || testPair.col >= GRID_COLS)) valid = false;
        }
    }

    return valid ? testPair : { ...pair };
}

/**
 * Calculates the landing positions of both gems in the pair if hard dropped.
 * @param board The puzzle board.
 * @param pair The active gem pair.
 * @returns The final resting row/col for primary and secondary gems.
 */
export function hardDropPair(board: Board, pair: GemPair): { row: number; col: number; secondaryRow: number; secondaryCol: number } {
    const secPosInitial = getSecondaryPosition(pair);
    
    let pRow = pair.row;
    let sRow = secPosInitial.row;
    const pCol = pair.col;
    const sCol = secPosInitial.col;

    if (pCol !== sCol) {
        while (pRow + 1 < GRID_ROWS && sRow + 1 < GRID_ROWS && 
               board[pRow + 1][pCol] === null && board[sRow + 1][sCol] === null) {
            pRow++;
            sRow++;
        }
        return { row: pRow, col: pCol, secondaryRow: sRow, secondaryCol: sCol };
    } else {
        if (pRow > sRow) {
            while (pRow + 1 < GRID_ROWS && board[pRow + 1][pCol] === null) {
                pRow++;
                sRow++;
            }
        } else {
            while (sRow + 1 < GRID_ROWS && board[sRow + 1][sCol] === null) {
                pRow++;
                sRow++;
            }
        }
        return { row: pRow, col: pCol, secondaryRow: sRow, secondaryCol: sCol };
    }
}

/**
 * Deep clones the puzzle board.
 * @param board The board to clone.
 * @returns A deep copy of the board.
 */
export function cloneBoard(board: Board): Board {
    return board.map(row => 
        row.map(cell => cell ? { ...cell } : null)
    );
}

/**
 * Places a gem pair into the board array.
 * @param board The puzzle board.
 * @param pair The pair to lock.
 * @returns A new board with the pair placed.
 */
export function lockGemPair(board: Board, pair: GemPair): Board {
    const newBoard = cloneBoard(board);
    const drop = hardDropPair(board, pair);

    if (drop.row >= 0 && drop.row < GRID_ROWS && drop.col >= 0 && drop.col < GRID_COLS) {
        newBoard[drop.row][drop.col] = createGem(pair.primaryColor, drop.row, drop.col);
    }
    
    if (drop.secondaryRow >= 0 && drop.secondaryRow < GRID_ROWS && drop.secondaryCol >= 0 && drop.secondaryCol < GRID_COLS) {
        newBoard[drop.secondaryRow][drop.secondaryCol] = createGem(pair.secondaryColor, drop.secondaryRow, drop.secondaryCol);
    }

    return newBoard;
}

/**
 * Drops all floating gems down until they rest on a solid block or bottom of board.
 * @param board The puzzle board.
 * @returns A new board state after gravity is applied.
 */
export function applyGravity(board: Board): Board {
    const newBoard = cloneBoard(board);

    for (let c = 0; c < GRID_COLS; c++) {
        let writeRow = GRID_ROWS - 1;
        for (let r = GRID_ROWS - 1; r >= 0; r--) {
            const cell = newBoard[r][c];
            if (cell !== null) {
                newBoard[r][c] = null;
                cell.row = writeRow;
                cell.col = c;
                newBoard[writeRow][c] = cell;
                writeRow--;
            }
        }
    }

    return newBoard;
}

/**
 * Finds all groups of 3+ connected gems of the same color.
 * Special gems (Counter, Crash) do not match by color.
 * @param board The board state.
 * @returns Array of MatchGroup.
 */
export function findMatches(board: Board): MatchGroup[] {
    const matches: MatchGroup[] = [];
    const visited = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));

    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            if (visited[r][c]) continue;
            
            const cell = board[r][c];
            if (!cell || cell.color === null) {
                visited[r][c] = true;
                continue;
            }

            const color = cell.color;
            const positions: { row: number; col: number }[] = [];
            const queue: { r: number; c: number }[] = [{ r, c }];
            let includesPowerGem = false;

            while (queue.length > 0) {
                const { r: curR, c: curC } = queue.shift()!;
                if (curR < 0 || curR >= GRID_ROWS || curC < 0 || curC >= GRID_COLS) continue;
                if (visited[curR][curC]) continue;

                const curCell = board[curR][curC];
                if (!curCell || curCell.color !== color) continue;

                visited[curR][curC] = true;
                positions.push({ row: curR, col: curC });
                if (curCell.powerGroup) includesPowerGem = true;

                queue.push({ r: curR - 1, c: curC });
                queue.push({ r: curR + 1, c: curC });
                queue.push({ r: curR, c: curC - 1 });
                queue.push({ r: curR, c: curC + 1 });
            }

            if (positions.length >= 3) {
                matches.push({
                    color,
                    positions,
                    includesPowerGem,
                    count: positions.length
                });
            }
        }
    }

    return matches;
}

/**
 * Removes matched gems and adjacent counter gems.
 * @param board The puzzle board.
 * @param matches The matched groups to clear.
 * @returns A new board with the gems removed.
 */
export function clearMatches(board: Board, matches: MatchGroup[]): Board {
    if (matches.length === 0) return board;

    const newBoard = cloneBoard(board);
    const toClear = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));

    for (const match of matches) {
        for (const pos of match.positions) {
            toClear[pos.row][pos.col] = true;
            
            const neighbors = [
                { r: pos.row - 1, c: pos.col },
                { r: pos.row + 1, c: pos.col },
                { r: pos.row, c: pos.col - 1 },
                { r: pos.row, c: pos.col + 1 }
            ];

            for (const { r, c } of neighbors) {
                if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
                    const neighborCell = newBoard[r][c];
                    if (neighborCell && neighborCell.special === SpecialGemType.COUNTER) {
                        toClear[r][c] = true;
                    }
                }
            }
        }
    }

    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            if (toClear[r][c]) {
                newBoard[r][c] = null;
            }
        }
    }

    return newBoard;
}

/**
 * Processes crash gems adjacent to any colored gem or matching adjacent color.
 * @param board The puzzle board.
 * @returns New board and count of cleared gems.
 */
export function processCrashGems(board: Board): { board: Board; cleared: number } {
    const newBoard = cloneBoard(board);
    let cleared = 0;
    const colorsToClear = new Set<GemColor>();
    const crashGemsToClear: { row: number; col: number }[] = [];

    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const cell = board[r][c];
            if (cell && cell.special === SpecialGemType.CRASH) {
                const neighbors = [
                    { r: r - 1, c },
                    { r: r + 1, c },
                    { r, c: c - 1 },
                    { r, c: c + 1 },
                    { r: r + 1, c: c }
                ];
                
                let activated = false;
                for (const { r: nr, c: nc } of neighbors) {
                    if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS) {
                        const neighbor = board[nr][nc];
                        if (neighbor && neighbor.color !== null) {
                            colorsToClear.add(neighbor.color);
                            activated = true;
                        }
                    }
                }
                
                if (activated) {
                    crashGemsToClear.push({ row: r, col: c });
                }
            }
        }
    }

    if (colorsToClear.size === 0) return { board: newBoard, cleared: 0 };

    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const cell = newBoard[r][c];
            if (cell) {
                if (cell.color && colorsToClear.has(cell.color)) {
                    newBoard[r][c] = null;
                    cleared++;
                }
            }
        }
    }
    
    for (const { row, col } of crashGemsToClear) {
        if (newBoard[row][col] !== null) {
            newBoard[row][col] = null;
            cleared++;
        }
    }

    return { board: newBoard, cleared };
}

/**
 * Finds contiguous 2x2+ rectangles of same-color gems to fuse into Power Gems.
 * @param board The puzzle board.
 * @returns Array of PowerGem coordinates and bounds.
 */
export function findPowerGems(board: Board): PowerGem[] {
    const powerGems: PowerGem[] = [];
    const used = Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(false));

    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            if (used[r][c]) continue;
            
            const cell = board[r][c];
            if (!cell || cell.color === null || cell.special) continue;

            const color = cell.color;
            let width = 0;
            let height = 0;

            while (c + width < GRID_COLS && board[r][c + width]?.color === color && !board[r][c + width]?.special && !used[r][c + width]) {
                width++;
            }
            
            if (width < 2) continue;

            let validRect = true;
            while (r + height < GRID_ROWS && validRect) {
                for (let x = 0; x < width; x++) {
                    const checkCell = board[r + height][c + x];
                    if (!checkCell || checkCell.color !== color || checkCell.special || used[r + height][c + x]) {
                        validRect = false;
                        break;
                    }
                }
                if (validRect) height++;
            }

            if (height >= 2) {
                const id = `pg_${Date.now()}_${r}_${c}`;
                powerGems.push({
                    id,
                    color,
                    row: r,
                    col: c,
                    width,
                    height
                });

                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        used[r + y][c + x] = true;
                    }
                }
            }
        }
    }

    return powerGems;
}

/**
 * Identifies and marks power gems on the board.
 * @param board The puzzle board.
 * @returns New board and the formed power gems.
 */
export function fusePowerGems(board: Board): { board: Board; formed: PowerGem[] } {
    const powerGems = findPowerGems(board);
    if (powerGems.length === 0) return { board, formed: [] };

    const newBoard = cloneBoard(board);
    
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            if (newBoard[r][c]) {
                newBoard[r][c]!.powerGroup = null;
            }
        }
    }

    for (const pg of powerGems) {
        for (let y = 0; y < pg.height; y++) {
            for (let x = 0; x < pg.width; x++) {
                const cell = newBoard[pg.row + y][pg.col + x];
                if (cell) {
                    cell.powerGroup = pg.id;
                }
            }
        }
    }

    return { board: newBoard, formed: powerGems };
}

/**
 * Fully resolves a chain reaction of drops, matches, and crash gems.
 * @param initialBoard The starting board state.
 * @returns The complete DropResult containing all chain steps.
 */
export function resolveChains(initialBoard: Board): DropResult {
    let currentBoard = cloneBoard(initialBoard);
    const chainSteps: ChainStep[] = [];
    let totalChains = 0;
    let totalGemsCleared = 0;
    let powerGemsFormed: PowerGem[] = [];
    let chainLink = 1;

    while (true) {
        let stepGemsCleared = 0;
        let matches = findMatches(currentBoard);
        let crashResult = processCrashGems(currentBoard);
        
        if (matches.length === 0 && crashResult.cleared === 0) {
            break;
        }

        let nextBoard = currentBoard;

        if (crashResult.cleared > 0) {
            nextBoard = crashResult.board;
            stepGemsCleared += crashResult.cleared;
        }

        if (matches.length > 0) {
            nextBoard = clearMatches(nextBoard, matches);
            stepGemsCleared += matches.reduce((sum, m) => sum + m.count, 0);
        }

        nextBoard = applyGravity(nextBoard);
        
        const fuseResult = fusePowerGems(nextBoard);
        nextBoard = fuseResult.board;
        powerGemsFormed = powerGemsFormed.concat(fuseResult.formed);

        chainSteps.push({
            chainLink,
            matches,
            gemsCleared: stepGemsCleared,
            boardAfter: nextBoard
        });

        totalGemsCleared += stepGemsCleared;
        currentBoard = nextBoard;
        chainLink++;
        totalChains++;
    }

    return {
        finalBoard: currentBoard,
        chainSteps,
        totalChains,
        totalGemsCleared,
        garbageToSend: calculateGarbage({ 
            finalBoard: currentBoard,
            chainSteps,
            totalChains,
            totalGemsCleared,
            garbageToSend: 0,
            superCharge: 0,
            powerGemsFormed: []
        }).rows,
        superCharge: calculateSuperCharge(totalGemsCleared, totalChains),
        powerGemsFormed
    };
}

/**
 * Calculates garbage rows generated from a drop result.
 * @param result The drop result.
 * @returns The garbage payload generated.
 */
export function calculateGarbage(result: DropResult): GarbagePayload {
    let baseRows = 0;
    if (result.totalChains > 1) {
        baseRows += Math.pow(2, result.totalChains - 1) - 1;
    }
    
    const powerGemBonus = result.powerGemsFormed.length;
    const rows = Math.floor(baseRows + powerGemBonus);
    
    const pattern = Array.from({ length: GRID_COLS }, (_, i) => i);
    
    return {
        rows,
        pattern,
        counterTurns: COUNTER_GEM_TURNS
    };
}

/**
 * Places a garbage payload onto a player's board.
 * @param board The target board.
 * @param payload The garbage payload.
 * @returns The new board state.
 */
export function placeGarbage(board: Board, payload: GarbagePayload): Board {
    if (payload.rows <= 0) return board;

    let newBoard = cloneBoard(board);
    
    for (let r = 0; r < payload.rows; r++) {
        for (const c of payload.pattern) {
            if (newBoard[0][c] === null) {
                newBoard[0][c] = createCounterGem(0, c, payload.counterTurns);
            }
        }
    }
    
    newBoard = applyGravity(newBoard);
    return newBoard;
}

/**
 * Decrements counter gem timers and converts expired ones to normal gems.
 * @param board The puzzle board.
 * @returns A new board state.
 */
export function tickCounterGems(board: Board): Board {
    const newBoard = cloneBoard(board);

    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const cell = newBoard[r][c];
            if (cell && cell.special === SpecialGemType.COUNTER) {
                cell.counterTurns--;
                if (cell.counterTurns <= 0) {
                    newBoard[r][c] = createGem(randomGemColor(), r, c);
                }
            }
        }
    }

    return newBoard;
}

/**
 * Checks if the board is in a loss state.
 * @param board The puzzle board.
 * @returns True if lost, false otherwise.
 */
export function checkLoss(board: Board): boolean {
    return board[0][SPAWN_COL] !== null || board[0][SPAWN_COL + 1] !== null;
}

/**
 * Calculates the SUPER meter charge gained from a chain.
 * @param gemsCleared Total gems cleared in this drop.
 * @param chainCount Total chain links.
 * @returns The amount of SUPER charge to add.
 */
export function calculateSuperCharge(gemsCleared: number, chainCount: number): number {
    const base = gemsCleared;
    const multiplier = 1 + (Math.max(0, chainCount - 1)) * 0.5;
    return Math.floor(base * multiplier);
}
