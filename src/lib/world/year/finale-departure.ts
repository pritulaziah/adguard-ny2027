const DURATION = 4;

function progress(time: number): number {
  const t = Math.max(0, Math.min(1, time / DURATION));
  return t * t;
}

/** Moves only the final sleigh after the visitor reaches the destination. */
export class FinaleDeparture {
  private active = false;
  private elapsed = 0;
  private offset = 0;
  private startOffset = 0;
  private targetOffset = 0;
  private finished = false;

  get complete(): boolean { return this.finished; }

  update(delta: number, arrived: boolean, reduced: boolean, exitOffset: number): number {
    const dt = Number.isFinite(delta) ? Math.max(0, delta) : 0;
    if (!arrived) {
      this.active = false;
      this.elapsed = 0;
      this.finished = false;
      this.offset = reduced ? 0 : this.offset * Math.exp(-dt * 6);
      if (this.offset < 0.001) this.offset = 0;
      return this.offset;
    }

    const exit = Number.isFinite(exitOffset) ? Math.max(0, exitOffset) : 0;
    if (!this.active) {
      this.active = true;
      this.elapsed = 0;
      this.startOffset = this.offset;
      this.targetOffset = Math.max(exit, this.offset);
    }
    this.targetOffset = Math.max(this.targetOffset, exit);
    if (reduced) {
      this.offset = this.targetOffset;
      this.finished = true;
      return this.offset;
    }

    const nextTime = this.elapsed + dt;
    const travel = this.targetOffset - this.startOffset;
    // Integrating the progress change keeps a wider exit target from causing a jump.
    this.offset += travel * (progress(nextTime) - progress(this.elapsed));
    const extraTime = Math.max(0, nextTime - Math.max(this.elapsed, DURATION));
    this.offset += Math.max(2, travel / 2) * extraTime;
    this.offset = Math.min(this.targetOffset, this.offset);
    this.elapsed = Math.min(nextTime, DURATION);
    this.finished = this.offset >= this.targetOffset;
    return this.offset;
  }
}
