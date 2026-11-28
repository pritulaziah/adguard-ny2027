import * as THREE from 'three';
import { PaperBatch } from '../paper-batch';
import { paperSheet } from '../paper-materials';
import { bar, cutout, shapedCutout } from './shared';
import { isSharedWheelGeometry, retroCarWheel } from './wheels';
import { addVanLuggage } from './van-luggage';
import { bridgeLift } from '../summer-bridge';

export const VAN_REAR_X = -0.9;

const REAR_AXLE_X = -0.54;
const FRONT_AXLE_X = 0.56;
const WHEEL_BASE = FRONT_AXLE_X - REAR_AXLE_X;
const WHEEL_RADIUS = 0.22;

/** Boxy 1970s/80s cab-over retro minivan that drives the entire yearly route. */
export class PaperRetroVan {
  readonly group = new THREE.Group();
  private readonly body = new THREE.Group();
  private readonly wheels: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene) {
    this.group.name = 'paper-retro-van';
    this.group.add(this.body);
    this.addShell();
    for (const axle of [REAR_AXLE_X, FRONT_AXLE_X]) {
      const wheel = retroCarWheel(WHEEL_RADIUS);
      wheel.position.set(axle, WHEEL_RADIUS, 0.112);
      this.group.add(wheel);
      this.wheels.push(wheel);
    }
    scene.add(this.group);
  }

  update(x: number, time: number, moving: boolean, reduced: boolean): void {
    const bob = moving && !reduced ? Math.sin(time * 9.5) * 0.01 : 0;
    let rear = bridgeLift(x + REAR_AXLE_X);
    let front = bridgeLift(x + FRONT_AXLE_X);
    let pitch = Math.atan2(front - rear, WHEEL_BASE);
    // Rotation shifts the wheel centres along X on the steeper, short bridge.
    if (rear || front) {
      for (let pass = 0; pass < 4; pass++) {
        const cosine = Math.cos(pitch);
        const shift = -WHEEL_RADIUS * Math.sin(pitch);
        rear = bridgeLift(x + REAR_AXLE_X * cosine + shift);
        front = bridgeLift(x + FRONT_AXLE_X * cosine + shift);
        pitch = Math.asin((front - rear) / WHEEL_BASE);
      }
    }
    const lift = (rear + front) / 2 + WHEEL_RADIUS * (1 - Math.cos(pitch)) - 0.01 * Math.sin(pitch);
    this.group.position.set(x, 0.34 + lift, 0);
    this.group.rotation.z = pitch;
    this.body.position.y = bob;
    const angle = -x / WHEEL_RADIUS;
    for (const wheel of this.wheels) wheel.rotation.z = angle;
  }

  /** Removes the van and releases the geometry that this class created. */
  destroy(): void {
    this.group.removeFromParent();
    this.group.traverse(object => {
      // The wheel template cache owns the shared wheel geometry.
      if (object instanceof THREE.Mesh && !isSharedWheelGeometry(object.geometry)) object.geometry.dispose();
    });
    this.wheels.length = 0;
  }

  private addShell(): void {
    const shell = new PaperBatch();

    // Angular cab-over van silhouette with flat vertical nose, crisp windshield slope, and straight roof.
    const vanShape = new THREE.Shape();
    vanShape.moveTo(-0.87, 0.23);
    vanShape.lineTo(0.87, 0.23);
    vanShape.lineTo(0.91, 0.28);
    vanShape.lineTo(0.91, 0.64);
    vanShape.lineTo(0.84, 0.67);
    vanShape.lineTo(0.62, 1.03);
    vanShape.quadraticCurveTo(0.58, 1.07, 0.5, 1.07);
    vanShape.lineTo(-0.82, 1.07);
    vanShape.quadraticCurveTo(-0.9, 1.07, -0.9, 0.98);
    vanShape.lineTo(-0.9, 0.28);
    vanShape.closePath();
    shapedCutout(shell, vanShape, '#517a8c', 0.068);

    // Warm cream upper cab section for classic two-tone retro van contrast across all seasons.
    const upperShape = new THREE.Shape();
    upperShape.moveTo(-0.89, 0.58);
    upperShape.lineTo(0.89, 0.58);
    upperShape.lineTo(0.84, 0.67);
    upperShape.lineTo(0.62, 1.03);
    upperShape.quadraticCurveTo(0.58, 1.07, 0.5, 1.07);
    upperShape.lineTo(-0.82, 1.07);
    upperShape.quadraticCurveTo(-0.89, 1.07, -0.89, 0.98);
    upperShape.closePath();
    shapedCutout(shell, upperShape, '#f2ead4', 0.072, 0.002);

    // Retro rust-ochre waist stripe and thin lower sill trim.
    cutout(
      shell,
      [
        [-0.9, 0.52],
        [0.9, 0.52],
        [0.9, 0.59],
        [-0.9, 0.59],
      ],
      '#c97349',
      0.076,
      0.004,
    );
    cutout(
      shell,
      [
        [-0.86, 0.25],
        [0.86, 0.25],
        [0.86, 0.3],
        [-0.86, 0.3],
      ],
      '#3e6273',
      0.074,
      0.003,
    );

    // Stamped fender arch flares, deep wheel wells, and mudflaps.
    for (const wx of [REAR_AXLE_X, FRONT_AXLE_X]) {
      cutout(
        shell,
        [
          [wx - 0.31, 0.23],
          [wx - 0.24, 0.515],
          [wx + 0.24, 0.515],
          [wx + 0.31, 0.23],
        ],
        '#6d94a4',
        0.076,
        0.007,
      );
      cutout(
        shell,
        [
          [wx - 0.28, 0.23],
          [wx - 0.22, 0.49],
          [wx + 0.22, 0.49],
          [wx + 0.28, 0.23],
        ],
        '#1d2224',
        0.076,
        0.009,
      );
      shell.add(new THREE.BoxGeometry(0.036, 0.12, 0.04), '#3a3f3e', { x: wx - 0.29, y: 0.19, z: 0.03 });
    }

    // Three boxy retro windows with dark rubber frames and sunlit glass panes.
    const windowFrames: Array<number[][]> = [
      [
        [-0.82, 0.64],
        [-0.82, 0.97],
        [-0.34, 0.97],
        [-0.34, 0.64],
      ],
      [
        [-0.25, 0.64],
        [-0.25, 0.97],
        [0.2, 0.97],
        [0.2, 0.64],
      ],
      [
        [0.29, 0.64],
        [0.29, 0.97],
        [0.57, 0.97],
        [0.76, 0.68],
        [0.76, 0.64],
      ],
    ];
    const windowPanes: Array<number[][]> = [
      [
        [-0.79, 0.67],
        [-0.79, 0.94],
        [-0.37, 0.94],
        [-0.37, 0.67],
      ],
      [
        [-0.22, 0.67],
        [-0.22, 0.94],
        [0.17, 0.94],
        [0.17, 0.67],
      ],
      [
        [0.32, 0.67],
        [0.32, 0.94],
        [0.55, 0.94],
        [0.72, 0.68],
        [0.72, 0.67],
      ],
    ];
    for (const pts of windowFrames) cutout(shell, pts, '#46504e', 0.076, 0.009);
    for (const pts of windowPanes) cutout(shell, pts, '#dfe9e3', 0.078, 0.011);

    // Diagonal paper window glints.
    const glints: Array<number[][]> = [
      [
        [-0.7, 0.68],
        [-0.6, 0.93],
        [-0.53, 0.93],
        [-0.63, 0.68],
      ],
      [
        [-0.12, 0.68],
        [-0.02, 0.93],
        [0.05, 0.93],
        [-0.05, 0.68],
      ],
      [
        [0.4, 0.68],
        [0.5, 0.93],
        [0.56, 0.93],
        [0.46, 0.68],
      ],
    ];
    for (const pts of glints) cutout(shell, pts, '#fffcf2', 0.016, 0.056);

    // Sliding door seams, sliding rail groove, handles, and boxy side mirror.
    shell.add(new THREE.BoxGeometry(0.015, 0.72, 0.014), '#3b5c6b', { x: 0.245, y: 0.61, z: 0.046 });
    shell.add(new THREE.BoxGeometry(0.015, 0.7, 0.014), '#3b5c6b', { x: -0.295, y: 0.61, z: 0.046 });
    shell.add(new THREE.BoxGeometry(0.49, 0.014, 0.014), '#3b5c6b', { x: -0.57, y: 0.555, z: 0.048 });
    shell.add(new THREE.BoxGeometry(0.085, 0.024, 0.02), '#3e4544', { x: 0.34, y: 0.54, z: 0.05 });
    shell.add(new THREE.BoxGeometry(0.085, 0.024, 0.02), '#3e4544', { x: 0.14, y: 0.54, z: 0.05 });
    bar(shell, 0.74, 0.69, 0.81, 0.75, 0.014, '#434a49', 0.048, 0.016);
    shell.add(new THREE.BoxGeometry(0.05, 0.11, 0.028), '#434a49', { x: 0.82, y: 0.77, z: 0.052 });

    // Steel bumpers, round retro headlight, amber side blinker, and vertical taillight.
    shell.add(new THREE.BoxGeometry(0.15, 0.085, 0.11), '#6f6f69', { x: 0.91, y: 0.27, z: 0.016 });
    shell.add(new THREE.BoxGeometry(0.14, 0.085, 0.11), '#6f6f69', { x: -0.9, y: 0.27, z: 0.016 });
    const lampShape = new THREE.Shape();
    lampShape.absellipse(0, 0, 0.055, 0.062, 0, Math.PI * 2, false, 0);
    shapedCutout(shell, lampShape, '#fce8a8', 0.046, 0.026, 0.88, 0.45);
    shell.add(new THREE.BoxGeometry(0.055, 0.032, 0.026), '#e29642', { x: 0.83, y: 0.55, z: 0.046 });
    cutout(
      shell,
      [
        [-0.91, 0.36],
        [-0.84, 0.36],
        [-0.84, 0.51],
        [-0.91, 0.51],
      ],
      '#cf5c4c',
      0.054,
      0.02,
    );
    cutout(
      shell,
      [
        [-0.91, 0.46],
        [-0.84, 0.46],
        [-0.84, 0.52],
        [-0.91, 0.52],
      ],
      '#e29642',
      0.056,
      0.022,
    );

    addVanLuggage(shell);

    const geometry = shell.build();
    if (!geometry) return;
    const mesh = new THREE.Mesh(geometry, paperSheet());
    mesh.name = 'paper-retro-van-body';
    this.body.add(mesh);
  }
}
