import * as THREE from 'three';
import { PaperBatch, PaperDetail, cutGeometry, mapleLeafGeometry, oakLeafGeometry, ovalGeometry, starGeometry } from './paper-brush';
import { paperSheet, seasonalPaperMaterial, type ScalarUniform } from './paper-materials';
import { STOP_SPACING, TRACK_LENGTH } from './route';
import { DISTANT_PEAKS_RAMP, FAR_RIDGE_RAMP, NEAR_RIDGE_RAMP, SEASON_BORDERS } from './seasons';

export interface BackdropContext {
  group: THREE.Group;
  cameraX: ScalarUniform;
}

function shapeFrom(draw: (shape: THREE.Shape) => void): THREE.Shape {
  const shape = new THREE.Shape();
  draw(shape);
  return shape;
}

function addCloud(batch: PaperBatch, x: number, y: number, z: number, scale: number, tint: string, shadow: string): void {
  const puffs: Array<[number, number, number, number]> = [
    [-0.95, 0.0, 0.92, 0.56],
    [-0.28, 0.24, 1.15, 0.74],
    [0.45, 0.16, 1.0, 0.64],
    [1.02, -0.02, 0.78, 0.48],
    [0.05, -0.08, 2.25, 0.4],
  ];
  for (const [px, py, pw, ph] of puffs) {
    batch.add(ovalGeometry(pw, ph, 0.03), shadow, {
      x: x + (px + 0.06) * scale,
      y: y + (py - 0.05) * scale,
      z: z - 0.04,
      scale: [scale, scale, 1],
    });
    batch.add(ovalGeometry(pw, ph, 0.03), tint, {
      x: x + px * scale,
      y: y + py * scale,
      z,
      scale: [scale, scale, 1],
    });
  }
}

function buildRidge(
  parent: THREE.Group,
  name: string,
  z: number,
  yBase: number,
  material: THREE.Material,
  heights: (x: number) => number,
): void {
  const startX = -38;
  const endX = TRACK_LENGTH + 38;
  const step = 1.4;
  const shape = new THREE.Shape();
  shape.moveTo(startX, -1.2);
  for (let x = startX; x <= endX; x += step) {
    shape.lineTo(x, heights(x));
  }
  shape.lineTo(endX, heights(endX));
  shape.lineTo(endX, -1.2);
  shape.closePath();
  const mesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.045, bevelEnabled: false }),
    material,
  );
  mesh.name = name;
  mesh.position.set(0, yBase, z);
  parent.add(mesh);
}

