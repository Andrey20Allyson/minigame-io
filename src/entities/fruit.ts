import { Entity } from "./entity";
import { Vec2 } from "../lib/vec2";

export class Fruit extends Entity {
  constructor(pos: Vec2, readonly points: number) {
    super(pos);
  }
}

