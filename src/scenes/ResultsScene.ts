import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { FighterData } from '../engine/types';
import { audioManager, SFX } from '../engine/audio';

interface ResultsData {
    winner: FighterData;
    loser: FighterData;
    stats: {
        chainMax: number;
        gemsCleared: number;
        roundsWon: number;
    };
    mode: 'arcade' | 'versus';
}

/**
 * Results Scene
 * Victory screen showing stats and options to rematch or quit.
 */
export class ResultsScene extends Phaser.Scene {
    private data!: ResultsData;
    private menuItems: { text: Phaser.GameObjects.Text, action: () => void }[] = [];
    private selectedIndex: number = 0;

    constructor() {
        super('ResultsScene');
    }

    init(data: ResultsData) {
        this.data = data;
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.ARENA_BG);

        // Dramatic zoom tween for entry
        this.cameras.main.setZoom(1.5);
        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1,
            duration: 800,
            ease: 'Cubic.easeOut'
        });

        // Spotlights (simple colored rectangles blending)
        this.add.rectangle(GAME_WIDTH / 2, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.GOLD, 0.1)
            .setOrigin(0.5, 0)
            .setBlendMode(Phaser.BlendModes.ADD);

        const cx = GAME_WIDTH / 2;

        this.add.text(cx, 100, this.data.winner.displayName.toUpperCase(), {
            fontFamily: 'Arial',
            fontSize: '48px',
            fontStyle: 'bold',
            color: '#fbbf24' // GOLD
        }).setOrigin(0.5);

        this.add.text(cx, 160, 'WINS!', {
            fontFamily: 'Arial',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#22d3ee' // CYAN
        }).setOrigin(0.5);

        // Stats Panel
        const panelY = 300;
        const stats = [
            `Best Chain: ${this.data.stats.chainMax}`,
            `Gems Cleared: ${this.data.stats.gemsCleared}`,
            `Rounds Won: ${this.data.stats.roundsWon}`
        ];

        stats.forEach((stat, index) => {
            this.add.text(cx, panelY + index * 40, stat, {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff'
            }).setOrigin(0.5);
        });

        // Buttons
        const options = [
            { label: 'REMATCH', action: () => this.rematch() },
            { label: 'MENU', action: () => this.quitToMenu() },
        ];

        this.menuItems = [];
        this.selectedIndex = 0;

        options.forEach((opt, index) => {
            const y = 500 + index * 80;
            
            const textObj = this.add.text(cx, y, opt.label, {
                fontFamily: 'Arial',
                fontSize: '32px',
                fontStyle: 'bold',
                color: '#ffffff',
                backgroundColor: '#1a1030', // PURPLE_DARK
                padding: { x: 30, y: 15 }
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

        // Keyboard inputs
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-UP', this.moveUp, this);
            this.input.keyboard.on('keydown-DOWN', this.moveDown, this);
            this.input.keyboard.on('keydown-ENTER', this.confirmSelection, this);
            this.input.keyboard.on('keydown-SPACE', this.confirmSelection, this);
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

    private rematch() {
        this.scene.start('BattleScene', {
            p1Fighter: this.data.winner,
            p2Fighter: this.data.loser,
            mode: this.data.mode,
        });
    }

    private quitToMenu() {
        this.scene.start('MenuScene');
    }
}