/** Builds three staggered torn-paper mountain and hill planes plus miniature hill trees. */
export function addPanoramaRidges({ group, cameraX }: BackdropContext): void {
  // Plane 2: distant alpine & coastal mountain range (slow 0.45x parallax).
  buildRidge(
    group,
    'torn-paper-distant-peaks',
    -7.6,
    -0.25,
    seasonalPaperMaterial(DISTANT_PEAKS_RAMP, {
      grainStrength: 0.055,
      grainScale: 0.4,
      cameraX,
      colorSpread: 0.55,
    }),
    x => {
      const wave = 2.05 + Math.sin(x * 0.14 + 0.3) * 0.72 + Math.sin(x * 0.31 + 1.4) * 0.44 + Math.cos(x * 0.53) * 0.18;
      // Gently dip along the summer coast so the open sea feels wide and airy.
      const coastDip = Math.exp(-Math.pow((x - STOP_SPACING * 3) / 9.5, 2)) * 0.88;
      return Math.max(1.05, wave - coastDip);
    },
  );

  // Plane 3: far rolling hills (0.54x parallax).
  const farHeight = (x: number): number =>
    1.18 + Math.sin(x * 0.21 + 0.7) * 0.34 + Math.sin(x * 0.51) * 0.18;

  buildRidge(
    group,
    'torn-paper-far-ridge',
    -5.2,
    -0.08,
    seasonalPaperMaterial(FAR_RIDGE_RAMP, {
      grainStrength: 0.065,
      grainScale: 0.48,
      cameraX,
      colorSpread: 0.7,
    }),
    farHeight,
  );

  // Plane 4: near rolling hills framing the back of the stage (0.66x parallax).
  buildRidge(
    group,
    'torn-paper-near-ridge',
    -3.1,
    0.1,
    seasonalPaperMaterial(NEAR_RIDGE_RAMP, {
      grainStrength: 0.075,
      grainScale: 0.54,
      cameraX,
      colorSpread: 0.85,
    }),
    x => 0.62 + Math.sin(x * 0.32 + 1.8) * 0.2 + Math.cos(x * 0.73) * 0.1,
  );

  // Miniature distant tree silhouettes perched along the far hill crest for clear depth scale.
  const ridgeTrees = new PaperBatch();
  const distantTreeStops: Array<{ x: number; kind: 'fir' | 'round'; color: string; scale: number }> = [
    // Winter start
    { x: -7.5, kind: 'fir', color: '#6b7e8d', scale: 0.9 },
    { x: -5.8, kind: 'fir', color: '#788b9a', scale: 0.72 },
    { x: 4.5, kind: 'fir', color: '#6c808e', scale: 0.85 },
    { x: 6.2, kind: 'fir', color: '#7c909d', scale: 0.68 },
    { x: 14.8, kind: 'fir', color: '#6e838e', scale: 0.78 },
    // Spring
    { x: 20.5, kind: 'round', color: '#7a9671', scale: 0.82 },
    { x: 22.1, kind: 'round', color: '#8aa47d', scale: 0.66 },
    { x: 29.0, kind: 'round', color: '#7e9975', scale: 0.76 },
    // Summer distant headland pines
    { x: 35.5, kind: 'fir', color: '#699194', scale: 0.7 },
    { x: 42.4, kind: 'fir', color: '#719898', scale: 0.74 },
    // Autumn
    { x: 48.0, kind: 'round', color: '#ad7d58', scale: 0.84 },
    { x: 49.7, kind: 'round', color: '#bf9160', scale: 0.68 },
    { x: 56.5, kind: 'round', color: '#a86f5f', scale: 0.78 },
    { x: 64.2, kind: 'round', color: '#b77d69', scale: 0.82 },
    { x: 65.8, kind: 'round', color: '#c48f68', scale: 0.66 },
    // Winter finale
    { x: 72.5, kind: 'fir', color: '#6a7f90', scale: 0.88 },
    { x: 74.2, kind: 'fir', color: '#798e9e', scale: 0.72 },
    { x: 82.0, kind: 'fir', color: '#697f90', scale: 0.82 },
  ];

  for (const item of distantTreeStops) {
    const baseY = -0.08 + farHeight(item.x) - 0.2;
    if (item.kind === 'fir') {
      ridgeTrees.add(
        cutGeometry([[-0.34, 0], [0, 0.92], [0.34, 0]], 0.025),
        item.color,
        { x: item.x, y: baseY, z: -5.06, scale: [item.scale, item.scale, 1] },
      );
      ridgeTrees.add(
        cutGeometry([[-0.26, 0.42], [0, 1.18], [0.26, 0.42]], 0.025),
        item.color,
        { x: item.x, y: baseY, z: -5.03, scale: [item.scale, item.scale, 1] },
      );
    } else {
      // Grounded tiny trunk + multi-lobe crown rooted directly into the hill crest.
      ridgeTrees.add(
        cutGeometry([[-0.07, -0.05], [0.07, -0.05], [0.05, 0.45], [-0.05, 0.45]], 0.02),
        '#7d695b',
        { x: item.x, y: baseY, z: -5.08, scale: [item.scale, item.scale, 1] },
      );
      ridgeTrees.add(
        ovalGeometry(0.68, 0.66, 0.025),
        item.color,
        { x: item.x, y: baseY + 0.52 * item.scale, z: -5.05, scale: [item.scale, item.scale, 1] },
      );
      ridgeTrees.add(
        ovalGeometry(0.46, 0.46, 0.025),
        item.color,
        { x: item.x + 0.25 * item.scale, y: baseY + 0.36 * item.scale, z: -5.03, scale: [item.scale, item.scale, 1] },
      );
      ridgeTrees.add(
        ovalGeometry(0.42, 0.42, 0.025),
        item.color,
        { x: item.x - 0.23 * item.scale, y: baseY + 0.34 * item.scale, z: -5.03, scale: [item.scale, item.scale, 1] },
      );
    }
  }

  const ridgeTreeMesh = ridgeTrees.build();
  if (ridgeTreeMesh) {
    const mesh = new THREE.Mesh(ridgeTreeMesh, paperSheet());
    mesh.name = 'distant-ridge-trees';
    group.add(mesh);
  }
}

