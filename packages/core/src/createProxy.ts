import type Input from './Input';

export default function createProxy<T extends Input>(
  inputRef: React.MutableRefObject<HTMLInputElement | null>,
  instanse: T,
) {
  return new Proxy(inputRef, {
    set(target, property, element: HTMLInputElement | null) {
      if (property !== 'current') {
        return false;
      }

      if (element !== inputRef.current) {
        if (inputRef.current !== null) {
          instanse.unregister(inputRef.current);
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
