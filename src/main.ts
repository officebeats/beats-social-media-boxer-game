import "./styles.css";
import { MatchGame, type FighterId, type MatchEvent } from "./game/match";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  pairCells,
  type Gem,
  type PuzzleGame,
  type ResolvedCell,
} from "./game/puzzle";
import { arcadeAudio } from "./game/audio";

type Screen = "title" | "select" | "match" | "results";
type FighterPose = "idle" | "attack" | "hurt" | "win";

declare global {
  interface Window {
    render_game_to_text: () => string;
    advanceTime: (ms: number) => void;
    __ringRush: {
      screen: () => Screen;
      startMatch: (fighter?: FighterId) => void;
      finish: (winner: FighterId) => void;
      showcaseGems: () => void;
    };
  }
}

const appRoot = document.querySelector<HTMLElement>("#app");
if (!appRoot) throw new Error("Missing app root");
const app: HTMLElement = appRoot;
app.innerHTML = '<canvas id="scene-canvas"></canvas><div id="screen-root"></div>';
const assetUrl = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
app.style.setProperty("--venue-far-image", `url("${assetUrl("assets/arena/venue-far.png")}")`);
app.style.setProperty("--ring-mid-image", `url("${assetUrl("assets/arena/ring-mid.png")}")`);
app.style.setProperty(
  "--ring-foreground-image",
  `url("${assetUrl("assets/arena/ring-foreground.png")}")`,
);
app.style.setProperty(
  "--gem-atlas-image",
  `url("${assetUrl("assets/gems/ring-rush-gem-atlas.png")}")`,
);
const screenRootElement = app.querySelector<HTMLElement>("#screen-root");
if (!screenRootElement) throw new Error("Missing screen root");
const screenRoot: HTMLElement = screenRootElement;

const audio = {
  title: new Audio(assetUrl("assets/audio/music/try-me.mp3")),
  match: new Audio(assetUrl("assets/audio/music/the-mafia-game.mp3")),
};
audio.title.loop = true;
audio.match.loop = true;
audio.title.volume = 0.34;
audio.match.volume = 0.3;

let screen: Screen = "title";
let selectedFighter: FighterId = "broner";
let match: MatchGame | null = null;
let muted = false;
let lastFrame = performance.now();
let accumulator = 0;
let manualUntil = 0;
let renderDirty = true;
let playerPose: FighterPose = "idle";
let rivalPose: FighterPose = "idle";
let poseResetAt = 0;
let impactText = "";
let impactResetAt = 0;
let gemFeedback = "idle";
let gemFeedbackResetAt = 0;
let parallaxX = 0;
let parallaxY = 0;
let renderedParallaxX = 0;
let renderedParallaxY = 0;
let matchReadyAt = 0;
let lastMatchPatchAt = 0;

const MATCH_INTRO_MS = 1300;
const MATCH_PATCH_MS = 50;

function fighterName(id: FighterId): string {
  return id === "broner" ? "BRONER" : "DEEN";
}

function spriteStyle(id: FighterId, pose: FighterPose, flip = false): string {
  const poseIndex: Record<FighterPose, number> = { idle: 0, attack: 1, hurt: 2, win: 3 };
  return [
    `--sprite:url(${assetUrl(`assets/fighters/${id}-states.png`)})`,
    `--pose-x:${poseIndex[pose] * 33.333}%`,
    `--flip:${flip ? -1 : 1}`,
  ].join(";");
}

function fighterVisual(
  id: FighterId,
  pose: FighterPose,
  classes: string,
  facing: "left" | "right",
): string {
  const naturalFacing = "right";
  const flip = naturalFacing !== facing;
  return `
    <div class="fighter-frame fighter-${id} ${classes} pose-${pose}" data-pose="${pose}" data-facing="${facing}">
      <div class="fighter-sprite fighter-fill" style="${spriteStyle(id, pose, flip)}"></div>
      ${id === "deen" && flip ? '<span class="deen-belt-fix">DEEN</span>' : ""}
    </div>
  `;
}

function stageMarkup(): string {
  return `
      <div class="arena" aria-hidden="true">
      <div class="arena-layer venue-far"></div>
      <div class="arena-layer ring-mid"></div>
      <div class="arena-layer ring-foreground"></div>
      <div class="arena-vignette"></div>
    </div>
  `;
}

