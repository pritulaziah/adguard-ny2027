import {
  AdditiveBlending,
  Color,
  DataTexture,
  DoubleSide,
  InstancedBufferAttribute,
  LinearFilter,
  LinearMipmapLinearFilter,
  RepeatWrapping,
  Sprite,
  type ColorRepresentation,
} from 'three';
import { MeshBasicNodeMaterial, PointsNodeMaterial } from 'three/webgpu';
import {
  attribute,
  clamp,
  color,
  float,
  instancedBufferAttribute,
  length,
  mix,
  mod,
  positionLocal,
  positionWorld,
  pow,
  shapeCircle,
  sin,
  smoothstep,
  texture,
  time,
  uniform,
  uv,
  vec2,
  vec3,
} from 'three/tsl';
import type { SeasonalRamp } from './seasons';

type FloatNode = ReturnType<typeof float>;
type Vec3Node = ReturnType<typeof vec3>;

// Paper grain is one small shared noise texture, sampled in the shader.
// A procedural noise node made the GPU shader compiler stall for seconds.
let grainTexture: DataTexture | null = null;

function paperGrain(): DataTexture {
  if (grainTexture) return grainTexture;
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < data.length; i += 4) {
    const value = 128 + (Math.random() - 0.5) * 110;
    data[i] = data[i + 1] = data[i + 2] = value;
    data[i + 3] = 255;
  }
  grainTexture = new DataTexture(data, size, size);
  grainTexture.wrapS = grainTexture.wrapT = RepeatWrapping;
  grainTexture.magFilter = LinearFilter;
  grainTexture.minFilter = LinearMipmapLinearFilter;
  grainTexture.generateMipmaps = true;
  // Grazing angles on long paper sheets shimmer without anisotropic filtering.
  grainTexture.anisotropy = 4;
  grainTexture.needsUpdate = true;
  return grainTexture;
}

// One sheet for every paper shape: the base colour and the darkened fold ride in
// the color attribute, and the grain is sampled in world space so merged details
// read as one continuous sheet.
let sheetMaterial: MeshBasicNodeMaterial | null = null;

export function paperSheet(grainStrength = 0.085): MeshBasicNodeMaterial {
  if (sheetMaterial) return sheetMaterial;

  const material = new MeshBasicNodeMaterial({ side: DoubleSide, toneMapped: false });
  const sheet = vec2(positionWorld.x.add(positionWorld.z.mul(0.37)), positionWorld.y.add(positionWorld.z.mul(0.61)));
  const grain = texture(paperGrain(), sheet.mul(0.55)).r.sub(0.5).mul(grainStrength);
  material.colorNode = attribute('color', 'vec3').add(grain);

  sheetMaterial = material;
  return material;
}

export function createScalarUniform(initial = 0) {
  return uniform(initial);
}

export type ScalarUniform = ReturnType<typeof createScalarUniform>;

// One transparent copy of the sheet serves every fading shape, so the renderer
// compiles a single extra pipeline instead of one per shape.
let transparentSheet: MeshBasicNodeMaterial | null = null;

export function transparentPaperSheet(): MeshBasicNodeMaterial {
  if (transparentSheet) return transparentSheet;
  const material = paperSheet().clone();
  material.transparent = true;
  material.depthWrite = false;
  transparentSheet = material;
  return material;
}

export interface SeasonalPaperOptions {
  verticalWash?: number;
  grainStrength?: number;
  grainScale?: number;
  cameraX?: ScalarUniform;
  colorSpread?: number;
}

