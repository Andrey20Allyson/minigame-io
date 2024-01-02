import { Game } from "../game";
import { Unsubscriber } from "../lib/event-emitter";
import { Fruit } from "../entities/fruit";
import { MovementController } from "./movement-controller";
import { SnakeBody } from "./body";
import { TickTimer } from "../lib/tick-timer";
import { Vec2 } from "../lib/vec2";
import { WorldGrid } from "../structs/world-grid";

export class Snake {
  head: SnakeBody;
  tail: SnakeBody;
  direction: Vec2 = new Vec2(1, 0);
  points: number = 0;
  private velocity: number = 10;
  maxVelocity: number = 25;
  isAlive: boolean = true;
  unsubscribers: Unsubscriber[] = [];
  readonly grid: WorldGrid<SnakeBody>;
  readonly movementController: MovementController;
  readonly movementTimer: TickTimer;

  constructor(
    readonly game: Game,
    pos: Vec2,
    initialLength: number = 4,
  ) {
    this.grid = this.game.snakeGrid;

    this.head = new SnakeBody(this, pos);
    this.tail = this.head;
    this.tail.setPointsToDigest(initialLength - 1);

    this.grid.add(this.head);

    this.movementController = new MovementController(this);
    
    this.movementTimer = new TickTimer(15);
    this.movementTimer.watch(this.game.events.tick);

    this.setVelocity(this.velocity);

    this.unsubscribers.push(
      this.game.events.fruitEaten.subscribe(this.eat, this),
      this.game.events.directionChange.subscribe(this.setDirection, this),
      this.game.events.snakeDeath.subscribe(this.handleSnakeDeath, this),
      this.movementTimer.subscribe(this.move, this),
    );
  }

  getVelocity() {
    return this.velocity;
  }

  setVelocity(velocity: number) {
    this.velocity = Math.min(velocity, this.maxVelocity);
    this.movementTimer.setDelay(150 / this.velocity);
  }

  setDirection(direction: Vec2) {
    this.direction = direction;
  }

  handleSnakeDeath(snake: Snake) {
    if (this !== snake) return;

    this.kill();
  }

  moveTail() {
    if (!this.isAlive) return;

    if (this.tail.hasPointsToDigest()) {
      this.tail.digest();
      return;
    };

    const nextTail = this.tail.next();
    if (nextTail === null) throw new Error(`Can't find next tail`);

    this.grid.delete(this.tail);
    this.tail = nextTail;
    this.tail.setPrev(null);
  }

  nextHeadPos(): Vec2 {
    let x = this.direction.x + this.head.pos.x;
    if (x > this.game.width - 1) {
      x = 0;
    }

    if (x < 0) {
      x = this.game.width - 1;
    }

    let y = this.direction.y + this.head.pos.y;
    if (y > this.game.height - 1) {
      y = 0;
    }

    if (y < 0) {
      y = this.game.height - 1;
    }

    return new Vec2(x, y);
  }

  moveHead() {
    this.game.events.beforeHeadMove.emit(this.head);

    const nextHead = new SnakeBody(this, this.nextHeadPos()).setPrev(this.head);

    const died = this.grid.has(nextHead.pos);
    if (died) {
      this.game.events.snakeDeath.emit(this);
      return;
    }

    this.grid.add(nextHead);
    this.head = nextHead;

    this.game.events.headMove.emit(this.head);
  }

  eat(fruit: Fruit) {
    this.head.eat(fruit);
    this.points += fruit.points;
    this.setVelocity(this.velocity + 1);
  }

  kill() {
    this.unsubscribers.forEach(unsub => unsub.unsubscribe());
    this.isAlive = false;
  }

  move() {
    if (!this.isAlive) return;

    this.moveHead();
    this.moveTail();
  }
}
