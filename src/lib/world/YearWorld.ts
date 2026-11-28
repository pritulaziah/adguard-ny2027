import * as THREE from 'three';
import type { WebGPURenderer } from 'three/webgpu';
import { get } from 'svelte/store';
import type { Interaction } from '../content/i18n';
import { objectFact } from '../content/object-fact';
import { openStoryId } from '../content/story-modal';
import { needsMotionStart, type JourneyStore, type JourneyState } from './journey-state';
import { resetPaperMaterials } from './paper-materials';
import { resetTemplates } from './paper-geometry';
import { createPaperScenery, type PaperSet } from './scenery';
import { SeasonalFleet } from './vehicles';
import { resetWheelTemplates } from './vehicles/wheels';
import type { MotionFrame } from './part-motion';
import { JourneyMotion, stopIndexAt } from './route';
import { FINALE_CAR_X } from './finale';
import { createYieldPacer } from './schedule';
import { CameraRig } from './year/camera';
import { CssLayer } from './year/css-layer';
import { WorldInput, STEP_LIMIT } from './year/input';
import { precompileRoute } from './year/precompile';
import { SparkLayer } from './year/sparks';
import { StoryLayer } from './year/stories';
import { createWalls } from './year/walls';
import { WeatherLayer } from './year/weather';
import { FinaleFireworks } from './year/fireworks';
import { FinaleDeparture } from './year/finale-departure';
import { disposeSceneResources } from './year/dispose-scene';

// Moving parts farther than this from the camera cannot be seen; skip their math.
const MOTION_SPAN = 13;

export interface WorldHost {
  renderer: WebGPURenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  layer: HTMLDivElement;
  journey: JourneyStore;
  onerror: () => void;
}

export class YearWorld {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly motion = new JourneyMotion();
  /** Resolves once the world is built and the first frame is drawn. */
  readonly loaded: Promise<void>;
  private resolveLoaded!: () => void;
  private renderer: WebGPURenderer;
  private css: CssLayer;
  private journey: JourneyStore;
  private onerror: () => void;
  private paper: PaperSet | null = null;
  private fleet: SeasonalFleet | null = null;
  private readonly weather: WeatherLayer;
  private fireworks: FinaleFireworks;
  private departure = new FinaleDeparture();
  private rig: CameraRig;
  private stories: StoryLayer;
  private sparks: SparkLayer;
  private input: WorldInput;
  private time = 0;
  private ready = false;
  private disposed = false;
  private settling = 0;
  private reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private unsubscribe: () => void;
  private state: JourneyState;
  private observer: ResizeObserver;
  private found = new Set<string>();
  private frame: MotionFrame = { time: 0, delta: 0, reduced: false, distance: 0 };
  private storyOpen = false;
  private unsubscribeStory: () => void;

  constructor(host: WorldHost) {
    this.scene = host.scene;
    this.camera = host.camera;
    this.renderer = host.renderer;
    this.journey = host.journey;
    this.onerror = host.onerror;
    this.loaded = new Promise<void>(resolve => {
      this.resolveLoaded = resolve;
    });
    this.state = get(host.journey);
    this.unsubscribe = host.journey.subscribe(state => {
      this.state = state;
    });
    this.unsubscribeStory = openStoryId.subscribe(value => {
      this.storyOpen = !!value;
    });
    this.css = new CssLayer(host.layer);
    this.rig = new CameraRig(host.camera, host.renderer, this.reduced);
    this.scene.background = this.rig.background;
    this.stories = new StoryLayer(host.layer);
    this.sparks = new SparkLayer(this.css.scene, host.camera);
    createWalls(this.scene, this.rig.cameraX);
    this.weather = new WeatherLayer(this.scene, this.reduced);
    this.fireworks = new FinaleFireworks(this.scene, this.camera, this.reduced);
    this.input = new WorldInput({
      scrollBy: (units, limit) => this.scrollBy(units, limit),
      setPointer: (x, y) => this.rig.setPointer(x, y),
      canScroll: () => this.ready && !this.disposed && !this.motion.committedToFinale,
    });
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(this.renderer.domElement);
    this.input.bind();
    this.resize();
    this.rig.update(1, true, 0, 0);
    void this.load().catch(error => {
      if (!this.disposed) {
        console.error('The paper world could not load.', error);
        this.onerror();
      }
    });
  }

  private async load(): Promise<void> {
    // Fonts and world geometry load side by side.
    const fonts = document.fonts.ready;
    const pause = createYieldPacer();

    // The build runs in slices, so the loading screen keeps animating.
    this.paper = await createPaperScenery(this.rig.cameraX);
    if (this.disposed) return;
    this.scene.add(this.paper.group);
    await pause();

    this.fleet = new SeasonalFleet(this.scene);
    this.fleet.update(0, 1 / 60, 0, this.reduced);
    await pause();

    this.stories.create();
    await pause();

    this.sparks.create(this.paper, key => {
      this.discover(key);
      this.wake(key);
      this.sparks.toggle(key);
    });
    await pause();

    this.resize();
    await fonts;
    if (this.disposed) return;
    await precompileRoute(this.renderer, this.scene, this.camera);
    if (this.disposed) return;

    this.ready = true;
    this.rig.update(1, true, 0, 0);
    this.updateLayers();
    this.css.render(this.camera, true);
    // Draw the first frame behind the loading screen. Pipeline and buffer setup
    // happens here, so the reveal shows a finished frame instead of a stall.
    this.renderer.render(this.scene, this.camera);
    this.journey.update(s => ({ ...s, ready: true, cameraSettled: true }));
    this.resolveLoaded();
  }

