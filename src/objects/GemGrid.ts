import Phaser from 'phaser';
import { COLORS, GRID_COLS, GRID_ROWS } from '../config';
import { Board, GemColor, SpecialGemType, Cell } from '../engine/types';

export class GemGrid extends Phaser.GameObjects.Container {
    private cellSize: number;
    private gemSprites: (Phaser.GameObjects.Container | null)[][];
    private gridGraphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number, cellSize: number = 48) {
        super(scene, x, y);
        this.cellSize = cellSize;
        this.gemSprites = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));

        this.gridGraphics = scene.add.graphics();
        this.drawGridOutline();
        this.add(this.gridGraphics);

        scene.add.existing(this);
    }

    private drawGridOutline() {
        this.gridGraphics.clear();
        this.gridGraphics.lineStyle(2, 0x333333, 0.5); // Subtle dark grey lines

        const width = GRID_COLS * this.cellSize;
        const height = GRID_ROWS * this.cellSize;

        for (let r = 0; r <= GRID_ROWS; r++) {
            this.gridGraphics.moveTo(0, r * this.cellSize);
            this.gridGraphics.lineTo(width, r * this.cellSize);
        }

        for (let c = 0; c <= GRID_COLS; c++) {
            this.gridGraphics.moveTo(c * this.cellSize, 0);
            this.gridGraphics.lineTo(c * this.cellSize, height);
        }
        this.gridGraphics.strokePath();
    }

    public getWorldPosition(row: number, col: number): { x: number, y: number } {
        return {
            x: this.x + col * this.cellSize,
            y: this.y + row * this.cellSize
        };
    }

    private getGemColorHex(color: GemColor | null, special: SpecialGemType | null): number {
        if (special === SpecialGemType.COUNTER) return COLORS.GEM_COUNTER;
        if (special === SpecialGemType.CRASH) return COLORS.GEM_CRASH;

        switch (color) {
            case GemColor.RED: return COLORS.GEM_RED;
            case GemColor.BLUE: return COLORS.GEM_BLUE;
            case GemColor.GREEN: return COLORS.GEM_GREEN;
            case GemColor.YELLOW: return COLORS.GEM_YELLOW;
            case GemColor.PURPLE: return COLORS.GEM_PURPLE;
            default: return 0x000000;
        }
    }

    public updateBoard(board: Board) {
        for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                const cell = board[r][c];
                
                // Remove existing sprite container if there is one
                if (this.gemSprites[r][c]) {
                    this.gemSprites[r][c]!.destroy();
                    this.gemSprites[r][c] = null;
                }

                if (cell) {
                    const gemContainer = this.scene.add.container(
                        c * this.cellSize + this.cellSize / 2,
                        r * this.cellSize + this.cellSize / 2
                    );
                    
                    const colorHex = this.getGemColorHex(cell.color, cell.special);
                    const rect = this.scene.add.rectangle(0, 0, this.cellSize * 0.9, this.cellSize * 0.9, colorHex);
                    gemContainer.add(rect);

                    if (cell.special === SpecialGemType.COUNTER) {
                        const text = this.scene.add.text(0, 0, cell.counterTurns.toString(), {
                            fontFamily: 'monospace',
                            fontSize: `${this.cellSize * 0.5}px`,
                            color: '#ffffff'
                        }).setOrigin(0.5);
                        gemContainer.add(text);
                    } else if (cell.special === SpecialGemType.CRASH) {
                        // Diamond symbol for crash gem
                        const text = this.scene.add.text(0, 0, '◆', {
                            fontFamily: 'monospace',
                            fontSize: `${this.cellSize * 0.6}px`,
                            color: '#000000'
                        }).setOrigin(0.5);
                        gemContainer.add(text);
                    }

                    this.add(gemContainer);
                    this.gemSprites[r][c] = gemContainer;
                }
            }
        }
    }

    public animateMatch(positions: {row: number, col: number}[], onComplete: () => void) {
        const targets: Phaser.GameObjects.Container[] = [];
        for (const pos of positions) {
            const sprite = this.gemSprites[pos.row][pos.col];
            if (sprite) {
                targets.push(sprite);
                const rect = sprite.list[0] as Phaser.GameObjects.Rectangle;
                rect.setFillStyle(0xffffff); // flash white
            }
        }

        this.scene.tweens.add({
            targets: targets,
            alpha: 0,
            duration: 300,
            onComplete: () => {
                for (const pos of positions) {
                    if (this.gemSprites[pos.row][pos.col]) {
                        this.gemSprites[pos.row][pos.col]!.destroy();
                        this.gemSprites[pos.row][pos.col] = null;
                    }
                }
                onComplete();
            }
        });
    }

    public animateGemDrop(fromRow: number, toRow: number, col: number, onComplete: () => void) {
        const sprite = this.gemSprites[fromRow][col];
        if (!sprite) {
            onComplete();
            return;
        }

        this.gemSprites[toRow][col] = sprite;
        this.gemSprites[fromRow][col] = null;

        const targetY = toRow * this.cellSize + this.cellSize / 2;

        this.scene.tweens.add({
            targets: sprite,
            y: targetY,
            duration: 200, // adjust based on gravity logic later
            ease: 'Linear',
            onComplete: () => {
                onComplete();
            }
        });
    }
}
