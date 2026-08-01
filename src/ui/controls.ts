export interface ControlCallbacks {
  onLeft: () => void;
  onRight: () => void;
  onRotate: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onSuper: () => void;
}

export class InputControlsManager {
  private callbacks: ControlCallbacks;
  private container: HTMLElement;

  constructor(container: HTMLElement, callbacks: ControlCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.attachKeyboardListeners();
    this.attachTouchDelegation();
  }

  private attachKeyboardListeners() {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys & space
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'KeyZ', 'KeyX'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.callbacks.onLeft();
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.callbacks.onRight();
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'KeyX':
          this.callbacks.onRotate();
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.callbacks.onSoftDrop();
          break;
        case 'Space':
          this.callbacks.onHardDrop();
          break;
        case 'ShiftLeft':
        case 'KeyZ':
          this.callbacks.onSuper();
          break;
      }
    });
  }

  private attachTouchDelegation() {
    // Persistent container delegation on pointerdown / click to prevent dropped taps or iOS audio lockouts
    this.container.addEventListener('pointerdown', (e: PointerEvent) => {
      const target = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
      if (!target) return;

      const action = target.getAttribute('data-action');
      switch (action) {
        case 'left':
          this.callbacks.onLeft();
          break;
        case 'right':
          this.callbacks.onRight();
          break;
        case 'rotate':
          this.callbacks.onRotate();
          break;
        case 'down':
          this.callbacks.onSoftDrop();
          break;
        case 'drop':
          this.callbacks.onHardDrop();
          break;
        case 'super':
          this.callbacks.onSuper();
          break;
      }
    });
  }
}
