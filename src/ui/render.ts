import { BoardMatrix, FallingPair, GemColor, GemType } from '../engine/types';
import { COLS, ROWS, getSatelliteOffset } from '../engine/puzzle';

const COLOR_MAP: Record<GemColor, { fill: string; stroke: string; glow: string }> = {
  red: { fill: '#ef4444', stroke: '#f87171', glow: 'rgba(239, 68, 68, 0.4)' },
  blue: { fill: '#3b82f6', stroke: '#60a5fa', glow: 'rgba(59, 130, 246, 0.4)' },
  green: { fill: '#22c55e', stroke: '#4ade80', glow: 'rgba(34, 197, 94, 0.4)' },
  yellow: { fill: '#eab308', stroke: '#fde047', glow: 'rgba(234, 179, 8, 0.4)' }
};

export class CanvasGridRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cellSize: number = 24;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    this.resizeCanvas();
  }

  public resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    // Board ratio: 6 columns x 12 rows
    const availableHeight = Math.min(parent.clientHeight - 20, 360);
    this.cellSize = Math.floor(availableHeight / ROWS);

    this.canvas.width = COLS * this.cellSize;
    this.canvas.height = ROWS * this.cellSize;
  }

  public render(board: BoardMatrix, pair: FallingPair | null) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background grid matrix lines
    this.drawGridBackground();

    // Draw settled gems on board
    this.drawBoardGems(board);

    // Draw active falling pair
    if (pair) {
      this.drawFallingPair(pair);
    }
  }

  private drawGridBackground() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.lineWidth = 1;

    for (let r = 0; r <= ROWS; r++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, r * this.cellSize);
      this.ctx.lineTo(this.canvas.width, r * this.cellSize);
      this.ctx.stroke();
    }

    for (let c = 0; c <= COLS; c++) {
      this.ctx.beginPath();
      this.ctx.moveTo(c * this.cellSize, 0);
      this.ctx.lineTo(c * this.cellSize, this.canvas.height);
      this.ctx.stroke();
    }
  }

  private drawBoardGems(board: BoardMatrix) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const gem = board[r][c];
        if (gem) {
          this.drawSingleGem(gem.color, gem.type, c, r, gem.timer);
        }
      }
    }
  }

  private drawFallingPair(pair: FallingPair) {
    // Draw pivot gem
    if (pair.y >= 0 && pair.y < ROWS && pair.x >= 0 && pair.x < COLS) {
      this.drawSingleGem(pair.pivot.color, pair.pivot.type, pair.x, pair.y);
    }

    // Draw satellite gem
    const offset = getSatelliteOffset(pair.rotation);
    const satX = pair.x + offset.dx;
    const satY = pair.y + offset.dy;
    if (satY >= 0 && satY < ROWS && satX >= 0 && satX < COLS) {
      this.drawSingleGem(pair.satellite.color, pair.satellite.type, satX, satY);
    }
  }

  public drawSingleGem(color: GemColor, type: GemType, col: number, row: number, timer?: number) {
    const x = col * this.cellSize;
    const y = row * this.cellSize;
    const s = this.cellSize;
    const palette = COLOR_MAP[color];

    this.ctx.save();

    if (type === 'crash') {
      // Glowing Crash Orb Core
      const cx = x + s / 2;
      const cy = y + s / 2;
      const radius = s * 0.42;

      const grad = this.ctx.createRadialGradient(cx, cy, 2, cx, cy, radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.6, palette.fill);
      grad.addColorStop(1, '#000000');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = palette.stroke;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    } else if (type === 'power') {
      // Fused Multi-Cell Power Gem
      this.ctx.fillStyle = palette.fill;
      this.ctx.fillRect(x + 1, y + 1, s - 2, s - 2);

      this.ctx.strokeStyle = '#fbbf24'; // Gold fusion border
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(x + 2, y + 2, s - 4, s - 4);
    } else if (type === 'counter') {
      // Counter Gem with Countdown Badge
      this.ctx.fillStyle = palette.fill;
      this.ctx.globalAlpha = 0.85;
      this.ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
      this.ctx.globalAlpha = 1.0;

      // Inner gray shield
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(x + 4, y + 4, s - 8, s - 8);

      // Countdown text badge
      if (timer !== undefined) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `bold ${Math.floor(s * 0.55)}px sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(timer.toString(), x + s / 2, y + s / 2);
      }
    } else {
      // Faceted Normal Gem
      this.ctx.fillStyle = palette.fill;
      this.ctx.fillRect(x + 2, y + 2, s - 4, s - 4);

      // Inner bevel highlights
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      this.ctx.beginPath();
      this.ctx.moveTo(x + 2, y + 2);
      this.ctx.lineTo(x + s - 2, y + 2);
      this.ctx.lineTo(x + s - 6, y + 6);
      this.ctx.lineTo(x + 6, y + 6);
      this.ctx.fill();

      this.ctx.strokeStyle = palette.stroke;
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x + 2, y + 2, s - 4, s - 4);
    }

    this.ctx.restore();
  }
}
