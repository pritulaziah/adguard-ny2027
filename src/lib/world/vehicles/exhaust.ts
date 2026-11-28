import * as THREE from 'three';
import { ovalGeometry } from '../paper-geometry';
import { carded } from '../paper-mesh';

const LIFETIME = 0.85;
const CAPACITY = 5;

interface ExhaustPuff {
  puff: THREE.Mesh;
  age: number;
  x: number;
  y: number;
  drift: number;
}

/** Five paper puffs leave the rear of the van and fade over less than a second. */
export class VanExhaust {
  private readonly puffs: ExhaustPuff[];
  private untilNextPuff = 0;

  constructor(scene: THREE.Scene) {
    this.puffs = Array.from({ length: CAPACITY }, (_, index) => {
      const puff = carded(ovalGeometry(0.18, 0.105, 0.018), index % 2 === 0 ? '#d5cfc4' : '#e5dbcb');
      puff.name = 'paper-van-exhaust';
      puff.visible = false;
      scene.add(puff);
      return { puff, age: LIFETIME, x: 0, y: 0.57, drift: 0 };
    });
  }

  update(vanX: number, speed: number, delta: number, reduced: boolean, lift = 0, pitch = 0): void {
    for (const entry of this.puffs) {
      entry.age = Math.min(entry.age + delta, LIFETIME);
      const progress = entry.age / LIFETIME;
      entry.puff.visible = !reduced && progress < 1;
      if (!entry.puff.visible) continue;
      entry.puff.position.set(entry.x + entry.drift * progress, entry.y + 0.29 * progress, 0.1);
      const scale = 1.25 * Math.sin(Math.PI * progress) + 0.38 * (1 - progress);
      entry.puff.scale.setScalar(scale);
    }

    if (reduced || Math.abs(speed) < 0.6) {
      this.untilNextPuff = 0;
      return;
    }
    this.untilNextPuff -= delta;
    if (this.untilNextPuff > 0) return;

    let free: ExhaustPuff | undefined;
    for (const entry of this.puffs) {
      if (entry.age >= LIFETIME) {
        free = entry;
        break;
      }
    }
    if (!free) return;
    free.age = 0;
    free.x = vanX - 0.92;
    free.y = 0.57 + lift - 0.92 * Math.sin(pitch);
    free.drift = -Math.sign(speed) * 0.45;
    this.untilNextPuff = 0.2;
  }

  /** Removes the puffs and releases their geometries. */
  destroy(): void {
    for (const { puff } of this.puffs) {
      puff.removeFromParent();
      puff.geometry.dispose();
    }
    this.puffs.length = 0;
  }
}
