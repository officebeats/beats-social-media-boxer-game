import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { FighterData } from '../engine/types';
import { audioManager, SFX } from '../engine/audio';
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
 * Uses victory_screen_mockup_1785555728023.jpg as full background graphic,
 * with dynamic winner text overlay, live stats overlay, and interactive PLAY AGAIN / SHARE FIGHT CARD buttons.
 */
export class ResultsScene extends Phaser.Scene {
    private data!: ResultsData;

    constructor() {
        super('ResultsScene');
    }

    init(data: ResultsData) {
        this.data = data;
    }

    create() {
        this.cameras.main.fadeIn(400, 0, 0, 0);

        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;

        // 1. Exact Mockup Background Image
        const bg = this.add.image(cx, cy, 'mockup-victory').setOrigin(0.5);
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        // 2. Winner Text Banner Overlay (Positioned over mock banner at Y: 180)
        this.add.text(cx, 180, `${this.data.winner.displayName.toUpperCase()} WINS!`, {
            fontFamily: 'Impact, sans-serif',
            fontSize: '26px',
            color: '#fbbf24',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        // 3. Stats Text Overlay (Positioned over mock stats card at Y: 460)
        const statY = 460;
        this.add.text(cx + 60, statY, `${this.data.stats.chainMax}x`, {
            fontFamily: 'Impact, sans-serif', fontSize: '20px', color: '#fbbf24'
        }).setOrigin(1, 0.5);

        this.add.text(cx + 60, statY + 36, `${this.data.stats.gemsCleared}`, {
            fontFamily: 'Impact, sans-serif', fontSize: '20px', color: '#fbbf24'
        }).setOrigin(1, 0.5);

        this.add.text(cx + 60, statY + 72, `1:23`, {
            fontFamily: 'Impact, sans-serif', fontSize: '20px', color: '#fbbf24'
        }).setOrigin(1, 0.5);

        // 4. PLAY AGAIN Button Zone (Bottom Left: Y: GAME_HEIGHT - 120, X: cx - 75)
        const playBtnY = GAME_HEIGHT - 120;
        const playZone = this.add.zone(cx - 75, playBtnY, 130, 48).setInteractive({ useHandCursor: true });
        playZone.on('pointerdown', () => {
            audioManager.play(SFX.MENU_CONFIRM);
            this.scene.start('BattleScene', {
                p1Fighter: this.data.winner,
                p2Fighter: this.data.loser,
                mode: this.data.mode
            });
        });

        // 5. SHARE FIGHT CARD Button Zone (Bottom Right: Y: GAME_HEIGHT - 120, X: cx + 75)
        const shareZone = this.add.zone(cx + 75, playBtnY, 130, 48).setInteractive({ useHandCursor: true });
        shareZone.on('pointerdown', async () => {
            audioManager.play(SFX.MENU_CONFIRM);
            const snapshotUrl = await captureSnapshot(this.game);
            await shareFightCard(snapshotUrl, this.data.winner.displayName);
        });

        // 6. Top Back Zone
        const topBackZone = this.add.zone(cx, 40, 300, 60).setInteractive({ useHandCursor: true });
        topBackZone.on('pointerdown', () => {
            audioManager.play(SFX.MENU_BACK);
            this.scene.start('MenuScene');
        });

        // Keyboard navigation
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-ESC', () => {
                audioManager.play(SFX.MENU_BACK);
                this.scene.start('MenuScene');
            });
            this.input.keyboard.on('keydown-ENTER', () => {
                audioManager.play(SFX.MENU_CONFIRM);
                this.scene.start('BattleScene', {
                    p1Fighter: this.data.winner,
                    p2Fighter: this.data.loser,
                    mode: this.data.mode
                });
            });
        }
    }
}
