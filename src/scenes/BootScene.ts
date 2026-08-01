import Phaser from 'phaser';
import { FIGHTER_ROSTER } from '../engine/fighters';
import { SPRITE_MAP, AnimationState } from '../engine/types';

/**
 * BootScene handles loading all game assets and configuring animations.
 */
export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Loading text
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'LOADING... 0%', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#fbbf24'
        }).setOrigin(0.5);

        // Progress bar graphics
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2, 320, 30);

        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0xfbbf24, 1);
            progressBar.fillRect(width / 2 - 155, height / 2 + 5, 310 * value, 20);
            loadingText.setText(`LOADING... ${Math.round(value * 100)}%`);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // Load all fighter sprite sheets
        FIGHTER_ROSTER.forEach(fighter => {
            this.load.spritesheet(fighter.spriteKey, `assets/fighters/${fighter.spriteKey}.png`, {
                frameWidth: 128,
                frameHeight: 256
            });
        });

        // Create placeholder textures for arena and gems
        this.createPlaceholderTextures();
    }

    private createPlaceholderTextures() {
        const graphics = this.make.graphics({ x: 0, y: 0 });

        // Arena far background
        graphics.fillStyle(0x0a0a12, 1);
        graphics.fillRect(0, 0, 512, 1024);
        graphics.generateTexture('arena-far', 512, 1024);
        graphics.clear();

        // Arena mid background
        graphics.fillStyle(0x1a1030, 0.8);
        graphics.fillRect(0, 0, 512, 1024);
        graphics.generateTexture('arena-mid', 512, 1024);
        graphics.clear();

        // Ring floor
        graphics.fillStyle(0x333333, 1);
        graphics.fillRect(0, 0, 512, 200);
        graphics.generateTexture('ring-floor', 512, 200);
        graphics.clear();

        // Gem placeholders (creating individual colors for now or a spritesheet)
        // A placeholder gem spritesheet (colored squares)
        const gemColors = [0xef4444, 0x3b82f6, 0x22c55e, 0xeab308, 0xa855f7, 0x6b7280, 0xffffff];
        let gemGraphics = this.make.graphics({ x: 0, y: 0 });
        gemColors.forEach((color, i) => {
            gemGraphics.fillStyle(color, 1);
            gemGraphics.fillRect(i * 64, 0, 64, 64); // 64x64 gems
        });
        gemGraphics.generateTexture('gems', 64 * gemColors.length, 64);
        gemGraphics.clear();
    }

    create() {
        // Create animations for all fighters
        FIGHTER_ROSTER.forEach(fighter => {
            const animKeys = Object.keys(SPRITE_MAP) as AnimationState[];
            
            animKeys.forEach(state => {
                const mapData = SPRITE_MAP[state];
                const frameRate = 12; // default SPRITE_FPS could be imported

                // Frame calculation based on row and col in spritesheet
                // 8 cols per row
                const startIdx = mapData.row * 8 + mapData.startFrame;
                const endIdx = mapData.row * 8 + mapData.endFrame;

                this.anims.create({
                    key: `${fighter.spriteKey}_${state}`,
                    frames: this.anims.generateFrameNumbers(fighter.spriteKey, { start: startIdx, end: endIdx }),
                    frameRate: frameRate,
                    repeat: (state === AnimationState.IDLE || state === AnimationState.VICTORY) ? -1 : 0
                });
            });
        });

        // Transition to TitleScene (assuming it exists)
        this.scene.start('TitleScene');
    }
}
