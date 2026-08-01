import Phaser from 'phaser';
import { FighterData, AnimationState } from '../engine/types';

/**
 * FighterSprite wraps a Phaser Sprite to manage fighter animations and idle logic.
 */
export class FighterSprite extends Phaser.GameObjects.Sprite {
    private fighterData: FighterData;
    private isP2: boolean;
    private currentState: AnimationState = AnimationState.IDLE;
    
    private fidgetTimer: number = 0;
    private fidgetTargetTime: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, fighterData: FighterData, isP2: boolean) {
        super(scene, x, y, fighterData.spriteKey);
        this.fighterData = fighterData;
        this.isP2 = isP2;

        this.setFlipX(this.isP2);
        this.scene.add.existing(this);
        
        // Return to idle after one-shot animations finish
        this.on('animationcomplete', this.onAnimationComplete, this);

        this.playIdle();
    }

    private playAnim(state: AnimationState) {
        this.currentState = state;
        this.play(`${this.fighterData.spriteKey}_${state}`);
    }

    private onAnimationComplete(anim: Phaser.Animations.Animation) {
        // If the animation is not idle or victory, and not knockdown, return to idle
        if (
            this.currentState !== AnimationState.IDLE && 
            this.currentState !== AnimationState.VICTORY && 
            this.currentState !== AnimationState.KNOCKDOWN
        ) {
            this.playIdle();
        }
    }

    public playIdle() {
        this.playAnim(AnimationState.IDLE);
        this.resetFidgetTimer();
    }

    public playJab() {
        this.playAnim(AnimationState.JAB);
    }

    public playFlinch() {
        this.playAnim(AnimationState.FLINCH);
    }

    public playKnockdown() {
        this.playAnim(AnimationState.KNOCKDOWN);
    }

    public playSuper() {
        this.playAnim(AnimationState.SUPER);
    }

    public playVictory() {
        this.playAnim(AnimationState.VICTORY);
    }

    public playGuard() {
        this.playAnim(AnimationState.GUARD);
    }

    public playTaunt() {
        this.playAnim(AnimationState.TAUNT);
    }

    private resetFidgetTimer() {
        this.fidgetTimer = 0;
        this.fidgetTargetTime = Phaser.Math.Between(
            this.fighterData.fidget.minInterval, 
            this.fighterData.fidget.maxInterval
        );
    }

    /**
     * Ticks the fidget timer, should be called in the scene's update loop
     * @param delta Time in ms since last update
     */
    public update(delta: number) {
        if (this.currentState === AnimationState.IDLE) {
            this.fidgetTimer += delta;

            if (this.fidgetTimer >= this.fidgetTargetTime) {
                // Play fidget A or B randomly
                const playFidgetA = Phaser.Math.Between(0, 1) === 0;
                this.playAnim(playFidgetA ? AnimationState.FIDGET_A : AnimationState.FIDGET_B);
                // The animationcomplete listener will return to idle and thereby reset the fidget timer
            }
        }
    }
}
