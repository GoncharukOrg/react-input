import type Input from './Input';

export default function createProxy(ref: React.MutableRefObject<HTMLInputElement | null>, instanse: Input) {
  return new Proxy(ref, {
    set(target, property, element: HTMLInputElement | null) {
      if (property !== 'current') {
        return false;
      }

      if (element !== ref.current) {
        if (ref.current !== null) {
          instanse.unregister(ref.current);
        }

        if (element !== null) {
          instanse.register(element);
        }
      }

      target[property] = element;

      return true;
    },
  });
}
