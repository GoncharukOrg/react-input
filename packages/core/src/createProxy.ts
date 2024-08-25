import type Input from './Input';

export default function createProxy<T extends Input>(
  ref: React.MutableRefObject<HTMLInputElement | null>,
  instanse: T,
  event?: { type: string; handler: (event: Event) => void },
) {
  return new Proxy(ref, {
    set(target, property, element: HTMLInputElement | null) {
      if (property !== 'current') {
        return false;
      }

      if (element !== ref.current) {
        if (ref.current !== null) {
          instanse.unregister(ref.current);

          if (event !== undefined) {
            ref.current.removeEventListener(event.type, event.handler);
          }
        }

        if (element !== null) {
          instanse.register(element);

          if (event !== undefined) {
            element.addEventListener(event.type, event.handler);
          }
        }
      }

      target[property] = element;

      return true;
    },
  });
}
