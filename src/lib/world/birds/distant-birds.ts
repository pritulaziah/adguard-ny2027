import type { PartMotion } from '../part-motion';
import type { DistantBirdSeason } from './distant-bird-season';

/** Updates one seasonal group of 3D folded-paper sky birds. */
export const distantBirds: PartMotion = (part, frame) => {
  const season = part.mesh.userData.distantBirds as DistantBirdSeason | undefined;
  if (!season) return;
  part.mesh.visible = season.update(frame.time, frame.delta, frame.distance, frame.reduced, frame.speed);
};
