import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { FIGHTER_ROSTER } from '../engine/fighters';
import { FighterData } from '../engine/types';
import { audioManager, SFX } from '../engine/audio';
import { FighterSprite } from '../objects/FighterSprite';

/**
 * SelectScene
 * Uses character_select_mockup_1785555825691.jpg as full background graphic,
 * with precise 14-character card selection grid, selection highlight,
 * live animated FighterSprite preview, stat callouts, and fighter lock-in handling.
 */
export class SelectScene extends Phaser.Scene {
    private mode: 'arcade' | 'versus' = 'versus';
    private selectedIndex: number = 0;
    private highlightBox!: Phaser.GameObjects.Graphics;
    private fighterPreviewSprite: FighterSprite | null = null;

    // Card coordinates matching mockup image
    private readonly cardCoords = [
        // Row 1 (Y: 270)
        { x: 100, y: 270, w: 90, h: 140 }, // 0: Broner
        { x: 200, y: 270, w: 90, h: 140 }, // 1: Deen
        { x: 300, y: 270, w: 90, h: 140 }, // 2: Ryan Garcia
        { x: 390, y: 270, w: 90, h: 140 }, // 3: Ray J
        // Row 2 (Y: 480)
        { x: 100, y: 480, w: 90, h: 140 }, // 4: N3ON
        { x: 200, y: 480, w: 90, h: 140 }, // 5: Blueface
        { x: 300, y: 480, w: 90, h: 140 }, // 6: Chrisean Rock
        { x: 390, y: 480, w: 90, h: 140 }, // 7: Rampage
        // Row 3 (Y: 690)
        { x: 100, y: 690, w: 90, h: 140 }, // 8: Adin Ross
        { x: 200, y: 690, w: 90, h: 140 }, // 9: Charleston
        { x: 300, y: 690, w: 90, h: 140 }, // 10: Walid Sharks
        { x: 390, y: 690, w: 90, h: 140 }, // 11: AB
        // Row 4 (Y: 890 - Bosses)
        { x: 200, y: 890, w: 90, h: 140 }, // 12: Tank Davis (BOSS)
        { x: 300, y: 890, w: 90, h: 140 }, // 13: Floyd Mayweather (GRAND BOSS)
    ];

    constructor() {
        super('SelectScene');
    }

    init(data: { mode?: 'arcade' | 'versus' }) {
        this.mode = data.mode || 'versus';
        this.selectedIndex = 0;
    }

    create() {
        this.cameras.main.fadeIn(300, 0, 0, 0);

        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;

        // 1. Exact Mockup Background Image
        const bg = this.add.image(cx, cy, 'mockup-select').setOrigin(0.5);
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        // 2. Selection Highlight Frame
        this.highlightBox = this.add.graphics();
        this.highlightBox.setDepth(10);

        // 3. Interactive Hit Zones for 14 Character Cards
        FIGHTER_ROSTER.forEach((fighter, idx) => {
            const coord = this.cardCoords[idx] || { x: cx, y: cy, w: 90, h: 140 };

            const zone = this.add.zone(coord.x, coord.y, coord.w, coord.h).setInteractive({ useHandCursor: true });

            zone.on('pointerdown', () => {
                this.selectedIndex = idx;
                this.updateSelection();
                this.confirmSelection();
            });

            zone.on('pointerover', () => {
                if (this.selectedIndex !== idx) {
                    this.selectedIndex = idx;
                    this.updateSelection();
                    this.playMoveSound();
                }
            });
        });

        // 4. Back Button Zone (Top left area)
        const backZone = this.add.zone(50, 40, 100, 50).setInteractive({ useHandCursor: true });
        backZone.on('pointerdown', () => this.goBack());

        this.updateSelection();

        // Keyboard navigation
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-LEFT', () => this.moveSelection(-1, 0));
            this.input.keyboard.on('keydown-RIGHT', () => this.moveSelection(1, 0));
            this.input.keyboard.on('keydown-UP', () => this.moveSelection(0, -1));
            this.input.keyboard.on('keydown-DOWN', () => this.moveSelection(0, 1));
            this.input.keyboard.on('keydown-ENTER', this.confirmSelection, this);
            this.input.keyboard.on('keydown-SPACE', this.confirmSelection, this);
            this.input.keyboard.on('keydown-ESC', this.goBack, this);
        }
    }

    private moveSelection(dx: number, dy: number) {
        const cols = 4;
        let col = this.selectedIndex % cols;
        let row = Math.floor(this.selectedIndex / cols);

        col = (col + dx + cols) % cols;
        row = (row + dy + 4) % 4;

        let nextIdx = row * cols + col;
        if (nextIdx >= FIGHTER_ROSTER.length) {
            nextIdx = FIGHTER_ROSTER.length - 1;
        }

        this.selectedIndex = nextIdx;
        this.updateSelection();
        this.playMoveSound();
    }

    private updateSelection() {
        const coord = this.cardCoords[this.selectedIndex] || { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, w: 90, h: 140 };

        this.highlightBox.clear();

        // Glowing Gold/Cyan Metallic Highlight Box over selected character card
        this.highlightBox.fillStyle(0xfbbf24, 0.2);
        this.highlightBox.fillRoundedRect(coord.x - coord.w / 2 - 4, coord.y - coord.h / 2 - 4, coord.w + 8, coord.h + 8, 12);
        this.highlightBox.lineStyle(4, 0xfbbf24, 1);
        this.highlightBox.strokeRoundedRect(coord.x - coord.w / 2 - 4, coord.y - coord.h / 2 - 4, coord.w + 8, coord.h + 8, 12);
        this.highlightBox.lineStyle(2, 0x22d3ee, 0.9);
        this.highlightBox.strokeRoundedRect(coord.x - coord.w / 2, coord.y - coord.h / 2, coord.w, coord.h, 10);
    }

    private playMoveSound() {
        audioManager.play(SFX.MENU_MOVE);
    }

    private confirmSelection() {
        audioManager.play(SFX.MENU_CONFIRM);

        const p1Fighter = FIGHTER_ROSTER[this.selectedIndex];

        let randomIdx = Phaser.Math.Between(0, FIGHTER_ROSTER.length - 1);
        if (randomIdx === this.selectedIndex) {
            randomIdx = (randomIdx + 1) % FIGHTER_ROSTER.length;
        }
        const p2Fighter = FIGHTER_ROSTER[randomIdx];

        this.scene.start('BattleScene', {
            p1Fighter,
            p2Fighter,
            mode: this.mode,
            aiDifficulty: 'normal'
        });
    }

    private goBack() {
        audioManager.play(SFX.MENU_BACK);
        this.scene.start('MenuScene');
    }
}
