import { BOARD_HEIGHT, BOARD_WIDTH, PuzzleGame, type Resolution } from "./puzzle";

export type FighterId = "broner" | "deen";
export type MatchPhase = "playing" | "paused" | "results";

export interface MatchEvent {
  type: "attack" | "hit" | "chain" | "super" | "result";
  actor: "player" | "rival";
  value?: number;
}

export class MatchGame {
  player: PuzzleGame;
  rival: PuzzleGame;
  phase: MatchPhase = "playing";
  elapsedMs = 0;
  winner: FighterId | null = null;
  readonly playerFighter: FighterId;
  readonly rivalFighter: FighterId;
  events: MatchEvent[] = [];
  private playerDropMs = 0;
  private rivalDropMs = 0;
  private aiThinkMs = 0;

  constructor(seed = 20260727, playerFighter: FighterId = "broner") {
    this.playerFighter = playerFighter;
    this.rivalFighter = playerFighter === "broner" ? "deen" : "broner";
    this.player = new PuzzleGame(seed);
    this.rival = new PuzzleGame(seed ^ 0x51f15e);
  }

  update(deltaMs: number): void {
    if (this.phase !== "playing") return;
    this.elapsedMs += deltaMs;
    this.playerDropMs += deltaMs;
    this.rivalDropMs += deltaMs;
    this.aiThinkMs += deltaMs;

    if (this.playerDropMs >= 850) {
      this.playerDropMs %= 850;
      this.handleResolution("player", this.player.softDrop());
    }

    if (this.aiThinkMs >= 240) {
      this.aiThinkMs %= 240;
      this.stepAi();
    }

    if (this.rivalDropMs >= 680) {
      this.rivalDropMs %= 680;
      this.handleResolution("rival", this.rival.softDrop());
    }

    this.checkResult();
  }

  movePlayer(dx: -1 | 1): boolean {
    return this.phase === "playing" && this.player.move(dx);
  }

  rotatePlayer(): boolean {
    return this.phase === "playing" && this.player.rotate();
  }

  softDropPlayer(): void {
    if (this.phase !== "playing") return;
    this.handleResolution("player", this.player.softDrop());
    this.checkResult();
  }

  hardDropPlayer(): void {
    if (this.phase !== "playing") return;
    this.handleResolution("player", this.player.hardDrop());
    this.checkResult();
  }

  usePlayerSuper(): boolean {
    if (this.phase !== "playing" || !this.player.useSuper()) return false;
    this.events.push({ type: "super", actor: "player" });
    this.rival.addCounterGems(4);
    this.checkResult();
    return true;
  }

  togglePause(): void {
    if (this.phase === "results") return;
    this.phase = this.phase === "paused" ? "playing" : "paused";
  }

  consumeEvents(): MatchEvent[] {
    return this.events.splice(0);
  }

  private handleResolution(actor: "player" | "rival", resolution: Resolution | null): void {
    if (!resolution) return;
    if (resolution.chain > 1) {
      this.events.push({ type: "chain", actor, value: resolution.chain });
    }
    if (resolution.attack > 0) {
      const target = actor === "player" ? this.rival : this.player;
      target.addCounterGems(Math.min(resolution.attack, 8));
      this.events.push({ type: "attack", actor, value: resolution.attack });
      this.events.push({ type: "hit", actor: actor === "player" ? "rival" : "player" });
    }
  }

  private stepAi(): void {
    const active = this.rival.active;
    if (!active) return;
    const target = this.chooseAiColumn();
    if (active.x < target) this.rival.move(1);
    else if (active.x > target) this.rival.move(-1);
    else if (this.rival.random.next() > 0.7) this.rival.rotate();
    if (this.rival.meter >= 100 && this.rival.random.next() > 0.82) {
      if (this.rival.useSuper()) {
        this.player.addCounterGems(4);
        this.events.push({ type: "super", actor: "rival" });
      }
    }
  }

  private chooseAiColumn(): number {
    let best = 0;
    let bestScore = Number.NEGATIVE_INFINITY;
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      let height = 0;
      for (let y = 0; y < BOARD_HEIGHT; y += 1) {
        if (this.rival.board[y][x]) {
          height = BOARD_HEIGHT - y;
          break;
        }
      }
      let score = -height * 3 + this.rival.random.next();
      const bottom = this.rival.board[BOARD_HEIGHT - 1][x];
      if (bottom?.color === this.rival.active?.pivot.color) score += 4;
      if (score > bestScore) {
        bestScore = score;
        best = x;
      }
    }
    return best;
  }

  private checkResult(): void {
    if (!this.player.topOut && !this.rival.topOut) return;
    this.phase = "results";
    this.winner = this.player.topOut ? this.rivalFighter : this.playerFighter;
    this.events.push({
      type: "result",
      actor: this.player.topOut ? "rival" : "player",
    });
  }
}