/** Builds soft low-contrast sky clouds, winter moon & stars, summer sun, and distant birds. */
export function addSkyDetails(group: THREE.Group): void {
  const sky = new PaperBatch();
  const S = STOP_SPACING;

  // Low-contrast folded-paper clouds floating in the far sky plane (z = -8.4, 0.42x speed).
  const clouds: Array<[number, number, number, string, string]> = [
    [-7.2, 7.6, 1.15, '#9eaec4', '#8d9eb6'],
    [5.8, 8.3, 1.0, '#a0b0c6', '#8f9fb7'],
    [14.2, 7.9, 1.15, '#99abc1', '#889ab1'],
    [23.8, 8.5, 1.12, '#a2b793', '#8ea680'],
    [29.4, 7.7, 1.05, '#a7bc98', '#92aa84'],
    [35.2, 8.6, 1.22, '#98bdc6', '#83aab5'],
    [45.6, 7.9, 1.08, '#c5a57a', '#b19167'],
    [51.4, 8.5, 1.18, '#cfa775', '#bc9362'],
    [58.8, 7.8, 1.15, '#cc9b89', '#b88777'],
    [66.2, 8.5, 1.1, '#c8978b', '#b58479'],
    [74.5, 8.2, 1.18, '#99abc4', '#879ab4'],
    [84.5, 7.6, 1.1, '#98aac2', '#8698b2'],
  ];
  for (const [cx, cy, scale, tint, shadow] of clouds) {
    addCloud(sky, cx, cy, -8.4, scale, tint, shadow);
  }

  // Winter crescent moons built cleanly from two matching Bezier arcs (no horn pinch).
  for (const [mx, my] of [[-6.8, 8.9], [S * 6 + 6.4, 8.8]] as Array<[number, number]>) {
    const crescent = shapeFrom(s => {
      s.moveTo(0.26, 0.62);
      s.bezierCurveTo(-0.46, 0.66, -0.78, 0.08, -0.5, -0.44);
      s.bezierCurveTo(-0.26, -0.82, 0.28, -0.72, 0.44, -0.42);
      s.bezierCurveTo(0.06, -0.5, -0.24, -0.26, -0.24, 0.08);
      s.bezierCurveTo(-0.24, 0.4, -0.02, 0.56, 0.26, 0.62);
      s.closePath();
    });
    sky.add(new THREE.ExtrudeGeometry(crescent, { depth: 0.025, bevelEnabled: false, curveSegments: 18 }), '#efe6cb', {
      x: mx,
      y: my,
      z: -8.1,
    });
  }

  const starSpots: Array<[number, number, number]> = [
    [-9.2, 9.2, 0.14], [-1.8, 9.5, 0.12], [7.8, 9.2, 0.15], [12.5, 9.4, 0.11],
    [S * 6 - 5.5, 9.1, 0.15], [S * 6 + 1.8, 9.5, 0.13], [S * 6 + 9.2, 8.9, 0.14],
  ];
  for (const [sx, sy, sr] of starSpots) {
    sky.add(starGeometry(sr, 0.02), '#f2e5be', { x: sx, y: sy, z: -8.15 });
  }

  // Warm soft paper sun framed cleanly inside the summer stop (clear of Spring, Autumn, and title).
  sky.add(ovalGeometry(1.48, 1.48, 0.02), '#b8cab8', { x: S * 3 - 0.1, y: 8.65, z: -6.85 });
  sky.add(ovalGeometry(1.02, 1.02, 0.02), '#f5e2b2', { x: S * 3 - 0.1, y: 8.65, z: -6.78 });

  const birdSpots: Array<[number, number, number, string]> = [
    [S * 3 - 4.8, 7.6, 0.28, '#e8efe8'],
    [S * 3 - 3.6, 8.0, 0.22, '#e8efe8'],
    [S * 3 + 2.8, 7.5, 0.25, '#e8efe8'],
    // Autumn migrating geese V-formation
    [S * 4 + 4.4, 8.2, 0.24, '#7d5f4c'],
    [S * 4 + 5.1, 8.45, 0.22, '#7d5f4c'],
    [S * 4 + 5.8, 8.15, 0.2, '#7d5f4c'],
    [S * 5 - 3.8, 8.5, 0.22, '#7c5c52'],
    [S * 5 - 3.1, 8.75, 0.2, '#7c5c52'],
  ];
  for (const [bx, by, bs, col] of birdSpots) {
    const bird = shapeFrom(s => {
      s.moveTo(-bs, -bs * 0.12);
      s.quadraticCurveTo(-bs * 0.45, bs * 0.36, 0, 0);
      s.quadraticCurveTo(bs * 0.45, bs * 0.36, bs, -bs * 0.12);
      s.quadraticCurveTo(bs * 0.42, bs * 0.12, 0, -bs * 0.16);
      s.quadraticCurveTo(-bs * 0.42, bs * 0.12, -bs, -bs * 0.12);
      s.closePath();
    });
    sky.add(new THREE.ExtrudeGeometry(bird, { depth: 0.016, bevelEnabled: false }), col, {
      x: bx,
      y: by,
      z: -7.9,
    });
  }

  const skyMesh = sky.build();
  if (skyMesh) {
    const mesh = new THREE.Mesh(skyMesh, paperSheet());
    mesh.name = 'sky-paper-details';
    group.add(mesh);
  }
}

