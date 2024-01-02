import { EventEmitter } from "../lib/event-emitter";
import { Fruit } from "../entities/fruit";
import { Snake } from "../snake";
import { SnakeBody } from "../snake/body";
import { Vec2 } from "../lib/vec2";

export class GameEvents {
  readonly tick = new EventEmitter<[]>();
  readonly fruitEaten = new EventEmitter<[fruit: Fruit]>();
  readonly beforeHeadMove = new EventEmitter<[head: SnakeBody]>();
  readonly headMove = new EventEmitter<[head: SnakeBody]>();
  readonly frame = new EventEmitter<[ctx: CanvasRenderingContext2D]>();
  readonly keydown = new EventEmitter<[code: string]>();
  readonly directionChange = new EventEmitter<[direction: Vec2]>();
  readonly snakeDeath = new EventEmitter<[snake: Snake]>();
}