function titleMarkup(): string {
  return `
    <section class="screen title-screen">
      ${stageMarkup()}
      <div class="title-lockup">
        <div class="logo">
          <span>RING</span>
          <strong>RUSH</strong>
        </div>
        <p class="title-subtitle">PUZZLE BOXING</p>
      </div>
      <div class="faceoff" aria-label="Adrien Broner faces Deen the Great">
        ${fighterVisual("broner", "idle", "title-fighter broner", "right")}
        <div class="versus">VS</div>
        ${fighterVisual("deen", "idle", "title-fighter deen", "left")}
      </div>
      <nav class="title-actions" aria-label="Main menu">
        <button class="primary-button" data-action="fight">FIGHT</button>
        <button class="secondary-button" data-action="options">AUDIO: ${muted ? "OFF" : "ON"}</button>
      </nav>
      <p class="legal-note">PRE-ALPHA VERTICAL SLICE</p>
    </section>
  `;
}

function selectMarkup(): string {
  return `
    <section class="screen select-screen">
      ${stageMarkup()}
      <header class="screen-header">
        <button class="icon-button" data-action="home" aria-label="Back">‹</button>
        <h1>SELECT FIGHTER</h1>
        <span class="header-spacer"></span>
      </header>
      <div class="fighter-select-grid">
        ${fighterCard("broner")}
        ${fighterCard("deen")}
      </div>
      <div class="locked-roster" aria-label="Future fighters">
        ${Array.from({ length: 4 }, () => '<div class="locked-slot"><span>♛</span></div>').join("")}
      </div>
      <button class="primary-button select-confirm" data-action="confirm">ENTER THE RING</button>
    </section>
  `;
}

function fighterCard(id: FighterId): string {
  const selected = selectedFighter === id;
  return `
    <button class="fighter-card ${id} ${selected ? "selected" : ""}" data-fighter="${id}" aria-pressed="${selected}">
      ${fighterVisual(id, "idle", "card-fighter", id === "broner" ? "right" : "left")}
      <div class="card-copy">
        <strong>${fighterName(id)}</strong>
        <span>${id === "broner" ? "COUNTER KING" : "PRESSURE TECH"}</span>
      </div>
    </button>
  `;
}

function healthBar(id: FighterId, isPlayer: boolean): string {
  return `
    <div class="fighter-hud ${isPlayer ? "player" : "rival"}">
      <div class="fighter-sprite hud-portrait" style="${spriteStyle(id, "idle", !isPlayer)}"></div>
      <div class="hud-info">
        <div class="hud-name">${fighterName(id)}</div>
        <div class="health-track"><span style="width:100%"></span></div>
        <div class="hud-stars">★ ★ ★</div>
      </div>
    </div>
  `;
}

function gemClass(gem: Gem | null): string {
  if (!gem) return "empty";
  return `${gem.color} ${gem.kind}`;
}

interface BoardCellView {
  classes: string;
  text: string;
  dataset: Record<string, string>;
}

function boardCells(game: PuzzleGame): BoardCellView[] {
  const active = new Map<string, Gem>();
  if (game.active) {
    pairCells(game.active).forEach(({ x, y, gem }) => active.set(`${y}:${x}`, gem));
  }
  const cells: BoardCellView[] = [];
  for (let y = 0; y < BOARD_HEIGHT; y += 1) {
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      const key = `${y}:${x}`;
      const activeGem = active.get(key);
      const gem = activeGem ?? game.board[y][x];

      const ds: Record<string, string> = {};
      let powerClass = "";
      if (gem?.powerGem) {
        const pg = gem.powerGem;
        powerClass = " power-gem";
        ds.powerW = String(pg.width);
        ds.powerH = String(pg.height);
        ds.powerRelX = String(pg.relX);
        ds.powerRelY = String(pg.relY);
      }

      cells.push({
        classes: `gem ${gemClass(gem)}${activeGem ? " active-piece" : ""}${powerClass}`,
        text: gem?.kind === "counter" ? String(gem.turns ?? "") : "",
        dataset: ds,
      });
    }
  }
  return cells;
}

