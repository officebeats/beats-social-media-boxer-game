import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { FIGHTER_ROSTER } from '../engine/fighters';
import { FighterData } from '../engine/types';
import { audioManager, SFX } from '../engine/audio';
import { FighterSprite } from '../objects/FighterSprite';

/**
 * SelectScene
 * Character selection screen styled after character_select_mockup_1785555825691.jpg.
 * Renders 14 character portrait cards, active 16-bit sprite animation preview,
 * stats bars, and passive ability callouts.
 */
export class SelectScene extends Phaser.Scene {
    private mode: 'arcade' | 'versus' = 'versus';
    private selectedIndex: number = 0;
    private portraitCards: { container: Phaser.GameObjects.Container; bg: Phaser.GameObjects.Graphics }[] = [];
    private highlightBox!: Phaser.GameObjects.Graphics;

    // Preview components
    private fighterPreviewSprite: FighterSprite | null = null;
    private nameText!: Phaser.GameObjects.Text;
    private taglineText!: Phaser.GameObjects.Text;
    private passiveText!: Phaser.GameObjects.Text;
    private superText!: Phaser.GameObjects.Text;

    constructor() {
        super('SelectScene');
    }

    init(data: { mode?: 'arcade' | 'versus' }) {
        this.mode = data.mode || 'versus';
        this.selectedIndex = 0;
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.ARENA_BG);
        this.cameras.main.fadeIn(400, 0, 0, 0);

        const cx = GAME_WIDTH / 2;

        // Venue Background
        const bg = this.add.image(cx, GAME_HEIGHT / 2, 'arena-far').setOrigin(0.5);
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        bg.setAlpha(0.4);

        // Header Title Banner
        const headerBg = this.add.graphics();
        headerBg.fillStyle(0x0a0a16, 0.9);
        headerBg.fillRoundedRect(cx - 150, 20, 300, 55, 10);
        headerBg.lineStyle(3, 0xfbbf24, 1);
        headerBg.strokeRoundedRect(cx - 150, 20, 300, 55, 10);

