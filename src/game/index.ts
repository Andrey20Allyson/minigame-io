import { Fruit } from "../entities/fruit";
import { GameEvents } from "./events";
import { KeyboardListener } from "../input/keyboard-listener";
import { Renderer } from "../rendering/renderer";
import { Snake } from "../snake";
import { SnakeBody } from "../snake/body";
import { Vec2 } from "../lib/vec2";
import { WorldGrid } from "../structs/world-grid";

export class Game {
  readonly events = new GameEvents();
  readonly fruits: Fruit[] = [];
  readonly snakeGrid: WorldGrid<SnakeBody>;
  readonly fruitGrid: WorldGrid<Fruit>;
  readonly context: CanvasRenderingContext2D;
  readonly renderer: Renderer;
  readonly width: number;
  readonly height: number;
  readonly snake: Snake;
  readonly ticksPerSecond: number = 50;
  readonly keyboardListener: KeyboardListener;
  private delta: number = 0;
  readonly tileSize = 16;

  constructor(
    readonly canvas: HTMLCanvasElement,
    readonly infoEl: HTMLElement,
    fruitCount = 15,
  ) {
    this.context = this.canvas.getContext('2d')!;
    this.width = Math.floor(this.canvas.width / this.tileSize);
    this.height = Math.floor(this.canvas.height / this.tileSize);

    this.snakeGrid = new WorldGrid(this);
    this.fruitGrid = new WorldGrid(this);
    this.snake = new Snake(this, this.ramdomPos());

    this.renderer = new Renderer(this);

    this.keyboardListener = new KeyboardListener(this.snake);
    this.keyboardListener.listen();

    this.events.headMove.subscribe(this.handleHeadMove, this);

    for (let i = 0; i < fruitCount; i++) {
      this.addFruit();
    }
  }

  getDelta() {
    return this.delta;
  }

  ramdomPos(): Vec2 {
    return new Vec2(
      randomInt(0, this.width),
      randomInt(0, this.height),
    );
  }

  freeRandomPos(): Vec2 | null {
    return this._findFreePosFrom(this.ramdomPos());
  }

  private _isFree(pos: Vec2) {
    return !this.fruitGrid.has(pos) && !this.snakeGrid.has(pos);
  }

  private _next(pos: Vec2): Vec2 {
    if (pos.x >= this.width - 1) {
      if (pos.y >= this.height - 1) {
        return new Vec2(0, 0);
      }

      return new Vec2(0, pos.y + 1);
    }

    return pos.sumv(1, 0);
  }

  private _findFreePosFrom(startPos: Vec2): Vec2 | null {
    let pos = startPos;

    while (this._isFree(pos) === false) {
      pos = this._next(pos);
      if (pos.eq(startPos)) return null;
    }

    return pos;
  }

  addFruit() {
    const pos = this.freeRandomPos();
    if (!pos) return;

    const points = Math.random() > .95 ? 5 : 1;

    const fruit = new Fruit(
      pos,
      points,
    );

    this.fruits.push(fruit);
    this.fruitGrid.add(fruit);
  }

  start() {
    this._start();
  }

  private handleHeadMove(head: SnakeBody) {
    const fruit = this.fruitGrid.get(head.pos);
    if (fruit === null) return;

    this.fruitGrid.delete(fruit);
    const idx = this.fruits.indexOf(fruit);
    this.fruits.splice(idx, 1);

    this.addFruit();

    this.events.fruitEaten.emit(fruit);
  }

  private _start() {
    this.frameLoop();
    this.tickLoop();
  }

  private tickLoop() {
    if (this.snake.isAlive) setTimeout(() => this.tickLoop(), 1000 / this.ticksPerSecond);

    this.events.tick.emit();

    this.delta++;
  }

  private frameLoop() {
    if (this.snake.isAlive) requestAnimationFrame(() => this.frameLoop());

    this.events.frame.emit(this.context);
  }
}

function randomInt(min: number, max: number) {
  return Math.trunc(Math.random() * (max - min)) + min;
}