function boardMarkup(
  game: PuzzleGame,
  compact: boolean,
  label: string,
  boardId: "player" | "rival",
): string {
  const cells = boardCells(game);
  return `
    <section class="board-shell ${compact ? "compact" : ""}" aria-label="${label}" data-board="${boardId}">
      <div class="board-label">${label}</div>
      <div class="gem-board">${cells
        .map((cell) => {
          const dsAttr = Object.entries(cell.dataset)
            .map(([k, v]) => `data-${k.replace(/([A-Z])/g, "-$1").toLowerCase()}="${v}"`)
            .join(" ");
          return `<span class="${cell.classes}" ${dsAttr}>${cell.text}</span>`;
        })
        .join("")}<div class="gem-fx-layer" aria-hidden="true"></div></div>
    </section>
  `;
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function matchMarkup(): string {
  if (!match) return "";
  const paused = match.phase === "paused";
  const introActive = performance.now() < matchReadyAt;
  return `
    <section class="screen match-screen ${introActive ? "is-intro" : ""}">
      ${stageMarkup()}
      <header class="match-hud">
        ${healthBar(match.playerFighter, true)}
        <button class="timer" data-action="pause"><span data-match-time>${formatTime(match.elapsedMs)}</span><small>Ⅱ</small></button>
        ${healthBar(match.rivalFighter, false)}
      </header>
      <div class="fight-plane">
        ${fighterVisual(match.playerFighter, playerPose, "match-fighter player", "right")}
        <div class="impact-copy ${impactText ? "show" : ""}">${impactText}</div>
        ${fighterVisual(match.rivalFighter, rivalPose, "match-fighter rival", "left")}
      </div>
      <div class="ring-depth-occluder" aria-hidden="true">
        <div class="arena-layer ring-foreground"></div>
      </div>
      <div class="gameplay-layout">
        ${boardMarkup(match.player, false, "YOU", "player")}
        <aside class="match-rail">
          <div class="next-label">NEXT</div>
          <div class="next-pair">
            <span class="gem ${gemClass(match.player.next[0])}" data-next="0"></span>
            <span class="gem ${gemClass(match.player.next[1])}" data-next="1"></span>
          </div>
          <div class="chain-readout"><span>CHAIN</span><strong data-chain>${match.player.chain || "—"}</strong></div>
          <button class="super-button ${match.player.meter >= 100 ? "ready" : ""}" data-action="super">
            <span>SUPER</span>
            <i style="--meter:${match.player.meter}%" data-meter></i>
          </button>
        </aside>
        ${boardMarkup(match.rival, true, "RIVAL", "rival")}
      </div>
      <div class="touch-controls" aria-label="Game controls">
        <button data-command="left" aria-label="Move left">←</button>
        <button data-command="rotate" aria-label="Rotate">↻</button>
        <button data-command="right" aria-label="Move right">→</button>
        <button data-command="drop" class="drop" aria-label="Hard drop">↓</button>
      </div>
      <div class="round-intro ${introActive ? "" : "complete"}" aria-live="polite">
        <span>ROUND 1</span>
        <strong>FIGHT!</strong>
      </div>
      ${
        paused
          ? `<div class="modal-backdrop">
              <div class="pause-panel" role="dialog" aria-modal="true" aria-label="Paused">
                <h2>PAUSED</h2>
                <button class="primary-button" data-action="resume">RESUME</button>
                <div class="pause-controls">ARROWS / SWIPE TO MOVE · TAP / ↑ TO ROTATE · SPACE / ↓ TO DROP</div>
                <button class="secondary-button" data-action="options">AUDIO: ${muted ? "OFF" : "ON"}</button>
                <button class="secondary-button" data-action="quit">QUIT</button>
              </div>
            </div>`
          : ""
      }
    </section>
  `;
}

function resultsMarkup(): string {
  if (!match || !match.winner) return "";
  const winnerIsPlayer = match.winner === match.playerFighter;
  const winnerStats = winnerIsPlayer ? match.player : match.rival;
  return `
    <section class="screen results-screen">
      ${stageMarkup()}
      <div class="winner-heading">
        <span>WINNER</span>
        <strong>${fighterName(match.winner)}</strong>
      </div>
      ${fighterVisual(match.winner, "win", "winner-fighter", "right")}
      <div class="results-stats">
        <div><span>MAX CHAIN</span><strong>${winnerStats.maxChain}</strong></div>
        <div><span>GEMS</span><strong>${winnerStats.cleared}</strong></div>
        <div><span>TIME</span><strong>${formatTime(match.elapsedMs)}</strong></div>
      </div>
      <div class="results-actions">
        <button class="primary-button" data-action="rematch">REMATCH</button>
        <button class="secondary-button" data-action="home">HOME</button>
      </div>
    </section>
  `;
}

function render(): void {
  renderDirty = false;
  lastMatchPatchAt = 0;
  screenRoot.innerHTML =
    screen === "title"
      ? titleMarkup()
      : screen === "select"
        ? selectMarkup()
        : screen === "match"
          ? matchMarkup()
          : resultsMarkup();
  bindInteractions();
  applyParallax();
  if (screen === "match") updateMatchDom(performance.now());
}

function updateBoardDom(boardId: "player" | "rival", game: PuzzleGame): void {
  const elements = app.querySelectorAll<HTMLElement>(`[data-board="${boardId}"] .gem-board > .gem`);
  const cells = boardCells(game);
  elements.forEach((element, index) => {
    const cell = cells[index];
    if (!cell) return;
    if (element.className !== cell.classes) element.className = cell.classes;
    if (element.textContent !== cell.text) element.textContent = cell.text;

    if (cell.dataset.powerW) {
      element.dataset.powerW = cell.dataset.powerW;
      element.dataset.powerH = cell.dataset.powerH;
      element.dataset.powerRelX = cell.dataset.powerRelX;
      element.dataset.powerRelY = cell.dataset.powerRelY;
    } else {
      delete element.dataset.powerW;
      delete element.dataset.powerH;
      delete element.dataset.powerRelX;
      delete element.dataset.powerRelY;
    }
  });
}

function updateFighterDom(
  role: "player" | "rival",
  fighter: FighterId,
  pose: FighterPose,
  facing: "left" | "right",
): void {
  const frame = app.querySelector<HTMLElement>(`.match-fighter.${role}`);
  const sprite = frame?.querySelector<HTMLElement>(".fighter-sprite");
  if (!frame || !sprite) return;
  if (frame.dataset.pose !== pose) {
    (["idle", "attack", "hurt", "win"] as FighterPose[]).forEach((value) =>
      frame.classList.toggle(`pose-${value}`, value === pose),
    );
    const flip = "right" !== facing;
    sprite.setAttribute("style", spriteStyle(fighter, pose, flip));
    frame.dataset.pose = pose;
  }
}

function updateMatchDom(now = performance.now()): void {
  if (!match || screen !== "match") return;
  const matchScreen = app.querySelector<HTMLElement>(".match-screen");
  if (!matchScreen) return;

  const introActive = now < matchReadyAt;
  matchScreen.classList.toggle("is-intro", introActive);
  const intro = matchScreen.querySelector<HTMLElement>(".round-intro");
  intro?.classList.toggle("complete", !introActive);

  const timer = matchScreen.querySelector<HTMLElement>("[data-match-time]");
  if (timer) timer.textContent = formatTime(match.elapsedMs);

  updateBoardDom("player", match.player);
  updateBoardDom("rival", match.rival);

  match.player.next.forEach((gem, index) => {
    const next = matchScreen.querySelector<HTMLElement>(`[data-next="${index}"]`);
    const classes = `gem ${gemClass(gem)}`;
    if (next && next.className !== classes) next.className = classes;
  });
  const chain = matchScreen.querySelector<HTMLElement>("[data-chain]");
  if (chain) chain.textContent = String(match.player.chain || "—");
  const superButton = matchScreen.querySelector<HTMLElement>(".super-button");
  superButton?.classList.toggle("ready", match.player.meter >= 100);
  matchScreen
    .querySelector<HTMLElement>("[data-meter]")
    ?.style.setProperty("--meter", `${match.player.meter}%`);

  updateFighterDom("player", match.playerFighter, playerPose, "right");
  updateFighterDom("rival", match.rivalFighter, rivalPose, "left");
  const impact = matchScreen.querySelector<HTMLElement>(".impact-copy");
  if (impact) {
    impact.textContent = impactText;
    impact.classList.toggle("show", Boolean(impactText));
  }
}

function bindInteractions(): void {
  app.querySelectorAll<HTMLElement>("[data-action]").forEach((element) => {
    element.addEventListener("click", () => handleAction(element.dataset.action ?? ""));
  });
  app.querySelectorAll<HTMLElement>("[data-fighter]").forEach((element) => {
    element.addEventListener("click", () => {
      selectedFighter = element.dataset.fighter as FighterId;
      renderDirty = true;
      render();
    });
  });
  app.querySelectorAll<HTMLElement>("[data-command]").forEach((element) => {
    element.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      handleCommand(element.dataset.command ?? "");
    });
  });

  const playerBoard = app.querySelector<HTMLElement>(".board-shell:not(.compact)");
  if (playerBoard) bindGestures(playerBoard);
}

