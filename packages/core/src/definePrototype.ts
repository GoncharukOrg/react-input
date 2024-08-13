interface Class<T, P = unknown> {
  new (init: P): T;
  prototype: T;
}

export default function definePrototype<T, P = unknown>(Class: Class<T, P>, value: unknown) {
  Object.defineProperty(Class, 'prototype', {
    writable: false,
    enumerable: false,
    configurable: false,
    value,
  });

  Object.defineProperties(Class.prototype, {
    [Symbol.toStringTag]: {
      writable: false,
      enumerable: false,
      configurable: true,
      value: Class.name,
    },
    constructor: {
      writable: true,
      enumerable: false,
      configurable: true,
      value: Class,
    },
  });
}
