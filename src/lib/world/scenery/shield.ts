import type { PaperDetail } from '../paper-brush';
import { colors } from './palette';

/** A small AdGuard shield badge on a house or a basket. */
export function addShieldOn(parent: PaperDetail, x: number, y: number, scale = 1): void {
  const badge = parent.child('shield', x, y, 0.15, scale);
  badge.cut([[0, 0.35], [0.29, 0.24], [0.25, -0.08], [0, -0.31], [-0.25, -0.08], [-0.29, 0.24]], colors.green);
  badge.stroke([[-0.13, 0.03], [-0.025, -0.07], [0.15, 0.13]], colors.cream, 0.04);
}
