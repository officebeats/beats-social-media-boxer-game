import { describe, expect, it } from "vitest";
import { BOARD_HEIGHT, PuzzleGame, SeededRandom } from "./puzzle";
import { MatchGame } from "./match";

describe("SeededRandom", () => {
  it("repeats the same sequence for the same seed", () => {
    const a = new SeededRandom(42);
    const b = new SeededRandom(42);
    expect(Array.from({ length: 10 }, () => a.next())).toEqual(
      Array.from({ length: 10 }, () => b.next()),
    );
  });
});

describe("PuzzleGame", () => {
  it("moves, rotates, and hard drops a pair", () => {
    const game = new PuzzleGame(7);
    expect(game.move(-1)).toBe(true);
    expect(game.rotate()).toBe(true);
    const result = game.hardDrop();
    expect(result.cleared).toBeGreaterThanOrEqual(0);
    expect(game.active).not.toBeNull();
    expect(game.board[BOARD_HEIGHT - 1].some(Boolean)).toBe(true);
  });

  it("creates deterministic snapshots", () => {
    const a = new PuzzleGame(99);
    const b = new PuzzleGame(99);
    for (let i = 0; i < 8; i += 1) {
      a.hardDrop();
      b.hardDrop();
    }
    expect(a.snapshot()).toEqual(b.snapshot());
  });

  it("converts counter gems with a full super meter", () => {
    const game = new PuzzleGame(2);
    game.addCounterGems(5);
    game.meter = 100;
    expect(game.useSuper()).toBe(true);
    const counters = game.board.flat().filter((gem) => gem?.kind === "counter");
    expect(counters).toHaveLength(1);
  });
});

describe("MatchGame", () => {
  it("pauses without advancing the timer", () => {
    const match = new MatchGame(3);
    match.update(100);
    match.togglePause();
    match.update(500);
    expect(match.elapsedMs).toBe(100);
    expect(match.phase).toBe("paused");
  });
});
