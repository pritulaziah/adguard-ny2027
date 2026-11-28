import { expect, test } from 'vitest';
import * as THREE from 'three';
import { addDistantBirds } from './scenery/distant-birds.ts';
import { Wingbeat } from './birds/index.ts';
import { createPaperScenery } from './scenery/index.ts';
import { createScalarUniform } from './paper-materials.ts';
import { PART_KINDS, motionFor } from './part-motion.ts';
import { TRACK_LENGTH, stopX } from './route.ts';
import { SEASON_BORDERS } from './seasons.ts';

function buildDistantBirds() {
  const root = new THREE.Group();
  const parts = [];
  addDistantBirds({
    group: root,
    cameraX: null,
    detail: () => {
      throw new Error('unexpected detail');
    },
    place: (name, x, z = 0, scale = 1, y = 0.34) => {
      const group = new THREE.Group();
      group.name = name;
      group.position.set(x, y, z);
      group.scale.setScalar(scale);
      root.add(group);
      return group;
    },
    animate: (mesh, kind) => {
      parts.push({
        mesh,
        kind,
        position: mesh.position.clone(),
        rotation: mesh.rotation.clone(),
        scale: mesh.scale.clone(),
        phase: parts.length * 0.73,
        worldX: mesh.position.x,
        span: mesh.userData.motionSpan,
        apply: motionFor(kind),
      });
    },
  });
  return { root, parts };
}

test('each season has one bird species, including winter, with no species mixing on one scene', () => {
  const { parts } = buildDistantBirds();
  expect(parts).toHaveLength(5);
  expect(parts.map(part => [part.mesh.userData.distantBirds.season, part.mesh.userData.distantBirds.species])).toEqual([
    ['winter-start', 'bullfinch'],
    ['spring', 'swallow'],
    ['summer', 'stork'],
    ['autumn', 'goose'],
    ['winter-end', 'bullfinch'],
  ]);

  // Across the entire route, at most one season's species is visible at any distance.
  for (let distance = 0; distance <= TRACK_LENGTH; distance += 0.5) {
    const visible = [];
    for (const part of parts) {
      part.apply(part, { time: 4, delta: 1 / 60, reduced: false, distance, speed: 0 });
      if (part.mesh.visible) visible.push(part.mesh.userData.distantBirds.species);
    }
    expect(visible.length, `at most one species visible at x=${distance}`).toBeLessThanOrEqual(1);
  }

  // Every story stop has its single matching seasonal species visible.
  const stopExpectations = [
    [stopX(0), 'bullfinch'],
    [stopX(1), 'bullfinch'],
    [stopX(2), 'swallow'],
    [stopX(3), 'swallow'],
    [stopX(4), 'stork'],
    [stopX(5), 'goose'],
    [stopX(6), 'goose'],
    [stopX(7), 'bullfinch'],
  ];
  for (const [distance, species] of stopExpectations) {
    const visible = [];
    for (const part of parts) {
      part.apply(part, { time: 4, delta: 1 / 60, reduced: false, distance, speed: 0 });
      if (part.mesh.visible) visible.push(part.mesh.userData.distantBirds.species);
    }
    expect(visible, `stop at ${distance} shows only ${species}`).toEqual([species]);
  }
});

