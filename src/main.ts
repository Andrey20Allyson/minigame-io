import { Game } from './game';
import './style.css'

const canvas = document.querySelector<HTMLCanvasElement>('#screen')!;
const infoEl = document.querySelector<HTMLParagraphElement>('#points')!;

const game = new Game(canvas, infoEl);
game.start();