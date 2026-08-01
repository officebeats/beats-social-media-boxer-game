import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { audioManager, SFX } from '../engine/audio';
import { getFighter } from '../engine/fighters';

/**
 * ArcadeScene
 * Uses arcade_mode_mockup_1785555697837.jpg as full background graphic,
 * with pulsing launch button overlay and keyboard/touch navigation.
 */
export class ArcadeScene extends Phaser.Scene {
    constructor() {
        super('ArcadeScene');
    }

    create() {
        this.cameras.main.fadeIn(300, 0, 0, 0);

        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;

        // 1. Exact Mockup Background Image
        const bg = this.add.image(cx, cy, 'mockup-arcade').setOrigin(0.5);
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        // 2. Pulsing Start Stage 1 Button Overlay (Y: GAME_HEIGHT - 85)
        const btnY = GAME_HEIGHT - 85;
        const btnW = 310;
        const btnH = 60;

        const btnOverlay = this.add.graphics();
        btnOverlay.fillStyle(0xef4444, 0.25);
        btnOverlay.fillRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 16);
        btnOverlay.lineStyle(3.5, 0xfbbf24, 1);
        btnOverlay.strokeRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 16);

        this.tweens.add({
            targets: btnOverlay,
            alpha: { from: 1, to: 0.4 },
            yoyo: true,
            repeat: -1,
            duration: 650,
            ease: 'Sine.easeInOut'
        });

        // 3. Interactive Zone on Start Button
        const startZone = this.add.zone(cx, btnY, btnW, btnH).setInteractive({ useHandCursor: true });

        const launchBattle = () => {
            audioManager.play(SFX.MENU_CONFIRM);
            const p1 = getFighter('broner'); // Default Hero (Adrien Broner)
            const p2 = getFighter('n3on');   // Stage 1 Rival (N3ON)

            this.scene.start('BattleScene', {
                p1Fighter: p1,
                p2Fighter: p2,
                mode: 'arcade',
                aiDifficulty: 'easy'
            });
        };

        startZone.on('pointerdown', launchBattle);

        // 4. Back Button Zone at top left
        const backZone = this.add.zone(50, 40, 100, 50).setInteractive({ useHandCursor: true });
        backZone.on('pointerdown', () => {
            audioManager.play(SFX.MENU_BACK);
            this.scene.start('MenuScene');
        });

        // Keyboard ESC & Enter
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-ESC', () => {
                audioManager.play(SFX.MENU_BACK);
                this.scene.start('MenuScene');
            });

            this.input.keyboard.on('keydown-ENTER', launchBattle);
            this.input.keyboard.on('keydown-SPACE', launchBattle);
        }
    }
}