test('all four seasonal species have distinct 3D paper silhouettes inside season sky bounds', () => {
  const { parts } = buildDistantBirds();
  const bounds = {
    'winter-start': [-6, SEASON_BORDERS.spring],
    spring: [SEASON_BORDERS.spring, SEASON_BORDERS.summer],
    summer: [SEASON_BORDERS.summer, SEASON_BORDERS.autumn],
    autumn: [SEASON_BORDERS.autumn, SEASON_BORDERS.winterEnd],
    'winter-end': [SEASON_BORDERS.winterEnd, TRACK_LENGTH],
  };
  const signatures = new Map();

  for (const part of parts) {
    const data = part.mesh.userData.distantBirds;
    const [minX, maxX] = bounds[data.season];
    expect(data.bodies).toBeInstanceOf(THREE.InstancedMesh);
    expect(data.leftWings).toBeInstanceOf(THREE.InstancedMesh);
    expect(data.rightWings).toBeInstanceOf(THREE.InstancedMesh);

    const bodyBox = new THREE.Box3().setFromBufferAttribute(data.bodies.geometry.getAttribute('position'));
    const bodySize = bodyBox.getSize(new THREE.Vector3());
    const wingBox = new THREE.Box3().setFromBufferAttribute(data.rightWings.geometry.getAttribute('position'));
    const wingSize = wingBox.getSize(new THREE.Vector3());
    expect(bodySize.x, `${data.species} body length`).toBeGreaterThan(1.0);
    expect(bodySize.z, `${data.species} 3D tail width`).toBeGreaterThan(0.18);
    if (data.species === 'bullfinch') {
      expect(bodySize.x, 'bullfinch has long avian body and tail').toBeGreaterThan(1.3);
      expect(wingSize.z / wingSize.x, 'bullfinch wing is sleek and swept, not rounded').toBeGreaterThan(2.1);
      expect(data.dorsalTilt, 'bullfinch keeps a clear side profile').toBeLessThan(0.22);
    }
    signatures.set(
      data.species,
      `${bodySize.x.toFixed(2)}:${bodySize.z.toFixed(2)}:${wingSize.x.toFixed(2)}:${wingSize.z.toFixed(2)}`,
    );

    const bodyColors = data.bodies.geometry.getAttribute('color');
    const uniqueTones = new Set();
    for (let i = 0; i < bodyColors.count; i += 6) {
      uniqueTones.add(
        `${bodyColors.getX(i).toFixed(2)},${bodyColors.getY(i).toFixed(2)},${bodyColors.getZ(i).toFixed(2)}`,
      );
    }
    expect(uniqueTones.size, `${data.species} layered paper tones`).toBeGreaterThanOrEqual(3);

    const testDistances =
      data.season === 'winter-start'
        ? [stopX(0), stopX(1)]
        : data.season === 'spring'
          ? [stopX(2), stopX(3)]
          : data.season === 'summer'
            ? [stopX(4)]
            : data.season === 'autumn'
              ? [stopX(5), stopX(6)]
              : [stopX(7), stopX(7) + 6];

    for (const distance of testDistances) {
      part.apply(part, { time: 0, delta: 1 / 60, reduced: false, distance, speed: 0 });
      for (const flight of data.flights) {
        for (const member of flight.members) {
          for (let step = 0; step < 30; step++) {
            const t = step * 0.6;
            part.apply(part, { time: t, delta: 0.05, reduced: false, distance, speed: 0 });
            const pose = flight.samplePose(member, t, distance, 1, false);
            if (pose.scale === 0) continue;
            expect(pose.x, `${data.season} min x at d=${distance}`).toBeGreaterThan(minX);
            expect(pose.x, `${data.season} max x at d=${distance}`).toBeLessThan(maxX);
            expect(pose.y, `${data.season} above peaks`).toBeGreaterThan(4.8);
            if (data.season === 'summer') {
              expect(pose.y, 'summer storks stay below the sun disc').toBeLessThan(7.1);
            }
            if (data.season === 'winter-start' || data.season === 'winter-end') {
              expect(pose.y, 'winter bullfinches stay below moons and stars').toBeLessThan(7.5);
            }
          }
        }
      }
    }
  }

  expect(new Set(signatures.values()).size).toBe(4);
});

