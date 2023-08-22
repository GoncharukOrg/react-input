import { useCallback } from 'react';

/**
 * Combines references to DOM elements (`ref`). Useful when it's necessary to store
 * a reference to the same element using the `useRef` hook in different components.
 * @returns function for combining references
 */
export default function useConnectedInputRef(
  ref: React.MutableRefObject<HTMLInputElement | null>,
  forwardedRef: React.ForwardedRef<HTMLInputElement>
) {
  return useCallback(
    (element: HTMLInputElement | null) => {
      // eslint-disable-next-line no-param-reassign
      ref.current = element;

      if (typeof forwardedRef === 'function') {
        forwardedRef(element);
      } else if (typeof forwardedRef === 'object' && forwardedRef !== null) {
        // eslint-disable-next-line no-param-reassign
        forwardedRef.current = element;
      }
    },
    [ref, forwardedRef]
  );
}
