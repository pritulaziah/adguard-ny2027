import * as THREE from 'three';

/**
 * Disposes the geometry, material, texture, and instance buffers of every
 * drawable in the scene. The per-owner destroy methods stay the primary path;
 * this sweep catches anything that a builder created and did not register.
 */
export function disposeSceneResources(scene: THREE.Scene): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  scene.traverse(object => {
    if (!(
      object instanceof THREE.Mesh ||
      object instanceof THREE.Points ||
      object instanceof THREE.Line ||
      object instanceof THREE.Sprite
    ))
      return;
    if (object instanceof THREE.InstancedMesh) object.dispose();
    if ('geometry' in object && object.geometry) geometries.add(object.geometry);
    const mats = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of mats) {
      if (!material) continue;
      materials.add(material);
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) textures.add(value);
      }
    }
  });

  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
  for (const texture of textures) texture.dispose();
}
