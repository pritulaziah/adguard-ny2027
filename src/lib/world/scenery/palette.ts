import * as THREE from 'three';

export const colors = {
  cream: '#f4ead5',
  snow: '#eeeae0',
  wood: '#967665',
  ink: '#4d5551',
  green: '#759486',
  gold: '#e4c07c',
};

export function shapeFrom(draw: (shape: THREE.Shape) => void): THREE.Shape {
  const shape = new THREE.Shape();
  draw(shape);
  return shape;
}

/** Deterministic PRNG so leaf drifts and flower beds stay stable across reloads. */
export function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
