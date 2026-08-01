/**
 * Crash Out: Ring Rush — Application Entry Point
 *
 * Initializes the Phaser.Game instance with all registered scenes.
 * Per GDD v8.0.0 Section 11.3.
 */
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './config';

// Scene imports
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { MenuScene } from './scenes/MenuScene';
import { SelectScene } from './scenes/SelectScene';
import { BattleScene } from './scenes/BattleScene';
import { PauseScene } from './scenes/PauseScene';
import { ResultsScene } from './scenes/ResultsScene';
import { TutorialScene } from './scenes/TutorialScene';

/**
 * Phaser Game Configuration
 * Per GDD v8.0.0 Section 11.3
 */
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    pixelArt: true,
    parent: 'game-container',
    backgroundColor: COLORS.ARENA_BG,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [
        BootScene,
        TitleScene,
        MenuScene,
        SelectScene,
        BattleScene,
        PauseScene,
        ResultsScene,
        TutorialScene,
    ],
    input: {
        gamepad: true,
    },
    audio: {
        disableWebAudio: false,
    },
};

// Boot the game
const game = new Phaser.Game(config);

export default game;
