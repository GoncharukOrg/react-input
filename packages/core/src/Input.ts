import SyntheticChangeError from './SyntheticChangeError';
import createContext from './createContext';

import type { CustomInputEvent, InitFunction, InputAttributes, InputOptions, InputType } from './types';

const ALLOWED_TYPES = ['text', 'email', 'tel', 'search', 'url'];

function setInputAttributes(
  element: HTMLInputElement,
  { value, selectionStart, selectionEnd }: Partial<InputAttributes>,
) {
  // Важно установить позицию курсора после установки значения,
  // так как после установки значения, курсор автоматически уходит в конец значения

  if (value !== undefined) {
    element.value = value;
  }

  if (selectionStart !== undefined && selectionEnd !== undefined) {
    element.setSelectionRange(selectionStart, selectionEnd);
  }
}

interface ContextValue {
  tracker: { value: string };
  onInit: InitFunction;
  onFocus: (event: FocusEvent) => void;
  onBlur: (event: FocusEvent) => void;
  onInput: (event: Event) => void;
}

const context = createContext<Input, ContextValue>();

declare class Input<D = unknown> {
  constructor(options?: InputOptions<D>);
  register(element: HTMLInputElement): void;
  unregister(element: HTMLInputElement): void;
}

function Input<D = unknown>(this: Input, options: InputOptions<D>) {
  if (!(this instanceof Input)) {
    // eslint-disable-next-line @stylistic/quotes
    throw new TypeError("Failed to construct 'Input': Please use the 'new' operator.");
  }

  const selection = {
    timeoutId: -1,
    cachedTimeoutId: -1,
    start: 0,
    end: 0,
  };

  const tracker = {
    value: '',
  };

  /**
   *
   * Handle init
   *
   */
  const onInit: InitFunction = ({ initialValue, controlled }) => {
    return options.init({ initialValue, controlled });
  };

  /**
   *
   * Handle focus
   *
   */
  const onFocus = (event: FocusEvent) => {
    const setSelection = () => {
      const element = event.target as HTMLInputElement | null;

      selection.start = element?.selectionStart ?? 0;
      selection.end = element?.selectionEnd ?? 0;

      selection.timeoutId = window.setTimeout(setSelection);
    };

    selection.timeoutId = window.setTimeout(setSelection);
  };

  /**
   *
   * Handle blur
   *
   */
  const onBlur = () => {
    window.clearTimeout(selection.timeoutId);

    selection.timeoutId = -1;
    selection.cachedTimeoutId = -1;
  };

  /**
   *
   * Handle input
   *
   */
  const onInput = (event: Event) => {
    const { tracking, eventType, eventHandler } = options;

    const element = event.target as HTMLInputElement | null;

    if (element === null) {
      return;
    }

    try {
      // Если событие вызывается слишком часто, смена курсора может не поспеть за новым событием,
      // поэтому сравниваем `timeoutId` кэшированный и текущий для избежания некорректного поведения маски
      if (selection.cachedTimeoutId === selection.timeoutId) {
        throw new SyntheticChangeError('The input selection has not been updated.');
      }

      selection.cachedTimeoutId = selection.timeoutId;

      const { value, selectionStart, selectionEnd } = element;

      if (selectionStart === null || selectionEnd === null) {
        throw new SyntheticChangeError('The selection attributes have not been initialized.');
      }

      const previousValue = tracker.value;
      let inputType: InputType | undefined;

      // При автоподстановке значения браузер заменяет значение полностью, как если бы мы
      // выделили значение и вставили новое, однако `_selection.start` и `_selection.end`
      // не изменятся что приведёт к не правильному определению типа ввода, например, при
      // автоподстановке значения меньше чем предыдущее, тип ввода будет определён как `deleteBackward`.
      // Учитывая что при автоподстановке `inputType` не определён и значение заменяется полностью,
      // нам надо имитировать выделение всего значения, для этого переопределяем позиции выделения
      // @ts-expect-error
      if (event.inputType === undefined) {
        selection.start = 0;
        selection.end = previousValue.length;
      }

      // Определяем тип ввода (ручное определение типа ввода способствует кроссбраузерности)
      if (selectionStart > selection.start) {
        inputType = 'insert';
      } else if (selectionStart <= selection.start && selectionStart < selection.end) {
        inputType = 'deleteBackward';
      } else if (selectionStart === selection.end && value.length < previousValue.length) {
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
      let changeStart = selection.start;
      let changeEnd = selection.end;

      if (inputType === 'insert') {
        addedValue = value.slice(selection.start, selectionStart);
      } else {
        // Для `delete` нам необходимо определить диапазон удаленных символов, так как
        // при удалении без выделения позиция каретки "до" и "после" будут совпадать
        const countDeleted = previousValue.length - value.length;

        changeStart = selectionStart;
        changeEnd = selectionStart + countDeleted;

        deletedValue = previousValue.slice(changeStart, changeEnd);
      }

      const trackingResult = tracking({
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

      setInputAttributes(element, {
        value: trackingResult.value,
        selectionStart: trackingResult.selectionStart,
        selectionEnd: trackingResult.selectionEnd,
      });

      // После изменения значения с помощью `setInputAttributes` значение `value` фактически изменится, что делает `input`
      // неконтролируемым, а событие `change` срабатывать не будет, так как предыдущее и текущее состояние внутри `input`
      // совпадают. Чтобы обойти эту проблему с версии React 16, устанавливаем предыдущее состояние на отличное от текущего.
      // Действие необходимо только при работе React, для правильной работы события `change`.
      (element as { _valueTracker?: { setValue?: (value: string) => void } })._valueTracker?.setValue?.(previousValue);

      if (typeof eventType === 'string') {
        const customInputEvent = new CustomEvent(eventType, {
          bubbles: true,
          cancelable: false,
          composed: true,
          detail: trackingResult.__detail,
        });

        // Генерируем и отправляем пользовательское событие. Событие сработает до вызовов `onInput` и `onChange`,
        // при этом если в момент вызова `eventHandler` изменить состояние компонента (что приведёт к ререндеру)
        // без изменения значения `value`, то `onChange` вызван не будет.
        queueMicrotask(() => {
          // TODO: если customEventHandler определён раньше чем пописка, то он вызывается раньше
          element.dispatchEvent(customInputEvent);
          eventHandler?.(customInputEvent as CustomInputEvent<D>);
        });
      }

      // Чтобы гарантировать правильное позиционирование каретки, обновляем
      // значения `_selection` перед последующим вызовом функции обработчика `input`
      selection.start = trackingResult.selectionStart;
      selection.end = trackingResult.selectionEnd;
    } catch (error) {
      const { name, cause } = error as SyntheticChangeError;

      setInputAttributes(element, {
        value: cause?.__attributes?.value ?? tracker.value,
        selectionStart: cause?.__attributes?.selectionStart ?? selection.start,
        selectionEnd: cause?.__attributes?.selectionEnd ?? selection.end,
      });

      if (cause?.__attributes?.selectionStart !== undefined) {
        selection.start = cause.__attributes.selectionStart;
      }

      if (cause?.__attributes?.selectionEnd !== undefined) {
        selection.end = cause.__attributes.selectionEnd;
      }

      event.preventDefault();
      event.stopPropagation();

      if (name !== 'SyntheticChangeError') {
        throw error;
      }
    }
  };

  context.set(this, { tracker, onInit, onFocus, onBlur, onInput });
}

Object.defineProperty(Input, 'prototype', {
  writable: false,
  enumerable: false,
  configurable: false,
  value: {
    register(this: Input | undefined, element: HTMLInputElement) {
      const _this = context.get(this);

      if (!ALLOWED_TYPES.includes(element.type)) {
        // TODO: мы не должны отображать ошибки в `production`, учесть при CDN (отсутствие переменной `NODE_ENV`)
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Warn: The input element type does not match one of the types: ${ALLOWED_TYPES.join(', ')}.`);
        }

        return;
      }

      const descriptor = Object.getOwnPropertyDescriptor(element, 'value');

      // Поскольку значение элемента может быть изменено вне текущей логики,
      // нам важно перехватывать каждое изменение для обновления `_tracker.value`.
      // `_tracker.value` служит заменой `_valueTracker.getValue()` предоставляемый React.
      Object.defineProperty(element, 'value', {
        ...descriptor,
        set: (value: string) => {
          _this.tracker.value = value;
          descriptor?.set?.call(element, value);
        },
      });

      const value = element.getAttribute('value');
      const defaultValue = element.getAttribute('defaultValue');

      // При создании `input` элемента возможно программное изменение свойства `value`, что может
      // сказаться на отображении состояния элемента, поэтому важно учесть свойство `value` в приоритете.
      // ISSUE: https://github.com/GoncharukBro/react-input/issues/3
      const initialValue = element.value || (value ?? defaultValue ?? '');
      const controlled = value !== null && value !== undefined;

      // Поскольку в `init` возможно изменение инициализированного значения, мы
      // также должны изменить значение элемента, при этом мы не должны устанавливать
      // позицию каретки, так как установка позиции здесь приведёт к автофокусу.
      setInputAttributes(element, {
        value: _this.onInit({ initialValue, controlled }),
      });

      // Событие `focus` не сработает при рендере, даже если включено свойство `autoFocus`,
      // поэтому нам необходимо запустить определение позиции курсора вручную при автофокусе.
      if (document.activeElement === element) {
        _this.onFocus({ target: element } as unknown as FocusEvent);
      }

      element.addEventListener('focus', _this.onFocus);
      element.addEventListener('blur', _this.onBlur);
      element.addEventListener('input', _this.onInput);
    },
    unregister(this: Input | undefined, element: HTMLInputElement) {
      const _this = context.get(this);

      element.removeEventListener('focus', _this.onFocus);
      element.removeEventListener('blur', _this.onBlur);
      element.removeEventListener('input', _this.onInput);
    },
  },
});

Object.defineProperties(Input.prototype, {
  [Symbol.toStringTag]: {
    writable: false,
    enumerable: false,
    configurable: true,
    value: 'Input',
  },
  constructor: {
    writable: true,
    enumerable: false,
    configurable: true,
    value: Input,
  },
});

export default Input;
