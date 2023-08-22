import { useEffect, useRef } from 'react';

import SyntheticChangeError from '../errors/SyntheticChangeError';
import setInputAttributes from '../utils/setInputAttributes';

import useDispatchCustomInputEvent from './useDispatchCustomInputEvent';

import type { CustomInputEventHandler, ExtendedHTMLInputElement, Init, InputType, Tracking } from '../types';

const validInputElement = (inputElement: HTMLInputElement | null) =>
  inputElement !== null && inputElement.type === 'text';

interface UseInputParam<D> {
  init: Init;
  tracking: Tracking<D>;
  customInputEventType?: string;
  customInputEventHandler?: CustomInputEventHandler<D>;
}

/**
 * The input event control hook allows you to perform logic and modify
 * input element attributes at certain stages of event tracking.
 * @param param
 * @returns
 */
export default function useInput<D = unknown>({
  init,
  tracking,
  customInputEventType,
  customInputEventHandler,
}: UseInputParam<D>): React.MutableRefObject<HTMLInputElement | null> {
  const inputRef = useRef<ExtendedHTMLInputElement | null>(null);

  const selection = useRef({
    requestID: -1,
    fallbackRequestID: -1,
    cachedRequestID: -1,
    start: 0,
    end: 0,
  });

  const [dispatchedCustomInputEvent, dispatchCustomInputEvent] = useDispatchCustomInputEvent<D>(
    inputRef,
    customInputEventType,
    customInputEventHandler
  );

  /**
   *
   * Handle errors
   *
   */

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    if (inputRef.current === null) {
      console.warn(new Error('Input element does not exist.'));
    }
    if (inputRef.current !== null && inputRef.current.type !== 'text') {
      console.warn(new Error('The type of the input element does not match the type "text".'));
    }
  }, []);

  /**
   *
   * Init input state
   *
   */

  useEffect(() => {
    if (inputRef.current === null || !validInputElement(inputRef.current)) return;

    const { controlled = false, initialValue = '' } = inputRef.current._wrapperState ?? {};
    // When creating an `input` element, it is possible to programmatically change the `value` property, which can
    // affect the display state of the element. Therefore, it's important to consider the `value` property as a priority.
    // ISSUE: https://github.com/GoncharukBro/react-input/issues/3
    const initResult = init({ controlled, initialValue: inputRef.current.value || initialValue });

    // Since in the previous step the initialized value can be changed, we
    // also need to modify the value of the element, while not setting the
    // caret position, as setting the position here will result in autofocus.
    setInputAttributes(inputRef.current, { value: initResult.value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   *
   * Handle input
   *
   */

  useEffect(() => {
    const handleInput = (event: Event) => {
      if (!validInputElement(inputRef.current)) return;

      try {
        if (inputRef.current === null) {
          throw new SyntheticChangeError('Reference to input element is not initialized.');
        }

        // If the event is triggered too frequently, the cursor change may not catch up with the new event,
        // so we compare the cached `requestID` with the current one to avoid incorrect mask behavior.
        if (selection.current.cachedRequestID === selection.current.requestID) {
          throw new SyntheticChangeError('The input selection has not been updated.');
        }

        selection.current.cachedRequestID = selection.current.requestID;

        const { value, selectionStart, selectionEnd } = inputRef.current;

        if (selectionStart === null || selectionEnd === null) {
          throw new SyntheticChangeError('The selection attributes have not been initialized.');
        }

        const previousValue = inputRef.current._valueTracker?.getValue?.() ?? '';
        let inputType: InputType = 'initial';

        // Determine the input type (manual input type detection promotes cross-browser compatibility)
        if (selectionStart > selection.current.start) {
          inputType = 'insert';
        } else if (selectionStart <= selection.current.start && selectionStart < selection.current.end) {
          inputType = 'deleteBackward';
        } else if (selectionStart === selection.current.end && value.length < previousValue.length) {
          inputType = 'deleteForward';
        }

        if ((inputType === 'deleteBackward' || inputType === 'deleteForward') && value.length > previousValue.length) {
          throw new SyntheticChangeError('Input type detection error.');
        }

        let addedValue = '';
        let deletedValue = '';
        let changeStart = selection.current.start;
        let changeEnd = selection.current.end;

        switch (inputType) {
          case 'insert': {
            addedValue = value.slice(selection.current.start, selectionStart);
            break;
          }
          case 'deleteBackward':
          case 'deleteForward': {
            // For `delete`, we need to determine the range of deleted characters, since
            // when deleting without selection, the "before" and "after" caret positions will be the same
            const countDeleted = previousValue.length - value.length;

            changeStart = selectionStart;
            changeEnd = selectionStart + countDeleted;

            deletedValue = previousValue.slice(changeStart, changeEnd);
            break;
          }
          default: {
            throw new SyntheticChangeError('The input type is undefined.');
          }
        }

        const trackingResult = tracking({
          inputType,
          value,
          addedValue,
          deletedValue,
          previousValue,
          changeStart,
          changeEnd,
          selectionStart,
          selectionEnd,
        });

        setInputAttributes(inputRef.current, {
          value: trackingResult.value,
          selectionStart: trackingResult.selectionStart,
          selectionEnd: trackingResult.selectionEnd,
        });

        dispatchCustomInputEvent(trackingResult.__detail);

        // After changing the value in the custom event (`dispatchCustomInputEvent`), the `change` event
        // will not be triggered, since the previous and current states inside the `input` are the same. To
        // work around this issue from React 16, we set the previous state to be different from the current one.
        inputRef.current._valueTracker?.setValue?.(previousValue);

        // To ensure correct caret positioning, update
        // the `selection` values before calling the `input` handler function again
        selection.current.start = trackingResult.selectionStart;
        selection.current.end = trackingResult.selectionEnd;
      } catch (error) {
        const { name, cause } = error as SyntheticChangeError;

        if (inputRef.current !== null) {
          setInputAttributes(inputRef.current, {
            value: cause?.__attributes?.value ?? inputRef.current._valueTracker?.getValue?.() ?? '',
            selectionStart: cause?.__attributes?.selectionStart ?? selection.current.start,
            selectionEnd: cause?.__attributes?.selectionEnd ?? selection.current.end,
          });
        }

        // To ensure correct caret positioning, update
        // the `selection` values before calling the `input` handler function again

        if (cause?.__attributes?.selectionStart !== undefined) {
          selection.current.start = cause.__attributes.selectionStart;
        }

        if (cause?.__attributes?.selectionEnd !== undefined) {
          selection.current.end = cause.__attributes.selectionEnd;
        }

        event.preventDefault();
        event.stopPropagation();

        if (name !== 'SyntheticChangeError') {
          throw error;
        }
      }
    };

    const inputElement = inputRef.current;

    inputElement?.addEventListener('input', handleInput);

    return () => {
      inputElement?.removeEventListener('input', handleInput);
    };
  }, [tracking, dispatchCustomInputEvent]);

  /**
   *
   * Handle focus
   *
   */

  useEffect(() => {
    const handleFocus = () => {
      if (!validInputElement(inputRef.current)) return;

      const setSelection = () => {
        // The cursor position changes after the `change` event is completed and the custom event is triggered,
        // the cursor position may be incorrect, which can lead to errors
        if (dispatchedCustomInputEvent.current) {
          selection.current.start = inputRef.current?.selectionStart ?? 0;
          selection.current.end = inputRef.current?.selectionEnd ?? 0;

          selection.current.requestID = requestAnimationFrame(setSelection);
        } else {
          selection.current.fallbackRequestID = requestAnimationFrame(setSelection);
        }
      };

      selection.current.requestID = requestAnimationFrame(setSelection);
    };

    // The `focus` event will not fire on render, even if the `autoFocus` property is enabled,
    // so we need to manually start cursor position detection when autofocus is enabled
    if (inputRef.current !== null && document.activeElement === inputRef.current) {
      handleFocus();
    }

    const inputElement = inputRef.current;

    inputElement?.addEventListener('focus', handleFocus);

    return () => {
      inputElement?.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   *
   * Handle blur
   *
   */

  useEffect(() => {
    const handleBlur = () => {
      if (!validInputElement(inputRef.current)) return;

      cancelAnimationFrame(selection.current.requestID);
      cancelAnimationFrame(selection.current.fallbackRequestID);

      selection.current.requestID = -1;
      selection.current.fallbackRequestID = -1;
      selection.current.cachedRequestID = -1;
    };

    const inputElement = inputRef.current;

    inputElement?.addEventListener('blur', handleBlur);

    return () => {
      inputElement?.removeEventListener('blur', handleBlur);
    };
  }, []);

  return inputRef;
}
