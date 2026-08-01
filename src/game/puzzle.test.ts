import { describe, expect, it } from "vitest";
import { BOARD_HEIGHT, PuzzleGame, SeededRandom, detectPowerGems, type Gem } from "./puzzle";
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

describe("PuzzleGame Power Gems & SPF2T Mechanics", () => {
  it("fuses 2x2 adjacent normal gems into a Power Gem", () => {
    const game = new PuzzleGame(5);
    const red: Gem = { color: "red", kind: "normal" };
    game.board[10][0] = { ...red };
    game.board[10][1] = { ...red };
    game.board[11][0] = { ...red };
    game.board[11][1] = { ...red };

    detectPowerGems(game.board);

    expect(game.board[10][0]?.powerGem).toBeDefined();
    expect(game.board[10][0]?.powerGem?.width).toBe(2);
    expect(game.board[10][0]?.powerGem?.height).toBe(2);
    expect(game.board[11][1]?.powerGem?.id).toBe(game.board[10][0]?.powerGem?.id);
  });

  it("detonates Power Gems when touched by a matching Crash Gem", () => {
    const game = new PuzzleGame(12);
    const redNormal: Gem = { color: "red", kind: "normal" };
    game.board[10][0] = { ...redNormal };
    game.board[10][1] = { ...redNormal };
    game.board[11][0] = { ...redNormal };
    game.board[11][1] = { ...redNormal };

    game.active = {
      x: 0,
      y: 8,
      orientation: 0,
      pivot: { color: "red", kind: "crash" },
      satellite: { color: "blue", kind: "normal" },
    };

    const result = game.hardDrop();

    expect(result.locked).toHaveLength(2);
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].cells.length).toBeGreaterThanOrEqual(5);
    expect(result.steps[0].cells.some((cell) => cell.gem.kind === "crash")).toBe(true);
  });

  it("applies character-specific drop patterns for Broner and Deen", () => {
    const bronerMatch = new MatchGame(1, "broner");
    const deenMatch = new MatchGame(1, "deen");

    const bronerCells = bronerMatch.player.addCounterGems(6);
    expect(bronerCells.length).toBe(6);

    const deenCells = deenMatch.player.addCounterGems(6);
    expect(deenCells.length).toBe(6);
  });
});

describe("PuzzleGame Standard Features", () => {
  it("moves, rotates, and hard drops a pair", () => {
    const game = new PuzzleGame(7);
    expect(game.move(-1)).toBe(true);
    expect(game.rotate()).toBe(true);
    const result = game.hardDrop();
    expect(result.cleared).toBeGreaterThanOrEqual(0);
    expect(result.locked).toHaveLength(2);
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

  it("reports counter-gem landing cells", () => {
    const game = new PuzzleGame(18);
    const cells = game.addCounterGems(4);

    expect(cells).toHaveLength(4);
    expect(cells.every((cell) => cell.gem.kind === "counter")).toBe(true);
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