// Continuous world-space color blend across season borders with shared paper grain.
export function seasonalPaperMaterial(ramp: SeasonalRamp, options: SeasonalPaperOptions = {}): MeshBasicNodeMaterial {
  const { verticalWash = 0, grainStrength = 0.085, grainScale = 0.55, cameraX, colorSpread = 1 } = options;
  const material = new MeshBasicNodeMaterial({ side: DoubleSide, toneMapped: false });

  const sampleX = cameraX && colorSpread < 1 ? mix(cameraX, positionWorld.x, float(colorSpread)) : positionWorld.x;

  const toColorNode = (hex: ColorRepresentation) => color(new Color(hex));
  let blended = mix(toColorNode(ramp.base), toColorNode(ramp.base), float(0));
  for (const stop of ramp.stops) {
    const factor = smoothstep(float(stop.from), float(stop.to), sampleX);
    blended = mix(blended, toColorNode(stop.color), factor);
  }

  if (verticalWash !== 0) {
    const heightT = smoothstep(float(0.5), float(9.5), positionWorld.y);
    const shade = mix(float(1 + verticalWash), float(1 - verticalWash), heightT);
    blended = blended.mul(shade);
  }

  const paperUV = vec2(positionWorld.x.add(positionWorld.z.mul(0.37)), positionWorld.y.add(positionWorld.z.mul(0.61)));
  const grain = texture(paperGrain(), paperUV.mul(grainScale)).r.sub(0.5).mul(grainStrength);
  material.colorNode = blended.add(grain);
  return material;
}

export function resetPaperMaterials(): void {
  sheetMaterial?.dispose();
  sheetMaterial = null;
  transparentSheet?.dispose();
  transparentSheet = null;
  grainTexture?.dispose();
  grainTexture = null;
}

export interface WeatherField {
  points: Sprite;
  speed: { value: number };
}

export interface WeatherFieldOptions {
  color: ColorRepresentation;
  size: number;
  fallMin: number;
  fallRange: number;
  driftAmp: number;
  driftFreq: number;
  opacity: number;
  minY?: number;
  spanY?: number;
  soft?: boolean;
}

// WebGPU draws point primitives at one pixel, so atmospheric particles use
// instanced sprites animated in the vertex shader.
export function createWeatherField(
  positions: Float32Array,
  seeds: Float32Array,
  options: WeatherFieldOptions,
): WeatherField {
  const speed = uniform(1);
  const base = instancedBufferAttribute(new InstancedBufferAttribute(positions, 3)) as unknown as Vec3Node;
  const seed = instancedBufferAttribute(new InstancedBufferAttribute(seeds, 1)) as unknown as FloatNode;
  const minY = options.minY ?? 0.35;
  const spanY = options.spanY ?? 7.1;

  const seconds = time.mul(speed);
  const fall = seconds.mul(float(options.fallMin).add(seed.mul(options.fallRange)));
  const height = mod(base.y.sub(minY).sub(fall), spanY).add(minY);
  const drift = sin(seconds.mul(options.driftFreq).add(seed.mul(6.283))).mul(options.driftAmp);

  const disc = options.soft
    ? smoothstep(float(0.5), float(0.14), length(uv().sub(vec2(0.5, 0.5))))
    : float(shapeCircle() as unknown as FloatNode);

  const material = new PointsNodeMaterial({
    color: options.color,
    size: options.size,
    sizeAttenuation: false,
    transparent: true,
    depthWrite: false,
    opacityNode: disc.mul(options.opacity),
  });
  material.positionNode = vec3(base.x.add(drift), height, base.z);

  const points = new Sprite(material);
  points.count = seeds.length;
  // The vertex shader moves particles past the bounds of the source buffer.
  points.frustumCulled = false;
  return { points, speed };
}

export interface LanternMaterials {
  body: MeshBasicNodeMaterial;
  glow: MeshBasicNodeMaterial;
  lit: { value: number };
}

export function lanternMaterials(): LanternMaterials {
  const lit = uniform(0);

  const body = new MeshBasicNodeMaterial({ side: DoubleSide, toneMapped: false });
  body.colorNode = mix(color('#cf9c79'), color('#ffe3a1'), lit);

  const glow = new MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
    toneMapped: false,
  });
  const falloff = pow(clamp(float(1).sub(length(uv().sub(vec2(0.5, 0.5))).mul(1.8)), 0, 1), 2.2);
  glow.colorNode = vec3(1, 0.78, 0.44).mul(falloff).mul(lit);

  return { body, glow, lit };
}
