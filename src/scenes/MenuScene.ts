import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config';
import { audioManager, SFX } from '../engine/audio';

interface MenuItem {
    card: Phaser.GameObjects.Graphics;
    title: Phaser.GameObjects.Text;
    subtitle: Phaser.GameObjects.Text;
    action: () => void;
}

/**
 * MenuScene
 * Styled after main_menu_mockup_1785555687774.jpg with 3D metallic gold/cyan arcade cards.
 */
export class MenuScene extends Phaser.Scene {
    private menuItems: MenuItem[] = [];
    private selectedIndex: number = 0;

    constructor() {
        super('MenuScene');
    }

    create() {
        this.cameras.main.setBackgroundColor(COLORS.ARENA_BG);
        this.cameras.main.fadeIn(400, 0, 0, 0);

        const cx = GAME_WIDTH / 2;

        // Background Venue Texture
        const bg = this.add.image(cx, GAME_HEIGHT / 2, 'arena-far').setOrigin(0.5);
        bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        bg.setAlpha(0.6);

        // Header Title Card Banner
        const headerBg = this.add.graphics();
        headerBg.fillStyle(0x0a0a16, 0.85);
        headerBg.fillRoundedRect(cx - 150, 45, 300, 70, 10);
        headerBg.lineStyle(3, 0xfbbf24, 1);
        headerBg.strokeRoundedRect(cx - 150, 45, 300, 70, 10);

        this.add.text(cx, 68, 'MAIN MENU', {
            fontFamily: 'Impact, sans-serif',
            fontSize: '32px',
            color: '#fbbf24',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 3, color: '#000000', blur: 3, fill: true }
        }).setOrigin(0.5);

        this.add.text(cx, 98, 'SELECT GAME MODE', {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#22d3ee',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Menu Options List
        const options = [
            {
                label: 'ARCADE MODE',
                sub: 'Warehouse Championship Gauntlet',
                action: () => this.scene.start('ArcadeScene')
            },
            {
                label: 'VERSUS CPU',
                sub: 'Quick Match vs Configurable AI',
                action: () => this.scene.start('SelectScene', { mode: 'versus' })
            },
            {
                label: 'HOW TO PLAY',
                sub: 'Gem Mechanics & SUPER Finishers',
                action: () => this.scene.start('TutorialScene')
            },
            {
                label: 'SETTINGS',
                sub: 'Audio & Screen Shake Controls',
                action: () => this.showComingSoon()
            },
        ];

        this.menuItems = [];
        this.selectedIndex = 0;

        const cardW = 320;
        const cardH = 75;
        const startY = 160;
        const gapY = 90;

        options.forEach((opt, index) => {
            const y = startY + index * gapY;

            // Graphics Card Container
            const card = this.add.graphics();

            // Main Title Text
            const title = this.add.text(cx - cardW / 2 + 20, y + 16, opt.label, {
                fontFamily: 'Impact, sans-serif',
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            });

            // Subtitle Text
            const subtitle = this.add.text(cx - cardW / 2 + 20, y + 46, opt.sub, {
                fontFamily: 'sans-serif',
                fontSize: '12px',
                color: '#9ca3af'
            });

            // Interactive Hit Zone
            const hitZone = this.add.zone(cx, y + cardH / 2, cardW, cardH).setInteractive({ useHandCursor: true });

            hitZone.on('pointerdown', () => {
                this.selectedIndex = index;
                this.updateSelection();
                this.confirmSelection();
            });

            hitZone.on('pointerover', () => {
                if (this.selectedIndex !== index) {
                    this.selectedIndex = index;
                    this.updateSelection();
                    this.playMoveSound();
                }
            });

            this.menuItems.push({ card, title, subtitle, action: opt.action });
        });

        this.updateSelection();

        // Keyboard Navigation
        if (this.input.keyboard) {
            this.input.keyboard.on('keydown-UP', this.moveUp, this);
            this.input.keyboard.on('keydown-DOWN', this.moveDown, this);
            this.input.keyboard.on('keydown-ENTER', this.confirmSelection, this);
            this.input.keyboard.on('keydown-SPACE', this.confirmSelection, this);
            this.input.keyboard.on('keydown-ESC', this.goBack, this);
        }

        // Gamepad Navigation
        if (this.input.gamepad) {
            this.input.gamepad.on('down', (pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button) => {
                if (button.index === 12) this.moveUp();
                if (button.index === 13) this.moveDown();
                if (button.index === 0) this.confirmSelection();
                if (button.index === 1) this.goBack();
            }, this);
        }
    }

    private updateSelection() {
        const cx = GAME_WIDTH / 2;
        const cardW = 320;
        const cardH = 75;
        const startY = 160;
        const gapY = 90;

        this.menuItems.forEach((item, index) => {
            const y = startY + index * gapY;
            const isSelected = index === this.selectedIndex;

            item.card.clear();

            if (isSelected) {
                // Glowing Metallic Gold/Cyan Selection Card
                item.card.fillStyle(0x1e1b4b, 0.95);
                item.card.fillRoundedRect(cx - cardW / 2, y, cardW, cardH, 10);
                item.card.lineStyle(3, 0xfbbf24, 1);
                item.card.strokeRoundedRect(cx - cardW / 2, y, cardW, cardH, 10);
                item.card.lineStyle(2, 0x22d3ee, 0.9);
                item.card.strokeRoundedRect(cx - cardW / 2 + 3, y + 3, cardW - 6, cardH - 6, 8);

                item.title.setColor('#fbbf24');
                item.subtitle.setColor('#67e8f9');
            } else {
                // Unselected Dark Card
                item.card.fillStyle(0x111827, 0.8);
                item.card.fillRoundedRect(cx - cardW / 2, y, cardW, cardH, 10);
                item.card.lineStyle(1.5, 0x374151, 0.8);
                item.card.strokeRoundedRect(cx - cardW / 2, y, cardW, cardH, 10);

                item.title.setColor('#e5e7eb');
                item.subtitle.setColor('#9ca3af');
            }
        });
    }

    private playMoveSound() {
        audioManager.play(SFX.MENU_MOVE);
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
        audioManager.play(SFX.MENU_CONFIRM);
        this.menuItems[this.selectedIndex].action();
    }

    private goBack() {
        audioManager.play(SFX.MENU_BACK);
        this.scene.start('TitleScene');
    }

    private showComingSoon() {
        const item = this.menuItems[this.selectedIndex];
        const origTitle = item.title.text;
        item.title.setText('COMING SOON');
        item.title.setColor('#ef4444');

        this.time.delayedCall(1200, () => {
            if (this.scene.isActive('MenuScene')) {
                item.title.setText(origTitle);
                this.updateSelection();
            }
        });
    }
}
