import * as THREE from 'three';
import { PaperBatch } from '../paper-brush';
import { paperSheet } from '../paper-materials';
import { bar, cutout, cutoutMesh, shapedCutout, type MovingVehicle } from './shared';

/**
 * A paper punt for the quiet summer backwater. The reader drifts with the
 * current, so the craft needs no rower: the wake and the banks carry the motion.
 * A curved canvas awning frames two benches above the rounded wooden hull.
 */
export function createPaperPunt(scene: THREE.Scene): MovingVehicle {
  const group = new THREE.Group();
  group.name = 'paper-hero-punt';
  const body = new THREE.Group();
  group.add(body);
  const wood = new PaperBatch();

  // A single strip follows a sampled curve with constant width. Adjacent
  // pieces overlap within one shape, so the rim has no mitre seams.
  function curvedStrip(path: THREE.Curve<THREE.Vector2>, width: number, color: string, z: number): void {
    const points = path.getPoints(64);
    const left: THREE.Vector2[] = [];
    const right: THREE.Vector2[] = [];
    for (let i = 0; i < points.length; i++) {
      const tangent = points[Math.min(i + 1, points.length - 1)]!.clone().sub(points[Math.max(0, i - 1)]!).normalize();
      const normal = new THREE.Vector2(-tangent.y, tangent.x).multiplyScalar(width / 2);
      left.push(points[i]!.clone().add(normal));
      right.push(points[i]!.clone().sub(normal));
    }
    const shape = new THREE.Shape([...left, ...right.reverse()]);
    shape.closePath();
    wood.add(new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: false }), color, { z }, color);
  }

  // Warm interior backing extends behind the front wall to seal the hull.
  const opening = new THREE.Shape();
  opening.moveTo(-1.1, 0.5);
  opening.quadraticCurveTo(0, 0.68, 1.15, 0.62);
  opening.lineTo(1.02, 0.02);
  opening.quadraticCurveTo(0, -0.08, -0.98, 0.02);
  opening.closePath();
  shapedCutout(wood, opening, '#887253', 0.018, -0.025);
  curvedStrip(new THREE.QuadraticBezierCurve(new THREE.Vector2(-1.1, 0.5), new THREE.Vector2(0, 0.68), new THREE.Vector2(1.15, 0.62)), 0.035, '#ceb28b', 0);

  // Two simple bench tops make the opening readable without loose props.
  for (const x of [-0.5, 0.35]) {
    cutout(wood, [[x - 0.15, 0.39], [x + 0.15, 0.4], [x + 0.11, 0.55], [x - 0.13, 0.54]], '#d7bc94', 0.018, 0.012);
  }

  const sheer = new THREE.CurvePath<THREE.Vector2>();
  sheer.add(new THREE.QuadraticBezierCurve(new THREE.Vector2(-1.14, 0.46), new THREE.Vector2(-0.6, 0.36), new THREE.Vector2(0, 0.38)));
  sheer.add(new THREE.QuadraticBezierCurve(new THREE.Vector2(0, 0.38), new THREE.Vector2(0.75, 0.38), new THREE.Vector2(1.16, 0.62)));
  const hull = new THREE.Shape(sheer.getPoints(64));
  hull.quadraticCurveTo(1.07, 0.08, 0.7, -0.015);
  hull.quadraticCurveTo(0, -0.09, -0.92, 0.015);
  hull.quadraticCurveTo(-1.08, 0.14, -1.14, 0.46);
  hull.closePath();
  shapedCutout(wood, hull, '#b78d63', 0.022, 0.04);

  // Fine curved plank joints stay inside the rounded hull.
  for (const [y, width] of [[0.26, 1.94], [0.13, 1.67]]) {
    curvedStrip(new THREE.QuadraticBezierCurve(new THREE.Vector2(-width / 2, y + 0.035), new THREE.Vector2(0, y - 0.04), new THREE.Vector2(width / 2, y + 0.06)), 0.009, '#956e4e', 0.066);
  }
  curvedStrip(sheer, 0.045, '#e3cba5', 0.082);

  // Close the stern between the rear and front rims in depth as well as height.
  const sternRear = new THREE.Vector3(-1.1, 0.5, 0.004);
  const sternFront = new THREE.Vector3(-1.14, 0.46, 0.086);
  const sternSpan = sternFront.clone().sub(sternRear);
  const sternMatrix = new THREE.Matrix4().compose(
    sternRear.clone().add(sternFront).multiplyScalar(0.5),
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), sternSpan.clone().normalize()),
    new THREE.Vector3(1, 1, 1),
  );
  wood.add(new THREE.BoxGeometry(0.045, sternSpan.length() + 0.025, 0.026), '#e3cba5', sternMatrix, '#e3cba5');

  // The rim alone does not seal the opening below it. This solid end wall
  // overlaps both hull layers throughout their depth, including oblique views.
  const sternWall = new THREE.Shape();
  sternWall.moveTo(-1.1, 0.51);
  sternWall.lineTo(-1.15, 0.475);
  sternWall.quadraticCurveTo(-1.08, 0.14, -0.92, 0.015);
  sternWall.lineTo(-0.84, 0.02);
  sternWall.lineTo(-0.99, 0.5);
  sternWall.closePath();
  wood.add(new THREE.ExtrudeGeometry(sternWall, { depth: 0.11, bevelEnabled: false }), '#a07c56', { z: -0.035 }, '#a07c56');

  // Two supports and a continuous curved canvas roof keep a quiet silhouette.
  for (const x of [-0.67, 0.66]) {
    bar(wood, x, 0.4, x, 0.99, 0.026, '#907553', 0.025, 0.014);
  }
  curvedStrip(new THREE.QuadraticBezierCurve(new THREE.Vector2(-0.89, 0.98), new THREE.Vector2(0, 1.24), new THREE.Vector2(0.89, 0.98)), 0.078, '#f4ead4', 0.058);

  const geometry = wood.build();
  if (geometry) body.add(new THREE.Mesh(geometry, paperSheet()));

  // Foam trails behind the stern and stays behind the near wall.
  const wake = cutoutMesh([[-1.5, 0.05], [-1.16, 0.065], [-0.92, 0.03], [-1.1, 0], [-1.52, 0.012]], '#e8f2dc', 0.012);
  wake.name = 'paper-punt-wake';
  wake.position.z = -0.02;
  group.add(wake);
  scene.add(group);

  return {
    group,
    update: (x, time, moving, reduced) => {
      const heave = reduced ? 0 : Math.sin(time * 1.35) * 0.018;
      group.position.set(x, 0.34 + heave, 0.06);
      body.rotation.z = reduced ? 0 : Math.sin(time * 1.05) * 0.012;
      wake.visible = moving && !reduced;
      if (!wake.visible) return;
      wake.position.x = -0.06 + Math.sin(time * 1.7) * 0.03;
      wake.scale.set(1 + Math.sin(time * 2.1) * 0.05, 1, 1);
    },
  };
}
