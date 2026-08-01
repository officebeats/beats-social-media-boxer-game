import Phaser from 'phaser';
import { InputAction } from '../engine/types';

export class TouchControls extends Phaser.GameObjects.Container {
    private inputManager: any;

    constructor(scene: Phaser.Scene, inputManager: any) {
        super(scene, 0, 0);
        this.inputManager = inputManager;

        const screenW = scene.cameras.main.width;
        const screenH = scene.cameras.main.height;
        const btnSize = 58;
        const spacing = btnSize + 8;
        const baseY = screenH - 65;

        // Bottom Left D-Pad Controls
        const dpadX = 60;
        this.createButton(dpadX - spacing / 1.2, baseY, '◄', InputAction.LEFT);
        this.createButton(dpadX, baseY, '▼', InputAction.DOWN);
        this.createButton(dpadX + spacing / 1.2, baseY, '►', InputAction.RIGHT);

        // Bottom Right Action Controls (Rotate, Hard Drop)
        const actionX = screenW - 60;
        this.createButton(actionX - spacing / 1.2, baseY, '↻', InputAction.ROTATE_CW);
        this.createButton(actionX, baseY, 'DROP', InputAction.HARD_DROP, true);

        scene.add.existing(this);

        // Show on touch devices or always visible for desktop preview
        if (!scene.sys.game.device.input.touch) {
            this.setAlpha(0.85); // Visible translucent on desktop so user sees touch UI
        }
    }

    private createButton(x: number, y: number, label: string, action: InputAction, isWide: boolean = false) {
        const btnW = isWide ? 76 : 58;
        const btnH = 58;

        const container = this.scene.add.container(x, y);

        // 3D Metallic Gold/Cyan Button Card Graphics
        const bg = this.scene.add.graphics();
        bg.fillStyle(0x0a0a16, 0.9);
        bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10);
        bg.lineStyle(2.5, 0xfbbf24, 0.9);
        bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10);
        bg.lineStyle(1.5, 0x22d3ee, 0.7);
        bg.strokeRoundedRect(-btnW / 2 + 2, -btnH / 2 + 2, btnW - 4, btnH - 4, 8);
        container.add(bg);

        // Label Text
        const text = this.scene.add.text(0, 0, label, {
            fontFamily: isWide ? 'Impact, sans-serif' : 'monospace',
            fontSize: isWide ? '16px' : '22px',
            color: '#fbbf24',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        container.add(text);

        // Hit Zone
        const hitZone = this.scene.add.zone(0, 0, btnW, btnH).setInteractive({ useHandCursor: true });
        container.add(hitZone);

        hitZone.on('pointerdown', () => {
            container.setScale(0.92);
            text.setColor('#22d3ee');
            if (this.inputManager && typeof this.inputManager.registerTouchAction === 'function') {
                this.inputManager.registerTouchAction(action);
            }
        });

        const resetBtn = () => {
            container.setScale(1.0);
            text.setColor('#fbbf24');
        };

        hitZone.on('pointerup', resetBtn);
        hitZone.on('pointerout', resetBtn);

        this.add(container);
    }
}
