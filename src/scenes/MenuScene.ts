import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { audioManager, SFX } from '../engine/audio';

/**
 * MenuScene
 * Uses main_menu_mockup_1785555687774.jpg as background graphic,
 * with precise hit zones over the 4 arcade buttons and a glowing neon selection frame.
 */
export class MenuScene extends Phaser.Scene {
    private selectedIndex: number = 0;
    private selectionGlow!: Phaser.GameObjects.Graphics;

    private readonly buttonPositions = [
        { y: 380, h: 80, action: () => this.scene.start('ArcadeScene') },
        { y: 480, h: 70, action: () => this.scene.start('SelectScene', { mode: 'versus' }) },
        { y: 575, h: 70, action: () => this.scene.start('TutorialScene') },
        { y: 670, h: 70, action: () => this.showComingSoon() },
    ];

    constructor() {
        super('MenuScene');
    }

    create() {
        this.cameras.main.fadeIn(300, 0, 0, 0);

        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;

        // 1. Exact Mockup Background Image
        const bg = this.add.image(cx, cy, 'mockup-menu').setOrigin(0.5);
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        // 2. Selection Glow Frame
        this.selectionGlow = this.add.graphics();
        this.selectionGlow.setDepth(5);

        // 3. Interactive Hit Zones for 4 Arcade Buttons
        const cardW = 310;

        this.buttonPositions.forEach((pos, index) => {
            const zone = this.add.zone(cx, pos.y, cardW, pos.h).setInteractive({ useHandCursor: true });

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

        // Keyboard navigation
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-UP', this.moveUp, this);
            this.input.keyboard.on('keydown-DOWN', this.moveDown, this);
            this.input.keyboard.on('keydown-ENTER', this.confirmSelection, this);
            this.input.keyboard.on('keydown-SPACE', this.confirmSelection, this);
            this.input.keyboard.on('keydown-ESC', this.goBack, this);
        }

        // Gamepad navigation
        if (this.input.gamepad) {
            this.input.gamepad.on('down', (pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button) => {
                if (button.index === 12) this.moveUp();
                if (button.index === 13) this.moveDown();
                if (button.index === 0) this.confirmSelection();
                if (button.index === 1) this.goBack();
            }, this);
        }
    }

    private updateSelection() {
        const cx = GAME_WIDTH / 2;
        const cardW = 310;
        const currentPos = this.buttonPositions[this.selectedIndex];

        this.selectionGlow.clear();

        // Glowing Neon Cyan/Gold Selection Frame over selected button
        this.selectionGlow.fillStyle(0x22d3ee, 0.2);
        this.selectionGlow.fillRoundedRect(cx - cardW / 2 - 4, currentPos.y - currentPos.h / 2 - 4, cardW + 8, currentPos.h + 8, 14);
        this.selectionGlow.lineStyle(3.5, 0xfbbf24, 1);
        this.selectionGlow.strokeRoundedRect(cx - cardW / 2 - 4, currentPos.y - currentPos.h / 2 - 4, cardW + 8, currentPos.h + 8, 14);
        this.selectionGlow.lineStyle(2, 0x22d3ee, 0.9);
        this.selectionGlow.strokeRoundedRect(cx - cardW / 2, currentPos.y - currentPos.h / 2, cardW, currentPos.h, 12);
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

    private goBack() {
        audioManager.play(SFX.MENU_BACK);
        this.scene.start('TitleScene');
    }

    private showComingSoon() {
        const cx = GAME_WIDTH / 2;
        const currentPos = this.buttonPositions[this.selectedIndex];

        const popup = this.add.text(cx, currentPos.y, 'COMING SOON!', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '24px',
            color: '#ef4444',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(10);

        this.time.delayedCall(1000, () => popup.destroy());
    }
}
