import { Entity } from "../entities/entity";
import { Fruit } from "../entities/fruit";
import { Snake } from ".";
import { Vec2 } from "../lib/vec2";
import { WorldGrid } from "../structs/world-grid";

export class SnakeBody extends Entity {
  private static COUNT_LIMIT = 2 ** 16 - 1;
  private _prev: Vec2 | null = null;
  private _next: Vec2 | null = null;
  readonly grid: WorldGrid<SnakeBody>;
  private pointsToDigest: number = 0;

  constructor(
    readonly snake: Snake,
    pos: Vec2,
  ) {
    super(pos);

    this.grid = this.snake.grid;
  }

  eat(fruit: Fruit) {
    this.pointsToDigest += fruit.points;
  }

  digest(): void {
    this.setPointsToDigest(this.pointsToDigest - 1);
  }

  setPointsToDigest(points: number) {
    this.pointsToDigest = Math.max(points, 0);
  }

  hasPointsToDigest() {
    return this.pointsToDigest > 0;
  }

  *iterToPrev(): Iterable<[number, SnakeBody]> {
    let body: SnakeBody | null = this;
    let count = 0;
    while (body) {
      if (count >= SnakeBody.COUNT_LIMIT) throw new Error();

      yield [count++, body];
      
      body = body.prev();
    }
  }
  
  *iterToNext(): Iterable<[number, SnakeBody]> {
    let body: SnakeBody | null = this;
    let count = 0;
    while (body) {
      if (count >= SnakeBody.COUNT_LIMIT) throw new Error();
      
      yield [count++, body];

      body = body.next();
    }
  }

  setPrev(node: SnakeBody | Vec2 | null): this {
    if (node === null) {
      this._prev = null;
      return this;
    };

    if (node instanceof Vec2) {
      this._prev = node;
      return this;
    }

    this._prev = node.pos;
    node._next = this.pos;

    return this;
  }

  setNext(node: SnakeBody | Vec2 | null): this {
    if (node === null) {
      this._next = null;
      return this;
    }

    if (node instanceof Vec2) {
      this._next = node;
      return this;
    }

    this._next = node.pos;
    node._prev = this.pos;

    return this;
  }

  prev(): SnakeBody | null {
    if (this._prev === null) return null;

    const entity = this.grid.get(this._prev);
    if (entity === null || entity instanceof SnakeBody === false) return null;

    return entity;
  }

  next(): SnakeBody | null {
    if (this._next === null) return null;

    const entity = this.grid.get(this._next);
    if (entity === null || entity instanceof SnakeBody === false) return null;

    return entity;
  }
}