function handleAction(action: string): void {
  unlockAudio();
  switch (action) {
    case "fight":
      screen = "select";
      break;
    case "confirm":
      startMatch(selectedFighter);
      return;
    case "pause":
    case "resume":
      if (performance.now() < matchReadyAt) return;
      match?.togglePause();
      break;
    case "options":
      muted = !muted;
      audio.title.muted = muted;
      audio.match.muted = muted;
      arcadeAudio.setMuted(muted);
      break;
    case "super":
      if (match?.usePlayerSuper()) {
        playerPose = "attack";
        rivalPose = "hurt";
        impactText = "SUPER!";
        arcadeAudio.play("super");
        triggerScreenShake(500);
        poseResetAt = performance.now() + 500;
        impactResetAt = performance.now() + 700;
      }
      updateMatchDom();
      return;
    case "rematch":
      startMatch(selectedFighter);
      return;
    case "quit":
    case "home":
      goHome();
      return;
  }
  renderDirty = true;
  render();
}

function handleCommand(command: string): void {
  if (!match || match.phase !== "playing" || performance.now() < matchReadyAt) return;
  switch (command) {
    case "left":
      if (match.movePlayer(-1)) arcadeAudio.play("move");
      break;
    case "right":
      if (match.movePlayer(1)) arcadeAudio.play("move");
      break;
    case "rotate":
      if (match.rotatePlayer()) arcadeAudio.play("rotate");
      break;
    case "soft":
      match.softDropPlayer();
      arcadeAudio.play("land");
      break;
    case "drop":
      match.hardDropPlayer();
      arcadeAudio.play("land");
      break;
  }
  processMatchEvents();
  if (screen === "match") updateMatchDom();
  else render();
}

