import type * as THREE from 'three';
import type { WebGPURenderer } from 'three/webgpu';
import { STORY_Z, TRACK_LENGTH } from '../route';

// compileAsync only builds pipelines for objects inside the current view.
// One very wide pass from the middle of the route covers every station, so
// the ride does not compile shaders on the way.
export async function precompileRoute(
  renderer: WebGPURenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
): Promise<void> {
  const position = camera.position.clone();
  const quaternion = camera.quaternion.clone();
  const fov = camera.fov;
  camera.fov = 150;
  camera.position.x = TRACK_LENGTH / 2;
  camera.lookAt(TRACK_LENGTH / 2, 3.05, STORY_Z + 0.18);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  try {
    await renderer.compileAsync(scene, camera);
  } finally {
    camera.fov = fov;
    camera.position.copy(position);
    camera.quaternion.copy(quaternion);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
  }
}
