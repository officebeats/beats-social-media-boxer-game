import Phaser from 'phaser';
import { 
    CAMERA_LERP, 
    CAMERA_DRIFT_PER_ATTACK, 
    CAMERA_MAX_DRIFT, 
    CAMERA_IDLE_TIMEOUT_MS 
} from '../config';

/**
 * CameraController handles horizontal camera drifting and screen shake effects.
 */
export class CameraController {
    private scene: Phaser.Scene;
    private _currentOffset: number = 0;
    private targetOffset: number = 0;
    private lastAttackTime: number = 0;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /**
     * Shifts the camera target offset toward the opponent when an attack occurs
     * @param attacker Who attacked ('p1' or 'p2')
     */
    public onAttack(attacker: 'p1' | 'p2') {
        const time = this.scene.time.now;
        this.lastAttackTime = time;

        // Assuming P1 is on the left (negative offset pushes camera right), P2 on right (positive offset pushes camera left)
        const driftAmount = attacker === 'p1' ? CAMERA_DRIFT_PER_ATTACK : -CAMERA_DRIFT_PER_ATTACK;
        
        this.targetOffset += driftAmount;

        // Clamp to max drift
        this.targetOffset = Phaser.Math.Clamp(this.targetOffset, -CAMERA_MAX_DRIFT, CAMERA_MAX_DRIFT);
    }

    /**
     * Triggers a screen shake effect
     * @param intensity Shake intensity (0.0 to 1.0)
     * @param duration Shake duration in ms
     */
    public shake(intensity: number, duration: number) {
        this.scene.cameras.main.shake(duration, intensity);
    }

    /**
     * Updates camera lerping and decay logic. Should be called in scene's update loop.
     */
    public update() {
        const time = this.scene.time.now;

        // Decay target offset to 0 if no attacks recently
        if (time - this.lastAttackTime > CAMERA_IDLE_TIMEOUT_MS) {
            this.targetOffset = 0;
        }

        // Lerp current offset toward target
        this._currentOffset = Phaser.Math.Linear(this._currentOffset, this.targetOffset, CAMERA_LERP);
    }

    /**
     * Current camera offset for applying parallax effects
     */
    public get currentOffset(): number {
        return this._currentOffset;
    }
}
