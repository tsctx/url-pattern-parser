// Pattern's parser
import { parse } from ".";

const EMPTY_PARAMS = Object.freeze(Object.create(null));

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
    this.#routes = Object.setPrototypeOf({ ALL: [] }, null);
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
    params: Record<string, string>[];
  } | null {
    const handlers = [];
    const params = [];
    const target = this.#routes[method] ?? this.#routes.ALL;
    for (let i = 0; i < target.length; ++i) {
      const {
        pattern: { pattern, keys },
        handlers: targetHandler,
      } = target[i];
      const matched = pattern.exec(path);
      if (matched !== null) {
        handlers.push(...targetHandler);
        if (keys.length === 0) {
          params.push(EMPTY_PARAMS);
        } else {
          const param = { __proto__: null } as unknown as Record<
            string,
            string
          >;
          for (let j = 0; j < keys.length; ++j) {
            param[keys[j]] = matched[j + 1];
          }
          params.push(param);
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
