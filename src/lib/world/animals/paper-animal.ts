import type * as THREE from 'three';
import type { Interaction } from '../../content/i18n';
import type { PaperDetail } from '../paper-detail';
import type { PartKind } from '../part-motion';
import { addGroundShadow, addSparkleEye, addStaticSparkleEye, shapeFrom, type AnimalBuilderContext } from './shared';

/**
 * One figure of the paper world. The base class owns the figure detail, the
 * ground shadow, the sparkle eyes, and the motion registration. A subclass
 * paints the paper shapes of its figure in `paint`.
 */
export abstract class PaperAnimal {
  /** The group and the batch of this figure. */
  protected readonly detail: PaperDetail;
  private painted = false;

  protected constructor(
    protected readonly ctx: AnimalBuilderContext,
    name: string,
    x: number,
    z: number,
    scale: number,
  ) {
    this.detail = ctx.detail(name, x, z, scale);
  }

  /**
   * Adds the shapes of this figure and returns the figure detail. A second
   * call does nothing, so a caller cannot paint the same figure twice.
   */
  build(): PaperDetail {
    if (this.painted) return this.detail;
    this.painted = true;
    this.paint();
    return this.detail;
  }

  /** Adds the shapes of this figure. The base class calls it from `build`. */
  protected abstract paint(): void;

  /** Creates one closed outline from a set of draw calls. */
  protected shape(draw: (shape: THREE.Shape) => void): THREE.Shape {
    return shapeFrom(draw);
  }

  /** Adds the soft ellipse under the figure. */
  protected shadow(width: number, depth = 0.28, color = '#767a75'): void {
    addGroundShadow(this.detail, width, depth, color);
  }

  /** Adds one eye with a white sparkle. */
  protected eye(parent: THREE.Object3D, x: number, y: number, z: number, radius = 0.048, iris?: string): void {
    addSparkleEye(parent, x, y, z, radius, iris);
  }

  /** Adds one eye without a motion. */
  protected stillEye(parent: PaperDetail, x: number, y: number, z: number, radius = 0.048): void {
    addStaticSparkleEye(parent, x, y, z, radius);
  }

  /** Binds a motion to one part of this figure. */
  protected animate(
    mesh: THREE.Object3D,
    kind: PartKind,
    key?: Interaction,
    sparkLift?: number,
    sparkOffsetX?: number,
  ): void {
    this.ctx.animate(mesh, kind, key, sparkLift, sparkOffsetX);
  }
}