function bindGestures(element: HTMLElement): void {
  let startX = 0;
  let startY = 0;
  element.addEventListener("pointerdown", (event) => {
    startX = event.clientX;
    startY = event.clientY;
    element.setPointerCapture(event.pointerId);
  });
  element.addEventListener("pointerup", (event) => {
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) < 22 && Math.abs(dy) < 22) handleCommand("rotate");
    else if (Math.abs(dx) > Math.abs(dy)) handleCommand(dx > 0 ? "right" : "left");
    else if (dy > 45) handleCommand("drop");
  });
}

function startMatch(fighter: FighterId = selectedFighter): void {
  selectedFighter = fighter;
  match = new MatchGame(20260727, fighter);
  screen = "match";
  playerPose = "idle";
  rivalPose = "idle";
  impactText = "";
  const now = performance.now();
  matchReadyAt = now + MATCH_INTRO_MS;
  poseResetAt = 0;
  impactResetAt = 0;
  accumulator = 0;
  lastFrame = now;
  audio.title.pause();
  audio.title.currentTime = 0;
  audio.match.currentTime = 0;
  void audio.match.play().catch(() => undefined);
  arcadeAudio.play("fight");
  renderDirty = true;
  render();
}

function goHome(): void {
  screen = "title";
  match = null;
  matchReadyAt = 0;
  audio.match.pause();
  audio.match.currentTime = 0;
  void audio.title.play().catch(() => undefined);
  renderDirty = true;
  render();
}

function unlockAudio(): void {
  if (screen === "title" && audio.title.paused) void audio.title.play().catch(() => undefined);
}

function triggerScreenShake(durationMs = 400): void {
  const matchScreen = app.querySelector<HTMLElement>(".match-screen");
  if (!matchScreen) return;
  matchScreen.classList.remove("screen-shake");
  void matchScreen.offsetWidth;
  matchScreen.classList.add("screen-shake");
  window.setTimeout(() => matchScreen.classList.remove("screen-shake"), durationMs);
}

