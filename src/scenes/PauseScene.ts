import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { audioManager, SFX } from '../engine/audio';

interface MenuItem {
    card: Phaser.GameObjects.Graphics;
    text: Phaser.GameObjects.Text;
    action: () => void;
}

/**
 * PauseScene
 * Styled after pause_menu_mockup_1785555910596.jpg with gold/cyan metallic modal overlay card.
 */
export class PauseScene extends Phaser.Scene {
    private menuItems: MenuItem[] = [];
    private selectedIndex: number = 0;

    constructor() {
        super('PauseScene');
    }

    create() {
        // 60% Dimmed Overlay over frozen battle
        this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65).setOrigin(0);

        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;

        const modalW = 320;
        const modalH = 380;

        // 3D Gold/Cyan Metallic Modal Card Frame
        const modal = this.add.graphics();
        modal.fillStyle(0x0a0a16, 0.95);
        modal.fillRoundedRect(cx - modalW / 2, cy - modalH / 2, modalW, modalH, 14);
        modal.lineStyle(3, 0xfbbf24, 1);
        modal.strokeRoundedRect(cx - modalW / 2, cy - modalH / 2, modalW, modalH, 14);
        modal.lineStyle(1.5, 0x22d3ee, 0.8);
        modal.strokeRoundedRect(cx - modalW / 2 + 4, cy - modalH / 2 + 4, modalW - 8, modalH - 8, 10);

        // Header Title
        this.add.text(cx, cy - modalH / 2 + 38, 'MATCH PAUSED', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '32px',
            color: '#fbbf24',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        const options = [
            { label: 'RESUME MATCH', action: () => this.resume() },
            { label: 'RESTART ROUND', action: () => this.restart() },
            { label: 'HOW TO PLAY', action: () => this.scene.start('TutorialScene') },
            { label: 'QUIT MATCH', action: () => this.quit() },
        ];

        this.menuItems = [];
        this.selectedIndex = 0;

        const cardW = 260;
        const cardH = 50;
        const startY = cy - 65;
        const gapY = 62;

        options.forEach((opt, index) => {
            const y = startY + index * gapY;

            const card = this.add.graphics();

            const text = this.add.text(cx, y + cardH / 2, opt.label, {
                fontFamily: 'Impact, sans-serif',
                fontSize: '20px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);

            const hitZone = this.add.zone(cx, y + cardH / 2, cardW, cardH).setInteractive({ useHandCursor: true });

            hitZone.on('pointerdown', () => {
                this.selectedIndex = index;
                this.updateSelection();
                this.confirmSelection();
            });

            hitZone.on('pointerover', () => {
                if (this.selectedIndex !== index) {
                    this.selectedIndex = index;
                    this.updateSelection();
                    this.playMoveSound();
                }
            });

            this.menuItems.push({ card, text, action: opt.action });
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
        const cy = GAME_HEIGHT / 2;
        const cardW = 260;
        const cardH = 50;
        const startY = cy - 65;
        const gapY = 62;

        this.menuItems.forEach((item, index) => {
            const y = startY + index * gapY;
            const isSelected = index === this.selectedIndex;

            item.card.clear();

            if (isSelected) {
                item.card.fillStyle(0x1e1b4b, 0.95);
                item.card.fillRoundedRect(cx - cardW / 2, y, cardW, cardH, 8);
                item.card.lineStyle(2.5, 0xfbbf24, 1);
                item.card.strokeRoundedRect(cx - cardW / 2, y, cardW, cardH, 8);

                item.text.setColor('#fbbf24');
            } else {
                item.card.fillStyle(0x111827, 0.85);
                item.card.fillRoundedRect(cx - cardW / 2, y, cardW, cardH, 8);
                item.card.lineStyle(1.5, 0x374151, 0.8);
                item.card.strokeRoundedRect(cx - cardW / 2, y, cardW, cardH, 8);

                item.text.setColor('#d1d5db');
            }
        });
    }

    private playMoveSound() {
        audioManager.play(SFX.MENU_MOVE);
    }

    private moveUp() {
        this.selectedIndex--;
        if (this.selectedIndex < 0) this.selectedIndex = this.menuItems.length - 1;
        this.updateSelection();
        this.playMoveSound();
    }

    private moveDown() {
        this.selectedIndex++;
        if (this.selectedIndex >= this.menuItems.length) this.selectedIndex = 0;
        this.updateSelection();
        this.playMoveSound();
    }

    private confirmSelection() {
        audioManager.play(SFX.MENU_CONFIRM);
        this.menuItems[this.selectedIndex].action();
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
