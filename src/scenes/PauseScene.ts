import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { audioManager, SFX } from '../engine/audio';

/**
 * Pause Scene
 * Overlay for pause menu.
 */
export class PauseScene extends Phaser.Scene {
    private menuItems: { text: Phaser.GameObjects.Text, action: () => void }[] = [];
    private selectedIndex: number = 0;
    
    constructor() {
        super('PauseScene');
    }

    create() {
        // Semi-transparent dark overlay
        const overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setOrigin(0);

        const cx = GAME_WIDTH / 2;
        const cy = GAME_HEIGHT / 2 - 100;

        this.add.text(cx, cy, 'PAUSED', {
            fontFamily: 'Arial',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#fbbf24'
        }).setOrigin(0.5);

        const options = [
            { label: 'RESUME', action: () => this.resume() },
            { label: 'RESTART', action: () => this.restart() },
            { label: 'QUIT', action: () => this.quit() },
        ];

        this.menuItems = [];
        this.selectedIndex = 0;

        options.forEach((opt, index) => {
            const y = cy + 100 + index * 70;
            
            const textObj = this.add.text(cx, y, opt.label, {
                fontFamily: 'Arial',
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5);
            
            textObj.setInteractive({ useHandCursor: true });
            textObj.on('pointerdown', () => {
                this.selectedIndex = index;
                this.updateSelection();
                this.confirmSelection();
            });
            textObj.on('pointerover', () => {
                if (this.selectedIndex !== index) {
                    this.selectedIndex = index;
                    this.updateSelection();
                    this.playMoveSound();
                }
            });

            this.menuItems.push({ text: textObj, action: opt.action });
        });

        this.updateSelection();

        // Keyboard input
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-UP', this.moveUp, this);
            this.input.keyboard.on('keydown-DOWN', this.moveDown, this);
            this.input.keyboard.on('keydown-ENTER', this.confirmSelection, this);
            this.input.keyboard.on('keydown-SPACE', this.confirmSelection, this);
            this.input.keyboard.on('keydown-ESC', this.resume, this); // ESC resumes
        }
    }

    private updateSelection() {
        this.menuItems.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.text.setColor('#22d3ee'); // Cyan
                item.text.setStroke('#67e8f9', 2);
            } else {
                item.text.setColor('#9ca3af'); // Grey
                item.text.setStroke('#000000', 0);
            }
        });
    }

    private playMoveSound() {
        if (audioManager && audioManager.play) {
            audioManager.play(SFX?.MENU_MOVE || 'MENU_MOVE');
        }
    }

    private moveUp() {
        this.selectedIndex--;
        if (this.selectedIndex < 0) this.selectedIndex = this.menuItems.length - 1;
        this.updateSelection();
        this.playMoveSound();
    }

    private moveDown() {
        this.selectedIndex++;
        if (this.selectedIndex >= this.menuItems.length) this.selectedIndex = 0;
        this.updateSelection();
        this.playMoveSound();
    }

    private confirmSelection() {
        if (audioManager && audioManager.play) {
            audioManager.play(SFX?.MENU_SELECT || 'MENU_SELECT');
        }
        this.menuItems[this.selectedIndex].action();
    }

    private resume() {
        if (audioManager && audioManager.play) {
            audioManager.play(SFX?.MENU_BACK || 'MENU_BACK');
        }
        this.scene.resume('BattleScene');
        this.scene.stop();
    }

    private restart() {
        const battleScene = this.scene.get('BattleScene');
        const data = (battleScene.scene.settings.data) || {};
        
        this.scene.stop('BattleScene');
        this.scene.start('BattleScene', data);
        this.scene.stop(); // Stop PauseScene
    }

    private quit() {
        this.scene.stop('BattleScene');
        this.scene.start('MenuScene');
        this.scene.stop(); // Stop PauseScene
    }
}
