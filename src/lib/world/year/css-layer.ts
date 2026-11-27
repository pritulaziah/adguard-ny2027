import * as THREE from 'three';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';

/**
 * The CSS3D overlay. It rewrites DOM transforms only when the camera or a
 * sprite changed, because a still frame must not touch the DOM.
 */
export class CssLayer {
  readonly scene = new THREE.Scene();
  readonly renderer = new CSS3DRenderer();
  private renderedCamera = new THREE.Vector3(NaN, NaN, NaN);
  private renderedFov = 0;
  private dirty = true;

  constructor(layer: HTMLDivElement) {
    this.renderer.domElement.style.pointerEvents = 'none';
    // Focus must not scroll the layer away from its WebGL geometry.
    this.renderer.domElement.style.overflow = 'clip';
    layer.append(this.renderer.domElement);
  }

  resize(width: number, height: number): void {
    this.renderer.setSize(width, height);
    this.dirty = true;
  }

  render(camera: THREE.PerspectiveCamera, changed: boolean): void {
    const cameraMoved = !this.renderedCamera.equals(camera.position) || this.renderedFov !== camera.fov;
    if (!cameraMoved && !changed && !this.dirty) return;
    this.renderer.render(this.scene, camera);
    this.renderedCamera.copy(camera.position);
    this.renderedFov = camera.fov;
    this.dirty = false;
  }

  destroy(): void {
    this.renderer.domElement.remove();
  }
}
