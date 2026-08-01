/**
 * Crash Out: Ring Rush — Unified Input Abstraction
 *
 * Maps keyboard, gamepad, and touch inputs to a unified InputAction enum.
 * Implements DAS (Delayed Auto Shift) for held direction keys.
 *
 * Per GDD v8.0.0 Section 10 & Directive #8.
 */
import Phaser from 'phaser';
import { InputAction } from '../engine/types';
import { DAS_DELAY_MS, DAS_REPEAT_MS } from '../config';

/** Keyboard key bindings */
const KEY_BINDINGS: Record<string, InputAction> = {
    ArrowLeft: InputAction.LEFT,
    ArrowRight: InputAction.RIGHT,
    ArrowDown: InputAction.DOWN,
    ArrowUp: InputAction.UP,
    KeyZ: InputAction.ROTATE_CW,
    KeyX: InputAction.ROTATE_CCW,
    Space: InputAction.HARD_DROP,
    KeyC: InputAction.SUPER,
    ShiftLeft: InputAction.SUPER,
    Escape: InputAction.PAUSE,
    Enter: InputAction.CONFIRM,
    Backspace: InputAction.BACK,
    // WASD alternative
    KeyA: InputAction.LEFT,
    KeyD: InputAction.RIGHT,
    KeyS: InputAction.DOWN,
    KeyW: InputAction.UP,
};

/** Gamepad button bindings (standard gamepad mapping) */
const GAMEPAD_BINDINGS: Record<number, InputAction> = {
    12: InputAction.UP,       // D-pad up
    13: InputAction.DOWN,     // D-pad down
    14: InputAction.LEFT,     // D-pad left
    15: InputAction.RIGHT,    // D-pad right
    0: InputAction.ROTATE_CW,   // A / Cross
    1: InputAction.ROTATE_CCW,  // B / Circle
    2: InputAction.HARD_DROP,   // X / Square
    3: InputAction.HARD_DROP,   // Y / Triangle
    9: InputAction.PAUSE,       // Start
    8: InputAction.BACK,        // Select
};

/** DAS state for a single direction */
interface DASState {
    held: boolean;
    holdStartTime: number;
    lastRepeatTime: number;
}

/**
 * InputManager — unified input handling for keyboard, gamepad, and touch.
 *
 * Usage:
 * ```typescript
 * const input = new InputManager(scene);
 * // In scene update():
 * const actions = input.poll();
 * if (actions.includes(InputAction.LEFT)) { ... }
 * ```
 */
export class InputManager {
    private scene: Phaser.Scene;
    private keys: Phaser.Input.Keyboard.KeyboardPlugin | null;
    private dasStates: Map<InputAction, DASState> = new Map();
    private justPressedActions: Set<InputAction> = new Set();
    private activeActions: Set<InputAction> = new Set();

    /** Touch button callbacks registered from TouchControls */
    private touchActions: Set<InputAction> = new Set();

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.keys = scene.input.keyboard;

        // Initialize DAS for directional inputs
        const dasActions = [InputAction.LEFT, InputAction.RIGHT, InputAction.DOWN];
        for (const action of dasActions) {
            this.dasStates.set(action, {
                held: false,
                holdStartTime: 0,
                lastRepeatTime: 0,
            });
        }

        // Register keyboard listeners
        if (this.keys) {
            this.keys.on('keydown', (event: KeyboardEvent) => {
                const action = KEY_BINDINGS[event.code];
                if (action !== undefined) {
                    this.justPressedActions.add(action);
                    this.activeActions.add(action);

                    // Start DAS tracking
                    const das = this.dasStates.get(action);
                    if (das && !das.held) {
                        das.held = true;
                        das.holdStartTime = this.scene.time.now;
                        das.lastRepeatTime = 0;
                    }
                }
            });

            this.keys.on('keyup', (event: KeyboardEvent) => {
                const action = KEY_BINDINGS[event.code];
                if (action !== undefined) {
                    this.activeActions.delete(action);

                    // Stop DAS tracking
                    const das = this.dasStates.get(action);
                    if (das) {
                        das.held = false;
                    }
                }
            });
        }
    }

    /**
     * Registers a touch button press (called by TouchControls).
     * @param action The InputAction triggered by touch.
     */
    registerTouchAction(action: InputAction): void {
        this.touchActions.add(action);
        this.justPressedActions.add(action);
    }

    /**
     * Polls for all active input actions this frame.
     * Applies DAS for held directional keys.
     * @returns Array of InputActions that should be processed this frame.
     */
    poll(): InputAction[] {
        const now = this.scene.time.now;
        const result: InputAction[] = [];

        // Process just-pressed actions (one-shot)
        for (const action of this.justPressedActions) {
            result.push(action);
        }
        this.justPressedActions.clear();
        this.touchActions.clear();

        // Process DAS for held directional keys
        for (const [action, das] of this.dasStates) {
            if (!das.held) continue;

            const holdDuration = now - das.holdStartTime;
            if (holdDuration >= DAS_DELAY_MS) {
                // DAS active — check repeat interval
                if (das.lastRepeatTime === 0) {
                    // First DAS repeat
                    das.lastRepeatTime = now;
                    if (!result.includes(action)) {
                        result.push(action);
                    }
                } else if (now - das.lastRepeatTime >= DAS_REPEAT_MS) {
                    das.lastRepeatTime = now;
                    if (!result.includes(action)) {
                        result.push(action);
                    }
                }
            }
        }

        // Process gamepad (if connected)
        if (this.scene.input.gamepad && this.scene.input.gamepad.total > 0) {
            const pad = this.scene.input.gamepad.getPad(0);
            if (pad) {
                for (const [buttonIndex, action] of Object.entries(GAMEPAD_BINDINGS)) {
                    const btn = pad.buttons[parseInt(buttonIndex)];
                    if (btn && btn.pressed && !result.includes(action)) {
                        result.push(action);
                    }
                }

                // Analog stick → directional actions
                if (pad.axes.length >= 2) {
                    const lx = pad.axes[0].getValue();
                    const ly = pad.axes[1].getValue();
                    if (lx < -0.5 && !result.includes(InputAction.LEFT)) result.push(InputAction.LEFT);
                    if (lx > 0.5 && !result.includes(InputAction.RIGHT)) result.push(InputAction.RIGHT);
                    if (ly > 0.5 && !result.includes(InputAction.DOWN)) result.push(InputAction.DOWN);
                    if (ly < -0.5 && !result.includes(InputAction.UP)) result.push(InputAction.UP);
                }
            }
        }

        return result;
    }

    /**
     * Checks if a specific action was just pressed this frame (not held/repeated).
     */
    wasJustPressed(action: InputAction): boolean {
        return this.justPressedActions.has(action);
    }

    /**
     * Checks if a specific action is currently held down.
     */
    isHeld(action: InputAction): boolean {
        return this.activeActions.has(action);
    }

    /** Clean up listeners */
    destroy(): void {
        if (this.keys) {
            this.keys.removeAllListeners();
        }
        this.dasStates.clear();
        this.justPressedActions.clear();
        this.activeActions.clear();
        this.touchActions.clear();
    }
}