function processMatchEvents(): void {
  if (!match) return;
  for (const event of match.consumeEvents()) applyMatchEvent(event);
  if (match.phase === "results") {
    screen = "results";
    audio.match.volume = 0.18;
    arcadeAudio.play("victory");
    renderDirty = true;
  }
}

function applyMatchEvent(event: MatchEvent): void {
  if ((event.delayMs ?? 0) > 0) {
    window.setTimeout(() => applyMatchEvent({ ...event, delayMs: 0 }), event.delayMs);
    return;
  }
  const actorIsPlayer = event.actor === "player";
  if (event.type === "land") {
    spawnGemEffects(event.actor, event.cells ?? [], "land");
    pulseBoard(event.actor, "board-landed", 300);
    setGemFeedback(`${event.actor} locked a pair`, 360);
    arcadeAudio.play("land");
    vibrate(8);
  } else if (event.type === "break") {
    const isPowerBreak = event.cells?.some((c) => Boolean(c.gem.powerGem));
    spawnGemEffects(event.actor, event.cells ?? [], "break");
    pulseBoard(event.actor, "board-breaking", 520);
    setGemFeedback(
      `${event.actor} broke ${event.cells?.length ?? 0} gems at chain ${event.value ?? 1}`,
      700,
    );
    if (isPowerBreak) {
      arcadeAudio.play("powerBreak");
      triggerScreenShake(350);
    } else {
      arcadeAudio.play("break");
    }
    vibrate((event.value ?? 1) > 1 ? [16, 28, 24] : 18);
  } else if (event.type === "garbage") {
    spawnGemEffects(event.actor, event.cells ?? [], "garbage");
    pulseBoard(event.actor, "board-garbage", 520);
    setGemFeedback(`${event.actor} received ${event.cells?.length ?? 0} counter gems`, 620);
    vibrate([10, 22, 10]);
  }
  if (event.type === "attack" || event.type === "super") {
    playerPose = actorIsPlayer ? "attack" : "hurt";
    rivalPose = actorIsPlayer ? "hurt" : "attack";
    poseResetAt = performance.now() + 360;
  }
  if (event.type === "chain") {
    impactText = `${event.value} CHAIN!`;
    impactResetAt = performance.now() + 650;
    arcadeAudio.play("chain", event.value ?? 1);
    triggerScreenShake(300 + (event.value ?? 1) * 80);
  } else if (event.type === "super") {
    impactText = "SUPER!";
    impactResetAt = performance.now() + 650;
    arcadeAudio.play("super");
    triggerScreenShake(500);
  }
}


function setGemFeedback(message: string, durationMs: number): void {
  gemFeedback = message;
  gemFeedbackResetAt = performance.now() + durationMs;
}

function pulseBoard(actor: "player" | "rival", className: string, durationMs: number): void {
  const board = app.querySelector<HTMLElement>(`[data-board="${actor}"]`);
  if (!board) return;
  board.classList.remove(className);
  void board.offsetWidth;
  board.classList.add(className);
  window.setTimeout(() => board.classList.remove(className), durationMs);
}

function spawnGemEffects(
  actor: "player" | "rival",
  cells: ResolvedCell[],
  mode: "land" | "break" | "garbage",
): void {
  const layer = app.querySelector<HTMLElement>(`[data-board="${actor}"] .gem-fx-layer`);
  if (!layer) return;
  cells.forEach((cell, index) => {
    const effect = document.createElement("span");
    effect.className = `gem-fx ${mode} ${gemClass(cell.gem)}`;
    effect.style.setProperty("--cell-x", String(cell.x));
    effect.style.setProperty("--cell-y", String(cell.y));
    effect.style.setProperty("--fx-delay", `${index * 24}ms`);
    effect.style.left = `${((cell.x + 0.5) / BOARD_WIDTH) * 100}%`;
    effect.style.top = `${((cell.y + 0.5) / BOARD_HEIGHT) * 100}%`;
    layer.append(effect);
    const lifetime = mode === "break" ? 1250 : mode === "garbage" ? 1040 : 880;
    window.setTimeout(() => effect.remove(), lifetime);
  });
}

function vibrate(pattern: number | number[]): void {
  if ("vibrate" in navigator) navigator.vibrate(pattern);
}

let currentEngine: { resize: () => void } | null = null;

