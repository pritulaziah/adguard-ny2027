import * as THREE from 'three';
import type { FlightGroup } from './flight-group';
import type { BirdPose, BirdSeason, BirdSpecies } from './types';

export interface DistantBirdSeasonOptions {
  season: BirdSeason;
  species: BirdSpecies;
  wingOffset: [number, number, number];
  dorsalTilt: number;
  centerX: number;
  fadeInStart: number;
  fadeInEnd: number;
  fadeOutStart: number;
  fadeOutEnd: number;
  flights: FlightGroup[];
  bodies: THREE.InstancedMesh;
  leftWings: THREE.InstancedMesh;
  rightWings: THREE.InstancedMesh;
}

/**
 * One season group of sky birds. It owns the season fade, the flight groups,
 * and the three instanced meshes. Each frame it writes every body and wing
 * matrix, so the frame loop allocates nothing.
 */
export class DistantBirdSeason {
  readonly season: BirdSeason;
  readonly species: BirdSpecies;
  readonly dorsalTilt: number;
  readonly flights: FlightGroup[];
  readonly bodies: THREE.InstancedMesh;
  readonly leftWings: THREE.InstancedMesh;
  readonly rightWings: THREE.InstancedMesh;
  private readonly wingOffset: [number, number, number];
  private readonly centerX: number;
  private readonly fadeInStart: number;
  private readonly fadeInEnd: number;
  private readonly fadeOutStart: number;
  private readonly fadeOutEnd: number;
  private readonly pose: BirdPose = { x: 0, y: 0, z: 0, scale: 1, yaw: 0, pitch: 0, roll: 0, flap: 0 };
  private readonly pos = new THREE.Vector3();
  private readonly scale = new THREE.Vector3();
  private readonly unitScale = new THREE.Vector3(1, 1, 1);
  private readonly bodyEuler = new THREE.Euler(0, 0, 0, 'YZX');
  private readonly bodyQuat = new THREE.Quaternion();
  private readonly bodyMatrix = new THREE.Matrix4();
  private readonly shoulder = new THREE.Vector3();
  private readonly wingEuler = new THREE.Euler();
  private readonly wingQuat = new THREE.Quaternion();
  private readonly wingMatrix = new THREE.Matrix4();
  private readonly instanceMatrix = new THREE.Matrix4();

  constructor(options: DistantBirdSeasonOptions) {
    this.season = options.season;
    this.species = options.species;
    this.dorsalTilt = options.dorsalTilt;
    this.flights = options.flights;
    this.bodies = options.bodies;
    this.leftWings = options.leftWings;
    this.rightWings = options.rightWings;
    this.wingOffset = options.wingOffset;
    this.centerX = options.centerX;
    this.fadeInStart = options.fadeInStart;
    this.fadeInEnd = options.fadeInEnd;
    this.fadeOutStart = options.fadeOutStart;
    this.fadeOutEnd = options.fadeOutEnd;
  }

  /** Writes all 3D body and wing matrices for this season group. */
  update(time: number, delta: number, distance: number, reduced: boolean, speed?: number): boolean {
    const fadeIn = THREE.MathUtils.smoothstep(distance, this.fadeInStart, this.fadeInEnd);
    const fadeOut = 1 - THREE.MathUtils.smoothstep(distance, this.fadeOutStart, this.fadeOutEnd);
    const seasonFade = Math.min(fadeIn, fadeOut);
    if (seasonFade <= 0.001) {
      for (const flight of this.flights) flight.reset(distance);
      return false;
    }

    const [wx, wy, wz] = this.wingOffset;
    let index = 0;
    for (const flight of this.flights) {
      flight.update(delta, distance, speed, reduced);
      for (const member of flight.members) {
        const pose = flight.samplePoseInto(member, time, distance, seasonFade, reduced, this.dorsalTilt, this.pose);
        this.pos.set(pose.x - this.centerX, pose.y, pose.z);
        this.bodyEuler.set(pose.roll, pose.yaw, pose.pitch, 'YZX');
        this.bodyQuat.setFromEuler(this.bodyEuler);
        this.scale.setScalar(pose.scale);
        this.bodyMatrix.compose(this.pos, this.bodyQuat, this.scale);
        this.bodies.setMatrixAt(index, this.bodyMatrix);

        // Left wing (-Z) hinges at the left shoulder and lifts with positive flap.
        this.shoulder.set(wx, wy, -wz);
        this.wingEuler.set(pose.flap, 0, pose.flap * 0.14);
        this.wingQuat.setFromEuler(this.wingEuler);
        this.wingMatrix.compose(this.shoulder, this.wingQuat, this.unitScale);
        this.instanceMatrix.multiplyMatrices(this.bodyMatrix, this.wingMatrix);
        this.leftWings.setMatrixAt(index, this.instanceMatrix);

        // Right wing (+Z) hinges at the right shoulder and lifts with positive flap.
        this.shoulder.set(wx, wy, wz);
        this.wingEuler.set(-pose.flap, 0, pose.flap * 0.14);
        this.wingQuat.setFromEuler(this.wingEuler);
        this.wingMatrix.compose(this.shoulder, this.wingQuat, this.unitScale);
        this.instanceMatrix.multiplyMatrices(this.bodyMatrix, this.wingMatrix);
        this.rightWings.setMatrixAt(index, this.instanceMatrix);
        index++;
      }
    }

    this.bodies.instanceMatrix.needsUpdate = true;
    this.leftWings.instanceMatrix.needsUpdate = true;
    this.rightWings.instanceMatrix.needsUpdate = true;
    return true;
  }
}
