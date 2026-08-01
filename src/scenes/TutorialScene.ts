import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { audioManager, SFX } from '../engine/audio';

/**
 * Tutorial Scene
 * Shows how to play instructions.
 */
export class TutorialScene extends Phaser.Scene {
    constructor() {
        super('TutorialScene');
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.ARENA_BG);

        this.add.text(GAME_WIDTH / 2, 60, 'HOW TO PLAY', {
            fontFamily: 'Arial',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#fbbf24'
        }).setOrigin(0.5);

        const instructions = [
            "• Match 3+ gems of the same color to clear them.",
            "• Chain combos: clearing gems causes gravity, which can trigger more matches.",
            "• Power gems: 4+ gems of the same color fuse into a power gem for massive damage.",
            "• Crash gems (diamonds): detonate ALL gems of one color.",
            "• Controls: Arrow keys to move, Z/X to rotate, Space for hard drop.",
            "• SUPER meter: fills as you clear gems. When full, press to unleash a devastating SUPER finisher!"
        ];

        const style = {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            wordWrap: { width: GAME_WIDTH - 60 },
            lineSpacing: 10
        };

        let currentY = 120;
        instructions.forEach(line => {
            const t = this.add.text(30, currentY, line, style);
            currentY += t.height + 20;
        });

        const backBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'BACK', {
            fontFamily: 'Arial',
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ffffff',
            backgroundColor: '#1a1030',
            padding: { x: 30, y: 10 }
        }).setOrigin(0.5);

        backBtn.setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => this.goBack());
        
        const pulse = this.tweens.add({
            targets: backBtn,
            alpha: 0.7,
            yoyo: true,
            repeat: -1,
            duration: 1000
        });

        // Inputs
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-ESC', this.goBack, this);
            this.input.keyboard.on('keydown-ENTER', this.goBack, this);
            this.input.keyboard.on('keydown-SPACE', this.goBack, this);
            this.input.keyboard.on('keydown-BACKSPACE', this.goBack, this);
        }
    }

    private goBack() {
        if (audioManager && audioManager.play) {
            audioManager.play(SFX?.MENU_BACK || 'MENU_BACK');
        }
        this.scene.start('MenuScene');
    }
}
