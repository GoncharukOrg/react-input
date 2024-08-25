import { useCallback } from 'react';

/**
 * Объединяет ссылки на dom-элементы (`ref`). Полезно когда необходимо хранить
 * ссылку на один и тот же элемент с помощью хука `useRef` в разных компонентах.
 * @returns
 */
export default function useConnectedRef<T extends HTMLElement>(
  ref: React.MutableRefObject<T | null>,
  forwardedRef: React.ForwardedRef<T>,
) {
  return useCallback(
    (element: T | null) => {
      ref.current = element;

      if (typeof forwardedRef === 'function') {
        forwardedRef(element);
      } else if (typeof forwardedRef === 'object' && forwardedRef !== null) {
        forwardedRef.current = element;
      }
    },
    [ref, forwardedRef],
  );
}
