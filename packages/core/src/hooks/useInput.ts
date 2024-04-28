import { useMemo, useRef } from 'react';
import { unstable_batchedUpdates } from 'react-dom';

import SyntheticChangeError from '../errors/SyntheticChangeError';
import setInputAttributes from '../utils/setInputAttributes';

import type {
  CustomInputEvent,
  CustomInputEventHandler,
  ExtendedHTMLInputElement,
  Init,
  InputType,
  Tracking,
} from '../types';

const TYPES = ['text', 'email', 'tel', 'search', 'url'];

interface Handler {
  onFocus: () => void;
  onBlur: () => void;
  onInput: (event: Event) => void;
}

function proxy(
  inputRef: React.MutableRefObject<ExtendedHTMLInputElement | null>,
  init: Init,
  { onFocus, onBlur, onInput }: Handler,
) {
  return new Proxy(inputRef, {
    set(target, property, inputElement: ExtendedHTMLInputElement | null) {
      if (property !== 'current') {
        return false;
      }

      const isValidType = inputElement !== null && TYPES.includes(inputElement.type);

      if (process.env.NODE_ENV !== 'production' && inputElement !== null && !isValidType) {
        console.warn(`Warn: The input element type does not match one of the types: ${TYPES.join(', ')}.`);
      }

      if (inputElement !== inputRef.current) {
        if (inputRef.current !== null) {
          inputRef.current.removeEventListener('focus', onFocus);
          inputRef.current.removeEventListener('blur', onBlur);
          inputRef.current.removeEventListener('input', onInput);
        }

        if (inputElement !== null && isValidType) {
          const { controlled = false, initialValue = '' } = inputElement._wrapperState ?? {};
          // При создании `input` элемента возможно программное изменение свойства `value`, что может
          // сказаться на отображении состояния элемента, поэтому важно учесть свойство `value` в приоритете
          // ISSUE: https://github.com/GoncharukBro/react-input/issues/3
          const initResult = init({ controlled, initialValue: inputElement.value || initialValue });
          // Поскольку в предыдущем шаге возможно изменение инициализированного значения, мы
          // также должны изменить значение элемента, при этом мы не должны устанавливать
          // позицию каретки, так как установка позиции здесь приведёт к автофокусу
          setInputAttributes(inputElement, { value: initResult.value });

          // Событие `focus` не сработает при рендере, даже если включено свойство `autoFocus`,
          // поэтому нам необходимо запустить определение позиции курсора вручную при автофокусе
          if (document.activeElement === inputElement) {
            onFocus();
          }

          inputElement.addEventListener('focus', onFocus);
          inputElement.addEventListener('blur', onBlur);
          inputElement.addEventListener('input', onInput);
        }
      }

      target[property] = inputElement;

      return true;
    },
  });
}

interface UseInputParam<D> {
  init: Init;
  tracking: Tracking<D>;
  eventType?: string;
  eventHandler?: CustomInputEventHandler<CustomInputEvent<D>>;
}

/**
 * Хук контроля события изменения ввода позволяет выполнять логику и изменять
 * аттрибуты `input` элемента на определённых этапах трекинга события.
 * @param param
 * @returns
 */
