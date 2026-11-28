import { expect, test, vi } from 'vitest';
import * as THREE from 'three';
import { disposeSceneResources } from './dispose-scene.ts';

test('the scene sweep releases instance buffers as well as geometry, material, and textures', () => {
  const scene = new THREE.Scene();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const texture = new THREE.Texture();
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const instanced = new THREE.InstancedMesh(geometry, material, 2);
  scene.add(instanced);

  const instancedDispose = vi.spyOn(instanced, 'dispose');
  const geometryDispose = vi.spyOn(geometry, 'dispose');
  const materialDispose = vi.spyOn(material, 'dispose');
  const textureDispose = vi.spyOn(texture, 'dispose');

  disposeSceneResources(scene);

  expect(instancedDispose).toHaveBeenCalled();
  expect(geometryDispose).toHaveBeenCalled();
  expect(materialDispose).toHaveBeenCalled();
  expect(textureDispose).toHaveBeenCalled();
});