        this.add.text(cx, 38, 'SELECT YOUR FIGHTER', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '22px',
            color: '#fbbf24',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.add.text(cx, 60, '14 AUTHENTIC KICK STREAM GUEST ROSTER', {
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#22d3ee',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 14 Fighter Cards Grid (2 rows x 7 cols)
        const cols = 7;
        const cardSize = 46;
        const gap = 8;
        const gridW = cols * cardSize + (cols - 1) * gap;
        const startX = cx - gridW / 2 + cardSize / 2;
        const startY = 105;

        this.portraitCards = [];

        FIGHTER_ROSTER.forEach((fighter, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const x = startX + col * (cardSize + gap);
            const y = startY + row * (cardSize + gap + 18);

            const container = this.add.container(x, y);

            // Card Background Graphics
            const cardBg = this.add.graphics();
            cardBg.fillStyle(0x111827, 0.9);
            cardBg.fillRoundedRect(-cardSize / 2, -cardSize / 2, cardSize, cardSize, 6);
            cardBg.lineStyle(1.5, fighter.isBoss ? 0xef4444 : 0x374151, 1);
            cardBg.strokeRoundedRect(-cardSize / 2, -cardSize / 2, cardSize, cardSize, 6);
            container.add(cardBg);

            // Crop headshot frame from fighter sprite sheet (Frame 0 = Idle pose)
            const headshot = this.add.sprite(0, -6, fighter.spriteKey, 0);
            headshot.setScale(0.32);
            // Mask or crop to upper body
            container.add(headshot);

            // Name Label below card
            const shortName = fighter.displayName.split(' ')[0].toUpperCase();
            const nameLabel = this.add.text(0, cardSize / 2 + 6, shortName, {
                fontFamily: 'Impact, sans-serif',
                fontSize: '10px',
                color: fighter.isBoss ? '#ef4444' : '#e5e7eb'
            }).setOrigin(0.5);
            container.add(nameLabel);

            // Interactive Hit Zone
            const hitZone = this.add.zone(0, 0, cardSize, cardSize + 16).setInteractive({ useHandCursor: true });

            hitZone.on('pointerdown', () => {
                this.selectedIndex = idx;
                this.updateSelection();
                this.confirmSelection();
            });

            hitZone.on('pointerover', () => {
                if (this.selectedIndex !== idx) {
                    this.selectedIndex = idx;
                    this.updateSelection();
                    this.playMoveSound();
                }
            });

            this.portraitCards.push({ container, bg: cardBg });
        });

        // Selection Highlight Frame
        this.highlightBox = this.add.graphics();
        this.highlightBox.setDepth(10);

        // Center Fighter Preview Stage (Y: 260 -> 450)
        const previewY = 320;
        const ringBase = this.add.image(cx, previewY + 70, 'ring-floor').setOrigin(0.5);
        ringBase.setDisplaySize(280, 70);

        // Right Stats Panel Card (Y: 410 -> GAME_HEIGHT - 60)
        const statCardY = 410;
        const statCardW = 350;
        const statCardH = 340;

        const statCard = this.add.graphics();
        statCard.fillStyle(0x0a0a16, 0.95);
        statCard.fillRoundedRect(cx - statCardW / 2, statCardY, statCardW, statCardH, 12);
        statCard.lineStyle(2.5, 0xfbbf24, 0.9);
        statCard.strokeRoundedRect(cx - statCardW / 2, statCardY, statCardW, statCardH, 12);
        statCard.lineStyle(1.5, 0x22d3ee, 0.8);
        statCard.strokeRoundedRect(cx - statCardW / 2 + 4, statCardY + 4, statCardW - 8, statCardH - 8, 8);

        // Stats Card Content
        this.nameText = this.add.text(cx, statCardY + 24, '', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '26px',
            color: '#fbbf24',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.taglineText = this.add.text(cx, statCardY + 54, '', {
            fontFamily: 'sans-serif',
            fontSize: '13px',
            color: '#22d3ee',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        // Passive Ability Callout Box
        this.passiveText = this.add.text(cx, statCardY + 110, '', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: statCardW - 40 }
        }).setOrigin(0.5);

        // SUPER Finisher Callout
        this.superText = this.add.text(cx, statCardY + 175, '', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#f43f5e',
            align: 'center',
            wordWrap: { width: statCardW - 40 }
        }).setOrigin(0.5);

        // Lock In Button
        const lockBtnY = statCardY + 235;

        const lockCard = this.add.graphics();
        lockCard.fillStyle(0x1e1b4b, 0.95);
        lockCard.fillRoundedRect(cx - 120, lockBtnY, 240, 44, 22);
        lockCard.lineStyle(2.5, 0xfbbf24, 1);
        lockCard.strokeRoundedRect(cx - 120, lockBtnY, 240, 44, 22);

        const lockLabel = this.add.text(cx, lockBtnY + 22, 'LOCK IN FIGHTER', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '18px',
            color: '#fbbf24',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        const lockZone = this.add.zone(cx, lockBtnY + 22, 240, 44).setInteractive({ useHandCursor: true });
        lockZone.on('pointerdown', () => this.confirmSelection());

        // Back Button
        const backBtn = this.add.text(cx, statCardY + 300, '← BACK TO MAIN MENU', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#9ca3af'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backBtn.on('pointerdown', () => this.goBack());

        // Initial Selection Setup
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
        const cols = 7;
        let col = this.selectedIndex % cols;
        let row = Math.floor(this.selectedIndex / cols);

        col = (col + dx + cols) % cols;
        row = (row + dy + 2) % 2;

        this.selectedIndex = row * cols + col;
        if (this.selectedIndex >= FIGHTER_ROSTER.length) {
            this.selectedIndex = FIGHTER_ROSTER.length - 1;
        }

        this.updateSelection();
        this.playMoveSound();
    }

    private updateSelection() {
        const fighter = FIGHTER_ROSTER[this.selectedIndex];
        const cx = GAME_WIDTH / 2;

        // Position Highlight Box around active portrait card
        const cardTarget = this.portraitCards[this.selectedIndex];
        if (cardTarget) {
            const size = 48;
            this.highlightBox.clear();
            this.highlightBox.lineStyle(3, 0xfbbf24, 1);
            this.highlightBox.strokeRoundedRect(
                cardTarget.container.x - size / 2 - 2,
                cardTarget.container.y - size / 2 - 2,
                size + 4,
                size + 4,
                8
            );
        }

        // Update Live 16-Bit Animated Fighter Preview Sprite
        if (this.fighterPreviewSprite) {
            this.fighterPreviewSprite.destroy();
        }

        this.fighterPreviewSprite = new FighterSprite(this, cx, 300, fighter, false);
        this.fighterPreviewSprite.setScale(0.7);
        this.fighterPreviewSprite.playIdle();

        // Update Stats Card Text
        this.nameText.setText(fighter.displayName.toUpperCase());
        this.taglineText.setText(`"${fighter.tagline}"`);

        this.passiveText.setText(
            `PASSIVE: ${fighter.passive.name.toUpperCase()}\n${fighter.passive.description}`
        );

        this.superText.setText(
            `SUPER: ${fighter.superFinisher.name.toUpperCase()}\n${fighter.superFinisher.description}`
        );
    }

    private playMoveSound() {
        audioManager.play(SFX.MENU_MOVE);
    }

    private confirmSelection() {
        audioManager.play(SFX.MENU_CONFIRM);

        const p1Fighter = FIGHTER_ROSTER[this.selectedIndex];

        // Pick random rival for Versus mode
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

    update(time: number, delta: number) {
        if (this.fighterPreviewSprite) {
            this.fighterPreviewSprite.update(delta);
        }
    }
}