export default function useInput<D = unknown>({
  init,
  tracking,
  eventType,
  eventHandler,
}: UseInputParam<D>): React.MutableRefObject<HTMLInputElement | null> {
  const selection = useRef({
    timeoutId: -1,
    fallbackTimeoutId: -1,
    cachedTimeoutId: -1,
    start: 0,
    end: 0,
  });

  const dispatchedCustomInputEvent = useRef(true);

  const inputRef = useRef<ExtendedHTMLInputElement | null>(null);

  const props = useRef({
    init,
    tracking,
    eventType,
    eventHandler,
  });

  props.current.init = init;
  props.current.tracking = tracking;
  props.current.eventType = eventType;
  props.current.eventHandler = eventHandler;

  return useMemo(() => {
    return proxy(inputRef, props.current.init, {
      /**
       *
       * Handle focus
       *
       */
      onFocus() {
        const setSelection = () => {
          // Позиция курсора изменяется после завершения события `change` и к срабатыванию кастомного
          // события позиция курсора может быть некорректной, что может повлечь за собой ошибки
          if (dispatchedCustomInputEvent.current) {
            selection.current.start = inputRef.current?.selectionStart ?? 0;
            selection.current.end = inputRef.current?.selectionEnd ?? 0;

            selection.current.timeoutId = window.setTimeout(setSelection);
          } else {
            selection.current.fallbackTimeoutId = window.setTimeout(setSelection);
          }
        };

        selection.current.timeoutId = window.setTimeout(setSelection);
      },

      /**
       *
       * Handle blur
       *
       */
      onBlur() {
        window.clearTimeout(selection.current.timeoutId);
        window.clearTimeout(selection.current.fallbackTimeoutId);

        selection.current.timeoutId = -1;
        selection.current.fallbackTimeoutId = -1;
        selection.current.cachedTimeoutId = -1;
      },

      /**
       *
       * Handle input
       *
       */
      onInput(event) {
        const inputElement = inputRef.current;

        if (inputElement === null) {
          return;
        }

        try {
          // Если событие вызывается слишком часто, смена курсора может не поспеть за новым событием,
          // поэтому сравниваем `timeoutId` кэшированный и текущий для избежания некорректного поведения маски
          if (selection.current.cachedTimeoutId === selection.current.timeoutId) {
            throw new SyntheticChangeError('The input selection has not been updated.');
          }

          selection.current.cachedTimeoutId = selection.current.timeoutId;

          const { value, selectionStart, selectionEnd } = inputElement;

          if (selectionStart === null || selectionEnd === null) {
            throw new SyntheticChangeError('The selection attributes have not been initialized.');
          }

          const previousValue = inputElement._valueTracker?.getValue?.() ?? '';
          let inputType: InputType | undefined;

          // Определяем тип ввода (ручное определение типа ввода способствует кроссбраузерности)
          if (selectionStart > selection.current.start) {
            inputType = 'insert';
          } else if (selectionStart <= selection.current.start && selectionStart < selection.current.end) {
            inputType = 'deleteBackward';
          } else if (selectionStart === selection.current.end && value.length < previousValue.length) {
            inputType = 'deleteForward';
          }

          if (
            inputType === undefined ||
            ((inputType === 'deleteBackward' || inputType === 'deleteForward') && value.length > previousValue.length)
          ) {
            throw new SyntheticChangeError('Input type detection error.');
          }

          let addedValue = '';
          let deletedValue = '';
          let changeStart = selection.current.start;
          let changeEnd = selection.current.end;

          if (inputType === 'insert') {
            addedValue = value.slice(selection.current.start, selectionStart);
          } else {
            // Для `delete` нам необходимо определить диапазон удаленных символов, так как
            // при удалении без выделения позиция каретки "до" и "после" будут совпадать
            const countDeleted = previousValue.length - value.length;

            changeStart = selectionStart;
            changeEnd = selectionStart + countDeleted;

            deletedValue = previousValue.slice(changeStart, changeEnd);
          }

          const trackingResult = props.current.tracking({
            inputType,
            previousValue,
            value,
            addedValue,
            deletedValue,
            changeStart,
            changeEnd,
            selectionStart,
            selectionEnd,
          });

          setInputAttributes(inputElement, {
            value: trackingResult.value,
            selectionStart: trackingResult.selectionStart,
            selectionEnd: trackingResult.selectionEnd,
          });

          const customEventType = props.current.eventType;
          const customEventHandler = props.current.eventHandler;

          if (typeof customEventType === 'string' && customEventHandler) {
            const { value, selectionStart, selectionEnd } = inputElement;

            dispatchedCustomInputEvent.current = false;

            // Генерируем и отправляем пользовательское событие. Нулевой `requestAnimationFrame` необходим для
            // запуска события в асинхронном режиме, в противном случае возможна ситуация, когда компонент
            // будет повторно отрисован с предыдущим значением, из-за обновления состояние после события `change`.
            // Важно использовать именно `requestAnimationFrame`, а не `setTimeout` чтобы не было заметно обновление
            // позиции каретки при вызове `setInputAttributes`
            requestAnimationFrame(() => {
              // После изменения состояния при событии `change` мы можем столкнуться с ситуацией,
              // когда значение `input` элемента не будет равно маскированному значению, что отразится
              // на данных передаваемых `event.target`. Поэтому устанавливаем предыдущее значение
              setInputAttributes(inputElement, {
                value,
                selectionStart: selectionStart ?? value.length,
                selectionEnd: selectionEnd ?? value.length,
              });

              const customInputEvent = new CustomEvent(customEventType, {
                bubbles: true,
                cancelable: false,
                composed: true,
                detail: trackingResult.__detail,
              }) as CustomInputEvent<D>;

              inputElement.dispatchEvent(customInputEvent);

              if (unstable_batchedUpdates) {
                unstable_batchedUpdates(customEventHandler, customInputEvent);
              } else {
                customEventHandler(customInputEvent);
              }

              dispatchedCustomInputEvent.current = true;
            });
          }

          // После изменения значения в кастомном событии (`dispatchCustomInputEvent`) событие `change`
          // срабатывать не будет, так как предыдущее и текущее состояние внутри `input` совпадают. Чтобы
          // обойти эту проблему с версии React 16, устанавливаем предыдущее состояние на отличное от текущего.
          inputElement._valueTracker?.setValue?.(previousValue);

          // Чтобы гарантировать правильное позиционирование каретки, обновляем
          // значения `selection` перед последующим вызовом функции обработчика `input`
          selection.current.start = trackingResult.selectionStart;
          selection.current.end = trackingResult.selectionEnd;
        } catch (error) {
          const { name, cause } = error as SyntheticChangeError;

          setInputAttributes(inputElement, {
            value: cause?.__attributes?.value ?? inputElement._valueTracker?.getValue?.() ?? '',
            selectionStart: cause?.__attributes?.selectionStart ?? selection.current.start,
            selectionEnd: cause?.__attributes?.selectionEnd ?? selection.current.end,
          });

          // Чтобы гарантировать правильное позиционирование каретки, обновляем
          // значения `selection` перед последующим вызовом функции обработчика `input`

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
      },
    });
  }, []);
}
