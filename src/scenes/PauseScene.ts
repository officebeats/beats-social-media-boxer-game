import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { audioManager, SFX } from '../engine/audio';

/**
 * PauseScene
 * Uses pause_menu_mockup_1785555910596.jpg as overlay graphic over frozen battle scene.
 */
export class PauseScene extends Phaser.Scene {
    private selectedIndex: number = 0;
    private selectionGlow!: Phaser.GameObjects.Graphics;

    private readonly buttonPositions = [
        { y: 310, action: () => this.resume() },
        { y: 375, action: () => this.restart() },
        { y: 440, action: () => this.scene.start('TutorialScene') },
        { y: 505, action: () => this.quit() },
    ];

    constructor() {
        super('PauseScene');
    }

    create() {
        // Dimmed backdrop
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5).setOrigin(0);

        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;

        // 1. Exact Mockup Card Image
        const cardBg = this.add.image(cx, cy, 'mockup-pause').setOrigin(0.5);
        cardBg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        // 2. Selection Glow Graphic
        this.selectionGlow = this.add.graphics();

        // 3. Interactive Hit Zones for 4 Pause Menu Buttons
        const cardW = 200;
        const cardH = 50;

        this.buttonPositions.forEach((pos, index) => {
            const zone = this.add.zone(cx, pos.y, cardW, cardH).setInteractive({ useHandCursor: true });

            zone.on('pointerdown', () => {
                this.selectedIndex = index;
                this.updateSelection();
                this.confirmSelection();
            });

            zone.on('pointerover', () => {
                if (this.selectedIndex !== index) {
                    this.selectedIndex = index;
                    this.updateSelection();
                    this.playMoveSound();
                }
            });
        });

        this.updateSelection();

        // Inputs
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-UP', this.moveUp, this);
            this.input.keyboard.on('keydown-DOWN', this.moveDown, this);
            this.input.keyboard.on('keydown-ENTER', this.confirmSelection, this);
            this.input.keyboard.on('keydown-SPACE', this.confirmSelection, this);
            this.input.keyboard.on('keydown-ESC', this.resume, this);
        }
    }

    private updateSelection() {
        const cx = GAME_WIDTH / 2;
        const cardW = 200;
        const cardH = 48;
        const currentPos = this.buttonPositions[this.selectedIndex];

        this.selectionGlow.clear();

        // Glowing Neon Selection Box over active pause button
        this.selectionGlow.fillStyle(0xfbbf24, 0.25);
        this.selectionGlow.fillRoundedRect(cx - cardW / 2, currentPos.y - cardH / 2, cardW, cardH, 10);
        this.selectionGlow.lineStyle(3, 0xfbbf24, 1);
        this.selectionGlow.strokeRoundedRect(cx - cardW / 2, currentPos.y - cardH / 2, cardW, cardH, 10);
        this.selectionGlow.lineStyle(1.5, 0x22d3ee, 0.9);
        this.selectionGlow.strokeRoundedRect(cx - cardW / 2 + 3, currentPos.y - cardH / 2 + 3, cardW - 6, cardH - 6, 8);
    }

    private playMoveSound() {
        audioManager.play(SFX.MENU_MOVE);
    }

    private moveUp() {
        this.selectedIndex--;
        if (this.selectedIndex < 0) this.selectedIndex = this.buttonPositions.length - 1;
        this.updateSelection();
        this.playMoveSound();
    }

    private moveDown() {
        this.selectedIndex++;
        if (this.selectedIndex >= this.buttonPositions.length) this.selectedIndex = 0;
        this.updateSelection();
        this.playMoveSound();
    }

    private confirmSelection() {
        audioManager.play(SFX.MENU_CONFIRM);
        this.buttonPositions[this.selectedIndex].action();
    }

    private resume() {
        audioManager.play(SFX.MENU_BACK);
        this.scene.resume('BattleScene');
        this.scene.stop();
    }

    private restart() {
        const battleScene = this.scene.get('BattleScene');
        const data = (battleScene.scene.settings.data) || {};
        this.scene.stop('BattleScene');
        this.scene.start('BattleScene', data);
        this.scene.stop();
    }

    private quit() {
        this.scene.stop('BattleScene');
        this.scene.start('MenuScene');
        this.scene.stop();
    }
}
