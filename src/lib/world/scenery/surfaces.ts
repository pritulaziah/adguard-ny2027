import * as THREE from 'three';
import { paint } from '../paper-brush';
import { carded } from '../paper-mesh';
import { paperSheet } from '../paper-materials';
import { SEASON_BORDERS } from '../seasons';
import { TRACK_LENGTH } from '../route';
import type { SceneryContext } from '../scene-context';

/** Winter rails, the spring garden path, the summer river, and the autumn road. */
export function addTravelSurfaces(ctx: SceneryContext): void {
  // Winter paper railways: start and finale.
  const addPaperRailway = (startX: number, endX: number): void => {
    const span = endX - startX;
    const center = (startX + endX) / 2;

    const track = ctx.detail('paper-railway', center, 0, 1, 0);
    track.box(span, 0.036, 0.72, '#d0c8b6', 0, 0.278, 0);

    const sleeperStep = 0.44;
    const sleeperCount = Math.floor((span - 0.2) / sleeperStep) + 1;
    const sleepers = new THREE.InstancedMesh(
      paint(new THREE.BoxGeometry(0.16, 0.024, 0.56), '#967a64'),
      paperSheet(),
      sleeperCount,
    );
    const dummy = new THREE.Object3D();
    for (let i = 0; i < sleeperCount; i++) {
      dummy.position.set(startX + 0.16 + i * sleeperStep - center, 0.309, 0);
      dummy.updateMatrix();
      sleepers.setMatrixAt(i, dummy.matrix);
    }
    sleepers.instanceMatrix.needsUpdate = true;
    track.group.add(sleepers);

    for (const zRail of [-0.11, 0.11]) {
      track.box(span, 0.022, 0.044, '#6d7378', 0, 0.333, zRail);
      track.box(span, 0.005, 0.026, '#b5babd', 0, 0.347, zRail);
    }
  };

  addPaperRailway(-10, SEASON_BORDERS.spring - 0.15);
  addPaperRailway(SEASON_BORDERS.winterEnd, TRACK_LENGTH + 10);

  // Spring garden path.
  const springLen = SEASON_BORDERS.summer - SEASON_BORDERS.spring;
  const springCenter = (SEASON_BORDERS.spring + SEASON_BORDERS.summer) / 2;
  const path = ctx.detail('paper-garden-path', springCenter, 0, 1, 0);
  path.box(springLen, 0.055, 0.74, '#dfd5bc', 0, 0.295, 0);

  for (let x = SEASON_BORDERS.spring + 0.6; x < SEASON_BORDERS.summer - 0.4; x += 0.95) {
    path.box(0.42, 0.015, 0.28, '#d1c6aa', x - springCenter, 0.326, ((Math.round(x * 3) % 2) ? 0.09 : -0.09));
  }

  // Grass border along garden path.
  for (const zEdge of [-0.42, 0.42]) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    for (let dx = 0; dx <= springLen; dx += 0.55) {
      shape.lineTo(dx, 0.08 + Math.abs(Math.sin(dx * 2.1 + zEdge)) * 0.12);
    }
    shape.lineTo(springLen, 0);
    shape.closePath();
    path.raw(
      new THREE.ExtrudeGeometry(shape, { depth: 0.025, bevelEnabled: false }),
      zEdge < 0 ? '#93aa7e' : '#a3b88d',
      SEASON_BORDERS.spring - springCenter,
      0.28,
      zEdge,
    );
  }

  // Calm river current.
  const summerLen = SEASON_BORDERS.autumn - SEASON_BORDERS.summer;
  const summerCenter = (SEASON_BORDERS.summer + SEASON_BORDERS.autumn) / 2;
  const sea = ctx.detail('paper-river', summerCenter, 0, 1, 0);
  sea.box(summerLen + 0.1, 0.06, 1.44, '#7eaaa0', 0, 0.29, -0.08);

  const waveSpecs: Array<{ z: number; y: number; color: string; amp: number; freq: number }> = [
    { z: -0.5, y: 0.31, color: '#70988d', amp: 0.13, freq: 1.45 },
    { z: -0.08, y: 0.31, color: '#8bb4a6', amp: 0.14, freq: 1.75 },
    { z: 0.35, y: 0.3, color: '#abc9b4', amp: 0.12, freq: 2.0 },
  ];
  waveSpecs.forEach((spec, idx) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.08);
    for (let dx = 0; dx <= summerLen + 0.2; dx += 0.35) {
      const crest = 0.08 + Math.abs(Math.sin(dx * spec.freq + idx * 1.3)) * spec.amp;
      shape.lineTo(dx, crest);
    }
    shape.lineTo(summerLen + 0.2, -0.08);
    shape.closePath();
    const ribbon = carded(new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: false }), spec.color);
    ribbon.name = 'paper-river-wave';
    ribbon.position.set(SEASON_BORDERS.summer - 0.1, spec.y, spec.z);
    ctx.group.add(ribbon);
    ctx.animate(ribbon, 'wave');
  });

  // Autumn country road.
  const autumnLen = SEASON_BORDERS.winterEnd - SEASON_BORDERS.autumn;
  const autumnCenter = (SEASON_BORDERS.autumn + SEASON_BORDERS.winterEnd) / 2;
  const road = ctx.detail('paper-road', autumnCenter, 0, 1, 0);
  road.box(autumnLen, 0.055, 0.78, '#968b7e', 0, 0.295, 0);

  for (const zCurb of [-0.41, 0.41]) road.box(autumnLen, 0.065, 0.07, '#b99770', 0, 0.3, zCurb);

  for (let x = SEASON_BORDERS.autumn + 0.75; x < SEASON_BORDERS.winterEnd - 0.6; x += 1.35) {
    road.box(0.58, 0.012, 0.055, '#eee2c8', x - autumnCenter, 0.326, 0);
  }
}
