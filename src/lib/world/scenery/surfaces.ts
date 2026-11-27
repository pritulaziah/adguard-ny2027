import * as THREE from 'three';
import { seasonalPaperMaterial } from '../paper-materials';
import { ROAD_RAMP, SEASON_BORDERS } from '../seasons';
import { TRACK_LENGTH } from '../route';
import type { SceneryContext } from '../scene-context';

function addGrassVerge(
  ctx: SceneryContext,
  name: string,
  startX: number,
  endX: number,
  backColor: string,
  frontColor: string,
  heightScale = 1,
): void {
  const span = endX - startX;
  const center = (startX + endX) / 2;
  const verge = ctx.detail(name, center, 0, 1, 0);
  for (const zEdge of [-0.44, 0.44]) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    for (let dx = 0; dx <= span; dx += 0.55) {
      const fade = THREE.MathUtils.smoothstep(dx, 0, 1.1) * THREE.MathUtils.smoothstep(span - dx, 0, 1.1);
      const crest = (0.075 + Math.abs(Math.sin(dx * 2.1 + zEdge)) * 0.11) * heightScale;
      shape.lineTo(dx, crest * fade);
    }
    shape.lineTo(span, 0);
    shape.closePath();
    verge.raw(
      new THREE.ExtrudeGeometry(shape, { depth: 0.024, bevelEnabled: false }),
      zEdge < 0 ? backColor : frontColor,
      startX - center,
      0.28,
      zEdge,
    );
  }
}

/** One continuous road from start to finale with seamless seasonal surfaces and verges. */
export function addTravelSurfaces(ctx: SceneryContext): void {
  const totalLength = TRACK_LENGTH + 20;
  const roadMesh = new THREE.Mesh(
    new THREE.BoxGeometry(totalLength, 0.055, 0.84),
    seasonalPaperMaterial(ROAD_RAMP, { grainStrength: 0.075 }),
  );
  roadMesh.name = 'paper-continuous-road';
  roadMesh.position.set(TRACK_LENGTH / 2, 0.295, 0);
  ctx.group.add(roadMesh);

  // Winter snow tire ruts and soft snowbank edges at start and finale.
  const addWinterRoadDetails = (startX: number, endX: number): void => {
    const span = endX - startX;
    const center = (startX + endX) / 2;
    const snow = ctx.detail('paper-snow-road', center, 0, 1, 0);
    for (const z of [-0.2, 0.2]) {
      snow.box(span, 0.008, 0.042, '#ccd6d8', 0, 0.326, z);
    }
    for (const zEdge of [-0.44, 0.44]) {
      snow.box(span, 0.022, 0.075, '#f2f1e8', 0, 0.312, zEdge);
    }
  };
  addWinterRoadDetails(-10, SEASON_BORDERS.spring - 0.6);
  addWinterRoadDetails(SEASON_BORDERS.winterEnd + 0.6, TRACK_LENGTH + 10);

  // Spring damp country lane pebbles and fresh green grass edges.
  const springStart = SEASON_BORDERS.spring + 0.5;
  const springEnd = SEASON_BORDERS.summer - 0.5;
  const springCenter = (springStart + springEnd) / 2;
  const springRoad = ctx.detail('paper-spring-road', springCenter, 0, 1, 0);
  for (let x = springStart + 0.45; x < springEnd - 0.35; x += 0.95) {
    springRoad.box(0.4, 0.012, 0.24, '#c7bca2', x - springCenter, 0.326, Math.round(x * 3) % 2 ? 0.1 : -0.1);
  }
  addGrassVerge(ctx, 'paper-spring-verge', springStart, springEnd, '#88a679', '#9cb78a', 0.95);

  // Summer sunlit dirt road tire tracks and warm golden-green meadow edges.
  const summerStart = SEASON_BORDERS.summer + 0.5;
  const summerEnd = SEASON_BORDERS.autumn - 0.5;
  const summerLen = summerEnd - summerStart;
  const summerCenter = (summerStart + summerEnd) / 2;
  const summerRoad = ctx.detail('paper-summer-road', summerCenter, 0, 1, 0);
  for (const z of [-0.19, 0.19]) {
    summerRoad.box(summerLen, 0.008, 0.06, '#c7b07f', 0, 0.326, z);
  }
  for (let x = summerStart + 0.6; x < summerEnd - 0.4; x += 1.25) {
    summerRoad.box(0.28, 0.009, 0.12, '#ccb98c', x - summerCenter, 0.326, Math.round(x * 5) % 2 ? 0.03 : -0.04);
  }
  addGrassVerge(ctx, 'paper-summer-verge', summerStart, summerEnd, '#a5b56d', '#c6ba70', 1.2);

  // Autumn asphalt curbs and cream dashed road markings.
  const autumnStart = SEASON_BORDERS.autumn + 0.5;
  const autumnEnd = SEASON_BORDERS.winterEnd - 0.5;
  const autumnLen = autumnEnd - autumnStart;
  const autumnCenter = (autumnStart + autumnEnd) / 2;
  const autumnRoad = ctx.detail('paper-autumn-road', autumnCenter, 0, 1, 0);
  for (const zCurb of [-0.43, 0.43]) {
    autumnRoad.box(autumnLen, 0.062, 0.068, '#b99770', 0, 0.3, zCurb);
  }
  for (let x = autumnStart + 0.7; x < autumnEnd - 0.55; x += 1.35) {
    autumnRoad.box(0.58, 0.012, 0.055, '#eee2c8', x - autumnCenter, 0.326, 0);
  }
}
