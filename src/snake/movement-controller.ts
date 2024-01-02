import { Game } from "../game";
import { Snake } from ".";
import { SnakeBody } from "./body";
import { Vec2 } from "../lib/vec2";

export class MovementController {
  private changeQueue: Vec2[] = [];
  private readonly keyToDirectionMap = new Map<string, Vec2>([
    ['KeyW', new Vec2(0, -1)],
    ['KeyA', new Vec2(-1, 0)],
    ['KeyS', new Vec2(0, 1)],
    ['KeyD', new Vec2(1, 0)],
  ]);
  readonly game: Game;

  constructor(readonly snake: Snake) {
    this.game = snake.game;

    this.game.events.keydown.subscribe(this.handleKeydown, this);
    this.game.events.beforeHeadMove.subscribe(this.handleBeforeHeadMove, this);
  }

  handleBeforeHeadMove(head: SnakeBody) {
    if (head.snake !== this.snake) return;

    this.change();
  }

  handleKeydown(code: string) {
    const direction = this.keyToDirectionMap.get(code);
    if (direction === undefined || this.canBeAdded(direction) === false) return;

    this.add(direction);
  }

  canBeAdded(direction: Vec2): boolean {
    if (this.changeQueue.length >= 3) return false;

    if (this.snake.direction.eq(direction.inverse()) && this.changeQueue.length === 0) return false;

    const lastDirection = this.last();
    if (lastDirection !== undefined && (lastDirection.eq(direction) || lastDirection.eq(direction.inverse()))) return false;

    return true;
  }

  add(direction: Vec2) {
    this.changeQueue.push(direction);
  }

  pop(): Vec2 | undefined {
    return this.changeQueue.shift();
  }

  last(): Vec2 | undefined {
    return this.changeQueue.at(-1);
  }

  next(): Vec2 | undefined {
    return this.changeQueue.at(0);
  }

  change() {
    const direction = this.pop();
    if (direction === undefined) return;

    this.game.events.directionChange.emit(direction);
  }
}