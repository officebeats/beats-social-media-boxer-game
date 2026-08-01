import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config';
import { audioManager, SFX } from '../engine/audio';

/**
 * TutorialScene
 * Uses how_to_play_mockup_1785555737435.jpg as full background graphic,
 * with interactive PREVIOUS / NEXT buttons and return handlers.
 */
export class TutorialScene extends Phaser.Scene {
    constructor() {
        super('TutorialScene');
    }

    create() {
        this.cameras.main.fadeIn(300, 0, 0, 0);

        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;

        // 1. Exact Mockup Background Image
        const bg = this.add.image(cx, cy, 'mockup-tutorial').setOrigin(0.5);
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

        // 2. Interactive PREVIOUS & NEXT Buttons (Y: GAME_HEIGHT - 120)
        const btnY = GAME_HEIGHT - 120;

        const prevZone = this.add.zone(cx - 90, btnY, 130, 50).setInteractive({ useHandCursor: true });
        const nextZone = this.add.zone(cx + 90, btnY, 130, 50).setInteractive({ useHandCursor: true });

        const goBack = () => {
            audioManager.play(SFX.MENU_BACK);
            this.scene.start('MenuScene');
        };

        prevZone.on('pointerdown', goBack);
        nextZone.on('pointerdown', goBack);

        // Top back zone
        const backZone = this.add.zone(cx, 40, 300, 60).setInteractive({ useHandCursor: true });
        backZone.on('pointerdown', goBack);

        // Keyboard ESC & Enter
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-ESC', goBack);
            this.input.keyboard.on('keydown-ENTER', goBack);
            this.input.keyboard.on('keydown-SPACE', goBack);
        }
    }
}
