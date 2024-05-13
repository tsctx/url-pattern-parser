// Pattern's parser
import { parse } from ".";

/**
 * Router using RegExp.
 */
class Router<T> {
  #routes: Record<
    string,
    {
      pattern: {
        keys: string[];
        pattern: RegExp;
      };
      handlers: T[];
    }[]
  >;
  constructor() {
    this.#routes = Object.create(null);
    this.#routes.ALL = [];
  }
  add(method: string, path: string, ...handlers: T[]) {
    const pattern = parse(path);
    const info = { pattern, handlers };
    if (method === "ALL") {
      const keys = Object.keys(this.#routes);
      for (let i = 0; i < keys.length; ++i) {
        this.#routes[keys[i]].push(info);
      }
    } else {
      if (typeof this.#routes[method] === "undefined") {
        this.#routes[method] = this.#routes.ALL.slice();
      }
      this.#routes[method].push(info);
    }
  }
  match(
    method: string,
    path: string,
  ): {
    handlers: T[];
    params: Record<string, string>;
  } | null {
    const handlers = [];
    const params = Object.create(null);
    const target = this.#routes[method] ?? this.#routes.ALL;
    for (let i = 0; i < target.length; ++i) {
      const {
        pattern: { pattern, keys },
        handlers: targetHandler,
      } = target[i];
      if (pattern.test(path)) {
        handlers.push(...targetHandler);
        const match = pattern.exec(path);
        if (match !== null) {
          for (let j = 0; j < keys.length; ++j) {
            params[keys[j]] = match[j + 1];
          }
        }
      }
    }
    if (handlers.length !== 0) {
      return {
        handlers: handlers,
        params: params,
      };
    }
    return null;
  }
}

export { Router };
