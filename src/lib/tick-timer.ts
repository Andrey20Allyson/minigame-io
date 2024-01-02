import { EventEmitter, Unsubscriber } from "./event-emitter";

export class TickTimer<P extends any[] = []> extends EventEmitter<P> {
  private unsubscriber: Unsubscriber | null = null;
  private counter = 0;

  constructor(private delay: number) {
    super();
  }

  watch(event: EventEmitter<P>) {
    this.unwatch();
    this.resetCounter();

    this.unsubscriber = event.subscribe(this.tick, this);
    return this.unsubscriber;
  }

  unwatch() {
    this.unsubscriber?.unsubscribe();
  }

  setDelay(delay: number) {
    this.delay = Math.round(delay);
  }

  private resetCounter(): void {
    this.counter = 0;
  }

  private isReady(): boolean {
    return this.counter >= this.delay;
  }

  private next(): void {
    this.counter++;
  }

  tick(...params: P) {
    this.next();
    if (this.isReady() === false) return;

    this.emit(...params);
    this.resetCounter();
  }
}