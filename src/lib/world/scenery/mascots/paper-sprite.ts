import * as THREE from 'three';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import type { SceneryContext } from '../../scene-context';
import { addGroundShadow } from '../../animals/shared';
import source from './portraits.json?raw';
import type { MascotInteraction } from '../../../content/i18n';

export interface PaperPortrait {
  width: number;
  height: number;
  crop: [left: number, top: number, right: number, bottom: number];
}

export const paperPortraits = JSON.parse(source) as Record<'agnar' | 'tengu' | 'diana', PaperPortrait>;

/** A paper illustration keeps its transparent edge and sits on the scene's ground. */
export async function addPaperSprite(
  ctx: SceneryContext,
  name: MascotInteraction,
  portrait: PaperPortrait,
  x: number,
  z: number,
  scale: number,
): Promise<void> {
  const url = `${import.meta.env.BASE_URL}mascots/${name}-paper.webp`;
  // Geometry checks run without the browser's image loader.
  const picture =
    typeof document === 'undefined' ? new THREE.Texture() : await new THREE.TextureLoader().loadAsync(url);
  picture.colorSpace = THREE.SRGBColorSpace;
  picture.anisotropy = 4;

  const [left, top, right, bottom] = portrait.crop;
  const height = 1.85;
  const width = (height * (right - left)) / (bottom - top);
  const geometry = new THREE.PlaneGeometry(width, height);
  const uv = geometry.getAttribute('uv');
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(
      i,
      (left + uv.getX(i) * (right - left)) / portrait.width,
      1 - (bottom - uv.getY(i) * (bottom - top)) / portrait.height,
    );
  }
  uv.needsUpdate = true;
  const material = new MeshBasicNodeMaterial({
    map: picture,
    transparent: true,
    alphaTest: 0.025,
    depthWrite: true,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  const group = ctx.place(`paper-mascot-${name}`, x, z, scale);
  group.matrixAutoUpdate = false;
  group.updateMatrix();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `paper-mascot-${name}-sprite`;
  mesh.position.y = height / 2 + 0.02;
  group.add(mesh);
  ctx.animate(mesh, 'still', name, 0.16);

  const shadow = ctx.detail(`paper-mascot-${name}-shadow`, x, z, scale);
  addGroundShadow(shadow, Math.min(1.05, width * 0.74), 0.25, '#92998e');
}
