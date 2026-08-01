import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { FIGHTER_ROSTER } from '../engine/fighters';
import { FighterData } from '../engine/types';
import { audioManager, SFX } from '../engine/audio';

/**
 * Select Scene
 * Character selection screen.
 */
export class SelectScene extends Phaser.Scene {
    private mode: 'arcade' | 'versus' = 'arcade';
    private portraits: Phaser.GameObjects.Rectangle[] = [];
    private selectedIndex: number = 0;
    private p1Fighter: FighterData | null = null;
    private p2Fighter: FighterData | null = null;
    private panelTextName!: Phaser.GameObjects.Text;
    private panelTextTagline!: Phaser.GameObjects.Text;
    private panelTextPassive!: Phaser.GameObjects.Text;
    private highlightRect!: Phaser.GameObjects.Rectangle;

    constructor() {
        super('SelectScene');
    }

    init(data: { mode?: 'arcade' | 'versus' }) {
        this.mode = data.mode || 'arcade';
        this.selectedIndex = 0;
        this.p1Fighter = null;
        this.p2Fighter = null;
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.ARENA_BG);

        this.add.text(GAME_WIDTH / 2, 60, 'SELECT YOUR FIGHTER', {
            fontFamily: 'Arial',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#fbbf24'
        }).setOrigin(0.5);

        // Side panel for stats
        const panelY = 550;
        this.panelTextName = this.add.text(GAME_WIDTH / 2, panelY, '', {
            fontFamily: 'Arial', fontSize: '28px', fontStyle: 'bold', color: '#22d3ee'
        }).setOrigin(0.5);
        
        this.panelTextTagline = this.add.text(GAME_WIDTH / 2, panelY + 40, '', {
            fontFamily: 'Arial', fontSize: '20px', fontStyle: 'italic', color: '#fbbf24'
        }).setOrigin(0.5);
        
        this.panelTextPassive = this.add.text(GAME_WIDTH / 2, panelY + 80, '', {
            fontFamily: 'Arial', fontSize: '18px', color: '#ffffff',
            align: 'center', wordWrap: { width: GAME_WIDTH - 40 }
        }).setOrigin(0.5);

        // Highlight for selected portrait
        this.highlightRect = this.add.rectangle(0, 0, 70, 70).setStrokeStyle(4, COLORS.CYAN).setDepth(10);

        // Grid parameters (14 fighters: 2 rows x 7 cols)
        const cols = 7;
        const rows = 2;
        const startX = GAME_WIDTH / 2 - ((cols - 1) * 45) / 2;
        const startY = 250;
        const spacing = 45; // 40 size + 5 gap
        const size = 40;

        this.portraits = [];

        FIGHTER_ROSTER.forEach((fighter, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = startX + col * spacing;
            const y = startY + row * spacing;

            // Placeholder portrait (color based on favorite color or random)
            const color = this.getColorForFighter(fighter);
            const portrait = this.add.rectangle(x, y, size, size, color);
            portrait.setInteractive();
            portrait.on('pointerdown', () => {
                this.selectedIndex = index;
                this.updateSelection();
                this.confirmSelection();
            });
            portrait.on('pointerover', () => {
                if (this.selectedIndex !== index) {
                    this.selectedIndex = index;
                    this.updateSelection();
                    this.playMoveSound();
                }
            });

            this.portraits.push(portrait);
        });

        this.updateSelection();

        // Inputs
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-LEFT', () => this.moveSelection(-1, 0));
            this.input.keyboard.on('keydown-RIGHT', () => this.moveSelection(1, 0));
            this.input.keyboard.on('keydown-UP', () => this.moveSelection(0, -1));
            this.input.keyboard.on('keydown-DOWN', () => this.moveSelection(0, 1));
            this.input.keyboard.on('keydown-ENTER', this.confirmSelection, this);
            this.input.keyboard.on('keydown-SPACE', this.confirmSelection, this);
            this.input.keyboard.on('keydown-ESC', this.goBack, this);
        }
    }

    private getColorForFighter(fighter: FighterData): number {
        // Just assigning some color based on favoredColor for placeholder
        switch (fighter.dropPattern.favoredColor) {
            case 'RED': return COLORS.GEM_RED;
            case 'BLUE': return COLORS.GEM_BLUE;
            case 'GREEN': return COLORS.GEM_GREEN;
            case 'YELLOW': return COLORS.GEM_YELLOW;
            case 'PURPLE': return COLORS.GEM_PURPLE;
            default: return 0x888888;
        }
    }

    private moveSelection(dx: number, dy: number) {
        const cols = 7;
        let col = this.selectedIndex % cols;
        let row = Math.floor(this.selectedIndex / cols);

        col += dx;
        row += dy;

        // Wrap around
        if (col < 0) col = cols - 1;
        if (col >= cols) col = 0;
        if (row < 0) row = 1;
        if (row > 1) row = 0;

        this.selectedIndex = row * cols + col;
        
        // Ensure index doesn't exceed roster if not fully rectangular
        if (this.selectedIndex >= FIGHTER_ROSTER.length) {
            this.selectedIndex = FIGHTER_ROSTER.length - 1;
        }

        this.updateSelection();
        this.playMoveSound();
    }

    private updateSelection() {
        const fighter = FIGHTER_ROSTER[this.selectedIndex];
        
        // Move highlight
        const targetPortrait = this.portraits[this.selectedIndex];
        if (targetPortrait) {
            this.highlightRect.setPosition(targetPortrait.x, targetPortrait.y);
            this.highlightRect.setSize(targetPortrait.width + 8, targetPortrait.height + 8);
        }

        // Update panel
        this.panelTextName.setText(fighter.displayName.toUpperCase());
        this.panelTextTagline.setText(`"${fighter.tagline}"`);
        this.panelTextPassive.setText(`Passive: ${fighter.passive.name}\n${fighter.passive.description}`);
    }

    private playMoveSound() {
        if (audioManager && audioManager.play) {
            audioManager.play(SFX?.MENU_MOVE || 'MENU_MOVE');
        }
    }

    private confirmSelection() {
        if (audioManager && audioManager.play) {
            audioManager.play(SFX?.MENU_SELECT || 'MENU_SELECT');
        }

        this.p1Fighter = FIGHTER_ROSTER[this.selectedIndex];

        // Auto-select random opponent
        const randomIdx = Phaser.Math.Between(0, FIGHTER_ROSTER.length - 1);
        this.p2Fighter = FIGHTER_ROSTER[randomIdx];

        this.scene.start('BattleScene', { 
            p1Fighter: this.p1Fighter, 
            p2Fighter: this.p2Fighter, 
            mode: this.mode 
        });
    }

    private goBack() {
        if (audioManager && audioManager.play) {
            audioManager.play(SFX?.MENU_BACK || 'MENU_BACK');
        }
        this.scene.start('MenuScene');
    }
}
