import { 
    GemColor, 
    Board, 
    PairOrientation, 
    GemPair, 
    DropResult, 
    AIDifficulty, 
    AIPlacement 
} from './types';
import { GRID_COLS, GRID_ROWS, SPAWN_COL } from '../config';
import { applyGravity, resolveChains, lockGemPair } from './puzzle';

/**
 * Validates whether a placement is structurally possible (doesn't go out of bounds
 * or overlap with gems at the top of the board).
 *
 * @param board - The current puzzle board
 * @param col - Target column for the primary gem
 * @param orientation - Target orientation of the gem pair
 * @returns True if the placement is valid
 */
export function isValidPlacement(board: Board, col: number, orientation: PairOrientation): boolean {
    if (orientation === PairOrientation.HORIZONTAL) {
        if (col < 0 || col + 1 >= GRID_COLS) return false;
        return board[0][col] === null && board[0][col + 1] === null;
    } else if (orientation === PairOrientation.HORIZONTAL_REVERSE) {
        if (col - 1 < 0 || col >= GRID_COLS) return false;
        return board[0][col] === null && board[0][col - 1] === null;
    } else {
        // VERTICAL_DOWN or VERTICAL_UP
        if (col < 0 || col >= GRID_COLS) return false;
        return board[0][col] === null;
    }
}

/**
 * Enumerates all valid placements (column + orientation) for a given pair.
 * 
 * @param board - The current puzzle board
 * @param pair - The falling gem pair
 * @returns Array of all valid AIPlacements
 */
export function getValidPlacements(board: Board, pair: GemPair): AIPlacement[] {
    const placements: AIPlacement[] = [];
    const orientations = [
        PairOrientation.HORIZONTAL,
        PairOrientation.HORIZONTAL_REVERSE,
        PairOrientation.VERTICAL_DOWN,
        PairOrientation.VERTICAL_UP
    ];

    for (let c = 0; c < GRID_COLS; c++) {
        for (const orient of orientations) {
            if (isValidPlacement(board, c, orient)) {
                placements.push({
                    targetCol: c,
                    targetOrientation: orient,
                    score: 0
                });
            }
        }
    }

    return placements;
}

/**
 * Simulates dropping a pair in a specific column and orientation.
 * Returns the final board state and drop result (matches, chains, etc.).
 *
 * @param board - The current puzzle board
 * @param pair - The falling gem pair
 * @param col - Target column
 * @param orientation - Target orientation
 * @returns The resulting board and DropResult, or null if invalid
 */
export function simulatePlacement(
    board: Board, 
    pair: GemPair, 
    col: number, 
    orientation: PairOrientation
): { board: Board; result: DropResult } | null {
    if (!isValidPlacement(board, col, orientation)) {
        return null;
    }
    
    // Create a modified pair at the target column and orientation
    const targetPair: GemPair = {
        ...pair,
        col,
        orientation,
        row: 0
    };

    // lockGemPair returns a new board with the pair inserted at its current location
    const boardWithPair = lockGemPair(board, targetPair);
    
    // Apply gravity to make the pair fall to the bottom
    const boardAfterGravity = applyGravity(boardWithPair);
    
    // Resolve any resulting matches and chains
    const dropResult = resolveChains(boardAfterGravity);
    
    return {
        board: dropResult.finalBoard,
        result: dropResult
    };
}

/**
 * Calculates the number of adjacent same-color gems on the board.
 * Used as a heuristic for placement quality.
 */
function calculateAdjacencyScore(board: Board): number {
    let adjacency = 0;
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const cell = board[r][c];
            if (!cell || cell.color === null) continue;
            
            // Check right
            if (c + 1 < GRID_COLS && board[r][c+1]?.color === cell.color) {
                adjacency++;
            }
            // Check down
            if (r + 1 < GRID_ROWS && board[r+1][c]?.color === cell.color) {
                adjacency++;
            }
        }
    }
    return adjacency;
}

/**
 * Calculates a specific bonus for same-color gems stacked vertically.
 * Helps the Hard AI set up vertical chains.
 */
function calculateVerticalStackScore(board: Board): number {
    let score = 0;
    for (let c = 0; c < GRID_COLS; c++) {
        for (let r = 0; r < GRID_ROWS - 1; r++) {
            const cell = board[r][c];
            if (!cell || cell.color === null) continue;
            if (board[r+1][c]?.color === cell.color) {
                score++;
            }
        }
    }
    return score;
}

/**
 * Heuristically scores a simulated board outcome.
 *
 * @param board - The resulting board state
 * @param result - The drop result containing match and chain info
 * @param isHard - Whether to apply Hard-difficulty scoring modifiers
 * @returns A numerical score for the placement
 */
