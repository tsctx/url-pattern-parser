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
      path: string;
      pattern: {
        keys: string[];
        pattern: RegExp;
      } | null;
      handlers: T[];
    }[]
  >;
  constructor() {
    //@ts-expect-error
    this.#routes = { __proto__: null, ALL: [] };
  }
  add(method: string, path: string, ...handlers: T[]) {
    const pattern = /[:({+*]/.test(path) ? parse(path) : null;
    const info = { path, pattern, handlers };
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
        path: targetPath,
        pattern: targetPattern,
        handlers: targetHandler,
      } = target[i];
      if (targetPattern === null) {
        if (path === targetPath) {
          params.push(EMPTY_PARAMS);
          handlers.push(...targetHandler);
        }
      } else {
        const { pattern, keys } = targetPattern;
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
