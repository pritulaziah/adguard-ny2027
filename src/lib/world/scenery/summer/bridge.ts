import { BufferGeometry, Float32BufferAttribute } from 'three';
import type { SceneryContext } from '../../scene-context';
import { bridgeLift, ROAD_SURFACE_Y, SUMMER_BRIDGE_HALF_SPAN, SUMMER_BRIDGE_X } from '../../summer-bridge';
import { shapeFrom } from '../palette';

/** Separate deck planks and open timber rails share one static paper batch. */
export function addSummerBridge(ctx: SceneryContext): void {
  const bridge = ctx.detail('summer-wooden-bridge', SUMMER_BRIDGE_X, 0, 1, 0);
  const half = SUMMER_BRIDGE_HALF_SPAN;
  const steps = 48;
  const deckY = (x: number) => ROAD_SURFACE_Y + bridgeLift(SUMMER_BRIDGE_X + x);

  function band(bottom: number, top: number) {
    return shapeFrom(s => {
      s.moveTo(-half, deckY(-half) + bottom);
      for (let i = 0; i <= steps; i++) {
        const x = -half + (i / steps) * half * 2;
        s.lineTo(x, deckY(x) + top);
      }
      for (let i = steps; i >= 0; i--) {
        const x = -half + (i / steps) * half * 2;
        s.lineTo(x, deckY(x) + bottom);
      }
      s.closePath();
    });
  }

  // A thin bed under the plank joints keeps the road closed to the wheels.
  const positions: number[] = [];
  for (let i = 0; i < steps; i++) {
    const a = -half + (i / steps) * half * 2;
    const b = -half + ((i + 1) / steps) * half * 2;
    positions.push(a, deckY(a) - 0.006, -0.47, a, deckY(a) - 0.006, 0.47, b, deckY(b) - 0.006, 0.47);
    positions.push(a, deckY(a) - 0.006, -0.47, b, deckY(b) - 0.006, 0.47, b, deckY(b) - 0.006, -0.47);
  }
  const bed = new BufferGeometry();
  bed.setAttribute('position', new Float32BufferAttribute(positions, 3));
  bridge.raw(bed, '#634a35');
  bed.dispose();

  const plankColors = ['#b58a58', '#bf9562', '#aa7c4c', '#c19966'];
  const planks = Math.round((half * 2) / 0.18);
  for (let i = 0; i < planks; i++) {
    const a = -half + (i / planks) * half * 2 + (i ? 0.006 : 0);
    const b = -half + ((i + 1) / planks) * half * 2 - (i < planks - 1 ? 0.006 : 0);
    const plank = shapeFrom(s => {
      s.moveTo(a, deckY(a) - 0.055);
      s.lineTo(a, deckY(a));
      s.lineTo((a + b) / 2, deckY((a + b) / 2));
      s.lineTo(b, deckY(b));
      s.lineTo(b, deckY(b) - 0.055);
      s.closePath();
    });
    bridge.shape(plank, plankColors[i % plankColors.length], 0, 0, -0.48, undefined, 0.96);
  }

  for (const z of [-0.54, 0.47]) {
    const front = z > 0;
    const wood = front ? '#a4774e' : '#805b3b';
    bridge.shape(band(-0.18, -0.065), front ? '#795337' : '#684a33', 0, 0, z, undefined, 0.08);
    bridge.shape(band(0.12, 0.17), wood, 0, 0, z, undefined, 0.065);
    bridge.shape(band(0.34, 0.405), wood, 0, 0, z, undefined, 0.075);
    bridge.shape(band(0.392, 0.405), front ? '#c19a68' : '#a47c50', 0, 0, z + 0.076, undefined, 0.012);

    for (const fraction of [-0.96, -0.49, 0, 0.49, 0.96]) {
      const x = fraction * half;
      const y = deckY(x);
      bridge.box(0.09, 0.44, 0.1, wood, x, y + 0.19, z + 0.02);
      for (const offset of [0.145, 0.37]) {
        bridge.oval(0.026, 0.026, '#57432e', x, y + offset, z + 0.075, undefined, 0.012);
      }
    }
    for (const fraction of [-0.83, 0.83]) {
      const x = fraction * half;
      const height = deckY(x) - 0.065 - 0.26;
      bridge.box(0.15, height, 0.14, '#795337', x, 0.26 + height / 2, z);
    }
  }
}
