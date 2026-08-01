import Phaser from 'phaser';
import { InputAction } from '../engine/types';

export class TouchControls extends Phaser.GameObjects.Container {
    // Assuming an InputManager type that has registerTouchAction
    private inputManager: any;

    constructor(scene: Phaser.Scene, inputManager: any) {
        super(scene, 0, 0);
        this.inputManager = inputManager;

        const screenW = scene.cameras.main.width;
        const screenH = scene.cameras.main.height;
        const padding = 20;
        const btnSize = 58;
        const spacing = btnSize + 10;

        // Bottom left area: D-Pad
        const dpadBaseX = padding + btnSize;
        const dpadBaseY = screenH - padding - btnSize * 1.5;

        this.createButton(dpadBaseX - spacing, dpadBaseY, '←', InputAction.LEFT);
        this.createButton(dpadBaseX, dpadBaseY + spacing, '↓', InputAction.DOWN);
        this.createButton(dpadBaseX + spacing, dpadBaseY, '→', InputAction.RIGHT);

        // Bottom right area: Rotate / Hard drop
        const actionBaseX = screenW - padding - btnSize * 1.5;
        const actionBaseY = screenH - padding - btnSize * 1.5;

        this.createButton(actionBaseX - spacing, actionBaseY + spacing, '↻', InputAction.ROTATE_CW);
        this.createButton(actionBaseX, actionBaseY, '⬇', InputAction.HARD_DROP);

        scene.add.existing(this);
        
        // Auto-hide on desktop (simple check for pointer capability vs touch capability can be added, assuming true for now unless setVisible(false) is called)
        if (!scene.sys.game.device.input.touch) {
            this.setVisible(false);
        }
    }

    private createButton(x: number, y: number, label: string, action: InputAction) {
        const bg = this.scene.add.rectangle(x, y, 58, 58, 0x000000, 0.5);
        bg.setInteractive({ useHandCursor: true });
        
        const text = this.scene.add.text(x, y, label, {
            fontFamily: 'monospace',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add([bg, text]);

        bg.on('pointerdown', () => {
            bg.setFillStyle(0x333333, 0.8);
            if (this.inputManager && typeof this.inputManager.registerTouchAction === 'function') {
                this.inputManager.registerTouchAction(action);
            }
        });

        bg.on('pointerup', () => {
            bg.setFillStyle(0x000000, 0.5);
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x000000, 0.5);
        });
    }
}
