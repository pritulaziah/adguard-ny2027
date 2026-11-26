import * as THREE from 'three';
import type { WebGPURenderer } from 'three/webgpu';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { get } from 'svelte/store';
import type { Interaction } from '../content/i18n';
import { objectFact } from '../content/object-fact';
import { openStoryId } from '../content/story-modal';
import type { JourneyStore, JourneyState } from './journey-state';
import { resetPaperMaterials, type WeatherField } from './paper-materials';
import { createPaperScenery, type PaperSet } from './scenery';
import { createSeasonalFleet, type SeasonalFleet } from './vehicles';
import type { MotionFrame } from './part-motion';
import { JourneyMotion, stopIndexAt, stopX } from './route';
import { createYieldPacer } from './schedule';
import { CameraRig } from './year/camera';
import { WorldInput, STEP_LIMIT } from './year/input';
import { precompileRoute } from './year/precompile';
import { SparkLayer } from './year/sparks';
import { StoryLayer } from './year/stories';
import { createWalls } from './year/walls';
import { createWeather } from './year/weather';

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
  private cssRenderer: CSS3DRenderer;
  private cssScene = new THREE.Scene();
  private journey: JourneyStore;
  private onerror: () => void;
  private paper: PaperSet | null = null;
  private fleet: SeasonalFleet | null = null;
  private weatherFields: WeatherField[] = [];
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
  private gullArrivalAt?: number;

  constructor(host: WorldHost) {
    this.scene = host.scene;
    this.camera = host.camera;
    this.renderer = host.renderer;
    this.journey = host.journey;
    this.onerror = host.onerror;
    this.loaded = new Promise<void>(resolve => { this.resolveLoaded = resolve; });
    this.state = get(host.journey);
    this.unsubscribe = host.journey.subscribe(state => { this.state = state; });
    this.cssRenderer = new CSS3DRenderer();
    this.cssRenderer.domElement.style.pointerEvents = 'none';
    // Focus must not scroll the layer away from its WebGL geometry.
    this.cssRenderer.domElement.style.overflow = 'clip';
    host.layer.append(this.cssRenderer.domElement);
    this.rig = new CameraRig(host.camera, host.renderer, this.reduced);
    this.scene.background = this.rig.background;
    this.stories = new StoryLayer(host.layer);
    this.sparks = new SparkLayer(this.cssScene, host.camera, host.renderer);
    createWalls(this.scene, this.rig.cameraX);
    this.weatherFields = createWeather(this.scene, this.reduced);
    this.input = new WorldInput(() => this.motion.target, {
      scrollBy: (units, limit) => this.scrollBy(units, limit),
      setPointer: (x, y) => this.rig.setPointer(x, y),
      canScroll: () => this.ready && !this.disposed,
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

    this.fleet = createSeasonalFleet(this.scene);
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
    this.cssRenderer.render(this.cssScene, this.camera);
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
    this.cssRenderer.setSize(width, height);
    this.stories.resize(this.rig.portrait);
    this.settling = 0;
  };

  private scrollBy(units: number, limit = STEP_LIMIT): void {
    if (!Number.isFinite(units)) return;
    const limited = Math.max(-limit, Math.min(limit, units));
    if (!this.motion.scroll(limited)) return;
    objectFact.set(null);
    this.settling = 0;
    this.journey.update(s => ({ ...s, moving: true, cameraSettled: false }));
  }

  private updateLayers(): void {
    this.stories.update(this.motion.distance);
    this.sparks.update(this.motion.distance, this.rig.portrait);
  }

  private animateParts(delta: number): void {
    if (!this.paper) return;
    const frame = this.frame;
    frame.time = this.time;
    frame.delta = delta;
    frame.reduced = this.reduced;
    frame.distance = this.motion.distance;

    const summerDistance = Math.abs(this.motion.distance - stopX(4));
    if (!this.reduced && summerDistance < 5.5) this.gullArrivalAt ??= this.time;
    if (summerDistance > 7) this.gullArrivalAt = undefined;
    frame.gullArrivalAt = this.gullArrivalAt;

    // The motion was bound to each part at build time, so this loop has no
    // branch on the part kind. Parts outside the view skip their math.
    for (const part of this.paper.animated) {
      if (Math.abs(part.worldX - frame.distance) > MOTION_SPAN) continue;
      part.apply(part, frame);
    }
  }

  // Threlte calls this task every frame, before it renders the scene.
  tick = (delta: number): void => {
    if (this.disposed) return;
    if (get(openStoryId)) return;
    const step = Math.min(delta, 0.05);
    this.time += step;
    if (this.ready) {
      const arrived = this.motion.step(step);
      const liveStop = stopIndexAt(this.motion.distance);

      if (arrived) {
        this.settling = 0;
        this.journey.update(s => ({ ...s, stop: liveStop, moving: false }));
      } else if (liveStop !== this.state.stop) {
        this.journey.update(s => ({ ...s, stop: liveStop }));
      }

      this.fleet?.update(this.motion.distance, step, this.time, this.reduced);
      this.rig.update(step, false, this.motion.distance, this.motion.speed);
      this.animateParts(step);

      if (!this.motion.moving && !this.state.cameraSettled) {
        this.settling += step;
        const closeEnough = this.camera.position.distanceTo(this.rig.desiredPosition) < 0.08;
        if (closeEnough || this.settling > 0.9) {
          this.journey.update(s => ({ ...s, cameraSettled: true }));
        }
      }
      this.updateLayers();
    }
    this.cssRenderer.render(this.cssScene, this.camera);
  };

  destroy(): void {
    objectFact.set(null);
    this.disposed = true;
    this.resolveLoaded();
    this.observer.disconnect();
    this.unsubscribe();
    this.input.unbind();
    this.stories.destroy();
    this.sparks.destroy();
    this.cssRenderer.domElement.remove();
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    this.scene.traverse(object => {
      if (!(object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line || object instanceof THREE.Sprite)) return;
      if ('geometry' in object && object.geometry) geometries.add(object.geometry);
      const mats = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of mats) {
        if (!material) continue;
        materials.add(material);
        for (const value of Object.values(material)) {
          if (value instanceof THREE.Texture) textures.add(value);
        }
      }
    });
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    for (const texture of textures) texture.dispose();
    resetPaperMaterials();
  }
}
