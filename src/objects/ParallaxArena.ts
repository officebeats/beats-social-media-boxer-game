import Phaser from 'phaser';

/**
 * ParallaxArena handles the rendering and parallax scrolling of the arena backgrounds.
 */
export class ParallaxArena {
    private scene: Phaser.Scene;
    private bgFar: Phaser.GameObjects.TileSprite;
    private bgMid: Phaser.GameObjects.TileSprite;
    private fighterContainer: Phaser.GameObjects.Container;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        
        const width = 390;
        const height = 844;

        // Depth 0: Far background
        this.bgFar = this.scene.add.tileSprite(width / 2, height / 2, width, height, 'arena-far');
        this.bgFar.setDepth(0);

        // Depth 1: Mid background
        this.bgMid = this.scene.add.tileSprite(width / 2, height / 2, width, height, 'arena-mid');
        this.bgMid.setDepth(1);

        // Depth 2: Fighter Container
        this.fighterContainer = this.scene.add.container(0, 0);
        this.fighterContainer.setDepth(2);
    }

    /**
     * Updates the parallax scrolling based on camera offset
     * @param cameraOffset Current camera offset value
     */
    update(cameraOffset: number) {
        this.bgFar.tilePositionX = cameraOffset * 0.15; // PARALLAX_FAR
        this.bgMid.tilePositionX = cameraOffset * 0.5;  // PARALLAX_MID
        this.fighterContainer.x = -cameraOffset * 1.0; // 1.0x parallax for fighters/foreground
    }

    /**
     * Gets the container where fighters should be added
     * @returns The fighter container
     */
    getFighterContainer(): Phaser.GameObjects.Container {
        return this.fighterContainer;
    }
}
