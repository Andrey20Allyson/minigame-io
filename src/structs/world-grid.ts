import { Game } from "../game";
import { Entity } from "../entities/entity";
import { Vec2 } from "../lib/vec2";

export class WorldGrid<E extends Entity> {
  private array: (E | null)[];
  readonly width: number;
  readonly height: number;

  constructor(
    readonly game: Game,
  ) {
    this.width = this.game.width;
    this.height = this.game.height;

    this.array = new Array(this.width * this.height).fill(null);
  }

  remove(pos: Vec2): void {
    this.array[this.idx(pos)] = null;
  }

  delete(entity: E) {
    this.remove(entity.pos);
  }

  add(entity: E): void {
    this.set(entity.pos, entity);
  }

  set(pos: Vec2, entity: E | null): void {
    this.array[this.idx(pos)] = entity;
  }

  get(pos: Vec2): E | null {
    return this.array[this.idx(pos)];
  }

  has(pos: Vec2): boolean {
    return this.get(pos) !== null;
  }

  private idx(pos: Vec2) {
    return pos.x + pos.y * this.width;
  }
}