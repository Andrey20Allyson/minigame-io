import { Game } from "../game";
import { Fruit } from "../entities/fruit";
import { Snake } from "../snake";
import { SnakeBody } from "../snake/body";

export class Renderer {
  readonly context: CanvasRenderingContext2D;
  readonly screenWidth: number;
  readonly screenHeight: number;
  readonly tileSize: number;

  constructor(
    readonly game: Game,
  ) {
    this.context = game.context;
    this.screenWidth = game.width;
    this.screenHeight = game.height;
    this.tileSize = game.tileSize;

    this.game.events.frame.subscribe(this.draw, this);
  }

  draw() {
    this.clear();

    this.drawSnake(this.game.snake);
    this.drawFruits(this.game.fruits);
    this.updateInfo(this.game.snake);
  }

  updateInfo(snake: Snake) {
    const pointsStr = snake.points.toString().padStart(3, '0');
    const speedStr = snake.getVelocity().toString().padStart(3, '0');

    this.game.infoEl.innerText = `Points: ${pointsStr}\nSpeed: ${speedStr}`
  }

  clear() {
    this.context.fillStyle = '#000';
    this.context.clearRect(0, 0, this.screenWidth * this.tileSize, this.screenHeight * this.tileSize);
  }

  drawSnake(snake: Snake) {
    for (const [index, body] of snake.head.iterToPrev()) {
      this.drawSnakeBody(snake, body, index);
    }
  }

  drawFruits(fruits: Fruit[]) {
    fruits.forEach(fruit => this.drawFruit(fruit));
  }

  drawSnakeBody(snake: Snake, body: SnakeBody, index: number) {
    const isDigesting = body.hasPointsToDigest();
    const isHead = index === 0;
    const light = isHead ? 40 : isDigesting ? 70 : 50;
    const width = isDigesting ? 1 : 0;

    const color = snake.isAlive === false ? '#777' : `hsl(${index * 2}, 100%, ${light}%)`;

    this.drawRounded(body.pos.x, body.pos.y, width, color);
  }

  drawFruit(fruit: Fruit) {
    const x = fruit.pos.x;
    const y = fruit.pos.y;
    
    this.drawRounded(x, y, .5, '#00f');

    const color = fruit.points >= 5 ? `hsl(${Math.trunc(this.game.getDelta() * 2)}, 100%, 50%)` : '#4b0';

    this.drawRounded(fruit.pos.x, fruit.pos.y, 0, color);

    this.drawRounded(x, y, -2.5, '#0f0');
  }

  drawRounded(x: number, y: number, r: number, color: string) {
    this.context.fillStyle = color;

    this._rf(x, y, 2 - r, 4 - r);
  }

  private _rf(x: number, y: number, ws: number, ds: number) {
    const tsize = this.tileSize;
    const tx = x * tsize;
    const ty = y * tsize;

    this.context.fillRect(
      tx + ds,
      ty + ws,
      tsize - ds * 2,
      tsize - ws * 2,
    );

    this.context.fillRect(
      tx + ws,
      ty + ds,
      tsize - ws * 2,
      tsize - ds * 2,
    );
  }
}