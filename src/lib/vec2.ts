export class Vec2 {
  constructor(
    readonly x: number,
    readonly y: number,
  ) { }

  inverse() {
    return new Vec2(-this.x, -this.y);
  }

  sum(vec: Vec2) {
    return new Vec2(vec.x + this.x, vec.y + this.y);
  }

  sumv(x: number, y: number) {
    return new Vec2(this.x + x, this.y + y);
  }

  eq(vec: Vec2) {
    return this.x === vec.x && this.y === vec.y;
  }
}