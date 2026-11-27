import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { WorldInput, KEY_SPEED, KEY_STEP } from './input';
import { controlsHelpOpen } from '../../content/controls-help';
import { openStoryId } from '../../content/story-modal';

let input: WorldInput;
let distance: number;
let canScroll: boolean;

function key(type: string, name: string, options: Record<string, unknown> = {}): void {
  const event = new Event(type, { cancelable: true });
  Object.assign(event, { key: name, ...options });
  Object.defineProperty(event, 'target', { value: null });
  window.dispatchEvent(event);
}

beforeEach(() => {
  vi.stubGlobal('window', new EventTarget());
  vi.stubGlobal('document', new EventTarget());
  distance = 0;
  canScroll = true;
  input = new WorldInput({
    scrollBy: units => { distance += units; },
    setPointer: () => {},
    canScroll: () => canScroll,
  });
  input.bind();
});

afterEach(() => {
  input.unbind();
  controlsHelpOpen.set(false);
  openStoryId.set(null);
  vi.unstubAllGlobals();
});

test.each([30, 60, 120])('held arrows move at the same speed at %i fps', fps => {
  key('keydown', 'ArrowRight');
  for (let frame = 0; frame < fps; frame++) {
    key('keydown', 'ArrowRight', { repeat: true });
    input.update(1 / fps);
  }
  expect(distance).toBeCloseTo(KEY_STEP + KEY_SPEED);
  key('keyup', 'ArrowRight');
  input.update(0.05);
  expect(distance).toBeCloseTo(KEY_STEP + KEY_SPEED);

  key('keydown', 'ArrowLeft');
  for (let frame = 0; frame < fps; frame++) input.update(1 / fps);
  key('keyup', 'ArrowLeft');
  expect(distance).toBeCloseTo(0);
});

test('a quick press moves a small distance and simultaneous arrows do not keep moving', () => {
  key('keydown', 'ArrowRight');
  key('keyup', 'ArrowRight');
  expect(distance).toBe(KEY_STEP);
  key('keydown', 'ArrowLeft');
  key('keydown', 'ArrowRight');
  const previous = distance;
  input.update(0.05);
  expect(distance).toBe(previous);
});

test.each(['help', 'story', 'blur', 'visibility', 'disabled'])('%s clears held arrows', reason => {
  key('keydown', 'ArrowRight');
  if (reason === 'help') controlsHelpOpen.set(true);
  if (reason === 'story') openStoryId.set('test-story');
  if (reason === 'blur') window.dispatchEvent(new Event('blur'));
  if (reason === 'visibility') document.dispatchEvent(new Event('visibilitychange'));
  if (reason === 'disabled') canScroll = false;
  input.update(0.05);
  expect(distance).toBe(KEY_STEP);
  controlsHelpOpen.set(false);
  openStoryId.set(null);
  canScroll = true;
  input.update(0.05);
  expect(distance).toBe(KEY_STEP);
});

test('modifiers and focused controls keep their keyboard behavior', () => {
  key('keydown', 'ArrowRight', { ctrlKey: true });
  const event = new Event('keydown', { cancelable: true });
  Object.assign(event, { key: 'ArrowRight' });
  Object.defineProperty(event, 'target', { value: { closest: () => ({}), isContentEditable: false } });
  window.dispatchEvent(event);
  input.update(0.05);
  expect(distance).toBe(0);
  expect(event.defaultPrevented).toBe(false);
});

test('help leaves wheel events available to the dialog', () => {
  controlsHelpOpen.set(true);
  const wheel = new Event('wheel', { cancelable: true });
  Object.assign(wheel, { deltaY: 100, deltaX: 0, deltaMode: 0 });
  window.dispatchEvent(wheel);
  expect(distance).toBe(0);
  expect(wheel.defaultPrevented).toBe(false);
});
