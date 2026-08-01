import Phaser from 'phaser';
import { FIGHTER_ROSTER } from '../engine/fighters';
import { SPRITE_MAP, AnimationState } from '../engine/types';

/**
 * BootScene handles preloading all assets and procedurally generating
 * rich 3D metallic UI tokens, gem textures, arena graphics, hit sparks,
 * and fighter animation definitions.
 */
export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background loading screen box
        const bg = this.add.graphics();
        bg.fillStyle(0x0a0a12, 1);
        bg.fillRect(0, 0, width, height);

        // Loading title
        const titleText = this.add.text(width / 2, height / 2 - 80, 'CRASH OUT: RING RUSH', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '28px',
            color: '#fbbf24',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        const loadingText = this.add.text(width / 2, height / 2 - 30, 'LOADING ASSETS... 0%', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#22d3ee',
            align: 'center'
        }).setOrigin(0.5);

        // Progress bar container
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x111827, 1);
        progressBox.lineStyle(2, 0xfbbf24, 1);
        progressBox.fillRoundedRect(width / 2 - 160, height / 2, 320, 24, 6);
        progressBox.strokeRoundedRect(width / 2 - 160, height / 2, 320, 24, 6);

        const progressBar = this.add.graphics();

        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0xfbbf24, 1);
            progressBar.fillRoundedRect(width / 2 - 156, height / 2 + 4, 312 * value, 16, 4);
            loadingText.setText(`LOADING ASSETS... ${Math.round(value * 100)}%`);
        });

        this.load.on('complete', () => {
            bg.destroy();
            titleText.destroy();
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // Load all 14 fighter sprite sheets
        FIGHTER_ROSTER.forEach(fighter => {
            this.load.spritesheet(fighter.spriteKey, `assets/fighters/${fighter.spriteKey}.jpg`, {
                frameWidth: 128,
                frameHeight: 256
            });
        });

        // Preload screen mockup backgrounds
        this.load.image('mockup-title', 'assets/title_screen_mockup_1785555675601.jpg');
        this.load.image('mockup-menu', 'assets/main_menu_mockup_1785555687774.jpg');
        this.load.image('mockup-arcade', 'assets/arcade_mode_mockup_1785555697837.jpg');
        this.load.image('mockup-select', 'assets/character_select_mockup_1785555825691.jpg');
        this.load.image('mockup-battle', 'assets/battle_screen_mockup_1785554702942.jpg');
        this.load.image('mockup-pause', 'assets/pause_menu_mockup_1785555910596.jpg');
        this.load.image('mockup-victory', 'assets/victory_screen_mockup_1785555728023.jpg');
        this.load.image('mockup-tutorial', 'assets/how_to_play_mockup_1785555737435.jpg');

        // Generate high quality procedural textures
        this.createProceduralTextures();
    }

    private createProceduralTextures() {
        const g = this.make.graphics({ x: 0, y: 0 });

        // 1. Arena Far Background (Dark Arena Venue with Volumetric Spotlights)
        g.fillGradientStyle(0x0a0a16, 0x0a0a16, 0x180b28, 0x180b28, 1);
        g.fillRect(0, 0, 512, 1024);

        // Spotlights
        g.fillStyle(0xfbbf24, 0.08);
        g.fillTriangle(100, 0, 0, 800, 300, 800);
        g.fillStyle(0x22d3ee, 0.08);
        g.fillTriangle(412, 0, 212, 800, 512, 800);

        // Venue Ring Ropes in Distance
        g.lineStyle(3, 0xef4444, 0.6);
        g.lineBetween(0, 400, 512, 400);
        g.lineStyle(3, 0x3b82f6, 0.6);
        g.lineBetween(0, 420, 512, 420);
        g.lineStyle(3, 0xfbbf24, 0.6);
        g.lineBetween(0, 440, 512, 440);

        g.generateTexture('arena-far', 512, 1024);
        g.clear();

        // 2. Arena Mid Background (Ringside Crowd & Stage Glow)
        g.fillStyle(0x000000, 0.0);
        g.fillRect(0, 0, 512, 1024);

        // Crowd Silhouette Dots
        g.fillStyle(0x222638, 0.7);
        for (let i = 0; i < 40; i++) {
            const rx = (i * 37) % 512;
            const ry = 480 + (i * 19) % 200;
            g.fillCircle(rx, ry, 12 + (i % 5) * 4);
        }

        // Electric Neon Ribbons
        g.lineStyle(4, 0x22d3ee, 0.8);
        g.lineBetween(0, 380, 512, 380);
        g.lineStyle(4, 0xfbbf24, 0.8);
        g.lineBetween(0, 460, 512, 460);

        g.generateTexture('arena-mid', 512, 1024);
        g.clear();

        // 3. Ring Floor Canvas Mat
        g.fillGradientStyle(0x1f2937, 0x1f2937, 0x111827, 0x111827, 1);
        g.fillRect(0, 0, 512, 200);

        // Ring Apron Border
        g.lineStyle(6, 0xd97706, 1);
        g.lineBetween(0, 3, 512, 3);
        g.lineStyle(3, 0x06b6d4, 1);
        g.lineBetween(0, 10, 512, 10);

        // Center Ring Logo Splash
        g.fillStyle(0xfbbf24, 0.2);
        g.fillCircle(256, 100, 60);

        g.generateTexture('ring-floor', 512, 200);
        g.clear();

        // 4. Faceted 3D Gems Sheet (Red, Blue, Green, Yellow, Purple, Grey Counter, Diamond Crash)
        const gemColors = [
            { main: 0xef4444, dark: 0x991b1b, light: 0xfca5a5 }, // Red
            { main: 0x3b82f6, dark: 0x1e40af, light: 0x93c5fd }, // Blue
            { main: 0x22c55e, dark: 0x166534, light: 0x86efac }, // Green
            { main: 0xeab308, dark: 0x854d0e, light: 0xfde047 }, // Yellow
            { main: 0xa855f7, dark: 0x6b21a8, light: 0xd8b4fe }, // Purple
            { main: 0x6b7280, dark: 0x374151, light: 0xd1d5db }, // Grey Counter
            { main: 0x38bdf8, dark: 0x0284c7, light: 0xf0f9ff }, // Crash Orb (Cyan Diamond)
        ];

        const gemSize = 64;
        const gemSheetWidth = gemSize * gemColors.length;

        gemColors.forEach((color, i) => {
            const ox = i * gemSize;

            // Outer Base
            g.fillStyle(color.dark, 1);
            g.fillRoundedRect(ox + 2, 2, gemSize - 4, gemSize - 4, 8);

            // Main Facet Body
            g.fillStyle(color.main, 1);
            g.fillRoundedRect(ox + 5, 5, gemSize - 10, gemSize - 10, 6);

            // Top-Left Bevel Highlight
            g.fillStyle(color.light, 0.8);
            g.fillTriangle(ox + 6, 6, ox + gemSize - 6, 6, ox + 6, gemSize - 6);

            // Inner Glass Facet Center
            g.fillStyle(color.main, 1);
            g.fillRoundedRect(ox + 12, 12, gemSize - 24, gemSize - 24, 4);

            // Glossy Specular Dot
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(ox + 16, 16, 4);

            // Gold/Cyan Metallic Outer Bevel Line
            g.lineStyle(2, 0x000000, 0.5);
            g.strokeRoundedRect(ox + 2, 2, gemSize - 4, gemSize - 4, 8);
        });

        g.generateTexture('gems-styled', gemSheetWidth, gemSize);
        g.clear();

        // 5. Hit Spark Flash
        g.fillStyle(0xffffff, 1);
        g.fillCircle(32, 32, 16);
        g.fillStyle(0xfbbf24, 0.8);
        g.fillCircle(32, 32, 28);
        g.lineStyle(4, 0x22d3ee, 1);
        for (let a = 0; a < 8; a++) {
            const angle = (a * Math.PI) / 4;
            g.lineBetween(
                32 + Math.cos(angle) * 12,
                32 + Math.sin(angle) * 12,
                32 + Math.cos(angle) * 30,
                32 + Math.sin(angle) * 30
            );
        }
        g.generateTexture('hit-spark', 64, 64);
        g.clear();
    }

    create() {
        // Create animations for all fighters (12 FPS, 8 cols per row)
        FIGHTER_ROSTER.forEach(fighter => {
            const animKeys = Object.keys(SPRITE_MAP) as AnimationState[];

            animKeys.forEach(state => {
                const mapData = SPRITE_MAP[state];
                const startIdx = mapData.row * 8 + mapData.startFrame;
                const endIdx = mapData.row * 8 + mapData.endFrame;

                const isLooping = (state === AnimationState.IDLE || state === AnimationState.VICTORY);

                this.anims.create({
                    key: `${fighter.spriteKey}_${state}`,
                    frames: this.anims.generateFrameNumbers(fighter.spriteKey, { start: startIdx, end: endIdx }),
                    frameRate: 12,
                    repeat: isLooping ? -1 : 0
                });
            });
        });

        // Transition to TitleScene
        this.scene.start('TitleScene');
    }
}
