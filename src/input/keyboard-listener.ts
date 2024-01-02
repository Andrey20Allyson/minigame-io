import { Game } from "../game";
import { Snake } from "../snake";

export class KeyboardListener {
  readonly game: Game;
  
  constructor(
    readonly snake: Snake,
  ) {
    this.game = snake.game;
  }

  listen() {
    document.addEventListener('keydown', ev => this.handle(ev));
  }

  handle(ev: KeyboardEvent) {
    this.game.events.keydown.emit(ev.code);
  }
}