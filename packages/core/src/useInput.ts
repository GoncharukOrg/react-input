import { useMemo, useRef } from 'react';

import SyntheticChangeError from './SyntheticChangeError';

import type { CustomInputEvent, CustomInputEventHandler, Init, InputAttributes, InputType, Tracking } from './types';

const ALLOWED_TYPES = ['text', 'email', 'tel', 'search', 'url'];

function setInputAttributes(
  inputElement: HTMLInputElement,
  { value, selectionStart, selectionEnd }: Partial<InputAttributes>,
) {
  // Важно установить позицию курсора после установки значения,
  // так как после установки значения, курсор автоматически уходит в конец значения

  if (value !== undefined) {
    inputElement.value = value;
  }

  if (selectionStart !== undefined && selectionEnd !== undefined) {
    inputElement.setSelectionRange(selectionStart, selectionEnd);
  }
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
  const inputRef = useRef<HTMLInputElement | null>(null);

  const tracker = useRef({
    value: '',
  });

  const selection = useRef({
    timeoutId: -1,
    fallbackTimeoutId: -1,
    cachedTimeoutId: -1,
    start: 0,
    end: 0,
  });

  const customEvent = useRef({
    dispatched: true,
  });

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
    /**
     *
     * Handle focus
     *
     */
    const onFocus = (event: FocusEvent) => {
      const setSelection = () => {
        const inputElement = event.target as HTMLInputElement | null;

        // Позиция курсора изменяется после завершения события `change` и к срабатыванию кастомного
        // события позиция курсора может быть некорректной, что может повлечь за собой ошибки
        if (customEvent.current.dispatched) {
          selection.current.start = inputElement?.selectionStart ?? 0;
          selection.current.end = inputElement?.selectionEnd ?? 0;

          selection.current.timeoutId = window.setTimeout(setSelection);
        } else {
          selection.current.fallbackTimeoutId = window.setTimeout(setSelection);
        }
      };

      selection.current.timeoutId = window.setTimeout(setSelection);
    };

    /**
     *
     * Handle blur
     *
     */
    const onBlur = () => {
      window.clearTimeout(selection.current.timeoutId);
      window.clearTimeout(selection.current.fallbackTimeoutId);

      selection.current.timeoutId = -1;
      selection.current.fallbackTimeoutId = -1;
      selection.current.cachedTimeoutId = -1;
    };

    /**
     *
     * Handle input
     *
     */
    const onInput = (event: Event) => {
      const inputElement = event.target as HTMLInputElement | null;

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

        const previousValue = tracker.current.value;
        let inputType: InputType | undefined;

        // При автоподстановке значения браузер заменяет значение полностью, как если бы мы
        // выделили значение и вставили новое, однако `selection.current.start` и `selection.current.end`
        // не изменятся что приведёт к не правильному определению типа ввода, например, при
        // автоподстановке значения меньше чем предыдущее, тип ввода будет определён как `deleteBackward`.
        // Учитывая что при автоподстановке `inputType` не определён и значение заменяется полностью,
        // нам надо имитировать выделение всего значения, для этого переопределяем позиции выделения
        // @ts-expect-error
        if (event.inputType === undefined) {
          selection.current.start = 0;
          selection.current.end = previousValue.length;
        }

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

        if (typeof props.current.eventType === 'string' && props.current.eventHandler) {
          customEvent.current.dispatched = false;

          const customEventType = props.current.eventType;
          const customEventHandler = props.current.eventHandler;

          // Генерируем и отправляем пользовательское событие. `requestAnimationFrame` необходим для
          // запуска события в асинхронном режиме, в противном случае возможна ситуация, когда компонент
          // будет повторно отрисован с предыдущим значением, из-за обновления состояние после события `change`.
          // Важно использовать именно `requestAnimationFrame`, а не `setTimeout` чтобы не было заметно обновление
          // позиции каретки при вызове `setInputAttributes`.
          requestAnimationFrame(() => {
            // После изменения состояния при событии `change` мы можем столкнуться с ситуацией,
            // когда значение `input` элемента не будет равно маскированному значению, что отразится
            // на данных передаваемых `event.target`. Поэтому устанавливаем предыдущее значение
            setInputAttributes(inputElement, {
              value: trackingResult.value,
              selectionStart: trackingResult.selectionStart,
              selectionEnd: trackingResult.selectionEnd,
            });

            const customInputEvent = new CustomEvent(customEventType, {
              bubbles: true,
              cancelable: false,
              composed: true,
              detail: trackingResult.__detail,
            }) as CustomInputEvent<D>;

            inputElement.dispatchEvent(customInputEvent);
            customEventHandler(customInputEvent);

            customEvent.current.dispatched = true;
          });
        }

        // После изменения значения с помощью `setInputAttributes` событие `change`
        // срабатывать не будет, так как предыдущее и текущее состояние внутри `input` совпадают. Чтобы
        // обойти эту проблему с версии React 16, устанавливаем предыдущее состояние на отличное от текущего.
        // Действие необходимо только при работе React, для правильной работы события `change`.
        (inputElement as { _valueTracker?: { setValue?: (value: string) => void } })._valueTracker?.setValue?.(
          previousValue,
        );

        tracker.current.value = trackingResult.value;

        // Чтобы гарантировать правильное позиционирование каретки, обновляем
        // значения `selection` перед последующим вызовом функции обработчика `input`
        selection.current.start = trackingResult.selectionStart;
        selection.current.end = trackingResult.selectionEnd;
      } catch (error) {
        const { name, cause } = error as SyntheticChangeError;

        setInputAttributes(inputElement, {
          value: cause?.__attributes?.value ?? tracker.current.value,
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
    };

    const register = (inputElement: HTMLInputElement) => {
      if (!ALLOWED_TYPES.includes(inputElement.type)) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Warn: The input element type does not match one of the types: ${ALLOWED_TYPES.join(', ')}.`);
        }

        return;
      }

      const value = inputElement.getAttribute('value');
      const defaultValue = inputElement.getAttribute('defaultValue');
      // При создании `input` элемента возможно программное изменение свойства `value`, что может
      // сказаться на отображении состояния элемента, поэтому важно учесть свойство `value` в приоритете
      // ISSUE: https://github.com/GoncharukBro/react-input/issues/3
      const initialValue = inputElement.value || (value ?? defaultValue ?? '');
      const controlled = value !== null && value !== undefined;

      tracker.current.value = props.current.init({ initialValue, controlled });
      // Поскольку в предыдущем шаге возможно изменение инициализированного значения, мы
      // также должны изменить значение элемента, при этом мы не должны устанавливать
      // позицию каретки, так как установка позиции здесь приведёт к автофокусу
      setInputAttributes(inputElement, tracker.current);

      // Событие `focus` не сработает при рендере, даже если включено свойство `autoFocus`,
      // поэтому нам необходимо запустить определение позиции курсора вручную при автофокусе
      if (document.activeElement === inputElement) {
        onFocus({ target: inputElement } as unknown as FocusEvent);
      }

      inputElement.addEventListener('focus', onFocus);
      inputElement.addEventListener('blur', onBlur);
      inputElement.addEventListener('input', onInput);
    };

    const unregister = (inputElement: HTMLInputElement) => {
      inputElement.removeEventListener('focus', onFocus);
      inputElement.removeEventListener('blur', onBlur);
      inputElement.removeEventListener('input', onInput);
    };

    return new Proxy(inputRef, {
      set(target, property, inputElement: HTMLInputElement | null) {
        if (property !== 'current') {
          return false;
        }

        if (inputElement !== inputRef.current) {
          if (inputRef.current !== null) {
            unregister(inputRef.current);
          }

          if (inputElement !== null) {
            register(inputElement);
          }
        }

        target[property] = inputElement;

        return true;
      },
    });
  }, []);
}