test('soaring birds fly along with forward and backward scroll and settle when stopped', () => {
  const { parts } = buildDistantBirds();
  const spring = parts.find(entry => entry.mesh.userData.distantBirds.season === 'spring');
  const flight = spring.mesh.userData.distantBirds.flights[0];

  // Enter Spring at Stop 2.
  spring.apply(spring, { time: 0, delta: 1 / 60, reduced: false, distance: stopX(2), speed: 0 });
  const startFocus = flight.runtime.focusX;
  const startOrbit = flight.runtime.orbitAngle;

  // Scroll forward from Stop 2 toward Stop 3.
  let t = 0;
  for (let i = 1; i <= 60; i++) {
    t = i / 30;
    const d = THREE.MathUtils.lerp(stopX(2), stopX(3), i / 60);
    spring.apply(spring, { time: t, delta: 1 / 30, reduced: false, distance: d, speed: 6.3 });
  }
  const forwardFocus = flight.runtime.focusX;
  const forwardOrbit = flight.runtime.orbitAngle;
  expect(forwardFocus, 'birds glide rightward with forward scroll').toBeGreaterThan(startFocus + 4);
  expect(forwardOrbit - startOrbit, 'orbit advances actively while scrolling').toBeGreaterThan(1.5);
  expect(flight.runtime.surge, 'scrolling triggers active flight surge').toBeGreaterThan(0.6);

  // Stop scrolling at Stop 3 and let the surge settle back to calm gliding.
  for (let i = 1; i <= 120; i++) {
    t += 1 / 30;
    spring.apply(spring, { time: t, delta: 1 / 30, reduced: false, distance: stopX(3), speed: 0 });
  }
  expect(flight.runtime.surge).toBeLessThan(0.02);

  // Scroll backward toward Stop 2: birds glide smoothly back with the reader.
  for (let i = 1; i <= 60; i++) {
    t += 1 / 30;
    const d = THREE.MathUtils.lerp(stopX(3), stopX(2), i / 60);
    spring.apply(spring, { time: t, delta: 1 / 30, reduced: false, distance: d, speed: -6.3 });
  }
  expect(flight.runtime.focusX, 'birds glide leftward with backward scroll').toBeLessThan(forwardFocus - 3);
  expect(Number.isFinite(flight.runtime.yaw)).toBe(true);
});

test('autumn geese fly continuously across autumn screens without mid-season resets', () => {
  const idle = buildDistantBirds().parts.find(entry => entry.mesh.userData.distantBirds.season === 'autumn');
  const scrolled = buildDistantBirds().parts.find(entry => entry.mesh.userData.distantBirds.season === 'autumn');

  let prevX = -Infinity;
  for (let i = 0; i < 66; i++) {
    const t = i / 30;
    const d = THREE.MathUtils.lerp(stopX(5), stopX(6), i / 65);
    idle.apply(idle, { time: t, delta: 1 / 30, reduced: false, distance: stopX(5), speed: 0 });
    scrolled.apply(scrolled, { time: t, delta: 1 / 30, reduced: false, distance: d, speed: 5.8 });

    const scrollData = scrolled.mesh.userData.distantBirds;
    const scrollFlock = scrollData.flights[0];
    const leadPose = scrollFlock.samplePose(scrollFlock.members[0], t, d, 1, false, scrollData.dorsalTilt);
    expect(scrolled.mesh.visible, `autumn visible at step ${i}`).toBe(true);
    expect(leadPose.scale, `no mid-season fade at step ${i}`).toBeCloseTo(scrollFlock.members[0].size, 3);
    expect(scrollFlock.runtime.flockX, `monotonic forward flight at step ${i}`).toBeGreaterThan(prevX);
    prevX = scrollFlock.runtime.flockX;
  }

  const idleFlock = idle.mesh.userData.distantBirds.flights[0];
  const scrollFlock = scrolled.mesh.userData.distantBirds.flights[0];
  expect(scrollFlock.runtime.flockX, 'scrolling forward carries the flock across autumn').toBeGreaterThan(
    idleFlock.runtime.flockX + 6,
  );
  expect(Math.abs(scrollFlock.runtime.flockX - stopX(6)), 'flock stays framed over Stop 6').toBeLessThan(3.5);

  // Pausing to read at Stop 5 and then scrolling to Stop 6 keeps one unbroken flight.
  const paused = buildDistantBirds().parts.find(entry => entry.mesh.userData.distantBirds.season === 'autumn');
  const pausedData = paused.mesh.userData.distantBirds;
  const pausedFlock = pausedData.flights[0];
  let pt = 0;
  let lastPausedX = -Infinity;
  for (let i = 0; i < 450; i++) {
    pt += 1 / 30;
    paused.apply(paused, { time: pt, delta: 1 / 30, reduced: false, distance: stopX(5), speed: 0 });
    expect(pausedFlock.runtime.flockX).toBeGreaterThan(lastPausedX);
    lastPausedX = pausedFlock.runtime.flockX;
  }
  for (let i = 1; i <= 66; i++) {
    pt += 1 / 30;
    const d = THREE.MathUtils.lerp(stopX(5), stopX(6), i / 66);
    paused.apply(paused, { time: pt, delta: 1 / 30, reduced: false, distance: d, speed: 5.8 });
    const pose = pausedFlock.samplePose(pausedFlock.members[0], pt, d, 1, false, pausedData.dorsalTilt);
    expect(pose.scale).toBeCloseTo(pausedFlock.members[0].size, 3);
    expect(pausedFlock.runtime.flockX).toBeGreaterThan(lastPausedX);
    lastPausedX = pausedFlock.runtime.flockX;
  }
  expect(Math.abs(pausedFlock.runtime.flockX - stopX(6)), 'reader catches up to same flock at Stop 6').toBeLessThan(
    3.5,
  );

  // Reduced motion keeps the flock visible and stationary across time.
  const reduced = buildDistantBirds().parts.find(entry => entry.mesh.userData.distantBirds.season === 'autumn');
  reduced.apply(reduced, { time: 0, delta: 1 / 60, reduced: true, distance: stopX(5), speed: 0 });
  expect(reduced.mesh.visible).toBe(true);
  const data = reduced.mesh.userData.distantBirds;
  const firstBody = new THREE.Matrix4();
  const laterBody = new THREE.Matrix4();
  data.bodies.getMatrixAt(0, firstBody);
  reduced.apply(reduced, { time: 14, delta: 1 / 60, reduced: true, distance: stopX(5), speed: 0 });
  data.bodies.getMatrixAt(0, laterBody);
  expect(laterBody.elements).toEqual(firstBody.elements);
});

