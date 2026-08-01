import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { audioManager, SFX } from '../engine/audio';

/**
 * TutorialScene
 * Styled after how_to_play_mockup_1785555737435.jpg with arcade tutorial cards,
 * gem diagrams, and controls guide.
 */
export class TutorialScene extends Phaser.Scene {
    constructor() {
        super('TutorialScene');
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.ARENA_BG);
        this.cameras.main.fadeIn(400, 0, 0, 0);

        const cx = GAME_WIDTH / 2;

        // Background Venue
        const bg = this.add.image(cx, GAME_HEIGHT / 2, 'arena-far').setOrigin(0.5);
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        bg.setAlpha(0.45);

        // Header Title Banner
        const headerBg = this.add.graphics();
        headerBg.fillStyle(0x0a0a16, 0.9);
        headerBg.fillRoundedRect(cx - 150, 25, 300, 60, 10);
        headerBg.lineStyle(3, 0xfbbf24, 1);
        headerBg.strokeRoundedRect(cx - 150, 25, 300, 60, 10);

        this.add.text(cx, 44, 'HOW TO PLAY', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '28px',
            color: '#fbbf24',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.add.text(cx, 70, 'PUZZLE COMBAT SYSTEM MANUAL', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#22d3ee',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Tutorial Sections Cards List
        const sections = [
            {
                title: '1. GEM MATCHING & CHAINS',
                desc: 'Connect 3+ gems of the same color. Gravity drops remaining gems, triggering cascading chain combos (+N CHAIN!).',
                color: 0xef4444
            },
            {
                title: '2. POWER GEM FUSION',
                desc: 'Form 2×2 rectangular blocks of identical color to fuse them into high-damage Power Gems.',
                color: 0x3b82f6
            },
            {
                title: '3. FLASH CRASH ORBS',
                desc: 'Detonate glowing Crash Orbs (⚡) adjacent to colored gems to wipe all matching gems off the board.',
                color: 0x22c55e
            },
            {
                title: '4. CINEMATIC SUPER FINISHERS',
                desc: 'Clearing gems fills your SUPER meter. When full, unleash your character signature SUPER combo attack!',
                color: 0xfbbf24
            },
            {
                title: '5. GAME CONTROLS',
                desc: '• Move: ARROWS / D-PAD\n• Rotate: Z / X / ↻\n• Hard Drop: SPACE / ⬇',
                color: 0xa855f7
            }
        ];

        const cardW = 340;
        const startY = 100;

        sections.forEach((sec, idx) => {
            const y = startY + idx * 115;

            const card = this.add.graphics();
            card.fillStyle(0x0a0a16, 0.9);
            card.fillRoundedRect(cx - cardW / 2, y, cardW, 100, 10);
            card.lineStyle(2, 0xfbbf24, 0.8);
            card.strokeRoundedRect(cx - cardW / 2, y, cardW, 100, 10);
            card.lineStyle(1.5, 0x22d3ee, 0.6);
            card.strokeRoundedRect(cx - cardW / 2 + 3, y + 3, cardW - 6, 94, 8);

            this.add.text(cx - cardW / 2 + 15, y + 14, sec.title, {
                fontFamily: 'Impact, sans-serif',
                fontSize: '17px',
                color: '#fbbf24',
                stroke: '#000000',
                strokeThickness: 3
            });

            this.add.text(cx - cardW / 2 + 15, y + 42, sec.desc, {
                fontFamily: 'sans-serif',
                fontSize: '12px',
                color: '#e5e7eb',
                wordWrap: { width: cardW - 30 },
                lineSpacing: 4
            });
        });

        // Back Button Card
        const btnY = GAME_HEIGHT - 65;

        const backCard = this.add.graphics();
        backCard.fillStyle(0x1e1b4b, 0.95);
        backCard.fillRoundedRect(cx - 130, btnY, 260, 46, 23);
        backCard.lineStyle(2.5, 0xfbbf24, 1);
        backCard.strokeRoundedRect(cx - 130, btnY, 260, 46, 23);

        const backLabel = this.add.text(cx, btnY + 23, '← RETURN TO MENU', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '18px',
            color: '#fbbf24',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        const backZone = this.add.zone(cx, btnY + 23, 260, 46).setInteractive({ useHandCursor: true });
        backZone.on('pointerdown', () => this.goBack());

        // Keyboard ESC & Enter
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-ESC', this.goBack, this);
            this.input.keyboard.on('keydown-ENTER', this.goBack, this);
            this.input.keyboard.on('keydown-SPACE', this.goBack, this);
        }
    }

    private goBack() {
        audioManager.play(SFX.MENU_BACK);
        this.scene.start('MenuScene');
    }
}
