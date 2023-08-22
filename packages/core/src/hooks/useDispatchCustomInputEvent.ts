import { useCallback, useRef } from 'react';
import { unstable_batchedUpdates } from 'react-dom';

import setInputAttributes from '../utils/setInputAttributes';

import type { CustomInputEvent, CustomInputEventHandler, ExtendedHTMLInputElement } from '../types';

export default function useDispatchCustomInputEvent<D = unknown>(
  inputRef: React.MutableRefObject<ExtendedHTMLInputElement | null>,
  customInputEventType: string | undefined,
  customInputEventHandler: CustomInputEventHandler<D> | undefined
): [React.MutableRefObject<boolean>, (customInputEventDetail: D) => void] {
  const dispatched = useRef(true);

  const dispatch = useCallback(
    (customInputEventDetail: D) => {
      if (inputRef.current === null || !customInputEventType || !customInputEventHandler) {
        return;
      }

      const { value, selectionStart, selectionEnd } = inputRef.current;

      dispatched.current = false;

      // Generating and dispatching a custom event. The initial `setTimeout` is necessary for
      // triggering the event in an asynchronous mode; otherwise, there's a possibility that the component
      // will be re-rendered with the previous value due to state update after the `change` event.
      setTimeout(() => {
        if (inputRef.current === null) return;

        // After changing the state during the `change` event, we might encounter a situation
        // where the value of the `input` element won't be equal to the masked value, affecting
        // the data passed through `event.target`. Therefore, we set the previous value.
        setInputAttributes(inputRef.current, {
          value,
          selectionStart: selectionStart ?? value.length,
          selectionEnd: selectionEnd ?? value.length,
        });

        const customInputEvent = new CustomEvent(customInputEventType, {
          bubbles: true,
          cancelable: false,
          composed: true,
          detail: customInputEventDetail,
        }) as CustomInputEvent<D>;

        inputRef.current.dispatchEvent(customInputEvent);

        if (unstable_batchedUpdates) {
          unstable_batchedUpdates(customInputEventHandler, customInputEvent);
        } else {
          customInputEventHandler(customInputEvent);
        }

        dispatched.current = true;
      });
    },
    [inputRef, customInputEventType, customInputEventHandler]
  );

  return [dispatched, dispatch];
}