test('idle wing motion glides most of each cycle while scroll surge drives active beats', () => {
  const { parts } = buildDistantBirds();
  const wingbeat = new Wingbeat();
  for (const part of parts) {
    const data = part.mesh.userData.distantBirds;
    for (const flight of data.flights) {
      for (const member of flight.members) {
        const steps = 200;
        let gliding = 0;
        let maxIdle = 0;
        let activeBeats = 0;
        for (let i = 0; i < steps; i++) {
          const t = (i / steps) * member.wingCycle;
          const idle = wingbeat.sample(member, t, false, 0);
          const deviation = Math.abs(idle.flap - member.glideAngle);
          if (deviation < 0.05) gliding++;
          if (deviation > maxIdle) maxIdle = deviation;

          const surging = wingbeat.sample(member, t, false, 1);
          if (Math.abs(surging.flap - member.glideAngle) > 0.12) activeBeats++;
        }
        expect(gliding / steps, `${data.species} glides calmly when idle`).toBeGreaterThan(0.65);
        expect(maxIdle, `${data.species} distinct idle wingbeat`).toBeGreaterThan(0.35);
        expect(activeBeats / steps, `${data.species} beats actively while scrolling`).toBeGreaterThan(0.55);
      }
    }
  }
});

test('light gulls are replaced by seasonal birds in the full scenery', async () => {
  globalThis.requestAnimationFrame ??= callback => setTimeout(() => callback(performance.now()), 0);
  expect(PART_KINDS).not.toContain('gull');
  expect(PART_KINDS).toContain('distant-birds');

  const set = await createPaperScenery(createScalarUniform(0));
  expect(set.group.getObjectByName('gull-wing-left')).toBeUndefined();
  expect(set.group.getObjectByName('gull-wing-right')).toBeUndefined();
  expect(set.animated.filter(part => part.kind === 'distant-birds')).toHaveLength(5);
}, 60000);
