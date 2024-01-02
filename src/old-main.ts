import './style.css';

const canvas = document.querySelector<HTMLCanvasElement>('#screen')!;
const ctx = canvas.getContext('2d')!;
const width = canvas.width;
const heigth = canvas.height;
const halfWidth = Math.trunc(canvas.width / 2);
const halfHeight = Math.trunc(canvas.height / 2);
const pointsElement = document.querySelector<HTMLElement>('#points')!;

class Vec2 {
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

  eq(vec: Vec2) {
    return this.x === vec.x && this.y === vec.y;
  }
}

const snake: Vec2[] = [];
let direction: Vec2 = new Vec2(1, 0);
let points = 0;
let isGameOver = false;
let directionChangeQueue: Vec2[] = [];
let speed = 10;

let fruits: Vec2[] = [];
spawnFruit();

for (let i = 0; i < 3; i++) {
  snake.push(new Vec2(0, i));
}

document.addEventListener('keydown', handleKeyboard);
drawLoop();
tickLoop();
updatePoints();

function sleep(ms: number) {
  return new Promise<void>(res => setTimeout(res, ms));
}

function drawLoop() {
  clear();

  for (const [i, body] of snake.entries()) {
    const color = isGameOver ? '#777' : `hsl(${i * 2}, 100%, 65%)`;

    draw(body, color);
  }

  for (const fruit of fruits) {
    draw(fruit, '#0a2')
  }

  requestAnimationFrame(drawLoop);
}

async function tickLoop() {
  while (!isGameOver) {
    tick();

    await sleep(1000 / speed);
  }
}

function tick() {
  if (collidesWithBody()) {
    isGameOver = true;
    return;
  }

  const head = snake.at(-1)!;

  direction = directionChangeQueue.shift() ?? direction;

  let x = direction.x + head.x;
  if (x > halfWidth - 1) {
    x = -halfWidth;
  }

  if (x < -halfWidth) {
    x = halfWidth - 1;
  }

  let y = direction.y + head.y;
  if (y > halfHeight - 1) {
    y = -halfHeight;
  }

  if (y < -halfHeight) {
    y = halfHeight - 1;
  }

  const newHeadPos = new Vec2(x, y);

  snake.push(newHeadPos);

  const fruitIdx = fruitAt(newHeadPos);
  if (fruitIdx !== -1) {
    fruits.splice(fruitIdx, 1);
    spawnFruit();
    points++;
    speed = Math.min(speed + 1, 25);

    updatePoints();
  } else {
    snake.shift();
  }
}

function updatePoints() {
  const pointsStr = points.toString().padStart(3, '0');
  const speedStr = speed.toString().padStart(3, '0');

  pointsElement.innerText = `Points: ${pointsStr}\nSpeed: ${speedStr}`;
}

function collidesWithBody(): boolean {
  const head = snake.at(-1);
  if (head === undefined) return false;

  for (const body of snake) {
    if (body.x === head.x && body.y === head.y && body !== head) return true;
  }

  return false;
}

function fruitAt(pos: Vec2): number {
  return fruits.findIndex(fruit => fruit.x === pos.x && fruit.y === pos.y);
}

function randomInt(min: number, max: number) {
  return Math.trunc(Math.random() * (max - min)) + min;
}

function spawnFruit() {
  const x = randomInt(-halfWidth, halfWidth);
  const y = randomInt(-halfHeight, halfHeight);

  return fruits.push(new Vec2(x, y));
}

function draw(pos: Vec2, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(pos.x + halfWidth, pos.y + halfHeight, 1, 1);
}

function clear() {
  ctx.fillStyle = '#000'
  ctx.clearRect(0, 0, width, heigth);
}

function handleKeyboard(ev: KeyboardEvent) {
  if (directionChangeQueue.length >= 3) return;

  let chosenDirection: Vec2;

  switch (ev.code) {
    case 'KeyD':
      chosenDirection = new Vec2(1, 0);
      break;
    case 'KeyA':
      chosenDirection = new Vec2(-1, 0);
      break;
    case 'KeyS':
      chosenDirection = new Vec2(0, 1);
      break;
    case 'KeyW':
      chosenDirection = new Vec2(0, -1);
      break;
    default:
      return;
  }

  if (direction.eq(chosenDirection.inverse()) && directionChangeQueue.length === 0) return;

  const lastDirection = directionChangeQueue.at(-1);
  if (lastDirection !== undefined && (lastDirection.eq(chosenDirection) || lastDirection.eq(chosenDirection.inverse()))) return;

  directionChangeQueue.push(chosenDirection);
}