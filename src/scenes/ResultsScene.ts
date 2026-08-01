import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { FighterData } from '../engine/types';
import { audioManager, SFX } from '../engine/audio';
import { FighterSprite } from '../objects/FighterSprite';
import { captureSnapshot, shareFightCard } from '../utils/share';

interface ResultsData {
    winner: FighterData;
    loser: FighterData;
    stats: {
        chainMax: number;
        gemsCleared: number;
        roundsWon: number;
    };
    mode: 'arcade' | 'versus';
}

/**
 * ResultsScene
 * Matches victory_screen_mockup_1785555728023.jpg with metallic victory card,
 * 16-bit victory sprite animation, stats panel, and share fight card generator.
 */
export class ResultsScene extends Phaser.Scene {
    private data!: ResultsData;
    private winnerSprite!: FighterSprite;

    constructor() {
        super('ResultsScene');
    }

    init(data: ResultsData) {
        this.data = data;
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.ARENA_BG);
        this.cameras.main.setZoom(1.2);
        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1,
            duration: 600,
            ease: 'Cubic.easeOut'
        });

        const cx = GAME_WIDTH / 2;

        // Background Venue
        const bg = this.add.image(cx, GAME_HEIGHT / 2, 'arena-far').setOrigin(0.5);
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        bg.setAlpha(0.45);

        // Header Banner: "VICTORY!"
        const headerCard = this.add.graphics();
        headerCard.fillStyle(0x0a0a16, 0.9);
        headerCard.fillRoundedRect(cx - 160, 25, 320, 65, 10);
        headerCard.lineStyle(3, 0xfbbf24, 1);
        headerCard.strokeRoundedRect(cx - 160, 25, 320, 65, 10);

        this.add.text(cx, 44, `${this.data.winner.displayName.toUpperCase()}`, {
            fontFamily: 'Impact, sans-serif',
            fontSize: '26px',
            color: '#fbbf24',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.add.text(cx, 72, 'VICTORY CHAMPION', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#22d3ee',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 16-Bit Winner Fighter Sprite Pose (Center)
        const fighterY = 220;
        const ringBase = this.add.image(cx, fighterY + 70, 'ring-floor').setOrigin(0.5);
        ringBase.setDisplaySize(260, 60);

        this.winnerSprite = new FighterSprite(this, cx, fighterY, this.data.winner, false);
        this.winnerSprite.setScale(0.75);
        this.winnerSprite.playVictory();

        // Match Stats Panel Card (Y: 340 -> 540)
        const statCardY = 340;
        const statCardW = 340;
        const statCardH = 180;

        const statCard = this.add.graphics();
        statCard.fillStyle(0x0a0a16, 0.95);
        statCard.fillRoundedRect(cx - statCardW / 2, statCardY, statCardW, statCardH, 12);
        statCard.lineStyle(2.5, 0xfbbf24, 0.9);
        statCard.strokeRoundedRect(cx - statCardW / 2, statCardY, statCardW, statCardH, 12);
        statCard.lineStyle(1.5, 0x22d3ee, 0.8);
        statCard.strokeRoundedRect(cx - statCardW / 2 + 4, statCardY + 4, statCardW - 8, statCardH - 8, 8);

        this.add.text(cx, statCardY + 22, 'MATCH PERFORMANCE STATS', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '18px',
            color: '#fbbf24',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        const statsList = [
            `MAX CHAIN COMBO:  ${this.data.stats.chainMax}×`,
            `GEMS CLEARED:     ${this.data.stats.gemsCleared}`,
            `ROUNDS WON:       ${this.data.stats.roundsWon}`
        ];

        statsList.forEach((line, idx) => {
            this.add.text(cx - 120, statCardY + 60 + idx * 32, line, {
                fontFamily: 'monospace',
                fontSize: '14px',
                color: '#ffffff',
                fontStyle: 'bold'
            });
        });

        // Interactive Action Cards: SHARE FIGHT CARD, REMATCH, MENU
        const startBtnY = 545;

        // 1. Share Fight Card Button
        const shareCard = this.add.graphics();
        shareCard.fillStyle(0x1e1b4b, 0.95);
        shareCard.fillRoundedRect(cx - 140, startBtnY, 280, 46, 23);
        shareCard.lineStyle(2.5, 0x22d3ee, 1);
        shareCard.strokeRoundedRect(cx - 140, startBtnY, 280, 46, 23);

        this.add.text(cx, startBtnY + 23, '📸 SHARE FIGHT CARD', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '18px',
            color: '#22d3ee',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        const shareZone = this.add.zone(cx, startBtnY + 23, 280, 46).setInteractive({ useHandCursor: true });
        shareZone.on('pointerdown', async () => {
            audioManager.play(SFX.MENU_CONFIRM);
            const snapshotUrl = await captureSnapshot(this.game);
            await shareFightCard(snapshotUrl, this.data.winner.displayName);
        });

        // 2. Rematch Button
        const rematchY = startBtnY + 58;

        const rematchCard = this.add.graphics();
        rematchCard.fillStyle(0x111827, 0.9);
        rematchCard.fillRoundedRect(cx - 140, rematchY, 280, 44, 22);
        rematchCard.lineStyle(2, 0xfbbf24, 0.9);
        rematchCard.strokeRoundedRect(cx - 140, rematchY, 280, 44, 22);

        this.add.text(cx, rematchY + 22, '🥊 REMATCH', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '18px',
            color: '#fbbf24',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        const rematchZone = this.add.zone(cx, rematchY + 22, 280, 44).setInteractive({ useHandCursor: true });
        rematchZone.on('pointerdown', () => {
            audioManager.play(SFX.MENU_CONFIRM);
            this.scene.start('BattleScene', {
                p1Fighter: this.data.winner,
                p2Fighter: this.data.loser,
                mode: this.data.mode
            });
        });

        // 3. Menu Button
        const menuBtn = this.add.text(cx, GAME_HEIGHT - 35, '← RETURN TO MAIN MENU', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#9ca3af'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        menuBtn.on('pointerdown', () => {
            audioManager.play(SFX.MENU_BACK);
            this.scene.start('MenuScene');
        });
    }

    update(time: number, delta: number) {
        if (this.winnerSprite) {
            this.winnerSprite.update(delta);
        }
    }
}
