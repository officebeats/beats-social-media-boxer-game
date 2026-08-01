import { describe, it, expect } from 'vitest';
import {
  createEmptyBoard,
  createFallingPair,
  rotatePair,
  movePair,
  hardDropPair,
  lockPairToBoard,
  applyGravity,
  fusePowerGems,
  checkAndDetonate,
  calculateGarbage,
  dropGarbage,
  isBoardToppedOut,
  ROWS,
  COLS
} from '../src/engine/puzzle';
import { Gem } from '../src/engine/types';

describe('Puzzle Engine Unit Tests', () => {
  it('creates empty 6x12 board matrix', () => {
    const board = createEmptyBoard();
    expect(board.length).toBe(ROWS);
    expect(board[0].length).toBe(COLS);
    expect(board[0][0]).toBeNull();
  });

  it('spawns falling pair at (x=2, y=0)', () => {
    const pair = createFallingPair();
    expect(pair.x).toBe(2);
    expect(pair.y).toBe(0);
    expect(pair.rotation).toBe(0);
  });

  it('rotates falling pair clockwise with wall kick support', () => {
    const board = createEmptyBoard();
    const pair = createFallingPair();
    const rotated = rotatePair(board, pair);
    expect(rotated.rotation).toBe(1); // Satellite to the left
  });

  it('moves pair left and right within boundaries', () => {
    const board = createEmptyBoard();
    const pair = createFallingPair();

    const { pair: movedLeft, moved: movedL } = movePair(board, pair, -1, 0);
    expect(movedL).toBe(true);
    expect(movedLeft.x).toBe(1);

    const { pair: blocked, moved: movedBlocked } = movePair(board, movedLeft, -5, 0);
    expect(movedBlocked).toBe(false);
    expect(blocked.x).toBe(1);
  });

  it('hard drops pair to lowest available row', () => {
    const board = createEmptyBoard();
    const pair = createFallingPair();
    const dropped = hardDropPair(board, pair);

    // Rotation 0: pivot at y, satellite at y+1. Max y is 10 for pivot, 11 for satellite.
    expect(dropped.y).toBe(10);
  });

  it('locks pair into board matrix', () => {
    let board = createEmptyBoard();
    const pair = createFallingPair(
      { id: 'g1', color: 'red', type: 'normal' },
      { id: 'g2', color: 'red', type: 'normal' }
    );
    const dropped = hardDropPair(board, pair);
    board = lockPairToBoard(board, dropped);

    expect(board[10][2]?.id).toBe('g1');
    expect(board[11][2]?.id).toBe('g2');
  });

  it('applies gravity so floating gems fall', () => {
    let board = createEmptyBoard();
    board[5][2] = { id: 'floating', color: 'blue', type: 'normal' };

    const { board: newBoard, movedAny } = applyGravity(board);
    expect(movedAny).toBe(true);
    expect(newBoard[5][2]).toBeNull();
    expect(newBoard[11][2]?.id).toBe('floating');
  });

  it('fuses 2x2 solid matching normal gems into Power Gems', () => {
    let board = createEmptyBoard();
    const g: Gem = { id: 'test', color: 'green', type: 'normal' };

    board[10][0] = { ...g, id: 'g1' };
    board[10][1] = { ...g, id: 'g2' };
    board[11][0] = { ...g, id: 'g3' };
    board[11][1] = { ...g, id: 'g4' };

    board = fusePowerGems(board);
    expect(board[10][0]?.type).toBe('power');
    expect(board[10][1]?.type).toBe('power');
    expect(board[11][0]?.type).toBe('power');
    expect(board[11][1]?.type).toBe('power');
  });

  it('detonates gems when Crash Gem touches matching normal gems', () => {
    let board = createEmptyBoard();
    board[11][0] = { id: 'c1', color: 'red', type: 'crash' };
    board[11][1] = { id: 'n1', color: 'red', type: 'normal' };

    const { board: detonatedBoard, clearedCount } = checkAndDetonate(board);
    expect(clearedCount).toBe(2);
    expect(detonatedBoard[11][0]).toBeNull();
    expect(detonatedBoard[11][1]).toBeNull();
  });

  it('calculates garbage sent using GDD formula', () => {
    // Single detonation: 2 gems cleared, bonus 0, chain 0 -> floor((2 * 0.75 + 0) * 1.0) = 1
    expect(calculateGarbage(2, 0, 0)).toBe(1);

    // 2x2 Power gem: 4 gems cleared, bonus 4, chain 0 -> floor((4 * 0.75 + 4) * 1.0) = 7
    expect(calculateGarbage(4, 4, 0)).toBe(7);

    // Chain 2 multiplier (1.5x)
    expect(calculateGarbage(4, 4, 1)).toBe(10);
  });

  it('drops garbage counter gems according to character drop pattern', () => {
    let board = createEmptyBoard();
    const pattern = ['yellow', 'yellow', 'red', 'red', 'yellow', 'yellow'] as const;

    board = dropGarbage(board, 6, [...pattern]);
    expect(board[0][0]?.type).toBe('counter');
    expect(board[0][0]?.color).toBe('yellow');
    expect(board[0][2]?.color).toBe('red');
  });

  it('detects top out when spawn position (1, 2) is blocked', () => {
    let board = createEmptyBoard();
    expect(isBoardToppedOut(board)).toBe(false);

    board[1][2] = { id: 'top', color: 'red', type: 'normal' };
    expect(isBoardToppedOut(board)).toBe(true);
  });
});
