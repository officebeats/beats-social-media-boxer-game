import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { audioManager, SFX } from '../engine/audio';
import { getFighter } from '../engine/fighters';
import { FighterData } from '../engine/types';

interface LadderStage {
    stageNum: number;
    fighterId: string;
    fighter: FighterData;
    isBoss?: boolean;
    isGrandBoss?: boolean;
}

/**
 * ArcadeScene
 * Renders the 7-Stage Solo Championship Ladder framed by glowing boxing ropes,
 * matching arcade_mode_mockup_1785555697837.jpg.
 */
export class ArcadeScene extends Phaser.Scene {
    private currentStageIndex = 0;

    constructor() {
        super('ArcadeScene');
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.ARENA_BG);
        this.cameras.main.fadeIn(400, 0, 0, 0);

        const cx = GAME_WIDTH / 2;

        // Venue Background
        const bg = this.add.image(cx, GAME_HEIGHT / 2, 'arena-far').setOrigin(0.5);
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        bg.setAlpha(0.5);

        // Header Title Banner
        const headerBg = this.add.graphics();
        headerBg.fillStyle(0x0a0a16, 0.9);
        headerBg.fillRoundedRect(cx - 170, 30, 340, 70, 10);
        headerBg.lineStyle(3, 0xfbbf24, 1);
        headerBg.strokeRoundedRect(cx - 170, 30, 340, 70, 10);

        this.add.text(cx, 50, 'LOCKED-IN CHAMPIONSHIP', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '24px',
            color: '#fbbf24',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.add.text(cx, 78, '7-STAGE SOLOS GAUNTLET LADDER', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#22d3ee',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Define 7 Ladder Stages
        const stageConfigs = [
            { stageNum: 1, fighterId: 'n3on' },
            { stageNum: 2, fighterId: 'rayj' },
            { stageNum: 3, fighterId: 'blueface' },
            { stageNum: 4, fighterId: 'ryan' },
            { stageNum: 5, fighterId: 'broner' },
            { stageNum: 6, fighterId: 'tank', isBoss: true },
            { stageNum: 7, fighterId: 'floyd', isGrandBoss: true },
        ];

        const stages: LadderStage[] = stageConfigs.map(c => ({
            ...c,
            fighter: getFighter(c.fighterId)
        }));

        // Render Ladder Stage Cards (Bottom to Top)
        const cardW = 340;
        const cardH = 50;
        const startY = 120;
        const gapY = 56;

        stages.forEach((stage, idx) => {
            const y = startY + idx * gapY;
            const isCurrent = idx === this.currentStageIndex;

            const cardGraphics = this.add.graphics();

            // Card Fill & Border
            if (stage.isGrandBoss) {
                cardGraphics.fillStyle(0x451a03, 0.9);
                cardGraphics.fillRoundedRect(cx - cardW / 2, y, cardW, cardH, 8);
                cardGraphics.lineStyle(3, 0xf59e0b, 1);
                cardGraphics.strokeRoundedRect(cx - cardW / 2, y, cardW, cardH, 8);
            } else if (stage.isBoss) {
                cardGraphics.fillStyle(0x450a0a, 0.9);
                cardGraphics.fillRoundedRect(cx - cardW / 2, y, cardW, cardH, 8);
                cardGraphics.lineStyle(3, 0xef4444, 1);
                cardGraphics.strokeRoundedRect(cx - cardW / 2, y, cardW, cardH, 8);
            } else {
                cardGraphics.fillStyle(0x111827, 0.85);
                cardGraphics.fillRoundedRect(cx - cardW / 2, y, cardW, cardH, 8);
                cardGraphics.lineStyle(2, isCurrent ? 0x22d3ee : 0x374151, 1);
                cardGraphics.strokeRoundedRect(cx - cardW / 2, y, cardW, cardH, 8);
            }

            // Stage Number Badge
            const badgeLabel = stage.isGrandBoss ? 'FINAL' : stage.isBoss ? 'BOSS' : `STAGE ${stage.stageNum}`;
            const badgeColor = stage.isGrandBoss ? '#f59e0b' : stage.isBoss ? '#ef4444' : '#22d3ee';

            this.add.text(cx - cardW / 2 + 15, y + 16, badgeLabel, {
                fontFamily: 'monospace',
                fontSize: '12px',
                color: badgeColor,
                fontStyle: 'bold'
            });

            // Fighter Name
            this.add.text(cx - cardW / 2 + 100, y + 14, stage.fighter.displayName.toUpperCase(), {
                fontFamily: 'Impact, sans-serif',
                fontSize: '20px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            });

            // Fighter Tagline
            this.add.text(cx + cardW / 2 - 15, y + 16, `"${stage.fighter.tagline}"`, {
                fontFamily: 'sans-serif',
                fontSize: '11px',
                color: '#9ca3af',
                fontStyle: 'italic'
            }).setOrigin(1, 0);

            // Active Stage Highlight Bar
            if (isCurrent) {
                const pulseBox = this.add.graphics();
                pulseBox.lineStyle(2, 0xfbbf24, 1);
                pulseBox.strokeRoundedRect(cx - cardW / 2 - 2, y - 2, cardW + 4, cardH + 4, 10);

                this.tweens.add({
                    targets: pulseBox,
                    alpha: { from: 1, to: 0.3 },
                    yoyo: true,
                    repeat: -1,
                    duration: 600
                });
            }
        });

        // Start Arcade Battle Button at Bottom
        const btnY = GAME_HEIGHT - 90;

        const startCard = this.add.graphics();
        startCard.fillStyle(0x1e1b4b, 0.95);
        startCard.fillRoundedRect(cx - 140, btnY, 280, 52, 26);
        startCard.lineStyle(3, 0xfbbf24, 1);
        startCard.strokeRoundedRect(cx - 140, btnY, 280, 52, 26);

        const startText = this.add.text(cx, btnY + 26, 'START GAUNTLET (STAGE 1)', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '20px',
            color: '#fbbf24',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        const startZone = this.add.zone(cx, btnY + 26, 280, 52).setInteractive({ useHandCursor: true });

        startZone.on('pointerdown', () => {
            audioManager.play(SFX.MENU_CONFIRM);
            const currentStage = stages[this.currentStageIndex];
            const p1 = getFighter('broner'); // Default Arcade Hero (Adrien Broner)
            const p2 = currentStage.fighter;

            this.scene.start('BattleScene', {
                p1Fighter: p1,
                p2Fighter: p2,
                mode: 'arcade',
                aiDifficulty: currentStage.isGrandBoss ? 'hard' : currentStage.isBoss ? 'normal' : 'easy'
            });
        });

        // Navigation Back Button
        const backBtn = this.add.text(cx, GAME_HEIGHT - 25, '← BACK TO MAIN MENU', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#9ca3af'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backBtn.on('pointerdown', () => {
            audioManager.play(SFX.MENU_BACK);
            this.scene.start('MenuScene');
        });

        // Keyboard ESC & Enter
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-ESC', () => {
                audioManager.play(SFX.MENU_BACK);
                this.scene.start('MenuScene');
            });

            this.input.keyboard.on('keydown-ENTER', () => {
                audioManager.play(SFX.MENU_CONFIRM);
                const currentStage = stages[this.currentStageIndex];
                const p1 = getFighter('broner');
                const p2 = currentStage.fighter;

                this.scene.start('BattleScene', {
                    p1Fighter: p1,
                    p2Fighter: p2,
                    mode: 'arcade',
                    aiDifficulty: currentStage.isGrandBoss ? 'hard' : currentStage.isBoss ? 'normal' : 'easy'
                });
            });
        }
    }
}