async function initBabylon(): Promise<void> {
  if (currentEngine) return;
  const canvas = document.querySelector<HTMLCanvasElement>("#scene-canvas");
  if (!canvas) return;
  await Promise.all([
    import("@babylonjs/core/Shaders/default.vertex"),
    import("@babylonjs/core/Shaders/default.fragment"),
  ]);
  const [
    { FreeCamera },
    { Engine },
    { HemisphericLight },
    { StandardMaterial },
    { Color3, Color4 },
    { Vector3 },
    { CreateSphere },
    { Scene },
  ] = await Promise.all([
    import("@babylonjs/core/Cameras/freeCamera"),
    import("@babylonjs/core/Engines/engine"),
    import("@babylonjs/core/Lights/hemisphericLight"),
    import("@babylonjs/core/Materials/standardMaterial"),
    import("@babylonjs/core/Maths/math.color"),
    import("@babylonjs/core/Maths/math.vector"),
    import("@babylonjs/core/Meshes/Builders/sphereBuilder"),
    import("@babylonjs/core/scene"),
  ]);
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true }, true);
  currentEngine = engine;
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 0);
  const camera = new FreeCamera("camera", new Vector3(0, 0, -10), scene);
  camera.setTarget(Vector3.Zero());
  new HemisphericLight("ambient", new Vector3(0, 1, 0), scene).intensity = 0.6;

  const colors = [new Color3(0.1, 0.45, 1), new Color3(1, 0.55, 0.08)];
  for (let i = 0; i < 18; i += 1) {
    const orb = CreateSphere(`orb-${i}`, { diameter: 0.035 + (i % 4) * 0.012 }, scene);
    orb.position = new Vector3(-4.5 + ((i * 1.37) % 9), -2.2 + ((i * 0.79) % 4.6), 0);
    const material = new StandardMaterial(`glow-${i}`, scene);
    material.emissiveColor = colors[i % colors.length];
    material.alpha = 0.25 + (i % 3) * 0.12;
    orb.material = material;
  }
  engine.runRenderLoop(() => {
    if (!currentEngine || currentEngine !== engine) return;
    scene.meshes.forEach((mesh, index) => {
      mesh.position.y += Math.sin(performance.now() * 0.0007 + index) * 0.0008;
    });
    scene.render();
  });
  window.addEventListener("resize", () => engine.resize());
}

function applyParallax(): void {
  const layers = app.querySelectorAll<HTMLElement>(".arena-layer");
  layers.forEach((layer) => {
    const depth = layer.classList.contains("venue-far")
      ? 0.1
      : layer.classList.contains("ring-mid")
        ? 0.65
        : 1;
    layer.style.transform = `translate3d(${renderedParallaxX * depth}px, ${renderedParallaxY * depth}px, 0) scale(${1.04 + depth * 0.01})`;
  });
}

window.addEventListener("pointermove", (event) => {
  parallaxX = (event.clientX / window.innerWidth - 0.5) * -14;
  parallaxY = (event.clientY / window.innerHeight - 0.5) * -8;
});

window.addEventListener("deviceorientation", (event) => {
  if (event.gamma == null || event.beta == null) return;
  parallaxX = Math.max(-12, Math.min(12, event.gamma * -0.4));
  parallaxY = Math.max(-7, Math.min(7, (event.beta - 45) * -0.16));
});

window.addEventListener("keydown", (event) => {
  if (import.meta.env.DEV && event.key.toLowerCase() === "g") {
    event.preventDefault();
    window.__ringRush.showcaseGems();
    return;
  }
  if (import.meta.env.DEV && event.key.toLowerCase() === "p") {
    event.preventDefault();
    document.documentElement.classList.toggle("qa-freeze-gem-fx");
    return;
  }
  if (event.key === "f") {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen();
    return;
  }
  if (
    event.key === "Escape" &&
    match?.phase === "playing" &&
    performance.now() >= matchReadyAt
  ) {
    match.togglePause();
    renderDirty = true;
    return;
  }
  const map: Record<string, string> = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "rotate",
    ArrowDown: "soft",
    " ": "drop",
    s: "super",
  };
  const command = map[event.key];
  if (command) {
    event.preventDefault();
    handleCommand(command);
  }
});