/** Adds grounded foreground bottom-edge foliage/snowbanks (z = +1.15, 1.24x speed). */
export function addForegroundFraming(group: THREE.Group, batch: PaperBatch): void {
  const fg = (name: string, x: number, y: number, z: number, scale = 1) =>
    new PaperDetail(batch, group, name, x, y, z, scale);

  // --- 1. Grounded bottom-edge foreground details (rooted at y = 0.26, below vehicle wheels) ---
  // Winter start & finale: crisp folded-paper snowdrifts + tiny foreground pine tips.
  const snowBanks = [-4.2, -0.8, 3.6, 7.9, 12.2, 15.8, 69.5, 73.2, 77.6, 82.0];
  for (let i = 0; i < snowBanks.length; i++) {
    const x = snowBanks[i];
    const bank = fg('fg-snowbank', x, 0.25, 1.18 + (i % 2) * 0.14);
    const drift = shapeFrom(s => {
      s.moveTo(-1.35, 0);
      s.quadraticCurveTo(-0.55, 0.42 + (i % 3) * 0.04, 0.15, 0.28);
      s.quadraticCurveTo(0.75, 0.45, 1.4, 0);
      s.closePath();
    });
    bank.shape(drift, i % 2 ? '#edf1f3' : '#e4eaee', 0, 0, 0, undefined, 0.024);
    if (i % 2 === 0) {
      bank.cut([[-0.22, 0.08], [0, 0.46], [0.22, 0.08]], '#5e7e71', -0.45, 0, 0.03, undefined, 0.02);
      bank.cut([[-0.16, 0.08], [0, 0.36], [0.16, 0.08]], '#6e8d7f', -0.18, 0, 0.035, undefined, 0.02);
    }
  }

  // Spring foreground meadow grass tufts & tiny daisies.
  for (let x = SEASON_BORDERS.spring + 0.8; x < SEASON_BORDERS.summer - 0.6; x += 2.35) {
    const tuft = fg('fg-spring-grass', x, 0.25, 1.15 + ((Math.round(x) % 2) * 0.12));
    for (let b = -2; b <= 2; b++) {
      const h = 0.32 + (2 - Math.abs(b)) * 0.05;
      tuft.cut(
        [[b * 0.08 - 0.03, 0], [b * 0.15, h], [b * 0.08 + 0.03, 0]],
        b % 2 === 0 ? '#749664' : '#85a673',
        0,
        0,
        b * 0.005,
        undefined,
        0.018,
      );
    }
    tuft.oval(0.09, 0.09, '#f6e7d4', 0.12, 0.34, 0.03, undefined, 0.014);
    tuft.oval(0.04, 0.04, '#e6be6c', 0.12, 0.34, 0.045, undefined, 0.012);
  }

  // Summer coastal foreground dune reeds & lapping sea-foam scallops.
  for (let x = SEASON_BORDERS.summer + 0.9; x < SEASON_BORDERS.autumn - 0.6; x += 2.6) {
    const dune = fg('fg-summer-coast', x, 0.25, 1.18);
    const wave = shapeFrom(s => {
      s.moveTo(-1.1, 0);
      s.quadraticCurveTo(-0.5, 0.34, 0, 0.24);
      s.quadraticCurveTo(0.55, 0.38, 1.15, 0);
      s.closePath();
    });
    dune.shape(wave, '#d9d0b4', 0, 0, 0, undefined, 0.022);
    for (let b = -1; b <= 1; b++) {
      dune.cut(
        [[b * 0.11 - 0.025, 0.04], [b * 0.19, 0.44 - Math.abs(b) * 0.06], [b * 0.11 + 0.025, 0.04]],
        '#7b9e84',
        0.25,
        0,
        0.025,
        undefined,
        0.018,
      );
    }
  }

  // Autumn foreground fallen-leaf mounds (authentic maple/oak silhouettes!).
  const autumnColors = ['#c96a4a', '#da9b4e', '#b75a4b', '#e2b666', '#a85a45'];
  for (let x = SEASON_BORDERS.autumn + 0.9; x < SEASON_BORDERS.winterEnd - 0.8; x += 2.5) {
    const pile = fg('fg-autumn-leaves', x, 0.25, 1.16 + ((Math.round(x) % 2) * 0.12));
    const mound = shapeFrom(s => {
      s.moveTo(-0.95, 0);
      s.quadraticCurveTo(-0.2, 0.34, 0.25, 0.26);
      s.quadraticCurveTo(0.65, 0.36, 1.0, 0);
      s.closePath();
    });
    pile.shape(mound, '#b67d57', 0, 0, 0, undefined, 0.022);
    for (let k = 0; k < 4; k++) {
      const col = autumnColors[(Math.round(x) + k) % autumnColors.length];
      const lx = -0.45 + k * 0.3;
      const ly = 0.24 + (k % 2) * 0.1;
      const rot: [number, number, number] = [0, 0, (k - 1.5) * 0.55];
      if (k % 2 === 0) pile.mapleLeaf(0.24, col, lx, ly, 0.03 + k * 0.008, rot);
      else pile.oakLeaf(0.22, col, lx, ly, 0.03 + k * 0.008, rot);
    }
  }
}
