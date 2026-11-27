import { mount, unmount } from 'svelte';
import WallStory from '../../ui/WallStory.svelte';
import { STOP_COUNT, stopX } from '../route';
import { FINALE_STORY_X } from '../finale';

interface Story {
  element: HTMLDivElement;
  component: ReturnType<typeof mount>;
  x: number;
  /** Last states written to the DOM, so a still frame does no style work. */
  shown: boolean;
  active: boolean;
  opacity: number;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

/** One screen-space story card above every stop. */
export class StoryLayer {
  private stories: Story[] = [];

  constructor(private readonly layer: HTMLDivElement) {}

  create(): void {
    for (let index = 0; index <= STOP_COUNT; index++) {
      const x = index === STOP_COUNT ? FINALE_STORY_X : stopX(index);
      const element = document.createElement('div');
      element.className = 'wall-copy';
      if (index === STOP_COUNT) element.classList.add('is-finale');
      const component = mount(WallStory, { target: element, props: { index } });
      // Stories live in screen space, so every viewport centres them the same way
      // and keeps text steady while the 3D planes shift behind and in front.
      this.layer.append(element);
      // The copy stays click-through; the story button opts back into pointer events.
      element.style.pointerEvents = 'none';
      this.stories.push({ element, component, x, shown: true, active: false, opacity: 1 });
    }
  }

  resize(portrait: boolean): void {
    for (const story of this.stories) story.element.classList.toggle('is-portrait', portrait);
  }

  update(distance: number): void {
    const storyDistance = Math.min(distance, FINALE_STORY_X);
    for (const story of this.stories) {
      const absDiff = Math.abs(story.x - storyDistance);
      const opacity = 1 - smoothstep(1.5, 4.7, absDiff);
      const shown = opacity > 0.004;
      const active = shown && opacity > 0.85;
      if (shown !== story.shown) {
        story.shown = shown;
        story.element.style.display = shown ? '' : 'none';
      }
      if (shown && Math.abs(story.opacity - opacity) > 0.002) {
        story.opacity = opacity;
        story.element.style.opacity = opacity.toFixed(3);
      }
      // Touch the DOM only when the state really changes.
      if (active !== story.active) {
        story.active = active;
        story.element.inert = !active;
        story.element.setAttribute('aria-hidden', String(!active));
      }
    }
  }

  destroy(): void {
    for (const story of this.stories) {
      void unmount(story.component);
      story.element.remove();
    }
    this.stories = [];
  }
}
