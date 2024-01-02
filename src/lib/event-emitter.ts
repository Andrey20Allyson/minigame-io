export type EventListener<P extends any[] = []> = (...params: P) => void;

export type ListenerType<E extends EventEmitter<any>> = E extends EventEmitter<infer P> ? EventListener<P> : never;

export class Unsubscriber {
  constructor(
    private readonly emitter: EventEmitter,
    private readonly callback: EventListener,
  ) { }

  unsubscribe() {
    this.emitter.unsubscribe(this.callback);
  }
}

export class EventEmitter<P extends any[] = []> {
  private listeners: EventListener<P>[] = [];

  subscribe(listener: EventListener<P>, thisArg?: unknown): Unsubscriber {
    const _listener = thisArg === undefined ? listener : listener.bind(thisArg);
    
    this.listeners.push(_listener);
    return new Unsubscriber(this, _listener);
  }

  once(listener: EventListener<P>, thisArg?: unknown): Unsubscriber {
    const unsubscriber = this.subscribe((...p) => {
      listener.call(thisArg, ...p);
      unsubscriber.unsubscribe();
    });

    return unsubscriber;
  }

  emit(...params: P): this {
    this.listeners.forEach(listener => listener(...params));
    return this;
  }

  unsubscribe(listener: EventListener<P>): boolean {
    const oldLength = this.listeners.length;
    this.listeners = this.listeners.filter(oldListener => oldListener !== listener);

    return this.listeners.length < oldLength;
  }
}