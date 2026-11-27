import * as THREE from 'three';
import type { WebGPURenderer } from 'three/webgpu';
import { createScalarUniform, type ScalarUniform } from '../paper-materials';
import { STORY_Z, routeProgress } from '../route';
import { WALL_RAMP, sampleRampColor } from '../seasons';
import { finaleCameraOffset } from '../finale';

/** Camera position, parallax, pointer smoothing, and the seasonal background. */
export class CameraRig {
  readonly cameraX: ScalarUniform = createScalarUniform(0);
  readonly background = new THREE.Color(WALL_RAMP.base);
  readonly desiredPosition = new THREE.Vector3();
  portrait = false;
  private look = new THREE.Vector3();
  private desiredLook = new THREE.Vector3();
  private pointer = new THREE.Vector2();
  private pointerSmooth = new THREE.Vector2();

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly renderer: WebGPURenderer,
    private readonly reduced: boolean,
  ) {}

  resize(width: number, height: number): void {
    this.portrait = width / height < 0.85;
    // Threlte owns the drawing buffer size. Only keep the projection in step.
    if (this.camera.aspect !== width / height) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  setPointer(x: number, y: number): void {
    this.pointer.set(x, y);
  }

  update(delta: number, immediate: boolean, distance: number, speed: number): void {
    const height = this.renderer.domElement.clientHeight || window.innerHeight;
    const aspect = this.camera.aspect;
    const shortT = THREE.MathUtils.clamp((560 - height) / (560 - 360), 0, 1);
    const desiredFov = THREE.MathUtils.lerp(54, 55, shortT);
    if (Math.abs(this.camera.fov - desiredFov) > 0.01) {
      this.camera.fov = desiredFov;
      this.camera.updateProjectionMatrix();
    }

    // Portrait views include both figures beside the story. Copy stays in screen space.
    const wallWidth = this.portrait ? 8.4 : 5.35;
    const minDistance = THREE.MathUtils.lerp(8.35, 8.65, shortT);
    const viewDistance = Math.max(
      minDistance,
      wallWidth / (2 * Math.tan(THREE.MathUtils.degToRad(desiredFov / 2)) * aspect * 0.87),
    );

    this.pointerSmooth.lerp(this.pointer, 1 - Math.exp(-delta * 3.8));
    const parallaxX = this.portrait || this.reduced ? 0 : 0.58;
    const parallaxY = this.portrait || this.reduced ? 0 : 0.26;
    const progress = routeProgress(distance);
    const fraction = ((progress % 1) + 1) % 1;
    const speedFactor = THREE.MathUtils.clamp(Math.abs(speed) / 2.2, 0, 1);
    const peek = this.reduced ? 0 : Math.sin(fraction * Math.PI) * speedFactor;
    const framedDistance = distance + finaleCameraOffset(distance);

    // Pivot gently around the animal plane (z ~ -1.05) so clickable sparks stay steady
    // while close foreground planes and deep hills/sky glide smoothly in opposite parallax.
    this.desiredPosition.set(
      framedDistance + this.pointerSmooth.x * parallaxX,
      2.55 + this.pointerSmooth.y * parallaxY + peek * 0.14,
      STORY_Z + viewDistance,
    );
    this.desiredLook.set(
      framedDistance - this.pointerSmooth.x * (parallaxX * 0.14),
      (this.portrait ? viewDistance * 0.32 : 3.06) - this.pointerSmooth.y * (parallaxY * 0.14) - peek * 0.16,
      STORY_Z + 0.18 + peek * 0.45,
    );

    const factor = immediate || this.reduced ? 1 : 1 - Math.exp(-delta * 4.5);
    this.camera.position.lerp(this.desiredPosition, factor);
    this.look.lerp(this.desiredLook, factor);
    this.camera.lookAt(this.look);
    this.camera.updateMatrixWorld();

    this.cameraX.value = this.camera.position.x;
    sampleRampColor(WALL_RAMP, this.camera.position.x, this.background);
  }
}