function fixedUpdate(deltaMs: number): void {
  if (!match || screen !== "match") return;
  if (performance.now() < matchReadyAt) return;
  match.update(deltaMs);
  processMatchEvents();
  if (performance.now() >= poseResetAt && (playerPose !== "idle" || rivalPose !== "idle")) {
    playerPose = "idle";
    rivalPose = "idle";
    renderDirty = true;
  }
  if (performance.now() >= impactResetAt && impactText) {
    impactText = "";
    renderDirty = true;
  }
  if (performance.now() >= gemFeedbackResetAt && gemFeedback !== "idle") {
    gemFeedback = "idle";
  }
}

function frame(now: number): void {
  const delta = Math.min(50, now - lastFrame);
  lastFrame = now;
  if (now >= manualUntil) {
    accumulator += delta;
    while (accumulator >= 1000 / 60) {
      fixedUpdate(1000 / 60);
      accumulator -= 1000 / 60;
    }
  }
  if (renderDirty) render();
  else if (match && screen === "match" && now - lastMatchPatchAt >= MATCH_PATCH_MS) {
    updateMatchDom(now);
    lastMatchPatchAt = now;
  }

  renderedParallaxX += (parallaxX - renderedParallaxX) * Math.min(1, delta / 90);
  renderedParallaxY += (parallaxY - renderedParallaxY) * Math.min(1, delta / 90);
  if (
    Math.abs(parallaxX - renderedParallaxX) > 0.01 ||
    Math.abs(parallaxY - renderedParallaxY) > 0.01
  ) {
    applyParallax();
  }
  requestAnimationFrame(frame);
}

window.advanceTime = (ms: number) => {
  manualUntil = performance.now() + 100;
  matchReadyAt = 0;
  const steps = Math.max(1, Math.round(ms / (1000 / 60)));
  for (let i = 0; i < steps; i += 1) fixedUpdate(1000 / 60);
  if (screen === "match") updateMatchDom();
  else render();
};

window.render_game_to_text = () => {
  const payload = {
    coordinateSystem: "Puzzle boards use x=0..5 left-to-right and y=0..11 top-to-bottom.",
    screen,
    selectedFighter,
    muted,
    gemFeedback,
    match: match
      ? {
          phase: match.phase,
          ready: performance.now() >= matchReadyAt,
          elapsedMs: Math.round(match.elapsedMs),
          playerFighter: match.playerFighter,
          rivalFighter: match.rivalFighter,
          fighters: {
            player: { id: match.playerFighter, pose: playerPose, facing: "right" },
            rival: { id: match.rivalFighter, pose: rivalPose, facing: "left" },
          },
          winner: match.winner,
          player: {
            active: match.player.active,
            board: match.player.board,
            next: match.player.next,
            score: match.player.score,
            meter: match.player.meter,
            chain: match.player.chain,
            topOut: match.player.topOut,
          },
          rival: {
            active: match.rival.active,
            board: match.rival.board,
            score: match.rival.score,
            meter: match.rival.meter,
            chain: match.rival.chain,
            topOut: match.rival.topOut,
          },
        }
      : null,
    controls: {
      keyboard: "arrows move/rotate/drop, space hard-drops, S uses super, Esc pauses, F fullscreen",
      touch: "tap rotates, horizontal swipe moves, downward swipe hard-drops",
    },
  };
  return JSON.stringify(payload);
};

window.__ringRush = {
  screen: () => screen,
  startMatch,
  finish: (winner) => {
    if (!match) startMatch(selectedFighter);
    if (!match) return;
    match.winner = winner;
    match.phase = "results";
    screen = "results";
    renderDirty = true;
    render();
  },
  showcaseGems: () => {
    if (!match || screen !== "match") startMatch(selectedFighter);
    if (!match) return;
    matchReadyAt = 0;
    const red: Gem = { color: "red", kind: "normal" };
    match.player.board[BOARD_HEIGHT - 1][0] = { ...red };
    match.player.board[BOARD_HEIGHT - 1][1] = { ...red };
    match.player.board[BOARD_HEIGHT - 1][2] = { ...red };
    match.player.active = {
      x: 3,
      y: 8,
      orientation: 0,
      pivot: { ...red },
      satellite: { color: "blue", kind: "normal" },
    };
    match.hardDropPlayer();
    processMatchEvents();
    updateMatchDom();
  },
};

if (new URLSearchParams(window.location.search).get("play") === "1") {
  startMatch(selectedFighter);
}

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
}

render();
window.setTimeout(() => void initBabylon(), 250);
requestAnimationFrame(frame);
