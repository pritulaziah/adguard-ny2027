import * as THREE from 'three';
import { carded } from './paper-mesh';
import { lanternMaterials } from './paper-materials';

function box(parent: THREE.Object3D, width: number, height: number, depth: number, color: string, x = 0, y = 0, z = 0): THREE.Mesh {
  const mesh = carded(new THREE.BoxGeometry(width, height, depth), color);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

export function paperLaptop() {
  const group = new THREE.Group();
  // Woven coastal blanket grounding the laptop cleanly on dry beach sand.
  box(group, 2.58, 0.02, 1.18, '#e8dbc2', 0, 0.005, 0.28);
  for (const sz of [-0.14, 0.28, 0.7]) {
    box(group, 2.6, 0.024, 0.09, '#c89b7e', 0, 0.007, sz);
  }
  box(group, 2.15, 0.075, 1.05, '#d6cdb7', 0, 0.05, 0.42);
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 9; x++) {
      box(group, 0.14, 0.012, 0.1, '#829b8a', -0.76 + x * 0.19, 0.087, 0.15 + y * 0.15);
    }
  }
  box(group, 0.55, 0.01, 0.25, '#b2bfa8', 0, 0.086, 0.73);
  const lid = new THREE.Group();
  lid.position.y = 0.08;
  group.add(lid);
  box(lid, 2.15, 1.4, 0.055, '#e8dfc9', 0, 0.7);
  const screen = box(lid, 1.94, 1.18, 0.02, '#849f90', 0, 0.72, 0.04);
  box(lid, 1.25, 0.75, 0.018, '#d9e3d0', -0.16, 0.72, 0.06);
  box(lid, 1.25, 0.11, 0.023, '#b2c9b1', -0.16, 1.05, 0.07);
  for (let i = 0; i < 3; i++) {
    box(lid, 0.7 - i * 0.1, 0.035, 0.025, '#8eac98', -0.3, 0.88 - i * 0.11, 0.075);
  }
  const shield = new THREE.Shape();
  shield.moveTo(0, 0.25);
  shield.lineTo(0.2, 0.16);
  shield.lineTo(0.17, -0.08);
  shield.lineTo(0, -0.22);
  shield.lineTo(-0.17, -0.08);
  shield.lineTo(-0.2, 0.16);
  shield.closePath();
  const badge = carded(new THREE.ShapeGeometry(shield), '#f4d597');
  badge.position.set(0.62, 0.62, 0.09);
  lid.add(badge);
  let open = true;
  lid.rotation.x = -0.12;

  return {
    group,
    screen,
    toggle: () => { open = !open; },
    update: (_time: number, delta: number, reduced: boolean) => {
      const targetAngle = open ? -0.12 : Math.PI / 2;
      const alpha = reduced ? 1 : 1 - Math.exp(-delta * 5.5);
      lid.rotation.x = THREE.MathUtils.lerp(lid.rotation.x, targetAngle, alpha);
    },
  };
}

export function paperLantern() {
  const group = new THREE.Group();
  // Curved wooden garden lantern stand rooted on the autumn ground.
  box(group, 0.11, 2.25, 0.09, '#7f6759', 0.44, 1.12, -0.06);
  box(group, 0.34, 0.1, 0.16, '#967c6a', 0.44, 0.05, -0.06);
  box(group, 0.56, 0.085, 0.08, '#7f6759', 0.2, 2.22, -0.06);
  // Diagonal wooden brace under the lantern bracket.
  const brace = carded(new THREE.BoxGeometry(0.42, 0.055, 0.06), '#8d7263');
  brace.position.set(0.3, 2.04, -0.06);
  brace.rotation.z = Math.PI / 4;
  group.add(brace);
  // Thin hanging cord down to the lantern cap.
  box(group, 0.032, 0.42, 0.03, '#dfcdb1', 0, 2.0, -0.02);

  const lamp = new THREE.Group();
  lamp.position.y = 1.24;
  group.add(lamp);
  const { body: bodyMaterial, glow, lit } = lanternMaterials();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.46, 18, 12), bodyMaterial);
  body.scale.set(0.88, 1.18, 0.25);
  lamp.add(body);
  // A TSL radial gradient makes the glow. Additive blending keeps the paper edge.
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 3.1), glow);
  halo.position.z = 0.09;
  lamp.add(halo);
  box(lamp, 0.45, 0.08, 0.12, '#a76b5d', 0, 0.53);
  box(lamp, 0.45, 0.08, 0.12, '#a76b5d', 0, -0.53);
  for (const x of [-0.17, 0, 0.17]) box(lamp, 0.016, 0.9, 0.02, '#efd4ac', x, 0, 0.12);
  box(lamp, 0.025, 0.35, 0.04, '#e4bd79', 0, -0.73);
  let target = 0;
  let pulse = -100;

  return {
    group,
    body,
    toggle: (time: number) => {
      target = target > 0.5 ? 0 : 1;
      pulse = time;
    },
    update: (time: number, delta: number, reduced: boolean) => {
      const alpha = reduced ? 1 : 1 - Math.exp(-delta * 7);
      lit.value += (target - lit.value) * alpha;
      if (reduced) {
        lamp.rotation.z = 0;
      } else {
        lamp.rotation.z = Math.sin(time * 1.1) * 0.05
          + Math.sin((time - pulse) * 5) * Math.max(0, 1 - (time - pulse) / 3) * 0.3;
      }
    },
  };
}
