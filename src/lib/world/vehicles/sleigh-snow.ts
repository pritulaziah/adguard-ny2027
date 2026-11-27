import * as THREE from 'three';
import { ovalGeometry, paint } from '../paper-brush';
import { paperSheet } from '../paper-materials';
import { SLEIGH_REAR_X } from './sleigh';

/** A low snow trail follows the rear of the sleigh and settles onto the path. */
export function createSleighSnow(scene: THREE.Scene, name: string) {
  const capacity = 72;
  const lifetime = 0.65;
  const snow = new THREE.InstancedMesh(paint(ovalGeometry(0.08, 0.045, 0.012).clone(), '#f7f2e4'), paperSheet(), capacity);
  snow.name = name;
  snow.count = 0;
  snow.frustumCulled = false;
  snow.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(snow);
  const particles = Array.from({ length: capacity }, () => ({ age: lifetime, x: 0, z: 0, vx: 0, vz: 0, lift: 0, size: 1 }));
  const dummy = new THREE.Object3D();
  let cursor = 0;
  let untilNext = 0;

  return (x: number, speed: number, delta: number, reduced: boolean): void => {
    const dt = Math.max(0, Math.min(delta, 0.05));
    for (const p of particles) p.age = reduced ? lifetime : Math.min(lifetime, p.age + dt);
    if (!reduced && Math.abs(speed) > 0.12) {
      untilNext -= dt;
      const strength = Math.min(Math.abs(speed), 12);
      if (untilNext <= 0) {
        for (let i = 0; i < 8; i++) {
          const p = particles[cursor];
          const seed = ((cursor * 37 + 13) % 71) / 71;
          cursor = (cursor + 1) % capacity;
          const side = i % 2 ? 1 : -1;
          p.age = 0;
          p.x = x + SLEIGH_REAR_X - 0.08 + (seed - 0.5) * 0.12;
          p.z = side * 0.19;
          p.vx = -Math.sign(speed) * (0.65 + strength * 0.18 + seed * 0.8);
          p.vz = side * (0.18 + strength * 0.02 + seed * 0.25);
          p.lift = 0.08 + strength * 0.007 + seed * 0.09;
          p.size = 0.6 + seed * 0.9;
        }
        untilNext = 0.075 - strength * 0.003;
      }
    } else untilNext = 0;

    let count = 0;
    for (const p of particles) {
      if (p.age >= lifetime) continue;
      const t = p.age / lifetime;
      dummy.position.set(p.x + p.vx * p.age, 0.36 + Math.sin(t * Math.PI) * p.lift, p.z + p.vz * p.age);
      dummy.rotation.set(0, 0, t * 2 + p.size);
      dummy.scale.setScalar(p.size * (1 - t * t));
      dummy.updateMatrix();
      snow.setMatrixAt(count++, dummy.matrix);
    }
    snow.count = count;
    snow.instanceMatrix.needsUpdate = true;
  };
}
