import './style.css';
import { GameScreen, PlayerState, FighterStats } from './engine/types';
import { FIGHTER_ROSTER } from './engine/fighters';
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
  decrementCounterGems
} from './engine/puzzle';
import { arcadeAudio } from './engine/audio';
import { CanvasGridRenderer } from './ui/render';
import { FighterAnimationView } from './ui/fighters-view';
import { InputControlsManager } from './ui/controls';

class GameController {
  private appContainer: HTMLElement;
  private currentScreen: GameScreen = 'title';

  // Selection state
  private selectedP1Fighter: FighterStats = FIGHTER_ROSTER.broner;
  private selectedP2Fighter: FighterStats = FIGHTER_ROSTER.deen;

  // Active match state
  private p1State!: PlayerState;
  private p2State!: PlayerState;
  private gameLoopId: number | null = null;
  private p1DropTimer: number = 0;

  // Renderers
  private p1Renderer: CanvasGridRenderer | null = null;
  private p2Renderer: CanvasGridRenderer | null = null;
  private p1FighterView: FighterAnimationView | null = null;
  private p2FighterView: FighterAnimationView | null = null;

  constructor() {
    const el = document.getElementById('app');
    if (!el) throw new Error('#app root element missing');
    this.appContainer = el;

    this.showTitleScreen();
    this.attachGlobalDelegation();
  }

