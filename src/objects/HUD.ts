import Phaser from 'phaser';
import { COLORS } from '../config';

export class HUD extends Phaser.GameObjects.Container {
    private gameWidth: number;
    
    private p1HPBar: Phaser.GameObjects.Graphics;
    private p2HPBar: Phaser.GameObjects.Graphics;
    
    private p1SuperMeter: Phaser.GameObjects.Graphics;
    private p2SuperMeter: Phaser.GameObjects.Graphics;

    private timerText: Phaser.GameObjects.Text;
    private p1CurrentHP: number = 0;
    private p1MaxHP: number = 0;
    private p2CurrentHP: number = 0;
    private p2MaxHP: number = 0;

    constructor(scene: Phaser.Scene, gameWidth: number) {
        super(scene, 0, 0);
        this.gameWidth = gameWidth;

        this.p1HPBar = scene.add.graphics();
        this.p2HPBar = scene.add.graphics();
        this.p1SuperMeter = scene.add.graphics();
        this.p2SuperMeter = scene.add.graphics();

        this.timerText = scene.add.text(gameWidth / 2, 20, '99', {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        this.add([this.p1HPBar, this.p2HPBar, this.p1SuperMeter, this.p2SuperMeter, this.timerText]);
        scene.add.existing(this);
    }

    private drawHPBar(graphics: Phaser.GameObjects.Graphics, x: number, y: number, hp: number, maxHP: number, flip: boolean = false) {
        graphics.clear();
        const width = 140;
        const height = 16;
        const fillWidth = maxHP > 0 ? (hp / maxHP) * width : 0;

        graphics.fillStyle(0x333333);
        graphics.fillRect(x, y, flip ? -width : width, height);

        graphics.fillStyle(COLORS.HP_FILL);
        graphics.fillRect(x, y, flip ? -fillWidth : fillWidth, height);
    }

    private drawSuperMeter(graphics: Phaser.GameObjects.Graphics, x: number, y: number, charge: number, maxCharge: number, flip: boolean = false) {
        graphics.clear();
        const width = 140;
        const height = 8;
        const fillWidth = maxCharge > 0 ? (charge / maxCharge) * width : 0;

        graphics.fillStyle(0x222222);
        graphics.fillRect(x, y, flip ? -width : width, height);

        graphics.fillStyle(COLORS.SUPER_FILL);
        graphics.fillRect(x, y, flip ? -fillWidth : fillWidth, height);
    }

    public updateHP(player: 'p1' | 'p2', hp: number, maxHP: number) {
        if (player === 'p1') {
            this.p1CurrentHP = hp;
            this.p1MaxHP = maxHP;
            this.drawHPBar(this.p1HPBar, 20, 20, hp, maxHP, false);
        } else {
            this.p2CurrentHP = hp;
            this.p2MaxHP = maxHP;
            this.drawHPBar(this.p2HPBar, this.gameWidth - 20, 20, hp, maxHP, true);
        }
    }

    public updateSuper(player: 'p1' | 'p2', charge: number, maxCharge: number) {
        if (player === 'p1') {
            this.drawSuperMeter(this.p1SuperMeter, 20, 40, charge, maxCharge, false);
        } else {
            this.drawSuperMeter(this.p2SuperMeter, this.gameWidth - 20, 40, charge, maxCharge, true);
        }
    }

    public updateTimer(seconds: number) {
        this.timerText.setText(Math.max(0, seconds).toString().padStart(2, '0'));
    }

    public showCombo(player: 'p1' | 'p2', chainCount: number) {
        if (chainCount <= 1) return;

        const x = player === 'p1' ? 40 : this.gameWidth - 40;
        const y = 80;

        const text = this.scene.add.text(x, y, `+${chainCount} CHAIN!`, {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: '#fbbf24',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.add(text);

        this.scene.tweens.add({
            targets: text,
            y: y - 30,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 800,
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
            alpha: 0.3,
            yoyo: true,
            repeat: 3,
            duration: 200
        });
    }

    public showRoundIntro(round: number) {
        const text = this.scene.add.text(this.gameWidth / 2, this.scene.cameras.main.height / 2, `ROUND ${round}\nFIGHT!`, {
            fontFamily: 'monospace',
            fontSize: '48px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        this.add(text);
        text.setScale(0);

        this.scene.tweens.add({
            targets: text,
            scale: 1,
            duration: 500,
            ease: 'Back.out',
            onComplete: () => {
                this.scene.time.delayedCall(1000, () => {
                    this.scene.tweens.add({
                        targets: text,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => text.destroy()
                    });
                });
            }
        });
    }

    public showKO() {
        const text = this.scene.add.text(this.gameWidth / 2, this.scene.cameras.main.height / 2, 'K.O.!', {
            fontFamily: 'monospace',
            fontSize: '64px',
            color: '#ef4444',
            align: 'center',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);
        this.add(text);
        
        // Screen flash
        const flash = this.scene.add.rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height, 0xffffff);
        flash.setOrigin(0, 0);
        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 500,
            onComplete: () => flash.destroy()
        });
    }
}
