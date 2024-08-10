export default function createContext<T extends WeakKey, V>() {
  const map = new WeakMap<T, V>();

  return {
    set(that: T, value: V) {
      map.set(that, value);
    },
    get(that: T | undefined) {
      if (that === undefined || !map.has(that)) {
        throw new TypeError('Illegal invocation');
      }

      return map.get(that)!;
    },
  };
}
