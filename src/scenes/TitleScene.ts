import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { InputAction } from '../engine/types';
import { audioManager, SFX } from '../engine/audio';

/**
 * Title Scene
 * The main entry point displaying the game logo and waiting for start input.
 */
export class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    create() {
        // Dark arena background
        this.cameras.main.setBackgroundColor(COLORS.ARENA_BG);

        // Center coordinates
        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2;

        // Subtle particle effect: floating squares
        const particles = this.add.particles(0, 0, 'particle', {
            x: { min: 0, max: GAME_WIDTH },
            y: GAME_HEIGHT + 20,
            lifespan: 4000,
            speedY: { min: -50, max: -150 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.3, end: 0 },
            tint: [COLORS.GOLD, COLORS.CYAN],
            blendMode: 'ADD',
            frequency: 300,
        });

        // "CRASH OUT" text
        this.add.text(cx, cy - 80, 'CRASH OUT', {
            fontFamily: 'Arial',
            fontSize: '56px',
            fontStyle: 'bold',
            color: '#fbbf24' // COLORS.GOLD
        }).setOrigin(0.5);

        // "RING RUSH" text
        this.add.text(cx, cy - 20, 'RING RUSH', {
            fontFamily: 'Arial',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#22d3ee' // COLORS.CYAN
        }).setOrigin(0.5);

        // "PRESS START" text
        const startText = this.add.text(cx, cy + 120, 'PRESS START', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff' // COLORS.TEXT_PRIMARY
        }).setOrigin(0.5);

        // Pulse tween for PRESS START
        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            yoyo: true,
            repeat: -1,
            duration: 800,
            ease: 'Sine.easeInOut'
        });

        // Any input to continue
        const onInput = () => {
            this.input.keyboard?.off('keydown', onInput);
            this.input.off('pointerdown', onInput);
            
            // Assuming audioManager is initialized
            if (audioManager && audioManager.play) {
                audioManager.play(SFX?.MENU_SELECT || 'MENU_SELECT');
            }

            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('MenuScene');
            });
        };

        this.input.keyboard?.on('keydown', onInput);
        this.input.on('pointerdown', onInput);
        
        // Setup gamepad input if available
        if (this.input.gamepad) {
            this.input.gamepad.on('down', onInput);
        }
    }
}
