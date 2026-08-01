import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { audioManager, SFX } from '../engine/audio';

/**
 * TitleScene
 * Uses title_screen_mockup_1785555675601.jpg background graphic,
 * with precise glowing selection box over PRESS START button and input listeners.
 */
export class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    create() {
        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;

        // 1. Exact Mockup Background Image
        const bg = this.add.image(cx, cy, 'mockup-title').setOrigin(0.5);
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        // 2. Pulsing Glow Frame over PRESS START Button (Y: GAME_HEIGHT - 95, W: 210, H: 65)
        const btnY = GAME_HEIGHT - 95;
        const btnW = 210;
        const btnH = 60;

        const startGlow = this.add.graphics();
        startGlow.lineStyle(3, 0xfbbf24, 0.9);
        startGlow.strokeRoundedRect(cx - btnW / 2, btnY - btnH / 2, btnW, btnH, 14);
        startGlow.lineStyle(2, 0x22d3ee, 0.8);
        startGlow.strokeRoundedRect(cx - btnW / 2 + 3, btnY - btnH / 2 + 3, btnW - 6, btnH - 6, 12);

        this.tweens.add({
            targets: startGlow,
            alpha: { from: 1, to: 0.2 },
            yoyo: true,
            repeat: -1,
            duration: 700,
            ease: 'Sine.easeInOut'
        });

        // 3. Interactive Zone over screen
        const startZone = this.add.zone(cx, cy, GAME_WIDTH, GAME_HEIGHT).setInteractive({ useHandCursor: true });

        const onInput = () => {
            startZone.off('pointerdown', onInput);
            this.input.keyboard?.off('keydown', onInput);
            if (this.input.gamepad) {
                this.input.gamepad.off('down', onInput);
            }

            audioManager.play(SFX.MENU_CONFIRM);

            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('MenuScene');
            });
        };

        startZone.on('pointerdown', onInput);
        this.input.keyboard?.on('keydown', onInput);
        if (this.input.gamepad) {
            this.input.gamepad.on('down', onInput);
        }
    }
}
