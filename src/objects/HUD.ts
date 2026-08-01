import Phaser from 'phaser';
import { COLORS } from '../config';

export class HUD extends Phaser.GameObjects.Container {
    private gameWidth: number;

    private p1HPBar: Phaser.GameObjects.Graphics;
    private p2HPBar: Phaser.GameObjects.Graphics;

    private p1SuperMeter: Phaser.GameObjects.Graphics;
    private p2SuperMeter: Phaser.GameObjects.Graphics;

    private timerText: Phaser.GameObjects.Text;
    private p1NameText: Phaser.GameObjects.Text;
    private p2NameText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, gameWidth: number) {
        super(scene, 0, 0);
        this.gameWidth = gameWidth;

        this.p1HPBar = scene.add.graphics();
        this.p2HPBar = scene.add.graphics();
        this.p1SuperMeter = scene.add.graphics();
        this.p2SuperMeter = scene.add.graphics();

        // P1 Fighter Name
        this.p1NameText = scene.add.text(14, 8, 'P1 FIGHTER', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '14px',
            color: '#fbbf24',
            stroke: '#000000',
            strokeThickness: 3
        });

        // P2 Fighter Name
        this.p2NameText = scene.add.text(gameWidth - 14, 8, 'P2 FIGHTER', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '14px',
            color: '#22d3ee',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0);

        // Center Digital Round Timer Container
        const timerBg = scene.add.graphics();
        timerBg.fillStyle(0x0a0a16, 0.95);
        timerBg.fillCircle(gameWidth / 2, 28, 22);
        timerBg.lineStyle(2, 0xfbbf24, 1);
        timerBg.strokeCircle(gameWidth / 2, 28, 22);

        this.timerText = scene.add.text(gameWidth / 2, 28, '99', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add([
            this.p1NameText,
            this.p2NameText,
            this.p1HPBar,
            this.p2HPBar,
            this.p1SuperMeter,
            this.p2SuperMeter,
            timerBg,
            this.timerText
        ]);

        scene.add.existing(this);
    }

    public setFighterNames(p1Name: string, p2Name: string) {
        this.p1NameText.setText(p1Name.toUpperCase());
        this.p2NameText.setText(p2Name.toUpperCase());
    }

    private drawHPBar(graphics: Phaser.GameObjects.Graphics, x: number, y: number, hp: number, maxHP: number, flip: boolean = false) {
        graphics.clear();
        const barW = 145;
        const barH = 18;
        const fillW = maxHP > 0 ? (Math.max(0, hp) / maxHP) * barW : 0;

        const dir = flip ? -1 : 1;
        const originX = flip ? x - barW : x;

        // Metallic Outer Frame
        graphics.fillStyle(0x111827, 0.9);
        graphics.fillRoundedRect(originX, y, barW, barH, 4);
        graphics.lineStyle(2, 0xfbbf24, 0.9);
        graphics.strokeRoundedRect(originX, y, barW, barH, 4);

        // Fill Bar (Gold to Red Gradient Fill)
        if (fillW > 0) {
            const fillX = flip ? x - fillW : x;
            graphics.fillStyle(hp < 30 ? 0xef4444 : 0xfbbf24, 1);
            graphics.fillRoundedRect(fillX, y + 2, fillW, barH - 4, 2);
        }
    }

    private drawSuperMeter(graphics: Phaser.GameObjects.Graphics, x: number, y: number, charge: number, maxCharge: number, flip: boolean = false) {
        graphics.clear();
        const barW = 145;
        const barH = 10;
        const fillW = maxCharge > 0 ? (Math.min(maxCharge, charge) / maxCharge) * barW : 0;

        const originX = flip ? x - barW : x;

        // Container
        graphics.fillStyle(0x0a0a16, 0.9);
        graphics.fillRoundedRect(originX, y, barW, barH, 3);
        graphics.lineStyle(1.5, 0x22d3ee, 0.8);
        graphics.strokeRoundedRect(originX, y, barW, barH, 3);

        // Cyan Glowing Fill
        if (fillW > 0) {
            const fillX = flip ? x - fillW : x;
            graphics.fillStyle(charge >= maxCharge ? 0x67e8f9 : 0x06b6d4, 1);
            graphics.fillRoundedRect(fillX, y + 2, fillW, barH - 4, 2);
        }
    }

    public updateHP(player: 'p1' | 'p2', hp: number, maxHP: number) {
        if (player === 'p1') {
            this.drawHPBar(this.p1HPBar, 14, 26, hp, maxHP, false);
        } else {
            this.drawHPBar(this.p2HPBar, this.gameWidth - 14, 26, hp, maxHP, true);
        }
    }

    public updateSuper(player: 'p1' | 'p2', charge: number, maxCharge: number) {
        if (player === 'p1') {
            this.drawSuperMeter(this.p1SuperMeter, 14, 48, charge, maxCharge, false);
        } else {
            this.drawSuperMeter(this.p2SuperMeter, this.gameWidth - 14, 48, charge, maxCharge, true);
        }
    }

    public updateTimer(seconds: number) {
        this.timerText.setText(Math.max(0, seconds).toString().padStart(2, '0'));
    }

    public showCombo(player: 'p1' | 'p2', chainCount: number) {
        if (chainCount <= 1) return;

        const x = player === 'p1' ? 70 : this.gameWidth - 70;
        const y = 85;

        const text = this.scene.add.text(x, y, `CHAIN ×${chainCount}!`, {
            fontFamily: 'Impact, sans-serif',
            fontSize: '24px',
            color: '#fbbf24',
            stroke: '#000000',
            strokeThickness: 5,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 3, fill: true }
        }).setOrigin(0.5);

        this.add(text);

        this.scene.tweens.add({
            targets: text,
            y: y - 40,
            scaleX: 1.4,
            scaleY: 1.4,
            alpha: 0,
            duration: 900,
            ease: 'Power2',
            onComplete: () => {
                text.destroy();
            }
        });
    }

    public flashSuperReady(player: 'p1' | 'p2') {
        const meter = player === 'p1' ? this.p1SuperMeter : this.p2SuperMeter;

        this.scene.tweens.add({
            targets: meter,
            alpha: 0.2,
            yoyo: true,
            repeat: 4,
            duration: 150
        });
    }

    public showRoundIntro(round: number) {
        const cx = this.gameWidth / 2;
        const cy = this.scene.cameras.main.height / 2 - 40;

        const banner = this.scene.add.graphics();
        banner.fillStyle(0x0a0a16, 0.9);
        banner.fillRect(0, cy - 50, this.gameWidth, 100);
        banner.lineStyle(3, 0xfbbf24, 1);
        banner.lineBetween(0, cy - 50, this.gameWidth, cy - 50);
        banner.lineBetween(0, cy + 50, this.gameWidth, cy + 50);

        const text = this.scene.add.text(cx, cy, `ROUND ${round}\nFIGHT!`, {
            fontFamily: 'Impact, sans-serif',
            fontSize: '44px',
            color: '#fbbf24',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setScale(0);

        this.scene.tweens.add({
            targets: text,
            scale: 1,
            duration: 400,
            ease: 'Back.out',
            onComplete: () => {
                this.scene.time.delayedCall(800, () => {
                    this.scene.tweens.add({
                        targets: [text, banner],
                        alpha: 0,
                        duration: 300,
                        onComplete: () => {
                            text.destroy();
                            banner.destroy();
                        }
                    });
                });
            }
        });
    }

    public showKO() {
        const cx = this.gameWidth / 2;
        const cy = this.scene.cameras.main.height / 2 - 40;

        const text = this.scene.add.text(cx, cy, 'K.O.!', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '72px',
            color: '#ef4444',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 8,
            shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 4, fill: true }
        }).setOrigin(0.5);

        // White Screen Flash
        const flash = this.scene.add.rectangle(0, 0, this.gameWidth, this.scene.cameras.main.height, 0xffffff);
        flash.setOrigin(0, 0);
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 400,
            onComplete: () => flash.destroy()
        });
    }
}