  private discover(id: Interaction): void {
    this.found.add(id);
    this.journey.update(s => ({ ...s, discoveries: this.found.size }));
  }

  /** Stamps the click time on every part that reacts to this figure. */
  private wake(key: Interaction): void {
    if (!this.paper) return;
    for (const part of this.paper.animated) {
      if (part.key === key) part.startedAt = this.time;
    }
  }

  private resize = (): void => {
    const width = this.renderer.domElement.clientWidth;
    const height = this.renderer.domElement.clientHeight;
    if (!width || !height) return;
    this.rig.resize(width, height);
    this.css.resize(width, height);
    this.sparks.resize(width, height);
    this.stories.resize(this.rig.portrait);
    this.settling = 0;
  };

  private scrollBy(units: number, limit = STEP_LIMIT): void {
    if (!Number.isFinite(units)) return;
    const limited = Math.max(-limit, Math.min(limit, units));
    if (!this.motion.scroll(limited)) return;
    this.sparks.closeFact();
    this.settling = 0;
    if (needsMotionStart(this.state)) this.journey.update(s => ({ ...s, moving: true, cameraSettled: false }));
  }

  private updateLayers(): boolean {
    this.stories.update(this.motion.distance);
    return this.sparks.update(this.motion.distance, this.rig.portrait);
  }

  private animateParts(delta: number): void {
    if (!this.paper) return;
    const frame = this.frame;
    frame.time = this.time;
    frame.delta = delta;
    frame.reduced = this.reduced;
    frame.distance = this.motion.distance;
    frame.speed = this.motion.speed;

    // The motion was bound to each part at build time, so this loop has no
    // branch on the part kind. Parts outside the view skip their math.
    for (const part of this.paper.animated) {
      if (Math.abs(part.worldX - frame.distance) > (part.span ?? MOTION_SPAN)) continue;
      part.apply(part, frame);
    }
  }

  // Threlte calls this task every frame, before it renders the scene.
  tick = (delta: number): void => {
    if (this.disposed) return;
    if (this.storyOpen) return;
    const step = Math.min(delta, 0.05);
    this.time += step;
    let layersChanged = false;
    if (this.ready) {
      this.input.update(step);
      const arrived = this.motion.step(step);
      const liveStop = stopIndexAt(this.motion.distance);

      if (arrived) {
        this.settling = 0;
        this.journey.update(s => ({ ...s, stop: liveStop, moving: false }));
      } else if (liveStop !== this.state.stop) {
        this.journey.update(s => ({ ...s, stop: liveStop }));
      }

      this.rig.update(step, false, this.motion.distance, this.motion.speed);
      this.weather.update(this.camera);
      this.animateParts(step);

      if (!this.motion.moving && !this.state.cameraSettled) {
        this.settling += step;
        const closeEnough = this.camera.position.distanceTo(this.rig.desiredPosition) < 0.08;
        if (closeEnough || this.settling > 0.9) {
          this.journey.update(s => ({ ...s, cameraSettled: true }));
        }
      }
      const atFinale = this.motion.finished && !this.motion.moving && this.state.cameraSettled;
      // Leave room for the entire van beyond the right edge.
      const halfView = (this.camera.position.z + 0.7) * this.rig.halfViewTan * this.camera.aspect;
      const exitOffset = Math.max(0, this.camera.position.x + halfView + 5 - FINALE_CAR_X);
      const departureOffset = this.departure.update(step, this.motion.committedToFinale, this.reduced, exitOffset);
      this.fleet?.update(this.motion.distance, step, this.time, this.reduced, departureOffset);
      layersChanged = this.updateLayers();
      this.fireworks.update(step, this.motion.distance, atFinale && this.departure.complete, this.rig.portrait);
    }
    // The CSS layer only changes with the camera or a spark, so a still frame
    // leaves the DOM transforms alone.
    this.css.render(this.camera, layersChanged);
  };

  destroy(): void {
    objectFact.set(null);
    this.disposed = true;
    this.resolveLoaded();
    this.observer.disconnect();
    this.unsubscribe();
    this.unsubscribeStory();
    this.input.unbind();
    this.stories.destroy();
    this.sparks.destroy();
    this.css.destroy();
    this.weather.destroy();
    this.fleet?.destroy();
    this.fireworks.destroy();
    disposeSceneResources(this.scene);
    for (const season of this.paper?.birds ?? []) season.destroy();
    resetPaperMaterials();
    resetTemplates();
    resetWheelTemplates();
  }
}
