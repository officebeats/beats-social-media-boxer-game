import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { InputAction } from '../engine/types';
import { audioManager, SFX } from '../engine/audio';

/**
 * Menu Scene
 * The main menu of the game.
 */
export class MenuScene extends Phaser.Scene {
    private menuItems: { text: Phaser.GameObjects.Text, action: () => void }[] = [];
    private selectedIndex: number = 0;

    constructor() {
        super('MenuScene');
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.ARENA_BG);
        this.cameras.main.fadeIn(500, 0, 0, 0);

        const cx = GAME_WIDTH / 2;

        this.add.text(cx, 100, 'MAIN MENU', {
            fontFamily: 'Arial',
            fontSize: '40px',
            fontStyle: 'bold',
            color: '#fbbf24'
        }).setOrigin(0.5);

        const options = [
            { label: 'ARCADE MODE', action: () => this.startGame('arcade') },
            { label: 'VS CPU', action: () => this.startGame('versus') },
            { label: 'HOW TO PLAY', action: () => this.scene.start('TutorialScene') },
            { label: 'OPTIONS', action: () => this.showComingSoon() },
        ];

        this.menuItems = [];
        this.selectedIndex = 0;

        options.forEach((opt, index) => {
            const y = 250 + index * 80;
            
            // Arcade button style
            const textObj = this.add.text(cx, y, opt.label, {
                fontFamily: 'Arial',
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#ffffff',
                backgroundColor: '#1a1030', // PURPLE_DARK
                padding: { x: 20, y: 10 }
            }).setOrigin(0.5);
            
            // Interactive for touch/mouse
            textObj.setInteractive({ useHandCursor: true });
            textObj.on('pointerdown', () => {
                this.selectedIndex = index;
                this.updateSelection();
                this.confirmSelection();
            });
            textObj.on('pointerover', () => {
                this.selectedIndex = index;
                this.updateSelection();
                this.playMoveSound();
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
            this.input.keyboard.on('keydown-ESC', this.goBack, this);
        }

        // Gamepad input mapping
        if (this.input.gamepad) {
            this.input.gamepad.on('down', (pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button) => {
                if (button.index === 12) this.moveUp(); // DPAD UP
                if (button.index === 13) this.moveDown(); // DPAD DOWN
                if (button.index === 0) this.confirmSelection(); // A
                if (button.index === 1) this.goBack(); // B
            }, this);
        }
    }

    private updateSelection() {
        this.menuItems.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.text.setColor('#22d3ee'); // Cyan glow
                item.text.setStroke('#67e8f9', 2);
            } else {
                item.text.setColor('#9ca3af'); // Grey/White
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

    private goBack() {
        if (audioManager && audioManager.play) {
            audioManager.play(SFX?.MENU_BACK || 'MENU_BACK');
        }
        this.scene.start('TitleScene');
    }

    private startGame(mode: 'arcade' | 'versus') {
        this.scene.start('SelectScene', { mode });
    }

    private showComingSoon() {
        const item = this.menuItems[this.selectedIndex].text;
        const originalText = item.text;
        item.setText('COMING SOON');
        item.setColor('#ef4444'); // Red
        
        this.time.delayedCall(1000, () => {
            if (this.scene.isActive('MenuScene')) {
                item.setText(originalText);
                this.updateSelection();
            }
        });
    }
}
