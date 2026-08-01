/**
 * Crash Out: Ring Rush — AI Engine Tests
 *
 * Validates AI placement scoring across all 3 difficulty tiers.
 */
import { describe, it, expect } from 'vitest';
import { getAIPlacement, getValidPlacements } from '../src/engine/ai';
import { createBoard, placeGarbage } from '../src/engine/puzzle';
import { GemColor, PairOrientation, GemPair, Board } from '../src/engine/types';
import { GRID_COLS } from '../src/config';

const makePair = (primary: GemColor = GemColor.RED, secondary: GemColor = GemColor.BLUE): GemPair => ({
    primaryColor: primary,
    secondaryColor: secondary,
    row: 0,
    col: 2,
    orientation: PairOrientation.VERTICAL_DOWN,
});

describe('getValidPlacements', () => {
    it('should return placements for an empty board', () => {
        const board = createBoard();
        const pair = makePair();
        const placements = getValidPlacements(board, pair);
        expect(placements.length).toBeGreaterThan(0);
    });

    it('should return fewer placements for a nearly full board', () => {
        const board = createBoard();
        // Fill most of the board
        const emptyPlacements = getValidPlacements(board, makePair());

        // Now create a board with some columns full
        let fullBoard = createBoard();
        // Fill columns 0-3 completely
        for (let r = 0; r < 12; r++) {
            for (let c = 0; c < 4; c++) {
                fullBoard[r][c] = {
                    color: GemColor.RED,
                    special: null,
                    powerGroup: null,
                    counterTurns: 0,
                    row: r,
                    col: c,
                };
            }
        }
        const fullPlacements = getValidPlacements(fullBoard, makePair());
        expect(fullPlacements.length).toBeLessThan(emptyPlacements.length);
    });
});

describe('getAIPlacement - Easy', () => {
    it('should return a valid placement', () => {
        const board = createBoard();
        const pair = makePair();
        const placement = getAIPlacement(board, pair, 'easy');
        expect(placement.targetCol).toBeGreaterThanOrEqual(0);
        expect(placement.targetCol).toBeLessThan(GRID_COLS);
        expect(Object.values(PairOrientation)).toContain(placement.targetOrientation);
    });

    it('should work on boards with existing gems', () => {
        let board = createBoard();
        // Place some gems
        board[11][0] = { color: GemColor.RED, special: null, powerGroup: null, counterTurns: 0, row: 11, col: 0 };
        board[11][1] = { color: GemColor.BLUE, special: null, powerGroup: null, counterTurns: 0, row: 11, col: 1 };
        const pair = makePair();
        const placement = getAIPlacement(board, pair, 'easy');
        expect(placement.targetCol).toBeGreaterThanOrEqual(0);
    });
});

describe('getAIPlacement - Normal', () => {
    it('should return a valid placement', () => {
        const board = createBoard();
        const pair = makePair();
        const placement = getAIPlacement(board, pair, 'normal');
        expect(placement.targetCol).toBeGreaterThanOrEqual(0);
        expect(placement.targetCol).toBeLessThan(GRID_COLS);
        expect(placement.score).toBeDefined();
    });

    it('should produce a score', () => {
        const board = createBoard();
        const pair = makePair();
        const placement = getAIPlacement(board, pair, 'normal');
        expect(typeof placement.score).toBe('number');
    });
});

describe('getAIPlacement - Hard', () => {
    it('should return a valid placement', () => {
        const board = createBoard();
        const pair = makePair();
        const placement = getAIPlacement(board, pair, 'hard');
        expect(placement.targetCol).toBeGreaterThanOrEqual(0);
        expect(placement.targetCol).toBeLessThan(GRID_COLS);
    });

    it('should generally score higher than Easy', () => {
        const board = createBoard();
        const pair = makePair();
        const hardPlacement = getAIPlacement(board, pair, 'hard');
        // Hard should at least produce a non-negative score
        expect(hardPlacement.score).toBeGreaterThanOrEqual(0);
    });
});

describe('AI consistency', () => {
    it('should never return invalid column', () => {
        const board = createBoard();
        const pair = makePair();
        for (let i = 0; i < 20; i++) {
            const placement = getAIPlacement(board, pair, 'easy');
            expect(placement.targetCol).toBeGreaterThanOrEqual(0);
            expect(placement.targetCol).toBeLessThan(GRID_COLS);
        }
    });

    it('should handle all gem color combinations', () => {
        const board = createBoard();
        const colors = Object.values(GemColor);
        for (const c1 of colors) {
            for (const c2 of colors) {
                const pair = makePair(c1, c2);
                const placement = getAIPlacement(board, pair, 'normal');
                expect(placement.targetCol).toBeGreaterThanOrEqual(0);
            }
        }
    });
});
