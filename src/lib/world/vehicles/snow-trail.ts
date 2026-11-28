import * as THREE from 'three';
import { ovalGeometry, paint } from '../paper-geometry';
import { paperSheet } from '../paper-materials';
import { VAN_REAR_X } from './retro-van';

interface SnowParticle {
  age: number;
  x: number;
  z: number;
  vx: number;
  vz: number;
  lift: number;
  size: number;
}

/** A low snow trail follows the rear tires on winter stretches and settles onto the road. */
export class SnowTrail {
  private readonly capacity = 72;
  private readonly lifetime = 0.65;
  private readonly snow: THREE.InstancedMesh;
  private readonly particles: SnowParticle[];
  private readonly dummy = new THREE.Object3D();
  private cursor = 0;
  private untilNext = 0;

  constructor(scene: THREE.Scene, name: string) {
    this.snow = new THREE.InstancedMesh(
      paint(ovalGeometry(0.08, 0.045, 0.012), '#f7f2e4'),
      paperSheet(),
      this.capacity,
    );
    this.snow.name = name;
    this.snow.count = 0;
    this.snow.visible = false;
    this.snow.frustumCulled = false;
    this.snow.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(this.snow);
    this.particles = Array.from({ length: this.capacity }, () => ({
      age: this.lifetime,
      x: 0,
      z: 0,
      vx: 0,
      vz: 0,
      lift: 0,
      size: 1,
    }));
  }

  update(x: number, speed: number, delta: number, reduced: boolean): void {
    const dt = Math.max(0, Math.min(delta, 0.05));

    if (reduced) {
      if (this.snow.count > 0) this.clear();
      return;
    }

    const spawning = Math.abs(speed) > 0.12;
    // Every particle is dead and the van does not move: nothing to advance.
    if (this.snow.count === 0 && !spawning) {
      this.untilNext = 0;
      return;
    }

    if (this.snow.count > 0) {
      for (const particle of this.particles) particle.age = Math.min(this.lifetime, particle.age + dt);
    }

    if (spawning) {
      this.untilNext -= dt;
      const strength = Math.min(Math.abs(speed), 12);
      if (this.untilNext <= 0) {
        for (let i = 0; i < 8; i++) {
          const particle = this.particles[this.cursor];
          const seed = ((this.cursor * 37 + 13) % 71) / 71;
          this.cursor = (this.cursor + 1) % this.capacity;
          const side = i % 2 ? 1 : -1;
          particle.age = 0;
          particle.x = x + VAN_REAR_X - 0.06 + (seed - 0.5) * 0.12;
          particle.z = side * 0.19;
          particle.vx = -Math.sign(speed) * (0.65 + strength * 0.18 + seed * 0.8);
          particle.vz = side * (0.18 + strength * 0.02 + seed * 0.25);
          particle.lift = 0.08 + strength * 0.007 + seed * 0.09;
          particle.size = 0.6 + seed * 0.9;
        }
        this.untilNext = 0.075 - strength * 0.003;
      }
    } else this.untilNext = 0;

    let count = 0;
    for (const particle of this.particles) {
      if (particle.age >= this.lifetime) continue;
      const t = particle.age / this.lifetime;
      this.dummy.position.set(
        particle.x + particle.vx * particle.age,
        0.36 + Math.sin(t * Math.PI) * particle.lift,
        particle.z + particle.vz * particle.age,
      );
      this.dummy.rotation.set(0, 0, t * 2 + particle.size);
      this.dummy.scale.setScalar(particle.size * (1 - t * t));
      this.dummy.updateMatrix();
      this.snow.setMatrixAt(count++, this.dummy.matrix);
    }
    this.snow.count = count;
    if (count > 0) this.snow.instanceMatrix.needsUpdate = true;
    if (this.snow.visible !== count > 0) this.snow.visible = count > 0;
  }

  /** Removes the trail and releases its instance buffer and geometry. */
  destroy(): void {
    this.snow.removeFromParent();
    this.snow.geometry.dispose();
    this.snow.dispose();
  }

  private clear(): void {
    for (const particle of this.particles) particle.age = this.lifetime;
    this.snow.count = 0;
    this.snow.visible = false;
  }
}
