import Phaser from 'phaser';
import { COLORS, GRID_COLS, GRID_ROWS } from '../config';
import { Board, GemColor, SpecialGemType } from '../engine/types';

export class GemGrid extends Phaser.GameObjects.Container {
    private cellSize: number;
    private gemSprites: (Phaser.GameObjects.Container | null)[][];
    private gridGraphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, x: number, y: number, cellSize: number = 48) {
        super(scene, x, y);
        this.cellSize = cellSize;
        this.gemSprites = Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill(null));

        this.gridGraphics = scene.add.graphics();
        this.drawGridFrame();
        this.add(this.gridGraphics);

        scene.add.existing(this);
    }

    private drawGridFrame() {
        this.gridGraphics.clear();

        const width = GRID_COLS * this.cellSize;
        const height = GRID_ROWS * this.cellSize;

        // Dark Translucent Background Box for Board
        this.gridGraphics.fillStyle(0x0a0a16, 0.85);
        this.gridGraphics.fillRoundedRect(-4, -4, width + 8, height + 8, 8);

        // Gold/Cyan Metallic Outer Border
        this.gridGraphics.lineStyle(3, 0xfbbf24, 0.9);
        this.gridGraphics.strokeRoundedRect(-4, -4, width + 8, height + 8, 8);
        this.gridGraphics.lineStyle(1.5, 0x22d3ee, 0.7);
        this.gridGraphics.strokeRoundedRect(-2, -2, width + 4, height + 4, 6);

        // Grid Cell Dividers
        this.gridGraphics.lineStyle(1, 0x374151, 0.4);
        for (let r = 1; r < GRID_ROWS; r++) {
            this.gridGraphics.moveTo(0, r * this.cellSize);
            this.gridGraphics.lineTo(width, r * this.cellSize);
        }
        for (let c = 1; c < GRID_COLS; c++) {
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

    private getGemIndex(color: GemColor | null, special: SpecialGemType | null): number {
        if (special === SpecialGemType.COUNTER) return 5;
        if (special === SpecialGemType.CRASH) return 6;

        switch (color) {
            case GemColor.RED: return 0;
            case GemColor.BLUE: return 1;
            case GemColor.GREEN: return 2;
            case GemColor.YELLOW: return 3;
            case GemColor.PURPLE: return 4;
            default: return 0;
        }
    }

    public updateBoard(board: Board) {
        for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                const cell = board[r][c];

                if (this.gemSprites[r][c]) {
                    this.gemSprites[r][c]!.destroy();
                    this.gemSprites[r][c] = null;
                }

                if (cell) {
                    const gemContainer = this.scene.add.container(
                        c * this.cellSize + this.cellSize / 2,
                        r * this.cellSize + this.cellSize / 2
                    );

                    const frameIdx = this.getGemIndex(cell.color, cell.special);
                    
                    // Styled Gem Sprite from procedural texture
                    const sprite = this.scene.add.sprite(0, 0, 'gems-styled');
                    sprite.setFrame(frameIdx);
                    sprite.setDisplaySize(this.cellSize * 0.94, this.cellSize * 0.94);
                    gemContainer.add(sprite);

                    // Counter Gem Overlay Number
                    if (cell.special === SpecialGemType.COUNTER) {
                        const counterNum = this.scene.add.text(0, 0, cell.counterTurns.toString(), {
                            fontFamily: 'Impact, sans-serif',
                            fontSize: `${Math.floor(this.cellSize * 0.55)}px`,
                            color: '#ffffff',
                            stroke: '#000000',
                            strokeThickness: 3
                        }).setOrigin(0.5);
                        gemContainer.add(counterNum);
                    }

                    // Crash Gem Sparkling Diamond Symbol Overlay
                    if (cell.special === SpecialGemType.CRASH) {
                        const crashOrb = this.scene.add.text(0, 0, '⚡', {
                            fontFamily: 'sans-serif',
                            fontSize: `${Math.floor(this.cellSize * 0.6)}px`,
                            color: '#ffffff',
                            stroke: '#0284c7',
                            strokeThickness: 3
                        }).setOrigin(0.5);

                        this.scene.tweens.add({
                            targets: crashOrb,
                            scale: { from: 1, to: 1.25 },
                            alpha: { from: 1, to: 0.7 },
                            yoyo: true,
                            repeat: -1,
                            duration: 400
                        });

                        gemContainer.add(crashOrb);
                    }

                    // Power Gem Fused Border Frame
                    if (cell.powerGroup) {
                        const powerBorder = this.scene.add.graphics();
                        powerBorder.lineStyle(2, 0xfbbf24, 0.9);
                        powerBorder.strokeRoundedRect(
                            -this.cellSize * 0.45,
                            -this.cellSize * 0.45,
                            this.cellSize * 0.9,
                            this.cellSize * 0.9,
                            4
                        );
                        gemContainer.add(powerBorder);
                    }

                    this.add(gemContainer);
                    this.gemSprites[r][c] = gemContainer;
                }
            }
        }
    }

    public animateMatch(positions: { row: number; col: number }[], onComplete: () => void) {
        const targets: Phaser.GameObjects.Container[] = [];
        for (const pos of positions) {
            const sprite = this.gemSprites[pos.row][pos.col];
            if (sprite) {
                targets.push(sprite);

                // Spawn hit spark at match position
                const worldPos = this.getWorldPosition(pos.row, pos.col);
                const spark = this.scene.add.sprite(worldPos.x, worldPos.y, 'hit-spark');
                spark.setScale(0.8);
                spark.setDepth(10);
                this.scene.tweens.add({
                    targets: spark,
                    scale: 1.4,
                    alpha: 0,
                    duration: 250,
                    onComplete: () => spark.destroy()
                });
            }
        }

        this.scene.tweens.add({
            targets: targets,
            scale: 1.3,
            alpha: 0,
            duration: 280,
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
            duration: 180,
            ease: 'Bounce.easeOut',
            onComplete: () => {
                onComplete();
            }
        });
    }
}
