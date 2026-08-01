import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { audioManager, SFX } from '../engine/audio';
import { getFighter } from '../engine/fighters';
import { FighterSprite } from '../objects/FighterSprite';
import { ParallaxArena } from '../objects/ParallaxArena';

/**
 * TitleScene
 * Matches the executive title screen mockup with 3D metallic headers,
 * 16-bit shadowboxing fighters (Broner vs Deen), neon light ribbons,
 * and a glowing arcade card "PRESS START".
 */
export class TitleScene extends Phaser.Scene {
    private arena!: ParallaxArena;
    private p1Fighter!: FighterSprite;
    private p2Fighter!: FighterSprite;

    constructor() {
        super('TitleScene');
    }

    create() {
        const cx = GAME_WIDTH / 2;

        // 1. Parallax Arena Backdrop
        this.arena = new ParallaxArena(this);

        // 2. Ring Mat Base
        const ringMat = this.add.image(cx, GAME_HEIGHT - 100, 'ring-floor').setOrigin(0.5, 0);
        ringMat.setDisplaySize(GAME_WIDTH, 140);
        ringMat.setDepth(1);

        // 3. 16-Bit Shadowboxing Fighter Sprites on Ring Mat
        const bronerData = getFighter('broner');
        const deenData = getFighter('deen');

        this.p1Fighter = new FighterSprite(this, cx - 80, GAME_HEIGHT - 160, bronerData, false);
        this.p1Fighter.setDepth(2);
        this.p1Fighter.setScale(0.65);
        this.p1Fighter.playIdle();

        this.p2Fighter = new FighterSprite(this, cx + 80, GAME_HEIGHT - 160, deenData, true);
        this.p2Fighter.setDepth(2);
        this.p2Fighter.setScale(0.65);
        this.p2Fighter.playIdle();

        // 4. Floating Arcade Title Card Banner (Depth 3)
        const bannerBg = this.add.graphics();
        bannerBg.fillStyle(0x0a0a16, 0.75);
        bannerBg.fillRoundedRect(cx - 170, 75, 340, 185, 12);
        bannerBg.lineStyle(3, 0xfbbf24, 0.9);
        bannerBg.strokeRoundedRect(cx - 170, 75, 340, 185, 12);
        bannerBg.lineStyle(2, 0x22d3ee, 0.8);
        bannerBg.strokeRoundedRect(cx - 166, 79, 332, 177, 8);
        bannerBg.setDepth(3);

        // Header Text: "CRASH OUT"
        const mainTitle = this.add.text(cx, 115, 'CRASH OUT', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '48px',
            color: '#fbbf24',
            stroke: '#000000',
            strokeThickness: 8,
            shadow: { offsetX: 3, offsetY: 4, color: '#000000', blur: 4, fill: true }
        }).setOrigin(0.5).setDepth(4);

        // Subheader Text: "RING RUSH"
        const subTitle = this.add.text(cx, 165, 'RING RUSH', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '40px',
            color: '#22d3ee',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 3, color: '#000000', blur: 3, fill: true }
        }).setOrigin(0.5).setDepth(4);

        // Genre Subtitle: "PUZZLE BOXING"
        const subGenre = this.add.text(cx, 215, '⚡ PUZZLE BOXING VERSUS ⚡', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#f43f5e',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(4);

        // 5. "PRESS START" Glowing Arcade Card (Depth 4)
        const btnCard = this.add.graphics();
        btnCard.fillStyle(0x111827, 0.9);
        btnCard.fillRoundedRect(cx - 120, GAME_HEIGHT - 280, 240, 50, 25);
        btnCard.lineStyle(3, 0xfbbf24, 1);
        btnCard.strokeRoundedRect(cx - 120, GAME_HEIGHT - 280, 240, 50, 25);
        btnCard.setDepth(4);

        const startText = this.add.text(cx, GAME_HEIGHT - 255, 'PRESS START / TAP', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '20px',
            color: '#fbbf24',
            shadow: { offsetX: 1, offsetY: 2, color: '#000000', blur: 2, fill: true }
        }).setOrigin(0.5).setDepth(5);

        // Pulse tween for PRESS START card
        this.tweens.add({
            targets: [startText, btnCard],
            alpha: { from: 1, to: 0.35 },
            yoyo: true,
            repeat: -1,
            duration: 750,
            ease: 'Sine.easeInOut'
        });

        // Version Badge
        this.add.text(cx, GAME_HEIGHT - 25, 'v8.0.0 — KICK STREAM CHAMPIONSHIP ROSTER', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#9ca3af'
        }).setOrigin(0.5).setDepth(5);

        // Input transition
        const onInput = () => {
            this.input.keyboard?.off('keydown', onInput);
            this.input.off('pointerdown', onInput);
            if (this.input.gamepad) {
                this.input.gamepad.off('down', onInput);
            }

            audioManager.play(SFX.MENU_CONFIRM);

            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('MenuScene');
            });
        };

        this.input.keyboard?.on('keydown', onInput);
        this.input.on('pointerdown', onInput);
        if (this.input.gamepad) {
            this.input.gamepad.on('down', onInput);
        }
    }

    update(time: number, delta: number) {
        if (this.p1Fighter) this.p1Fighter.update(delta);
        if (this.p2Fighter) this.p2Fighter.update(delta);
    }
}
