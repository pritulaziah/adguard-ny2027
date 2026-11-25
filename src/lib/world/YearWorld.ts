import * as THREE from 'three';
import type { WebGPURenderer } from 'three/webgpu';
import { CSS3DObject, CSS3DSprite, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { mount, unmount } from 'svelte';
import { get } from 'svelte/store';
import { language, translations, type Interaction } from '../content/i18n';
import { homeStoryOpen } from '../content/home-story';
import { snowmanFact } from '../content/snowman-fact';
import WallStory from '../ui/WallStory.svelte';
import type { JourneyStore, JourneyState } from './journey-state';
import { createWeatherField, resetPaperMaterials, seasonalPaperMaterial, type WeatherField } from './paper-materials';
import { carded } from './paper-mesh';
import { createPaperScenery, type PaperSet } from './paper-scenery';
import { createSeasonalFleet, type SeasonalFleet } from './paper-vehicles';
import { paperLaptop, paperLantern } from './paper-props';
import { JourneyMotion, STOP_COUNT, STOP_SPACING, TRACK_LENGTH, WALL_Z, STORY_Z, stopIndexAt } from './route';
import { FLOOR_RAMP, SEASON_BORDERS, WALL_RAMP, sampleRampColor } from './seasons';

const STORY_SCALE = 0.006;
// One wheel notch or drag event moves at most a fraction of a station.
const STEP_LIMIT = 1.6;

interface Story {
  object: CSS3DObject;
  component: ReturnType<typeof mount>;
  x: number;
}

interface Spark {
  key: Interaction;
  object: CSS3DSprite;
  button: HTMLButtonElement;
  anchor: THREE.Object3D;
  local: THREE.Vector3;
  x: number;
  position: THREE.Vector3;
}

export interface WorldHost {
  renderer: WebGPURenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  layer: HTMLDivElement;
  journey: JourneyStore;
  onerror: () => void;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export class YearWorld {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly motion = new JourneyMotion();
  private renderer: WebGPURenderer;
  private cssRenderer: CSS3DRenderer;
  private cssScene = new THREE.Scene();
  private journey: JourneyStore;
  private onerror: () => void;
  private paper: PaperSet | null = null;
  private fleet: SeasonalFleet | null = null;
  private weatherFields: WeatherField[] = [];
  private stories: Story[] = [];
  private sparks: Spark[] = [];
  private factProjection = new THREE.Vector3();
  private time = 0;
  private ready = false;
  private disposed = false;
  private portrait = false;
  private settling = 0;
  private bgColor = new THREE.Color(WALL_RAMP.base);
  private look = new THREE.Vector3();
  private desiredLook = new THREE.Vector3();
  private desiredPosition = new THREE.Vector3();
  private pointer = new THREE.Vector2();
  private pointerSmooth = new THREE.Vector2();
  private reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private unsubscribe: () => void;
  private state: JourneyState;
  private observer: ResizeObserver;
  private mailX = STOP_SPACING * 4 + 2.15;
  private found = new Set<string>();
  private propUpdates: Array<(time: number, delta: number, reduced: boolean) => void> = [];
  private touchActive = false;
  private touchLastX = 0;
  private touchLastY = 0;

  constructor(host: WorldHost) {
    this.scene = host.scene;
    this.camera = host.camera;
    this.renderer = host.renderer;
    this.journey = host.journey;
    this.onerror = host.onerror;
    this.state = get(host.journey);
    this.unsubscribe = host.journey.subscribe(state => { this.state = state; });
    this.cssRenderer = new CSS3DRenderer();
    this.cssRenderer.domElement.style.pointerEvents = 'none';
    // Focus must not scroll the layer away from its WebGL geometry.
    this.cssRenderer.domElement.style.overflow = 'clip';
    host.layer.append(this.cssRenderer.domElement);
    this.scene.background = this.bgColor;
    this.createWalls();
    this.createWeather();
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(this.renderer.domElement);
    window.addEventListener('pointermove', this.movePointer);
    window.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', this.onTouchEnd, { passive: true });
    this.resize();
    this.updateCamera(1, true);
    void this.load().catch(error => {
      if (!this.disposed) {
        console.error('The paper world could not load.', error);
        this.onerror();
      }
    });
  }

  private createWalls(): void {
    // Tall panoramic wall guarantees no exposed sky gap on any viewport ratio.
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(TRACK_LENGTH + 76, 20),
      seasonalPaperMaterial(WALL_RAMP, { verticalWash: 0.045, grainStrength: 0.085 }),
    );
    wall.name = 'seasonal-paper-wall';
    wall.position.set(TRACK_LENGTH / 2, 7.0, WALL_Z);
    this.scene.add(wall);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(TRACK_LENGTH + 76, 18),
      seasonalPaperMaterial(FLOOR_RAMP, { grainStrength: 0.07 }),
    );
    floor.name = 'seasonal-paper-floor';
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(TRACK_LENGTH / 2, -1.22, 4);
    this.scene.add(floor);
  }

  private addWeatherZone(
    count: number,
    sampleX: (index: number) => number,
    options: Parameters<typeof createWeatherField>[2],
  ): void {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = sampleX(i);
      positions[i * 3 + 1] = 0.4 + Math.random() * 7.1;
      positions[i * 3 + 2] = -2.1 + Math.random() * 2.9;
      seeds[i] = Math.random();
    }
    const field = createWeatherField(positions, seeds, options);
    field.speed.value = this.reduced ? 0 : 1;
    this.weatherFields.push(field);
    this.scene.add(field.points);
  }

  private createWeather(): void {
    // Winter snow at both ends of the calendar year.
    this.addWeatherZone(
      170,
      i => (i % 2 === 0
        ? -8 + Math.random() * (SEASON_BORDERS.spring + 8)
        : SEASON_BORDERS.winterEnd - 0.5 + Math.random() * (TRACK_LENGTH - SEASON_BORDERS.winterEnd + 11)),
      { color: '#fff9e9', size: 2.5, fallMin: 0.11, fallRange: 0.25, driftAmp: 0.22, driftFreq: 0.7, opacity: 0.76 },
    );

    // Spring blossom petals.
    this.addWeatherZone(
      75,
      () => SEASON_BORDERS.spring + Math.random() * (SEASON_BORDERS.summer - SEASON_BORDERS.spring),
      { color: '#f7d8d0', size: 3.0, fallMin: 0.06, fallRange: 0.15, driftAmp: 0.34, driftFreq: 0.55, opacity: 0.72 },
    );

    // Summer warm sunlit coastal motes.
    this.addWeatherZone(
      65,
      () => SEASON_BORDERS.summer + Math.random() * (SEASON_BORDERS.autumn - SEASON_BORDERS.summer),
      { color: '#fff2c4', size: 2.2, fallMin: -0.05, fallRange: 0.09, driftAmp: 0.28, driftFreq: 0.45, opacity: 0.56 },
    );

    // Autumn drifting leaf specks.
    this.addWeatherZone(
      110,
      () => SEASON_BORDERS.autumn + Math.random() * (SEASON_BORDERS.winterEnd - SEASON_BORDERS.autumn),
      { color: '#eab875', size: 3.1, fallMin: 0.09, fallRange: 0.2, driftAmp: 0.36, driftFreq: 0.65, opacity: 0.74 },
    );
  }

  private async load(): Promise<void> {
    const paper = createPaperScenery();
    this.paper = paper;
    this.scene.add(paper.group);
    this.fleet = createSeasonalFleet(this.scene);
    this.fleet.update(0, 1 / 60, 0, this.reduced);
    this.createStories();
    this.createInteractions();
    this.createMail();
    this.createProps();
    this.resize();
    await document.fonts.ready;
    await this.precompileRoute();
    if (this.disposed) return;
    this.ready = true;
    this.updateCamera(1, true);
    this.updateLayers();
    this.cssRenderer.render(this.cssScene, this.camera);
    this.journey.update(s => ({ ...s, ready: true, cameraSettled: true }));
  }

  // compileAsync only builds pipelines for objects inside the current view.
  // One very wide pass from the middle of the route covers every station, so
  // the ride does not compile shaders on the way.
  private async precompileRoute(): Promise<void> {
    const camera = this.camera;
    const position = camera.position.clone();
    const quaternion = camera.quaternion.clone();
    const fov = camera.fov;
    camera.fov = 150;
    camera.position.x = TRACK_LENGTH / 2;
    camera.lookAt(TRACK_LENGTH / 2, 3.05, STORY_Z + 0.18);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    try {
      await this.renderer.compileAsync(this.scene, camera);
    } finally {
      camera.fov = fov;
      camera.position.copy(position);
      camera.quaternion.copy(quaternion);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld(true);
    }
  }

  private createStories(): void {
    for (let index = 0; index <= STOP_COUNT; index++) {
      const x = index * STOP_SPACING;
      const element = document.createElement('div');
      element.className = 'wall-copy';
      const component = mount(WallStory, { target: element, props: { index } });
      const object = new CSS3DObject(element);
      object.position.set(x, 4.38, STORY_Z);
      object.scale.setScalar(STORY_SCALE);
      this.cssScene.add(object);
      this.stories.push({ object, component, x });
    }
  }

  private createInteractions(): void {
    if (!this.paper) return;
    for (const [key, anchor] of this.paper.objects) {
      const part = this.paper.parts.find(item => item.mesh === anchor);
      if (!part) continue;
      this.spark(anchor, key, () => {
        this.discover(key);
        if (key === 'snowman') {
          if (get(snowmanFact)) snowmanFact.set(null);
          else {
            const spark = this.sparks.find(item => item.key === 'snowman');
            if (spark) this.positionSnowmanFact(spark);
          }
        }
      });
    }
  }

  private spark(anchor: THREE.Object3D, key: Interaction, onclick: () => void): void {
    const label = translations[get(language)].interactions[key].label;
    const button = document.createElement('button');
    button.className = 'object-spark';
    button.dataset.interaction = key;
    button.type = 'button';
    button.title = label;
    button.setAttribute('aria-label', label);
    button.textContent = '✦';
    button.addEventListener('click', event => {
      event.stopPropagation();
      onclick();
    });
    const sprite = new CSS3DSprite(button);
    sprite.scale.setScalar(0.0075);
    let local = new THREE.Vector3(0, 0.5, 0);
    if (anchor instanceof THREE.Mesh) {
      anchor.geometry.computeBoundingBox();
      local = anchor.geometry.boundingBox!.getCenter(new THREE.Vector3());
      local.y = anchor.geometry.boundingBox!.max.y + 0.16;
    }
    anchor.updateWorldMatrix(true, false);
    const world = local.clone().applyMatrix4(anchor.matrixWorld);
    this.cssScene.add(sprite);
    this.sparks.push({ key, object: sprite, button, anchor, local, x: world.x, position: world });
  }

  private discover(id: Interaction): void {
    this.found.add(id);
    this.journey.update(s => ({ ...s, discoveries: this.found.size }));
  }

  private positionSnowmanFact(spark: Spark): void {
    const point = this.factProjection.copy(spark.position).project(this.camera);
    const width = this.renderer.domElement.clientWidth;
    const height = this.renderer.domElement.clientHeight;
    const next = { x: (point.x + 1) * width / 2, y: (1 - point.y) * height / 2, width, height };
    const previous = get(snowmanFact);
    if (!previous || Math.abs(previous.x - next.x) > 0.75 || Math.abs(previous.y - next.y) > 0.75 || previous.width !== width || previous.height !== height) snowmanFact.set(next);
  }

  private createMail(): void {
    const box = new THREE.Group();
    box.position.set(this.mailX, 0.35, -1.1);
    const body = carded(new THREE.BoxGeometry(0.7, 0.5, 0.18), '#78988a');
    body.position.y = 0.9;
    box.add(body);
    const post = carded(new THREE.BoxGeometry(0.06, 0.8, 0.06), '#ae9d79');
    post.position.y = 0.4;
    box.add(post);
    const flap = carded(new THREE.PlaneGeometry(0.51, 0.27), '#f5ead1');
    flap.position.set(0, 0.91, 0.1);
    box.add(flap);
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.25, 1.035, 0.105),
        new THREE.Vector3(0, 0.87, 0.105),
        new THREE.Vector3(0.25, 1.035, 0.105),
      ]),
      new THREE.LineBasicMaterial({ color: '#b4a581' }),
    );
    box.add(line);
    this.scene.add(box);
    this.spark(body, 'mail', () => this.discover('mail'));
  }

  private createProps(): void {
    const laptop = paperLaptop();
    laptop.group.position.set(STOP_SPACING * 3 - 1.85, 0.34, -1.35);
    laptop.group.scale.setScalar(0.85);
    this.scene.add(laptop.group);
    this.propUpdates.push(laptop.update);
    this.spark(laptop.screen, 'laptop', () => this.discover('laptop'));

    const lantern = paperLantern();
    lantern.group.position.set(STOP_SPACING * 5 + 1.85, 0.8, -1.65);
    this.scene.add(lantern.group);
    this.propUpdates.push(lantern.update);
    this.spark(lantern.body, 'lantern', () => this.discover('lantern'));
  }

  private resize = (): void => {
    const width = this.renderer.domElement.clientWidth;
    const height = this.renderer.domElement.clientHeight;
    if (!width || !height) return;
    this.portrait = width / height < 0.85;
    // Threlte owns the drawing buffer size. Only keep the projection in step.
    if (this.camera.aspect !== width / height) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
    this.cssRenderer.setSize(width, height);
    for (const story of this.stories) {
      story.object.element.classList.toggle('is-portrait', this.portrait);
      story.object.position.y = this.portrait ? 4.44 : 4.38;
    }
    this.settling = 0;
  };

  private movePointer = (event: PointerEvent): void => {
    if (get(homeStoryOpen)) return;
    if (event.pointerType === 'touch') return;
    this.pointer.set(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
  };

  private onWheel = (event: WheelEvent): void => {
    if (get(homeStoryOpen)) return;
    if (!this.ready || this.disposed) return;
    event.preventDefault();
    const raw = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    const scale = event.deltaMode === 1 ? 32 : event.deltaMode === 2 ? 400 : 1;
    this.scrollBy(raw * scale * 0.007);
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    if (get(homeStoryOpen)) return;
    if (!this.ready || this.disposed) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      this.scrollBy(event.key === 'ArrowRight' ? STOP_SPACING : -STOP_SPACING, Number.POSITIVE_INFINITY);
    }
  };

  private scrollBy(units: number, limit = STEP_LIMIT): void {
    if (!Number.isFinite(units)) return;
    const limited = Math.max(-limit, Math.min(limit, units));
    if (!this.motion.scroll(limited)) return;
    snowmanFact.set(null);
    this.settling = 0;
    this.journey.update(s => ({ ...s, moving: true, cameraSettled: false }));
  }

  private isInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    return target.closest('button, a, .language-switch, .object-spark') !== null;
  }

  private onTouchStart = (event: TouchEvent): void => {
    if (get(homeStoryOpen)) return;
    if (!this.ready || this.disposed || event.touches.length !== 1) return;
    if (this.isInteractiveTarget(event.target)) return;
    const touch = event.touches[0];
    this.touchActive = true;
    this.touchLastX = touch.clientX;
    this.touchLastY = touch.clientY;
  };

  private onTouchMove = (event: TouchEvent): void => {
    if (get(homeStoryOpen)) { this.touchActive = false; return; }
    if (!this.touchActive || event.touches.length !== 1) return;
    event.preventDefault();
    const touch = event.touches[0];
    const dx = touch.clientX - this.touchLastX;
    const dy = touch.clientY - this.touchLastY;
    this.touchLastX = touch.clientX;
    this.touchLastY = touch.clientY;

    const span = Math.max(window.innerWidth, 320);
    this.scrollBy((-(dx) * 1.15 - dy * 0.75) / span * 3.2);
  };

  private onTouchEnd = (): void => {
    this.touchActive = false;
  };

  private updateCamera(delta: number, immediate = false): void {
    const height = this.renderer.domElement.clientHeight || window.innerHeight;
    const aspect = this.camera.aspect;
    const shortT = THREE.MathUtils.clamp((560 - height) / (560 - 360), 0, 1);
    const desiredFov = THREE.MathUtils.lerp(54, 55, shortT);
    if (Math.abs(this.camera.fov - desiredFov) > 0.01) {
      this.camera.fov = desiredFov;
      this.camera.updateProjectionMatrix();
    }

    const wallWidth = this.portrait ? 4.05 : 5.35;
    const minDistance = THREE.MathUtils.lerp(8.35, 8.65, shortT);
    const distance = Math.max(
      minDistance,
      wallWidth / (2 * Math.tan(THREE.MathUtils.degToRad(desiredFov / 2)) * aspect * 0.87),
    );

    this.pointerSmooth.lerp(this.pointer, 1 - Math.exp(-delta * 3));
    const parallax = this.portrait || this.reduced ? 0 : 0.12;
    const fraction = (((this.motion.distance % STOP_SPACING) + STOP_SPACING) % STOP_SPACING) / STOP_SPACING;
    const speedFactor = THREE.MathUtils.clamp(Math.abs(this.motion.speed) / 2.2, 0, 1);
    const peek = this.reduced ? 0 : Math.sin(fraction * Math.PI) * speedFactor;

    this.desiredPosition.set(
      this.motion.distance + this.pointerSmooth.x * parallax,
      2.55 + this.pointerSmooth.y * parallax + peek * 0.14,
      STORY_Z + distance,
    );
    this.desiredLook.set(
      this.motion.distance,
      3.06 - peek * 0.16,
      STORY_Z + 0.18 + peek * 0.45,
    );

    const factor = immediate || this.reduced ? 1 : 1 - Math.exp(-delta * 4.5);
    this.camera.position.lerp(this.desiredPosition, factor);
    this.look.lerp(this.desiredLook, factor);
    this.camera.lookAt(this.look);
    this.camera.updateMatrixWorld();

    sampleRampColor(WALL_RAMP, this.camera.position.x, this.bgColor);
  }

  private updateLayers(): void {
    for (let i = 0; i < this.stories.length; i++) {
      const story = this.stories[i];
      const absDiff = Math.abs(story.x - this.motion.distance);
      const opacity = 1 - smoothstep(1.5, 4.7, absDiff);
      const visible = opacity > 0.004;
      story.object.visible = visible;
      if (visible) {
        story.object.element.style.opacity = opacity.toFixed(3);
      }
      const active = visible && opacity > 0.85 && !this.motion.moving;
      story.object.element.inert = !active;
      story.object.element.setAttribute('aria-hidden', String(!active));
      // Let the snowman's mark receive clicks through the Home story's empty area.
      story.object.element.style.pointerEvents = active && i !== 1 ? 'auto' : 'none';
    }

    const labels = translations[get(language)].interactions;
    for (const spark of this.sparks) {
      const label = labels[spark.key].label;
      if (spark.button.title !== label) {
        spark.button.title = label;
        spark.button.setAttribute('aria-label', label);
      }
      // Keep the touch target steady while the paper character moves underneath it.
      spark.object.position.copy(spark.position);
      const difference = Math.abs(spark.x - this.motion.distance);
      // The marks stay visible while the train moves; only distance hides them.
      const visible = difference < 5.6;
      spark.object.visible = visible;
      spark.button.inert = !visible;
      if (spark.key === 'snowman') {
        const expanded = String(!!get(snowmanFact));
        if (spark.button.getAttribute('aria-expanded') !== expanded) spark.button.setAttribute('aria-expanded', expanded);
        if (!spark.button.hasAttribute('aria-controls')) spark.button.setAttribute('aria-controls', 'snowman-fact');
        if (get(snowmanFact)) {
          if (visible) this.positionSnowmanFact(spark);
          else snowmanFact.set(null);
        }
      }
    }
  }

  private animateParts(delta: number): void {
    if (!this.paper || this.reduced) return;
    for (const part of this.paper.parts) {
      const mesh = part.mesh;
      const t = this.time + part.phase;
      if (part.kind === 'sway') mesh.rotation.z = part.rotation.z + Math.sin(t * 1.2) * 0.055;
      if (part.kind === 'wing') mesh.rotation.z = part.rotation.z + Math.sin(t * 3.2) * 0.12;
      if (part.kind === 'float') mesh.position.y = part.position.y + Math.sin(t * 1.5) * 0.055;
      if (part.kind === 'jump') mesh.position.y = part.position.y + Math.abs(Math.sin(t * 2.3)) * 0.035;
      if (part.kind === 'spin') mesh.rotation.z = part.rotation.z + this.time * 0.3;
      if (part.kind === 'wave') {
        mesh.position.x = part.position.x + Math.sin(t * 1.1) * 0.14;
        mesh.position.y = part.position.y + Math.sin(t * 1.9) * 0.025;
      }
    }
  }

  // Threlte calls this task every frame, before it renders the scene.
  tick = (delta: number): void => {
    if (this.disposed) return;
    if (get(homeStoryOpen)) return;
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
      this.updateCamera(step);
      this.animateParts(step);
      for (const update of this.propUpdates) update(this.time, step, this.reduced);

      if (!this.motion.moving && !this.state.cameraSettled) {
        this.settling += step;
        const closeEnough = this.camera.position.distanceTo(this.desiredPosition) < 0.08;
        if (closeEnough || this.settling > 0.9) {
          this.journey.update(s => ({ ...s, cameraSettled: true }));
        }
      }
      this.updateLayers();
    }
    this.cssRenderer.render(this.cssScene, this.camera);
  };

  destroy(): void {
    snowmanFact.set(null);
    this.disposed = true;
    this.observer.disconnect();
    this.unsubscribe();
    window.removeEventListener('pointermove', this.movePointer);
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('touchcancel', this.onTouchEnd);
    for (const story of this.stories) {
      void unmount(story.component);
      this.cssScene.remove(story.object);
    }
    for (const spark of this.sparks) this.cssScene.remove(spark.object);
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
