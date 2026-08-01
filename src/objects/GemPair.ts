import Phaser from 'phaser';
import { GemGrid } from './GemGrid';
import { Board, GemPair, GemColor, PairOrientation } from '../engine/types';
import { COLORS } from '../config';

export class GemPairDisplay extends Phaser.GameObjects.Container {
    private gemGrid: GemGrid;
    private cellSize: number;
    private primaryGem: Phaser.GameObjects.Rectangle;
    private secondaryGem: Phaser.GameObjects.Rectangle;
    
    private ghostPrimary: Phaser.GameObjects.Rectangle;
    private ghostSecondary: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, gemGrid: GemGrid, cellSize: number) {
        super(scene, 0, 0);
        this.gemGrid = gemGrid;
        this.cellSize = cellSize;

        this.primaryGem = scene.add.rectangle(0, 0, cellSize * 0.9, cellSize * 0.9, 0xffffff);
        this.secondaryGem = scene.add.rectangle(0, 0, cellSize * 0.9, cellSize * 0.9, 0xffffff);
        
        this.ghostPrimary = scene.add.rectangle(0, 0, cellSize * 0.9, cellSize * 0.9, 0xffffff, 0.3);
        this.ghostSecondary = scene.add.rectangle(0, 0, cellSize * 0.9, cellSize * 0.9, 0xffffff, 0.3);

        this.add([this.ghostPrimary, this.ghostSecondary, this.primaryGem, this.secondaryGem]);
        this.setVisible(false);
        scene.add.existing(this);
    }

    private getColorHex(color: GemColor): number {
        switch (color) {
            case GemColor.RED: return COLORS.GEM_RED;
            case GemColor.BLUE: return COLORS.GEM_BLUE;
            case GemColor.GREEN: return COLORS.GEM_GREEN;
            case GemColor.YELLOW: return COLORS.GEM_YELLOW;
            case GemColor.PURPLE: return COLORS.GEM_PURPLE;
            default: return 0xffffff;
        }
    }

    public updatePair(pair: GemPair | null) {
        if (!pair) {
            this.setVisible(false);
            return;
        }

        this.setVisible(true);
        this.primaryGem.setFillStyle(this.getColorHex(pair.primaryColor));
        this.secondaryGem.setFillStyle(this.getColorHex(pair.secondaryColor));

        const basePos = this.gemGrid.getWorldPosition(pair.row, pair.col);
        this.primaryGem.setPosition(basePos.x + this.cellSize / 2, basePos.y + this.cellSize / 2);

        let secRow = pair.row;
        let secCol = pair.col;

        switch (pair.orientation) {
            case PairOrientation.HORIZONTAL: secCol += 1; break;
            case PairOrientation.VERTICAL_DOWN: secRow += 1; break;
            case PairOrientation.HORIZONTAL_REVERSE: secCol -= 1; break;
            case PairOrientation.VERTICAL_UP: secRow -= 1; break;
        }

        const secPos = this.gemGrid.getWorldPosition(secRow, secCol);
        this.secondaryGem.setPosition(secPos.x + this.cellSize / 2, secPos.y + this.cellSize / 2);
    }

    public showGhostPreview(board: Board, pair: GemPair) {
        if (!pair) {
            this.ghostPrimary.setVisible(false);
            this.ghostSecondary.setVisible(false);
            return;
        }

        this.ghostPrimary.setVisible(true);
        this.ghostSecondary.setVisible(true);

        this.ghostPrimary.setFillStyle(this.getColorHex(pair.primaryColor), 0.3);
        this.ghostSecondary.setFillStyle(this.getColorHex(pair.secondaryColor), 0.3);

        // Simple mock of drop logic for ghost. Engine should ideally supply this,
        // but for visual purposes, drop until collision.
        let dropRow = pair.row;
        let secDropRow = dropRow;
        let secColOffset = 0;
        let secRowOffset = 0;

        switch (pair.orientation) {
            case PairOrientation.HORIZONTAL: secColOffset = 1; break;
            case PairOrientation.VERTICAL_DOWN: secRowOffset = 1; break;
            case PairOrientation.HORIZONTAL_REVERSE: secColOffset = -1; break;
            case PairOrientation.VERTICAL_UP: secRowOffset = -1; break;
        }

        secDropRow += secRowOffset;

        while (true) {
            const nextRow = dropRow + 1;
            const nextSecRow = nextRow + secRowOffset;
            const secCol = pair.col + secColOffset;

            // Check out of bounds
            if (nextRow >= board.length || nextSecRow >= board.length || nextSecRow < 0) {
                break;
            }

            // Check collision
            if (board[nextRow][pair.col] || board[nextSecRow][secCol]) {
                break;
            }

            dropRow++;
            secDropRow++;
        }

        const primaryPos = this.gemGrid.getWorldPosition(dropRow, pair.col);
        const secondaryPos = this.gemGrid.getWorldPosition(secDropRow, pair.col + secColOffset);

        this.ghostPrimary.setPosition(primaryPos.x + this.cellSize / 2, primaryPos.y + this.cellSize / 2);
        this.ghostSecondary.setPosition(secondaryPos.x + this.cellSize / 2, secondaryPos.y + this.cellSize / 2);
    }
}
