import * as THREE from 'three';
import { PaperBatch, rectGeometry, starGeometry } from '../paper-brush';
import { transparentPaperSheet } from '../paper-materials';
import { STORY_END } from '../route';

interface Burst {
  mesh: THREE.Mesh;
  material: ReturnType<typeof transparentPaperSheet>;
  delay: number;
}

function burstGeometry(index: number): THREE.BufferGeometry {
  const batch = new PaperBatch();
  const colors = ['#e9cc8c', '#d9a9b1', '#a9c2aa'];
  for (let ray = 0; ray < 12; ray++) {
    const angle = (ray / 12) * Math.PI * 2 + index * 0.2;
    const radius = ray % 2 ? 0.43 : 0.52;
    batch.add(rectGeometry(0.026, ray % 2 ? 0.23 : 0.32), colors[index], {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      rotate: [0, 0, angle - Math.PI / 2],
    });
    if (ray % 3 === 0)
      batch.add(starGeometry(0.07), '#f4dfaf', {
        x: Math.cos(angle + 0.12) * 0.88,
        y: Math.sin(angle + 0.12) * 0.88,
        z: 0.012,
      });
  }
  batch.add(starGeometry(0.065), colors[index]);
  return batch.build()!;
}

/** Quiet paper bursts frame the greeting. Reduced motion uses small still stars. */
export class FinaleFireworks {
  readonly group = new THREE.Group();
  private bursts: Burst[] = [];
  private elapsed = 0;
  private entered = false;

  constructor(
    scene: THREE.Scene,
    private readonly camera: THREE.PerspectiveCamera,
    private readonly reduced: boolean,
  ) {
    this.group.name = 'paper-finale-fireworks';
    scene.add(this.group);
    for (let index = 0; index < 3; index++) {
      const material = transparentPaperSheet().clone();
      material.opacity = 0;
      const geometry = reduced ? starGeometry(0.12).clone() : burstGeometry(index);
      if (reduced) {
        const color = new THREE.Color(['#e9cc8c', '#d9a9b1', '#a9c2aa'][index]);
        const values = new Float32Array(geometry.getAttribute('position').count * 3);
        for (let i = 0; i < values.length; i += 3) values.set([color.r, color.g, color.b], i);
        geometry.setAttribute('color', new THREE.BufferAttribute(values, 3));
      }
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `paper-firework-${index}`;
      // Keep the transparent meshes in the route precompile pass.
      mesh.position.set(STORY_END + 2 + (index - 1) * 3, 5, -4.4);
      this.group.add(mesh);
      this.bursts.push({ mesh, material, delay: index * 0.85 });
    }
  }

  update(delta: number, distance: number, settled: boolean, portrait: boolean): void {
    const active = distance >= STORY_END - 0.2 && settled;
    if (!active) {
      this.entered = false;
      this.elapsed = 0;
      for (const burst of this.bursts) burst.material.opacity = 0;
      return;
    }
    if (!this.entered) {
      this.entered = true;
      this.elapsed = 0;
    } else this.elapsed += delta;
    const positions = portrait
      ? [
          [-0.72, 0.04],
          [0.72, 0.04],
          [0, 0.86],
        ]
      : [
          [-0.72, 0.25],
          [0.72, 0.4],
          [-0.55, 0.73],
        ];
    const halfHeight = 12 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    this.bursts.forEach((burst, index) => {
      const age = (this.elapsed % 9.5) - burst.delay;
      const progress = THREE.MathUtils.clamp(age / 1.9, 0, 1);
      const [x, y] = positions[index];
      const fall = this.reduced ? 0 : progress * progress * 0.07;
      burst.mesh.position
        .set(x * halfHeight * this.camera.aspect, (y - fall) * halfHeight, -12)
        .applyMatrix4(this.camera.matrixWorld);
      burst.mesh.quaternion.copy(this.camera.quaternion);
      if (this.reduced) {
        burst.material.opacity = 0.65;
        burst.mesh.scale.setScalar((halfHeight * 0.025) / 0.12);
      } else {
        burst.material.opacity =
          age < 0 || age > 1.9
            ? 0
            : 0.72 * Math.min(1, progress / 0.12) * (1 - THREE.MathUtils.smoothstep(progress, 0.45, 1));
        const radius = portrait ? (index === 2 ? 0.035 : 0.09) : index === 2 ? 0.085 : 0.14;
        const spread = 0.18 + 0.82 * (1 - (1 - progress) ** 2);
        burst.mesh.scale.setScalar(halfHeight * radius * spread);
      }
    });
  }
}
