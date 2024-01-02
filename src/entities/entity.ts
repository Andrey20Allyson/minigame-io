import { Vec2 } from "../lib/vec2";

export abstract class Entity {
  constructor(readonly pos: Vec2) { }

  collides(entity: Entity) {
    return this.pos.eq(entity.pos);
  }
}