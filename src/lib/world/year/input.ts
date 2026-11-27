import { openStoryId } from '../../content/story-modal';
import { controlsHelpOpen } from '../../content/controls-help';

// One wheel notch or drag event moves at most a fraction of a station.
export const STEP_LIMIT = 1.6;
export const KEY_SPEED = 4;
export const KEY_STEP = 0.36;

export interface WorldInputHandlers {
  scrollBy: (units: number, limit?: number) => void;
  setPointer: (x: number, y: number) => void;
  canScroll: () => boolean;
}

/** Wheel, key, touch, and pointer input for the whole route. */
export class WorldInput {
  private touchActive = false;
  private touchLastX = 0;
  private touchLastY = 0;
  private heldKeys = new Set<string>();
  private subscriptions: (() => void)[] = [];
  private storyOpen = false;
  private helpOpen = false;

  constructor(private readonly handlers: WorldInputHandlers) {}

  private get blocked(): boolean {
    return this.storyOpen || this.helpOpen;
  }

  update(delta: number): void {
    if (this.blocked || !this.handlers.canScroll()) {
      this.reset();
      return;
    }
    const direction = Number(this.heldKeys.has('ArrowRight')) - Number(this.heldKeys.has('ArrowLeft'));
    if (direction) this.handlers.scrollBy(direction * KEY_SPEED * Math.max(0, Math.min(delta, 0.05)));
  }

  bind(): void {
    window.addEventListener('pointermove', this.movePointer);
    window.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.reset);
    document.addEventListener('visibilitychange', this.reset);
    this.subscriptions = [
      openStoryId.subscribe(value => {
        this.storyOpen = !!value;
        if (value) this.reset();
      }),
      controlsHelpOpen.subscribe(value => {
        this.helpOpen = !!value;
        if (value) this.reset();
      }),
    ];
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', this.onTouchEnd, { passive: true });
  }

  unbind(): void {
    window.removeEventListener('pointermove', this.movePointer);
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.reset);
    document.removeEventListener('visibilitychange', this.reset);
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions = [];
    this.reset();
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('touchcancel', this.onTouchEnd);
  }

  private movePointer = (event: PointerEvent): void => {
    if (this.blocked) return;
    if (event.pointerType === 'touch') return;
    this.handlers.setPointer(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
    );
  };

  private onWheel = (event: WheelEvent): void => {
    if (this.blocked) return;
    if (!this.handlers.canScroll()) return;
    event.preventDefault();
    const raw = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    const scale = event.deltaMode === 1 ? 32 : event.deltaMode === 2 ? 400 : 1;
    this.handlers.scrollBy(raw * scale * 0.007);
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    if (this.blocked) return;
    if (!this.handlers.canScroll()) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (target && (target.isContentEditable || target.closest('input, textarea, select, [role="slider"]'))) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      if (event.repeat || this.heldKeys.has(event.key)) return;
      this.heldKeys.add(event.key);
      this.handlers.scrollBy((event.key === 'ArrowRight' ? 1 : -1) * KEY_STEP);
    }
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.heldKeys.delete(event.key);
  };

  private reset = (): void => {
    this.heldKeys.clear();
    this.touchActive = false;
  };

  private isInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    return target.closest('button, a, .language-switch, .object-spark, .object-fact') !== null;
  }

  private onTouchStart = (event: TouchEvent): void => {
    if (this.blocked) return;
    if (!this.handlers.canScroll() || event.touches.length !== 1) return;
    if (this.isInteractiveTarget(event.target)) return;
    const touch = event.touches[0];
    this.touchActive = true;
    this.touchLastX = touch.clientX;
    this.touchLastY = touch.clientY;
  };

  private onTouchMove = (event: TouchEvent): void => {
    if (this.blocked) {
      this.touchActive = false;
      return;
    }
    if (!this.handlers.canScroll()) {
      this.touchActive = false;
      return;
    }
    if (!this.touchActive || event.touches.length !== 1) return;
    event.preventDefault();
    const touch = event.touches[0];
    const dx = touch.clientX - this.touchLastX;
    const dy = touch.clientY - this.touchLastY;
    this.touchLastX = touch.clientX;
    this.touchLastY = touch.clientY;

    const span = Math.max(window.innerWidth, 320);
    this.handlers.scrollBy(((-dx * 1.15 - dy * 0.75) / span) * 3.2);
  };

  private onTouchEnd = (): void => {
    this.touchActive = false;
  };
}