export function scoreBoard(board: Board, result: DropResult, isHard: boolean = false): number {
    let score = 0;

    for (const step of result.chainSteps) {
        // +10 per match that would clear
        score += step.matches.length * 10;
        
        // +5 per gem in largest match group
        let largestMatch = 0;
        for (const match of step.matches) {
            if (match.count > largestMatch) {
                largestMatch = match.count;
            }
        }
        score += largestMatch * 5;
        
        if (isHard && step.chainLink > 1) {
            // +25 per chain link in cascade for Hard mode
            score += 25; 
        }
    }

    // +20 per power gem that would form (+35 in Hard mode)
    score += result.powerGemsFormed.length * (isHard ? 35 : 20);

    // -30 if placement causes loss (column overflow)
    // Check if any column is filled to the top row
    let overflow = false;
    for (let c = 0; c < GRID_COLS; c++) {
        if (board[0][c] !== null) {
            overflow = true;
            break;
        }
    }
    if (overflow) {
        score -= 30;
    }

    // +3 for placing near same-color gems (adjacency bonus)
    score += calculateAdjacencyScore(board) * 3;

    if (isHard) {
        // Bonus for setting up chains (same color stacked vertically)
        score += calculateVerticalStackScore(board) * 2;
    }

    return score;
}

/**
 * The main entry point for the AI decision engine.
 * Determines the best placement for the given gem pair based on difficulty.
 *
 * @param board - The current puzzle board
 * @param pair - The falling gem pair
 * @param difficulty - AI difficulty tier
 * @returns The chosen AI placement
 */
export function getAIPlacement(board: Board, pair: GemPair, difficulty: AIDifficulty): AIPlacement {
    const validPlacements = getValidPlacements(board, pair);
    
    // Fallback if no valid placements
    if (validPlacements.length === 0) {
        return {
            targetCol: SPAWN_COL,
            targetOrientation: PairOrientation.VERTICAL_DOWN,
            score: -999
        };
    }

    if (difficulty === 'easy') {
        // Easy: Pick a random valid column, bias toward center, random orientation, ignore chains
        const pool = [...validPlacements];
        const centerPlacements = validPlacements.filter(p => p.targetCol === SPAWN_COL || p.targetCol === SPAWN_COL + 1);
        
        // Add center columns extra times to bias probability
        pool.push(...centerPlacements);
        pool.push(...centerPlacements);
        
        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool[randomIndex];
    }

    if (difficulty === 'normal') {
        // Normal: Simulate all placements, score them, pick randomly from top 3
        for (const placement of validPlacements) {
            const sim = simulatePlacement(board, pair, placement.targetCol, placement.targetOrientation);
            if (sim) {
                placement.score = scoreBoard(sim.board, sim.result, false);
            } else {
                placement.score = -999;
            }
        }

        // Sort descending
        validPlacements.sort((a, b) => b.score - a.score);

        // Pick from the top 3 placements randomly to add imperfection
        const topN = validPlacements.slice(0, 3);
        const randomIndex = Math.floor(Math.random() * topN.length);
        return topN[randomIndex];
    }

    if (difficulty === 'hard') {
        // Hard: Simulate all placements, do 1-step lookahead, pick absolute best
        for (const placement of validPlacements) {
            const sim = simulatePlacement(board, pair, placement.targetCol, placement.targetOrientation);
            if (sim) {
                // Base score
                let score = scoreBoard(sim.board, sim.result, true);
                
                // 1-step lookahead: simulate a hypothetical next pair (using same colors as current)
                const nextPair: GemPair = {
                    primaryColor: pair.primaryColor,
                    secondaryColor: pair.secondaryColor,
                    row: 0, 
                    col: SPAWN_COL,
                    orientation: PairOrientation.VERTICAL_DOWN
                };
                
                let bestNextScore = -999;
                const nextValid = getValidPlacements(sim.board, nextPair);
                for (const nextP of nextValid) {
                    const nextSim = simulatePlacement(sim.board, nextPair, nextP.targetCol, nextP.targetOrientation);
                    if (nextSim) {
                        const nextScore = scoreBoard(nextSim.board, nextSim.result, true);
                        if (nextScore > bestNextScore) {
                            bestNextScore = nextScore;
                        }
                    }
                }
                
                // Add weighted lookahead score
                placement.score = score + (bestNextScore > 0 ? bestNextScore * 0.5 : 0);
            } else {
                placement.score = -999;
            }
        }

        // Sort descending and pick absolute best
        validPlacements.sort((a, b) => b.score - a.score);
        return validPlacements[0];
    }

    return validPlacements[0];
}
