import * as THREE from 'three';
import type { WebGPURenderer } from 'three/webgpu';
import { CSS3DSprite, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { mount, unmount } from 'svelte';
import { get } from 'svelte/store';
import { language, translations, type Interaction } from '../content/i18n';
import { objectFact } from '../content/object-fact';
import { openStoryId } from '../content/story-modal';
import WallStory from '../ui/WallStory.svelte';
import type { JourneyStore, JourneyState } from './journey-state';
import { createScalarUniform, createWeatherField, resetPaperMaterials, seasonalPaperMaterial, type WeatherField } from './paper-materials';
import { carded } from './paper-mesh';
import { createPaperScenery, type PaperSet } from './paper-scenery';
import { createSeasonalFleet, type SeasonalFleet } from './paper-vehicles';
import { JourneyMotion, STOP_COUNT, STOP_SPACING, TRACK_LENGTH, STORY_Z, stopIndexAt, stopX } from './route';
import { createYieldPacer } from './schedule';
import { FLOOR_RAMP, SEASON_BORDERS, WALL_RAMP, sampleRampColor } from './seasons';

// One wheel notch or drag event moves at most a fraction of a station.
const STEP_LIMIT = 1.6;
// Push the sky wall deep behind the three ridge layers for strong travel parallax.
const SKY_WALL_Z = -9.6;

interface Story {
  element: HTMLDivElement;
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

function motionPulse(time: number, start: number, duration: number): number {
  const progress = THREE.MathUtils.clamp((time - start) / duration, 0, 1);
  return Math.sin(progress * Math.PI);
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
  private cameraX = createScalarUniform(0);
  private stories: Story[] = [];
  private layer: HTMLDivElement;
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
  private mailX = stopX(6) - 2.2;
  private found = new Set<string>();
  private wakeTimes = new Map<Interaction, number>();
  private gateOpen = false;
  private gateSwing = 0;
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
    this.loaded = new Promise<void>(resolve => { this.resolveLoaded = resolve; });
    this.state = get(host.journey);
    this.unsubscribe = host.journey.subscribe(state => { this.state = state; });
    this.cssRenderer = new CSS3DRenderer();
    this.cssRenderer.domElement.style.pointerEvents = 'none';
    // Focus must not scroll the layer away from its WebGL geometry.
    this.cssRenderer.domElement.style.overflow = 'clip';
    host.layer.append(this.cssRenderer.domElement);
    this.layer = host.layer;
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
    // Deep panoramic sky wall guarantees no exposed gap on any viewport ratio and
    // shifts slowly behind the distant peaks, rolling hills, and foreground planes.
    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(TRACK_LENGTH + 115, 28),
      seasonalPaperMaterial(WALL_RAMP, {
        verticalWash: 0.055,
        grainStrength: 0.075,
        grainScale: 0.35,
        cameraX: this.cameraX,
        colorSpread: 0.45,
      }),
    );
    wall.name = 'seasonal-paper-wall';
    wall.position.set(TRACK_LENGTH / 2, 8.5, SKY_WALL_Z);
    this.scene.add(wall);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(TRACK_LENGTH + 115, 26),
      seasonalPaperMaterial(FLOOR_RAMP, { grainStrength: 0.07 }),
    );
    floor.name = 'seasonal-paper-floor';
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(TRACK_LENGTH / 2, -1.22, 2);
    this.scene.add(floor);
  }

  private addWeatherZone(
    count: number,
    sampleX: (index: number) => number,
    zMin: number,
    zMax: number,
    options: Parameters<typeof createWeatherField>[2],
  ): void {
    const minY = options.minY ?? 0.35;
    const spanY = options.spanY ?? 7.4;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = sampleX(i);
      positions[i * 3 + 1] = minY + Math.random() * spanY;
      positions[i * 3 + 2] = zMin + Math.random() * (zMax - zMin);
      seeds[i] = Math.random();
    }
    const field = createWeatherField(positions, seeds, options);
    field.speed.value = this.reduced ? 0 : 1;
    this.weatherFields.push(field);
    this.scene.add(field.points);
  }

  private createWeather(): void {
    const sampleWinterX = (i: number): number =>
      i % 2 === 0
        ? -14 + Math.random() * (SEASON_BORDERS.spring + 14)
        : SEASON_BORDERS.winterEnd - 1.5 + Math.random() * (TRACK_LENGTH - SEASON_BORDERS.winterEnd + 16);
    const sampleSpringX = (): number =>
      SEASON_BORDERS.spring - 0.5 + Math.random() * (SEASON_BORDERS.summer - SEASON_BORDERS.spring + 1.0);
    const sampleSummerX = (): number =>
      SEASON_BORDERS.summer - 0.5 + Math.random() * (SEASON_BORDERS.autumn - SEASON_BORDERS.summer + 1.0);
    const sampleAutumnX = (): number =>
      SEASON_BORDERS.autumn - 0.5 + Math.random() * (SEASON_BORDERS.winterEnd - SEASON_BORDERS.autumn + 1.0);

    // 1. Far sky stratum (slow parallax behind hills and trees).
    this.addWeatherZone(140, sampleWinterX, -6.2, -2.8, {
      color: '#f5f2e8', size: 2.2, fallMin: 0.06, fallRange: 0.14, driftAmp: 0.14, driftFreq: 0.5, opacity: 0.5, spanY: 9.0,
    });
    this.addWeatherZone(110, sampleSpringX, -5.8, -2.6, {
      color: '#f5dbd4', size: 2.4, fallMin: 0.04, fallRange: 0.1, driftAmp: 0.22, driftFreq: 0.45, opacity: 0.48, spanY: 8.6,
    });
    this.addWeatherZone(100, sampleSummerX, -5.8, -2.6, {
      color: '#fff3c9', size: 2.0, fallMin: -0.03, fallRange: 0.06, driftAmp: 0.2, driftFreq: 0.4, opacity: 0.42, spanY: 8.6,
    });
    this.addWeatherZone(160, sampleAutumnX, -5.8, -2.6, {
      color: '#e5b374', size: 2.5, fallMin: 0.06, fallRange: 0.12, driftAmp: 0.24, driftFreq: 0.5, opacity: 0.5, spanY: 8.6,
    });

    // 2. Midground action stratum around the vehicles and animals.
    this.addWeatherZone(150, sampleWinterX, -1.9, 0.8, {
      color: '#fff9e9', size: 4.0, fallMin: 0.11, fallRange: 0.24, driftAmp: 0.24, driftFreq: 0.72, opacity: 0.76,
    });
    this.addWeatherZone(130, sampleSpringX, -1.9, 0.8, {
      color: '#f8dcd4', size: 4.5, fallMin: 0.06, fallRange: 0.15, driftAmp: 0.34, driftFreq: 0.55, opacity: 0.74,
    });
    this.addWeatherZone(110, sampleSummerX, -1.9, 0.8, {
      color: '#fff2c4', size: 3.6, fallMin: -0.05, fallRange: 0.09, driftAmp: 0.28, driftFreq: 0.45, opacity: 0.58,
    });
    this.addWeatherZone(190, sampleAutumnX, -1.9, 0.8, {
      color: '#eab570', size: 4.8, fallMin: 0.09, fallRange: 0.2, driftAmp: 0.36, driftFreq: 0.65, opacity: 0.76,
    });

    // 3. Close foreground bokeh stratum (moves 1.7x-2.3x faster than track on scroll and mouse move).
    this.addWeatherZone(90, sampleWinterX, 2.05, 3.35, {
      color: '#fffdf4', size: 17.5, fallMin: 0.18, fallRange: 0.32, driftAmp: 0.32, driftFreq: 0.82, opacity: 0.36, minY: 0.55, spanY: 4.8, soft: true,
    });
    this.addWeatherZone(80, sampleSpringX, 2.05, 3.35, {
      color: '#fbdcd4', size: 18.0, fallMin: 0.1, fallRange: 0.2, driftAmp: 0.4, driftFreq: 0.68, opacity: 0.34, minY: 0.55, spanY: 4.8, soft: true,
    });
    this.addWeatherZone(68, sampleSummerX, 2.05, 3.35, {
      color: '#fff4cb', size: 15.5, fallMin: -0.07, fallRange: 0.12, driftAmp: 0.34, driftFreq: 0.55, opacity: 0.3, minY: 0.55, spanY: 4.8, soft: true,
    });
    this.addWeatherZone(116, sampleAutumnX, 2.05, 3.35, {
      color: '#e8a25d', size: 18.5, fallMin: 0.14, fallRange: 0.26, driftAmp: 0.42, driftFreq: 0.76, opacity: 0.36, minY: 0.55, spanY: 4.8, soft: true,
    });
  }

  private async load(): Promise<void> {
    // Fonts and world geometry load side by side.
    const fonts = document.fonts.ready;
    const pause = createYieldPacer();

    // The build runs in slices, so the loading screen keeps animating.
    this.paper = await createPaperScenery(this.cameraX);
    if (this.disposed) return;
    this.scene.add(this.paper.group);
    await pause();

    this.fleet = createSeasonalFleet(this.scene);
    this.fleet.update(0, 1 / 60, 0, this.reduced);
    await pause();

    this.createStories();
    await pause();

    this.createInteractions();
    await pause();

    this.createMail();
    await pause();

    this.resize();
    await fonts;
    if (this.disposed) return;
    await this.precompileRoute();
    if (this.disposed) return;

    this.ready = true;
    this.updateCamera(1, true);
    this.updateLayers();
    this.cssRenderer.render(this.cssScene, this.camera);
    // Draw the first frame behind the loading screen. Pipeline and buffer setup
    // happens here, so the reveal shows a finished frame instead of a stall.
    this.renderer.render(this.scene, this.camera);
    this.journey.update(s => ({ ...s, ready: true, cameraSettled: true }));
    this.resolveLoaded();
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
      const x = stopX(index);
      const element = document.createElement('div');
      element.className = 'wall-copy';
      const component = mount(WallStory, { target: element, props: { index } });
      // Stories live in screen space, so every viewport centres them the same way
      // and keeps text steady while the 3D planes shift behind and in front.
      this.layer.append(element);
      this.stories.push({ element, component, x });
    }
  }

  private createInteractions(): void {
    if (!this.paper) return;
    for (const [key, anchor] of this.paper.objects) {
      const part = this.paper.parts.find(item => item.mesh === anchor);
      if (!part) continue;
      this.spark(anchor, key, () => {
        this.discover(key);
        this.wakeTimes.set(key, this.time);
        if (key === 'gate') {
          this.gateOpen = !this.gateOpen;
        }
        this.toggleFact(key);
      }, part.sparkLift, part.sparkOffsetX);
    }
  }

  private spark(anchor: THREE.Object3D, key: Interaction, onclick: () => void, lift = 0.16, offsetX = 0): void {
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
    let local = new THREE.Vector3(offsetX, 0.5, 0);
    if (anchor instanceof THREE.Mesh) {
      anchor.geometry.computeBoundingBox();
      local = anchor.geometry.boundingBox!.getCenter(new THREE.Vector3());
      local.x += offsetX;
      local.y = anchor.geometry.boundingBox!.max.y + lift;
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

  private toggleFact(key: Interaction): void {
    if (get(objectFact)?.key === key) {
      objectFact.set(null);
      return;
    }
    const spark = this.sparks.find(item => item.key === key);
    if (spark) this.positionFact(spark);
  }

  private positionFact(spark: Spark): void {
    const point = this.factProjection.copy(spark.position).project(this.camera);
    const width = this.renderer.domElement.clientWidth;
    const height = this.renderer.domElement.clientHeight;
    const next = { key: spark.key, x: (point.x + 1) * width / 2, y: (1 - point.y) * height / 2, width, height };
    const previous = get(objectFact);
    if (!previous || previous.key !== next.key || Math.abs(previous.x - next.x) > 0.75 || Math.abs(previous.y - next.y) > 0.75 || previous.width !== width || previous.height !== height) objectFact.set(next);
  }

  private createMail(): void {
    const box = new THREE.Group();
    box.name = 'paper-mailbox';
    box.position.set(this.mailX, 0.34, -1.04);

    // Sturdy wooden post with grounded base block.
    const base = carded(new THREE.BoxGeometry(0.24, 0.08, 0.14), '#876c5b');
    base.position.set(0, 0.04, 0);
    box.add(base);
    const post = carded(new THREE.BoxGeometry(0.09, 0.86, 0.08), '#9b7f6b');
    post.position.set(0, 0.45, 0);
    box.add(post);

    // Rounded-top retro sage mailbox body.
    const boxShape = new THREE.Shape();
    boxShape.moveTo(-0.36, -0.18);
    boxShape.lineTo(0.36, -0.18);
    boxShape.lineTo(0.36, 0.14);
    boxShape.quadraticCurveTo(0.36, 0.34, 0.12, 0.34);
    boxShape.lineTo(-0.12, 0.34);
    boxShape.quadraticCurveTo(-0.36, 0.34, -0.36, 0.14);
    boxShape.closePath();
    const body = carded(new THREE.ExtrudeGeometry(boxShape, { depth: 0.18, bevelEnabled: false, curveSegments: 12 }), '#6d9182');
    body.position.set(0, 0.96, -0.09);
    box.add(body);

    // Cream envelope resting in the mail slot (pops gently on click).
    const letter = new THREE.Group();
    letter.position.set(0, 1.0, 0.11);
    const envelope = carded(new THREE.BoxGeometry(0.46, 0.28, 0.025), '#f5ead1');
    letter.add(envelope);
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.22, 0.13, 0.02),
        new THREE.Vector3(0, -0.02, 0.02),
        new THREE.Vector3(0.22, 0.13, 0.02),
      ]),
      new THREE.LineBasicMaterial({ color: '#b4a581' }),
    );
    letter.add(line);
    box.add(letter);

    // Pivoting red mail flag on the right side.
    const flagPivot = new THREE.Group();
    flagPivot.position.set(0.37, 0.98, 0.04);
    const flagStem = carded(new THREE.BoxGeometry(0.032, 0.34, 0.025), '#cf6856');
    flagStem.position.set(0, 0.15, 0);
    flagPivot.add(flagStem);
    const flagTip = carded(new THREE.BoxGeometry(0.14, 0.095, 0.028), '#cf6856');
    flagTip.position.set(0.06, 0.28, 0);
    flagPivot.add(flagTip);
    flagPivot.rotation.z = -Math.PI / 2;
    box.add(flagPivot);

    let flagRaised = false;
    let flagAngle = -Math.PI / 2;
    this.propUpdates.push((_time, delta, reduced) => {
      const targetAngle = flagRaised ? 0 : -Math.PI / 2;
      flagAngle = THREE.MathUtils.lerp(flagAngle, targetAngle, reduced ? 1 : 1 - Math.exp(-delta * 9));
      flagPivot.rotation.z = flagAngle;
      const lift = flagRaised ? 0.08 : 0;
      letter.position.y = THREE.MathUtils.lerp(letter.position.y, 1.0 + lift, reduced ? 1 : 1 - Math.exp(-delta * 8));
    });

    this.scene.add(box);
    this.spark(body, 'mail', () => {
      flagRaised = !flagRaised;
      this.discover('mail');
      this.toggleFact('mail');
    }, 0.22);
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
    for (const story of this.stories) story.element.classList.toggle('is-portrait', this.portrait);
    this.settling = 0;
  };

  private movePointer = (event: PointerEvent): void => {
    if (get(openStoryId)) return;
    if (event.pointerType === 'touch') return;
    this.pointer.set(event.clientX / window.innerWidth * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
  };

  private onWheel = (event: WheelEvent): void => {
    if (get(openStoryId)) return;
    if (!this.ready || this.disposed) return;
    event.preventDefault();
    const raw = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    const scale = event.deltaMode === 1 ? 32 : event.deltaMode === 2 ? 400 : 1;
    this.scrollBy(raw * scale * 0.007);
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    if (get(openStoryId)) return;
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
    objectFact.set(null);
    this.settling = 0;
    this.journey.update(s => ({ ...s, moving: true, cameraSettled: false }));
  }

  private isInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    return target.closest('button, a, .language-switch, .object-spark') !== null;
  }

  private onTouchStart = (event: TouchEvent): void => {
    if (get(openStoryId)) return;
    if (!this.ready || this.disposed || event.touches.length !== 1) return;
    if (this.isInteractiveTarget(event.target)) return;
    const touch = event.touches[0];
    this.touchActive = true;
    this.touchLastX = touch.clientX;
    this.touchLastY = touch.clientY;
  };

  private onTouchMove = (event: TouchEvent): void => {
    if (get(openStoryId)) { this.touchActive = false; return; }
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

    this.pointerSmooth.lerp(this.pointer, 1 - Math.exp(-delta * 3.8));
    const parallaxX = this.portrait || this.reduced ? 0 : 0.58;
    const parallaxY = this.portrait || this.reduced ? 0 : 0.26;
    const fraction = (((this.motion.distance % STOP_SPACING) + STOP_SPACING) % STOP_SPACING) / STOP_SPACING;
    const speedFactor = THREE.MathUtils.clamp(Math.abs(this.motion.speed) / 2.2, 0, 1);
    const peek = this.reduced ? 0 : Math.sin(fraction * Math.PI) * speedFactor;

    // Pivot gently around the animal plane (z ~ -1.05) so clickable sparks stay steady
    // while close foreground planes and deep hills/sky glide smoothly in opposite parallax.
    this.desiredPosition.set(
      this.motion.distance + this.pointerSmooth.x * parallaxX,
      2.55 + this.pointerSmooth.y * parallaxY + peek * 0.14,
      STORY_Z + distance,
    );
    this.desiredLook.set(
      this.motion.distance - this.pointerSmooth.x * (parallaxX * 0.14),
      3.06 - this.pointerSmooth.y * (parallaxY * 0.14) - peek * 0.16,
      STORY_Z + 0.18 + peek * 0.45,
    );

    const factor = immediate || this.reduced ? 1 : 1 - Math.exp(-delta * 4.5);
    this.camera.position.lerp(this.desiredPosition, factor);
    this.look.lerp(this.desiredLook, factor);
    this.camera.lookAt(this.look);
    this.camera.updateMatrixWorld();

    this.cameraX.value = this.camera.position.x;
    sampleRampColor(WALL_RAMP, this.camera.position.x, this.bgColor);
  }

  private updateLayers(): void {
    for (let i = 0; i < this.stories.length; i++) {
      const story = this.stories[i];
      const absDiff = Math.abs(story.x - this.motion.distance);
      const opacity = 1 - smoothstep(1.5, 4.7, absDiff);
      const visible = opacity > 0.004;
      story.element.style.display = visible ? '' : 'none';
      if (visible) story.element.style.opacity = opacity.toFixed(3);
      const active = visible && opacity > 0.85;
      story.element.inert = !active;
      story.element.setAttribute('aria-hidden', String(!active));
      // Every story now has a button, so the copy must stay click-through:
      // the figures behind it keep their own targets, and the button in
      // app.css opts back into pointer events.
      story.element.style.pointerEvents = 'none';
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
      const factOpen = get(objectFact)?.key === spark.key;
      const expanded = String(factOpen);
      if (spark.button.getAttribute('aria-expanded') !== expanded) spark.button.setAttribute('aria-expanded', expanded);
      if (!spark.button.hasAttribute('aria-controls')) spark.button.setAttribute('aria-controls', 'object-fact');
      if (factOpen) {
        if (visible) this.positionFact(spark);
        else objectFact.set(null);
      }
    }
  }

  private wakeBoost(key?: Interaction): number {
    if (!key) return 0;
    const started = this.wakeTimes.get(key);
    if (started === undefined) return 0;
    const elapsed = this.time - started;
    if (elapsed < 0 || elapsed > 1.35) return 0;
    const fade = 1 - elapsed / 1.35;
    return fade * fade;
  }

  private animateParts(delta: number): void {
    if (!this.paper) return;
    const targetGate = this.gateOpen ? 1 : 0;
    this.gateSwing = THREE.MathUtils.lerp(this.gateSwing, targetGate, this.reduced ? 1 : 1 - Math.exp(-delta * 6.5));

    for (const part of this.paper.parts) {
      const mesh = part.mesh;
      const t = this.time + part.phase;
      const boost = this.reduced ? 0 : this.wakeBoost(part.key);

      if (part.kind === 'gate') {
        const sign = mesh.name === 'garden-gate-left' ? -1 : 1;
        mesh.rotation.y = sign * this.gateSwing * 1.15;
        continue;
      }
      if (this.reduced) continue;

      const reaction = part.key === undefined ? undefined : this.wakeTimes.get(part.key);
      const activityTime = this.time - (reaction ?? 0);
      const idle = reaction === undefined;

      if (part.kind === 'sway') {
        mesh.rotation.z = part.rotation.z + Math.sin(t * 1.25) * 0.055 + Math.sin(t * 9.5) * 0.14 * boost;
        mesh.position.y = part.position.y + Math.abs(Math.sin(t * 7)) * 0.08 * boost;
      } else if (part.kind === 'wing') {
        mesh.rotation.z = part.rotation.z + Math.sin(t * 3.1) * 0.11 + Math.sin(t * 10) * 0.24 * boost;
      } else if (part.kind === 'flutter') {
        mesh.rotation.z = part.rotation.z + Math.sin(t * 4.2) * 0.18;
      } else if (part.kind === 'fire') {
        const flicker = Math.sin(t * 7.5) * 0.05 + Math.sin(t * 13) * 0.03;
        mesh.scale.set(
          part.scale.x * (1 + flicker * 0.5 + boost * 0.12),
          part.scale.y * (1 + flicker + boost * 0.28),
          part.scale.z,
        );
      } else if (part.kind === 'float') {
        mesh.position.y = part.position.y + Math.sin(t * 1.5) * 0.055 + Math.sin(t * 6) * 0.14 * boost;
        mesh.rotation.z = part.rotation.z + Math.sin(t * 1.1) * 0.035;
      } else if (part.kind === 'jump') {
        mesh.position.y = part.position.y + Math.abs(Math.sin(t * 2.2)) * 0.04 + Math.abs(Math.sin(t * 8.5)) * 0.22 * boost;
      } else if (part.kind === 'cat-blink') {
        mesh.scale.y = part.scale.y * (1 - 0.9 * motionPulse((activityTime + (idle ? 2 : 0)) % 7.2, 0.08, 0.52));
      } else if (part.kind === 'cat-tail') {
        mesh.rotation.z = part.rotation.z + 0.13 * motionPulse((activityTime + (idle ? 2 : 0)) % 7.2, 0.52, 0.35);
      } else if (part.kind === 'bunny-ear') {
        mesh.rotation.z = part.rotation.z + 0.32 * motionPulse((activityTime + (idle ? 3.2 : 0)) % 6.5, 0.08, 0.62);
      } else if (part.kind === 'deer-ear') {
        const time = (activityTime + (idle ? 2.5 : 0)) % 6.2;
        mesh.rotation.z = part.rotation.z + 0.36 * motionPulse(time, 0.1, 0.2) + 0.24 * motionPulse(time, 0.43, 0.24);
      } else if (part.kind === 'crab-step') {
        const time = (activityTime + (idle ? 1.2 : 0)) % 6.8;
        const first = THREE.MathUtils.smoothstep(time, 0, 0.24);
        const second = THREE.MathUtils.smoothstep(time, 0.3, 0.54);
        const back = THREE.MathUtils.smoothstep(time, 1.05, 1.55);
        mesh.position.x = part.position.x + (first + second - 2 * back) * 0.18;
        mesh.rotation.z = part.rotation.z + 0.07 * (motionPulse(time, 0, 0.24) - motionPulse(time, 0.3, 0.24));
      } else if (part.kind === 'crab-claw') {
        mesh.rotation.z = part.rotation.z + 0.35 * motionPulse((activityTime + (idle ? 1.2 : 0)) % 6.8, 0.55, 0.52);
      } else if (part.kind === 'fish-dive') {
        const time = (activityTime + (idle ? 3.5 : 0)) % 5.8;
        const leap = motionPulse(time, 0, 0.78);
        const dive = motionPulse(time, 0.35, 1.08);
        mesh.position.set(part.position.x - dive * 0.24, part.position.y + leap * 0.35 - dive * 0.61, part.position.z);
        mesh.rotation.z = part.rotation.z + leap * 0.42 - dive * 0.58;
        mesh.visible = dive < 0.95;
      } else if (part.kind === 'fish-splash') {
        const splash = motionPulse((activityTime + (idle ? 3.5 : 0)) % 5.8, 0.6, 0.48);
        mesh.visible = splash > 0.01;
        mesh.scale.set(0.7 + 0.45 * splash, splash, 1);
      } else if (part.kind === 'gull') {
        const cycle = t % 8;
        const angle = cycle / 8 * Math.PI * 2;
        mesh.position.x = part.position.x + 1.15 * Math.sin(angle);
        mesh.position.y = part.position.y + 0.27 * Math.cos(angle);
        mesh.position.z = part.position.z + 0.55 * Math.cos(angle);
        const flap = 0.48 * Math.sin(cycle * 11) * motionPulse(cycle, 0.15, 1.7);
        mesh.children[0].rotation.z = -flap;
        mesh.children[1].rotation.z = flap;
      } else if (part.kind === 'spin') {
        mesh.rotation.z = part.rotation.z + this.time * 0.35;
        const pulse = 1 + boost * 0.5;
        mesh.scale.set(part.scale.x * pulse, part.scale.y * pulse, part.scale.z);
      } else if (part.kind === 'wave') {
        mesh.position.x = part.position.x + Math.sin(t * 1.1) * 0.14;
        mesh.position.y = part.position.y + Math.sin(t * 1.9) * 0.025;
      }
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
    objectFact.set(null);
    this.disposed = true;
    this.resolveLoaded();
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
      story.element.remove();
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
