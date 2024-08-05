import SyntheticChangeError from './SyntheticChangeError';

import type { CustomInputEvent, InputAttributes, InputOptions, InputType } from './types';

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

export default class Input<D = unknown> {
  private tracker = {
    value: '',
  };

  private selection = {
    timeoutId: -1,
    cachedTimeoutId: -1,
    start: 0,
    end: 0,
  };

  private options: InputOptions<D> = {
    init() {
      throw new Error('Function not implemented.');
    },
    tracking() {
      throw new Error('Function not implemented.');
    },
  };

  /**
   *
   * Handle focus
   *
   */
  private onFocus = (event: FocusEvent) => {
    const setSelection = () => {
      const inputElement = event.target as HTMLInputElement | null;

      this.selection.start = inputElement?.selectionStart ?? 0;
      this.selection.end = inputElement?.selectionEnd ?? 0;

      this.selection.timeoutId = window.setTimeout(setSelection);
    };

    this.selection.timeoutId = window.setTimeout(setSelection);
  };

  /**
   *
   * Handle blur
   *
   */
  private onBlur = () => {
    window.clearTimeout(this.selection.timeoutId);

    this.selection.timeoutId = -1;
    this.selection.cachedTimeoutId = -1;
  };

  /**
   *
   * Handle input
   *
   */
  private onInput = (event: Event) => {
    const { tracking, eventType, eventHandler } = this.options;

    const inputElement = event.target as HTMLInputElement | null;

    if (inputElement === null) {
      return;
    }

    try {
      // Если событие вызывается слишком часто, смена курсора может не поспеть за новым событием,
      // поэтому сравниваем `timeoutId` кэшированный и текущий для избежания некорректного поведения маски
      if (this.selection.cachedTimeoutId === this.selection.timeoutId) {
        throw new SyntheticChangeError('The input selection has not been updated.');
      }

      this.selection.cachedTimeoutId = this.selection.timeoutId;

      const { value, selectionStart, selectionEnd } = inputElement;

      if (selectionStart === null || selectionEnd === null) {
        throw new SyntheticChangeError('The selection attributes have not been initialized.');
      }

      const previousValue = this.tracker.value;
      let inputType: InputType | undefined;

      // При автоподстановке значения браузер заменяет значение полностью, как если бы мы
      // выделили значение и вставили новое, однако `selection.start` и `selection.end`
      // не изменятся что приведёт к не правильному определению типа ввода, например, при
      // автоподстановке значения меньше чем предыдущее, тип ввода будет определён как `deleteBackward`.
      // Учитывая что при автоподстановке `inputType` не определён и значение заменяется полностью,
      // нам надо имитировать выделение всего значения, для этого переопределяем позиции выделения
      // @ts-expect-error
      if (event.inputType === undefined) {
        this.selection.start = 0;
        this.selection.end = previousValue.length;
      }

      // Определяем тип ввода (ручное определение типа ввода способствует кроссбраузерности)
      if (selectionStart > this.selection.start) {
        inputType = 'insert';
      } else if (selectionStart <= this.selection.start && selectionStart < this.selection.end) {
        inputType = 'deleteBackward';
      } else if (selectionStart === this.selection.end && value.length < previousValue.length) {
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
      let changeStart = this.selection.start;
      let changeEnd = this.selection.end;

      if (inputType === 'insert') {
        addedValue = value.slice(this.selection.start, selectionStart);
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

      setInputAttributes(inputElement, {
        value: trackingResult.value,
        selectionStart: trackingResult.selectionStart,
        selectionEnd: trackingResult.selectionEnd,
      });

      // После изменения значения с помощью `setInputAttributes` значение `value` фактически изменится, что делает `input`
      // неконтролируемым, а событие `change` срабатывать не будет, так как предыдущее и текущее состояние внутри `input`
      // совпадают. Чтобы обойти эту проблему с версии React 16, устанавливаем предыдущее состояние на отличное от текущего.
      // Действие необходимо только при работе React, для правильной работы события `change`.
      (inputElement as { _valueTracker?: { setValue?: (value: string) => void } })._valueTracker?.setValue?.(
        previousValue,
      );

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
          inputElement.dispatchEvent(customInputEvent);
          eventHandler?.(customInputEvent as CustomInputEvent<D>);
        });
      }

      // Чтобы гарантировать правильное позиционирование каретки, обновляем
      // значения `selection` перед последующим вызовом функции обработчика `input`
      this.selection.start = trackingResult.selectionStart;
      this.selection.end = trackingResult.selectionEnd;
    } catch (error) {
      const { name, cause } = error as SyntheticChangeError;

      setInputAttributes(inputElement, {
        value: cause?.__attributes?.value ?? this.tracker.value,
        selectionStart: cause?.__attributes?.selectionStart ?? this.selection.start,
        selectionEnd: cause?.__attributes?.selectionEnd ?? this.selection.end,
      });

      // Чтобы гарантировать правильное позиционирование каретки, обновляем
      // значения `selection` перед последующим вызовом функции обработчика `input`

      if (cause?.__attributes?.selectionStart !== undefined) {
        this.selection.start = cause.__attributes.selectionStart;
      }

      if (cause?.__attributes?.selectionEnd !== undefined) {
        this.selection.end = cause.__attributes.selectionEnd;
      }

      event.preventDefault();
      event.stopPropagation();

      if (name !== 'SyntheticChangeError') {
        throw error;
      }
    }
  };

  constructor(options: InputOptions<D>) {
    this.options = options;
  }

  public register(inputElement: HTMLInputElement) {
    const { init } = this.options;

    if (!ALLOWED_TYPES.includes(inputElement.type)) {
      // TODO: мы не должны отображать ошибки в `production`, учесть при CDN (отсутствие переменной `NODE_ENV`)
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Warn: The input element type does not match one of the types: ${ALLOWED_TYPES.join(', ')}.`);
      }

      return;
    }

    const descriptor = Object.getOwnPropertyDescriptor(inputElement, 'value');

    // Поскольку значение элемента может быть изменено вне текущей логики,
    // нам важно перехватывать каждое изменение для обновления `tracker.value`.
    // `tracker.value` служит заменой `_valueTracker.getValue()` предоставляемый React.
    Object.defineProperty(inputElement, 'value', {
      ...descriptor,
      set: (value: string) => {
        this.tracker.value = value;
        descriptor?.set?.call(inputElement, value);
      },
    });

    const value = inputElement.getAttribute('value');
    const defaultValue = inputElement.getAttribute('defaultValue');

    // При создании `input` элемента возможно программное изменение свойства `value`, что может
    // сказаться на отображении состояния элемента, поэтому важно учесть свойство `value` в приоритете.
    // ISSUE: https://github.com/GoncharukBro/react-input/issues/3
    const initialValue = inputElement.value || (value ?? defaultValue ?? '');
    const controlled = value !== null && value !== undefined;

    // Поскольку в `init` возможно изменение инициализированного значения, мы
    // также должны изменить значение элемента, при этом мы не должны устанавливать
    // позицию каретки, так как установка позиции здесь приведёт к автофокусу.
    setInputAttributes(inputElement, {
      value: init({ initialValue, controlled }),
    });

    // Событие `focus` не сработает при рендере, даже если включено свойство `autoFocus`,
    // поэтому нам необходимо запустить определение позиции курсора вручную при автофокусе.
    if (document.activeElement === inputElement) {
      this.onFocus({ target: inputElement } as unknown as FocusEvent);
    }

    inputElement.addEventListener('focus', this.onFocus);
    inputElement.addEventListener('blur', this.onBlur);
    inputElement.addEventListener('input', this.onInput);
  }

  public unregister(inputElement: HTMLInputElement) {
    inputElement.removeEventListener('focus', this.onFocus);
    inputElement.removeEventListener('blur', this.onBlur);
    inputElement.removeEventListener('input', this.onInput);
  }
}
