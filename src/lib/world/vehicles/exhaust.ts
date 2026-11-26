import * as THREE from 'three';
import { ovalGeometry } from '../paper-brush';
import { carded } from '../paper-mesh';

export function createVanExhaust(
  scene: THREE.Scene,
): (vanX: number, speed: number, delta: number, reduced: boolean) => void {
  const lifetime = 0.85;
  const puffs = Array.from({ length: 5 }, (_, index) => {
    const puff = carded(ovalGeometry(0.18, 0.105, 0.018).clone(), index % 2 === 0 ? '#d5cfc4' : '#e5dbcb');
    puff.name = 'paper-van-exhaust';
    puff.visible = false;
    scene.add(puff);
    return { puff, age: lifetime, x: 0, drift: 0 };
  });
  let untilNextPuff = 0;

  return (vanX: number, speed: number, delta: number, reduced: boolean): void => {
    for (const entry of puffs) {
      entry.age = Math.min(entry.age + delta, lifetime);
      const progress = entry.age / lifetime;
      entry.puff.visible = !reduced && progress < 1;
      if (!entry.puff.visible) continue;
      entry.puff.position.set(entry.x + entry.drift * progress, 0.63 + 0.29 * progress, 0.1);
      const scale = 1.25 * Math.sin(Math.PI * progress) + 0.38 * (1 - progress);
      entry.puff.scale.setScalar(scale);
    }

    if (reduced || Math.abs(speed) < 0.6) {
      untilNextPuff = 0;
      return;
    }
    untilNextPuff -= delta;
    if (untilNextPuff > 0) return;
    const entry = puffs.find(({ age }) => age >= lifetime);
    if (!entry) return;
    entry.age = 0;
    entry.x = vanX - 0.92;
    entry.drift = -Math.sign(speed) * 0.45;
    untilNextPuff = 0.2;
  };
}