  private attachGlobalDelegation() {
    this.appContainer.addEventListener('click', (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-btn]') as HTMLElement | null;
      if (!target) return;

      const btnType = target.getAttribute('data-btn');
      if (btnType === 'sound-toggle') {
        const muted = arcadeAudio.toggleMute();
        target.textContent = muted ? '🔇 SOUND OFF' : '🔊 SOUND ON';
      } else if (btnType === 'start-game') {
        this.showSelectScreen();
      } else if (btnType === 'confirm-select') {
        this.startMatchIntro();
      } else if (btnType === 'restart-game') {
        this.showTitleScreen();
      }
    });
  }

  /* ---------------- TITLE SCREEN ---------------- */
  private showTitleScreen() {
    this.currentScreen = 'title';
    this.appContainer.innerHTML = `
      <div class="top-bar">
        <div class="logo-text">RING RUSH: PUZZLE BOXING</div>
        <button class="icon-btn" data-btn="sound-toggle">${arcadeAudio.getMuted() ? '🔇 SOUND OFF' : '🔊 SOUND ON'}</button>
      </div>

      <div class="title-screen">
        <div class="title-badge">Capcom Arcade Versus Engine</div>
        <h1 class="title-header">
          RING RUSH
          <span class="title-sub">PUZZLE BOXING</span>
        </h1>

        <div class="sparring-plane">
          <div style="font-family: 'Teko', sans-serif; font-size: 42px; font-weight: 700; color: #fbbf24;">ADRIEN BRONER</div>
          <div style="font-family: 'Teko', sans-serif; font-size: 32px; font-weight: 700; color: #ef4444;">VS</div>
          <div style="font-family: 'Teko', sans-serif; font-size: 42px; font-weight: 700; color: #3b82f6;">DEEN THE GREAT</div>
        </div>

        <button class="btn-primary" data-btn="start-game">PRESS START</button>
      </div>
    `;
  }

  /* ---------------- CHARACTER SELECT SCREEN ---------------- */
  private showSelectScreen() {
    this.currentScreen = 'select';
    const rosterList = Object.values(FIGHTER_ROSTER);

    this.appContainer.innerHTML = `
      <div class="top-bar">
        <div class="logo-text">CHARACTER SELECT</div>
        <button class="icon-btn" data-btn="sound-toggle">${arcadeAudio.getMuted() ? '🔇 SOUND OFF' : '🔊 SOUND ON'}</button>
      </div>

      <div class="select-screen">
        <div class="select-title">CHOOSE YOUR FIGHTER</div>

        <div class="roster-grid" id="roster-grid">
          ${rosterList.map(f => `
            <div class="fighter-card ${f.id === this.selectedP1Fighter.id ? 'selected' : ''}" data-fighter-id="${f.id}">
              <div class="fighter-avatar" style="border-color: ${f.themeColor}">${f.name.split(' ').map(n=>n[0]).join('')}</div>
              <div class="fighter-name">${f.name}</div>
              <div class="fighter-nick">${f.nickname}</div>
            </div>
          `).join('')}
        </div>

        <div class="fighter-stats-panel" id="stats-panel">
          ${this.renderStatsHTML(this.selectedP1Fighter)}
        </div>

        <button class="btn-primary" data-btn="confirm-select">FIGHT!</button>
      </div>
    `;

    // Attach card click handlers
    const grid = document.getElementById('roster-grid');
    if (grid) {
      grid.addEventListener('click', (e: MouseEvent) => {
        const card = (e.target as HTMLElement).closest('[data-fighter-id]') as HTMLElement | null;
        if (!card) return;

        const fId = card.getAttribute('data-fighter-id');
        if (fId && FIGHTER_ROSTER[fId]) {
          this.selectedP1Fighter = FIGHTER_ROSTER[fId];

          // Pick random rival for P2 (or default to Deen if P1 is Deen)
          const availableRivals = rosterList.filter(f => f.id !== fId);
          this.selectedP2Fighter = availableRivals[Math.floor(Math.random() * availableRivals.length)];

          // Update UI
          document.querySelectorAll('.fighter-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');

          const statsPanel = document.getElementById('stats-panel');
          if (statsPanel) {
            statsPanel.innerHTML = this.renderStatsHTML(this.selectedP1Fighter);
          }
        }
      });
    }
  }

  private renderStatsHTML(f: FighterStats): string {
    return `
      <div class="stats-header">
        <div>${f.name} <span style="font-size: 16px; color: #a1a1aa;">"${f.nickname}"</span></div>
        <div style="font-size: 18px; color: ${f.themeColor}">${f.division}</div>
      </div>
      <div class="stats-row">
        <span>HEALTH</span>
        <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${(f.health / 1300) * 100}%;"></div></div>
      </div>
      <div class="stats-row">
        <span>POWER</span>
        <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${f.attackMultiplier * 70}%;"></div></div>
      </div>
      <div class="stats-row">
        <span>SPEED</span>
        <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${f.moveSpeed * 70}%;"></div></div>
      </div>
      <div style="font-size: 12px; color: var(--gold); margin-top: 8px;">
        <strong>PASSIVE:</strong> ${f.passiveName} — ${f.passiveDesc}
      </div>
      <div style="font-size: 12px; color: #ef4444; margin-top: 4px;">
        <strong>SUPER:</strong> ${f.superName} — ${f.superDesc}
      </div>
    `;
  }

  /* ---------------- MATCH INTRO & BATTLE ---------------- */
  private startMatchIntro() {
    this.currentScreen = 'battle';

    // Initialize player states
    this.p1State = {
      id: 'p1',
      fighter: { ...this.selectedP1Fighter },
      board: createEmptyBoard(),
      fallingPair: createFallingPair(),
      nextPair: { pivot: createFallingPair().pivot, satellite: createFallingPair().satellite },
      health: this.selectedP1Fighter.health,
      superMeter: 0,
      isSuperReady: false,
      score: 0,
      maxChain: 0,
      totalClears: 0,
      pendingCounterGems: 0,
      stance: 'idle',
      stanceFrame: 0,
      stanceTimer: 0
    };

    this.p2State = {
      id: 'p2',
      fighter: { ...this.selectedP2Fighter },
      board: createEmptyBoard(),
      fallingPair: createFallingPair(),
      nextPair: { pivot: createFallingPair().pivot, satellite: createFallingPair().satellite },
      health: this.selectedP2Fighter.health,
      superMeter: 0,
      isSuperReady: false,
      score: 0,
      maxChain: 0,
      totalClears: 0,
      pendingCounterGems: 0,
      stance: 'idle',
      stanceFrame: 0,
      stanceTimer: 0
    };

    this.renderBattleScreenHTML();
    this.initBattleComponents();
    this.startMainGameLoop();
  }

  private renderBattleScreenHTML() {
    this.appContainer.innerHTML = `
      <div class="top-bar">
        <div class="logo-text">RING RUSH</div>
        <button class="icon-btn" data-btn="sound-toggle">${arcadeAudio.getMuted() ? '🔇 SOUND OFF' : '🔊 SOUND ON'}</button>
      </div>

      <div class="battle-screen">
        <!-- Fight Stance Plane -->
        <div class="fight-plane">
          <!-- P1 HP Bar -->
          <div class="hp-bar-container p1">
            <div class="hp-name">${this.p1State.fighter.name}</div>
            <div class="hp-track"><div class="hp-fill" id="p1-hp-fill" style="width: 100%;"></div></div>
            <div class="super-track"><div class="super-fill" id="p1-super-fill" style="width: 0%;"></div></div>
          </div>

          <!-- In-Ring Fighters -->
          <div id="p1-fighter-container"></div>
          <div id="p2-fighter-container"></div>

          <!-- P2 HP Bar -->
          <div class="hp-bar-container p2">
            <div class="hp-name">${this.p2State.fighter.name}</div>
            <div class="hp-track"><div class="hp-fill" id="p2-hp-fill" style="width: 100%;"></div></div>
            <div class="super-track"><div class="super-fill" id="p2-super-fill" style="width: 0%;"></div></div>
          </div>
        </div>

        <!-- Dual Puzzle Boards -->
        <div class="dual-boards">
          <canvas id="p1-canvas" class="game-canvas"></canvas>
          <canvas id="p2-canvas" class="game-canvas"></canvas>
        </div>

        <!-- Mobile Touch Ergonomics Panel (58px+ Touch Targets) -->
        <div class="mobile-controls" id="touch-controls">
          <div class="dpad-row">
            <button class="ctrl-btn" data-action="left">◄</button>
            <button class="ctrl-btn" data-action="rotate">↻</button>
            <button class="ctrl-btn" data-action="right">►</button>
          </div>
          <div class="dpad-row">
            <button class="ctrl-btn" data-action="down">▼</button>
            <button class="ctrl-btn" data-action="drop">⚡ DROP</button>
            <button class="ctrl-btn super-btn" data-action="super">🔥 SUPER</button>
          </div>
        </div>
      </div>
    `;
  }

  private initBattleComponents() {
    const c1 = document.getElementById('p1-canvas') as HTMLCanvasElement;
    const c2 = document.getElementById('p2-canvas') as HTMLCanvasElement;

    if (c1) this.p1Renderer = new CanvasGridRenderer(c1);
    if (c2) this.p2Renderer = new CanvasGridRenderer(c2);

    const f1 = document.getElementById('p1-fighter-container');
    const f2 = document.getElementById('p2-fighter-container');

    if (f1) this.p1FighterView = new FighterAnimationView(f1, this.p1State.fighter, false);
    if (f2) this.p2FighterView = new FighterAnimationView(f2, this.p2State.fighter, true);

    const ctrlEl = document.getElementById('touch-controls');
    if (ctrlEl) {
      new InputControlsManager(ctrlEl, {
        onLeft: () => this.handleP1Input('left'),
        onRight: () => this.handleP1Input('right'),
        onRotate: () => this.handleP1Input('rotate'),
        onSoftDrop: () => this.handleP1Input('soft'),
        onHardDrop: () => this.handleP1Input('hard'),
        onSuper: () => this.handleP1Input('super')
      });
    }
  }

  private handleP1Input(action: 'left' | 'right' | 'rotate' | 'soft' | 'hard' | 'super') {
    if (!this.p1State.fallingPair) return;

    if (action === 'left') {
      const { pair, moved } = movePair(this.p1State.board, this.p1State.fallingPair, -1, 0);
      if (moved) this.p1State.fallingPair = pair;
    } else if (action === 'right') {
      const { pair, moved } = movePair(this.p1State.board, this.p1State.fallingPair, 1, 0);
      if (moved) this.p1State.fallingPair = pair;
    } else if (action === 'rotate') {
      this.p1State.fallingPair = rotatePair(this.p1State.board, this.p1State.fallingPair);
    } else if (action === 'soft') {
      const { pair, moved } = movePair(this.p1State.board, this.p1State.fallingPair, 0, 1);
      if (moved) {
        this.p1State.fallingPair = pair;
        this.p1State.superMeter = Math.min(100, this.p1State.superMeter + 1);
      }
    } else if (action === 'hard') {
      this.p1State.fallingPair = hardDropPair(this.p1State.board, this.p1State.fallingPair);
      arcadeAudio.playDrop();
      this.lockAndEvaluateP1();
    } else if (action === 'super' && this.p1State.superMeter >= 100) {
      this.triggerSuperFinisher(this.p1State, this.p2State, this.p1FighterView);
    }
  }

  private lockAndEvaluateP1() {
    if (!this.p1State.fallingPair) return;
    this.p1State.board = lockPairToBoard(this.p1State.board, this.p1State.fallingPair);
    this.p1State.fallingPair = null;

    // Apply gravity, fusion, detonation loop
    let chainCount = 0;
    while (true) {
      const { board: gravBoard } = applyGravity(this.p1State.board);
      this.p1State.board = fusePowerGems(gravBoard);

      const { board: detBoard, clearedCount, powerGemBonus } = checkAndDetonate(this.p1State.board);

      if (clearedCount > 0) {
        chainCount++;
        arcadeAudio.playCrash();
        this.p1State.board = detBoard;
        this.p1State.totalClears += clearedCount;

        // Fighter punch visualizer stance
        if (this.p1FighterView) {
          this.p1FighterView.setStance('jab');
          arcadeAudio.playPunch();
          setTimeout(() => this.p1FighterView?.setStance('idle'), 300);
        }

        // Damage & Garbage calculation
        const garbage = calculateGarbage(clearedCount, powerGemBonus, chainCount - 1);
        const damage = Math.floor((clearedCount * 20 + powerGemBonus * 30) * this.p1State.fighter.attackMultiplier);

        this.applyAttack(this.p1State, this.p2State, damage, garbage);
      } else {
        break;
      }
    }

    // Decrement counter gem timers
    this.p1State.board = decrementCounterGems(this.p1State.board);

    // Spawn next pair
    if (!isBoardToppedOut(this.p1State.board)) {
      this.p1State.fallingPair = createFallingPair(this.p1State.nextPair.pivot, this.p1State.nextPair.satellite);
      this.p1State.nextPair = { pivot: createFallingPair().pivot, satellite: createFallingPair().satellite };
    } else {
      this.triggerKO(this.p2State, this.p1State);
    }
  }

  private applyAttack(attacker: PlayerState, defender: PlayerState, damage: number, garbage: number) {
    defender.health = Math.max(0, defender.health - damage);

    const defenderView = defender.id === 'p1' ? this.p1FighterView : this.p2FighterView;
    if (defenderView) {
      defenderView.setStance('flinch');
      setTimeout(() => defenderView.setStance('idle'), 300);
    }

    if (garbage > 0) {
      defender.board = dropGarbage(defender.board, garbage, attacker.fighter.counterDropPattern);
    }

    // Charge attacker SUPER meter
    attacker.superMeter = Math.min(100, attacker.superMeter + 12);
    if (attacker.superMeter >= 100 && !attacker.isSuperReady) {
      attacker.isSuperReady = true;
      arcadeAudio.playSuperChime();
    }

    this.updateHPUI();

    if (defender.health <= 0) {
      this.triggerKO(attacker, defender);
    }
  }

  private triggerSuperFinisher(attacker: PlayerState, defender: PlayerState, fighterView: FighterAnimationView | null) {
    attacker.superMeter = 0;
    attacker.isSuperReady = false;

    if (fighterView) {
      fighterView.setStance('super');
      arcadeAudio.playPunch();
      setTimeout(() => fighterView.setStance('idle'), 600);
    }

    this.applyAttack(attacker, defender, attacker.fighter.superDamage, 12);
  }

  private triggerKO(winner: PlayerState, _loser: PlayerState) {
    arcadeAudio.playKOBell();
    if (this.gameLoopId) cancelAnimationFrame(this.gameLoopId);

    // Show Victory Card Modal
    const victoryModal = document.createElement('div');
    victoryModal.className = 'victory-modal';
    victoryModal.innerHTML = `
      <div class="victory-card">
        <div class="victory-title">KNOCKOUT!</div>
        <div class="victory-name">${winner.fighter.name} WINS!</div>
        <div style="font-size: 14px; color: var(--gold); margin-bottom: 20px;">
          TOTAL CLEARS: ${winner.totalClears} GEMS
        </div>
        <button class="btn-primary" data-btn="restart-game">PLAY AGAIN</button>
      </div>
    `;
    this.appContainer.appendChild(victoryModal);
  }

  private updateHPUI() {
    const p1Fill = document.getElementById('p1-hp-fill');
    const p2Fill = document.getElementById('p2-hp-fill');

    if (p1Fill) p1Fill.style.width = `${(this.p1State.health / this.p1State.fighter.maxHealth) * 100}%`;
    if (p2Fill) p2Fill.style.width = `${(this.p2State.health / this.p2State.fighter.maxHealth) * 100}%`;

    const p1Super = document.getElementById('p1-super-fill');
    const p2Super = document.getElementById('p2-super-fill');

    if (p1Super) p1Super.style.width = `${this.p1State.superMeter}%`;
    if (p2Super) p2Super.style.width = `${this.p2State.superMeter}%`;
  }

  /* ---------------- MAIN GAME LOOP ---------------- */
  private startMainGameLoop() {
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;

      if (this.currentScreen === 'battle') {
        // Passive drop for P1 (every 800ms)
        this.p1DropTimer += dt;
        if (this.p1DropTimer >= 800) {
          this.p1DropTimer = 0;
          if (this.p1State.fallingPair) {
            const { pair, moved } = movePair(this.p1State.board, this.p1State.fallingPair, 0, 1);
            if (moved) {
              this.p1State.fallingPair = pair;
            } else {
              this.lockAndEvaluateP1();
            }
          }
        }

        // Render dual grids
        this.p1Renderer?.render(this.p1State.board, this.p1State.fallingPair);
        this.p2Renderer?.render(this.p2State.board, this.p2State.fallingPair);
      }

      this.gameLoopId = requestAnimationFrame(loop);
    };

    this.gameLoopId = requestAnimationFrame(loop);
  }
}

// Bootstrap game application on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new GameController();
});
