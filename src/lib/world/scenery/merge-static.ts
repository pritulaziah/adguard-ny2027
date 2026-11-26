import * as THREE from 'three';
import { paperSheet } from '../paper-materials';

/**
 * Merges the static child meshes of one object into a single mesh. Animated
 * parts, interaction anchors, and instanced meshes stay separate.
 */
export function mergeStaticChildren(
  root: THREE.Object3D,
  keep: Set<THREE.Object3D>,
  includeRoot = true,
): void {
  root.updateWorldMatrix(true, true);
  const inverseRoot = root.matrixWorld.clone().invert();
  const meshes: THREE.Mesh[] = [];
  const rootMesh = includeRoot ? `${root.name}-mesh` : '';

  const visit = (object: THREE.Object3D): void => {
    for (const child of object.children) {
      // A part moves on its own, so it and its subtree stay separate.
      if (keep.has(child)) continue;
      if (child instanceof THREE.InstancedMesh) continue;
      if (child instanceof THREE.Mesh) {
        // Named meshes stay separate. A motion can address them by index,
        // as the gull motion does with its two wings.
        const mergeable = child.children.length === 0 && ((includeRoot && child.name === rootMesh) || !child.name);
        if (mergeable && child.material === paperSheet() && child.geometry.getAttribute('color')) meshes.push(child);
        visit(child);
        continue;
      }
      if (child instanceof THREE.Group) visit(child);
    }
  };
  visit(root);
  if (meshes.length < 2) return;

  const positions: number[] = [];
  const colors: number[] = [];
  const vertex = new THREE.Vector3();
  for (const mesh of meshes) {
    const geometry = mesh.geometry;
    const position = geometry.getAttribute('position');
    const color = geometry.getAttribute('color');
    const index = geometry.getIndex();
    const matrix = new THREE.Matrix4().multiplyMatrices(inverseRoot, mesh.matrixWorld);
    const total = index ? index.count : position.count;
    for (let i = 0; i < total; i++) {
      const vertexIndex = index ? index.getX(i) : i;
      vertex.fromBufferAttribute(position, vertexIndex).applyMatrix4(matrix);
      positions.push(vertex.x, vertex.y, vertex.z);
      colors.push(color.getX(vertexIndex), color.getY(vertexIndex), color.getZ(vertexIndex));
    }
  }

  for (const mesh of meshes) {
    mesh.parent?.remove(mesh);
    mesh.geometry.dispose();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeBoundingSphere();
  const merged = new THREE.Mesh(geometry, paperSheet());
  merged.name = includeRoot ? `${root.name}-mesh` : `${root.name || 'part'}-merged`;
  root.add(merged);
}

/** Removes empty transform groups that only held static child shapes. */
export function pruneEmptyGroups(root: THREE.Object3D, keep: Set<THREE.Object3D>): void {
  for (const child of [...root.children]) {
    pruneEmptyGroups(child, keep);
    if (child instanceof THREE.Group && child.children.length === 0 && !keep.has(child)) root.remove(child);
  }
}
