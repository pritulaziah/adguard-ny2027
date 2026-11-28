import * as THREE from 'three';
import { CSS3DSprite } from 'three/addons/renderers/CSS3DRenderer.js';
import { get } from 'svelte/store';
import { language, translations, type Interaction } from '../../content/i18n';
import { objectFact, type FactPosition } from '../../content/object-fact';
import type { PaperSet } from '../scenery';

interface Spark {
  key: Interaction;
  object: CSS3DSprite;
  button: HTMLButtonElement;
  anchor: THREE.Object3D;
  local: THREE.Vector3;
  x: number;
  position: THREE.Vector3;
  expanded: boolean;
}

/** The glowing marks above the interactive figures, and the note they open. */
export class SparkLayer {
  private sparks: Spark[] = [];
  private fact: FactPosition | null = null;
  private projection = new THREE.Vector3();
  private labels = translations[get(language)].interactions;
  private unsubscribeLanguage: () => void;
  private unsubscribeFact: () => void;
  private viewWidth = 0;
  private viewHeight = 0;
  /** World units to CSS pixels for one unit of depth in portrait view. */
  private portraitPixels = 0;

  constructor(
    private readonly cssScene: THREE.Scene,
    private readonly camera: THREE.PerspectiveCamera,
  ) {
    this.unsubscribeLanguage = language.subscribe(value => {
      this.labels = translations[value].interactions;
    });
    this.unsubscribeFact = objectFact.subscribe(value => {
      this.fact = value;
    });
  }

  /** Caches the viewport size, so the frame loop reads no layout. */
  resize(width: number, height: number): void {
    this.viewWidth = width;
    this.viewHeight = height;
    this.portraitPixels = (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))) / height;
  }

  create(paper: PaperSet, onActivate: (key: Interaction) => void): void {
    for (const [key, anchor] of paper.objects) {
      const part = paper.parts.find(item => item.mesh === anchor);
      if (!part) continue;
      this.spark(anchor, key, () => onActivate(key), part.sparkLift, part.sparkOffsetX);
    }
  }

  private spark(anchor: THREE.Object3D, key: Interaction, onclick: () => void, lift = 0.16, offsetX = 0): void {
    const label = this.labels[key].label;
    const button = document.createElement('button');
    button.className = 'object-spark';
    button.dataset.interaction = key;
    button.type = 'button';
    button.title = label;
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-controls', 'object-fact');
    button.setAttribute('aria-expanded', 'false');
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
    sprite.position.copy(world);
    this.cssScene.add(sprite);
    this.sparks.push({ key, object: sprite, button, anchor, local, x: world.x, position: world, expanded: false });
  }

  toggle(key: Interaction): void {
    if (this.fact?.key === key) {
      objectFact.set(null);
      return;
    }
    const spark = this.sparks.find(item => item.key === key);
    if (spark) this.positionFact(spark);
  }

  /** Closes the open figure note, if one is open. */
  closeFact(): void {
    if (this.fact) objectFact.set(null);
  }

  private positionFact(spark: Spark): boolean {
    const point = this.projection.copy(spark.position).project(this.camera);
    const width = this.viewWidth;
    const height = this.viewHeight;
    const next = { key: spark.key, x: ((point.x + 1) * width) / 2, y: ((1 - point.y) * height) / 2, width, height };
    const previous = this.fact;
    if (
      !previous ||
      previous.key !== next.key ||
      Math.abs(previous.x - next.x) > 0.75 ||
      Math.abs(previous.y - next.y) > 0.75 ||
      previous.width !== width ||
      previous.height !== height
    ) {
      objectFact.set(next);
      return true;
    }
    return false;
  }

  /** Returns true when a spark or the note changed, so the CSS layer needs a new frame. */
  update(distance: number, portrait: boolean): boolean {
    let changed = false;
    const labels = this.labels;
    for (const spark of this.sparks) {
      const label = labels[spark.key].label;
      if (spark.button.title !== label) {
        spark.button.title = label;
        spark.button.setAttribute('aria-label', label);
        changed = true;
      }
      // The mark keeps its anchor while the paper character moves underneath it,
      // so only the scale and the visibility need a look each frame.
      if (portrait) {
        const view = this.camera.matrixWorldInverse.elements;
        const point = spark.position;
        const depth = -(view[2] * point.x + view[6] * point.y + view[10] * point.z + view[14]);
        spark.object.scale.setScalar((Math.max(depth, 0.1) * this.portraitPixels * 44) / 42);
      } else if (spark.object.scale.x !== 0.0075) {
        spark.object.scale.setScalar(0.0075);
        changed = true;
      }
      // The marks stay visible while the vehicle moves; only distance hides them.
      const visible = Math.abs(spark.x - distance) < 5.6;
      if (spark.object.visible !== visible) {
        spark.object.visible = visible;
        spark.button.inert = !visible;
        changed = true;
      }
      const factOpen = this.fact?.key === spark.key;
      if (factOpen !== spark.expanded) {
        spark.expanded = factOpen;
        spark.button.setAttribute('aria-expanded', String(factOpen));
        changed = true;
      }
      if (factOpen) {
        if (visible) {
          if (this.positionFact(spark)) changed = true;
        } else {
          objectFact.set(null);
          changed = true;
        }
      }
    }
    return changed;
  }

  destroy(): void {
    for (const spark of this.sparks) this.cssScene.remove(spark.object);
    this.sparks = [];
    this.unsubscribeLanguage();
    this.unsubscribeFact();
  }
}
