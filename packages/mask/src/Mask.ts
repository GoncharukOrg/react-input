import { Input, SyntheticChangeError } from '@react-input/core';

import * as utils from './utils';
import filter from './utils/filter';
import format from './utils/format';
import formatToReplacementObject from './utils/formatToReplacementObject';
import resolveSelection from './utils/resolveSelection';
import unformat from './utils/unformat';
import validate from './utils/validate';

import type { MaskOptions, MaskPart, Overlap, Replacement } from './types';

function normalizeOptions(options: MaskOptions) {
  return {
    mask: options.mask ?? '',
    replacement:
      typeof options.replacement === 'string'
        ? formatToReplacementObject(options.replacement)
        : (options.replacement ?? {}),
    showMask: options.showMask ?? false,
    separate: options.separate ?? false,
    track: options.track,
    modify: options.modify,
  };
}

export default class Mask extends Input<{ mask: string; replacement: Replacement; separate: boolean }> {
  static {
    Object.defineProperty(this.prototype, Symbol.toStringTag, {
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'Mask',
    });
  }

  format: (value: string) => string;
  formatToParts: (value: string) => MaskPart[];
  unformat: (value: string) => string;
  generatePattern: (overlap: Overlap) => string;

  constructor(options: MaskOptions = {}) {
    super({
      /**
       * Init
       */
      init: ({ initialValue, controlled }) => {
        const { mask, replacement, separate, showMask } = normalizeOptions(options);

        initialValue = controlled || initialValue ? initialValue : showMask ? mask : '';

        if (process.env.NODE_ENV !== 'production') {
          validate({ initialValue, mask, replacement });
        }

        return { value: initialValue, options: { mask, replacement, separate } };
      },
      /**
       * Tracking
       */
      tracking: ({ inputType, previousValue, previousOptions, addedValue, changeStart, changeEnd }) => {
        const { track, modify, ...normalizedOptions } = normalizeOptions(options);

        let { mask, replacement, showMask, separate } = normalizedOptions;

        const _data = inputType === 'insert' ? { inputType, data: addedValue } : { inputType, data: null };
        const trackingData = { ..._data, value: previousValue, selectionStart: changeStart, selectionEnd: changeEnd };

        const trackingValue = track?.(trackingData);

        if (trackingValue === false) {
          throw new SyntheticChangeError('Custom tracking stop.');
        } else if (trackingValue === null) {
          addedValue = '';
        } else if (trackingValue !== true && trackingValue !== undefined) {
          addedValue = trackingValue;
        }

        const modifiedOptions = modify?.(trackingData);

        if (modifiedOptions?.mask !== undefined) mask = modifiedOptions.mask;
        if (modifiedOptions?.replacement !== undefined)
          replacement =
            typeof modifiedOptions?.replacement === 'string'
              ? formatToReplacementObject(modifiedOptions?.replacement)
              : modifiedOptions.replacement;
        if (modifiedOptions?.showMask !== undefined) showMask = modifiedOptions.showMask;
        if (modifiedOptions?.separate !== undefined) separate = modifiedOptions.separate;

        // Дополнительно учитываем, что добавление/удаление символов не затрагивают значения до и после диапазона
        // изменения, поэтому нам важно получить их немаскированные значения на основе предыдущего значения и
        // закэшированных пропсов, то есть тех которые были применены к значению на момент предыдущего маскирования
        let beforeChangeValue = unformat(previousValue, { end: changeStart, ...previousOptions });
        let afterChangeValue = unformat(previousValue, { start: changeEnd, ...previousOptions });

        // Регулярное выражение по поиску символов кроме ключей `replacement`
        const regExp$1 = RegExp(`[^${Object.keys(replacement).join('')}]`, 'g');
        // Находим все заменяемые символы для фильтрации пользовательского значения.
        // Важно определить корректное значение на данном этапе
        let replacementChars = mask.replace(regExp$1, '');

        if (beforeChangeValue) {
          beforeChangeValue = filter(beforeChangeValue, { replacementChars, replacement, separate });
          replacementChars = replacementChars.slice(beforeChangeValue.length);
        }

        if (addedValue) {
          // Поскольку нас интересуют только "полезные" символы, фильтруем без учёта заменяемых символов
          addedValue = filter(addedValue, { replacementChars, replacement, separate: false });
          replacementChars = replacementChars.slice(addedValue.length);
        }

        if (inputType === 'insert' && addedValue === '') {
          throw new SyntheticChangeError('The character does not match the key value of the `replacement` object.');
        }

        // Модифицируем `afterChangeValue` чтобы позиция символов не смещалась. Необходимо выполнять
        // после фильтрации `addedValue` и перед фильтрацией `afterChangeValue`
        if (separate) {
          // Находим заменяемые символы в диапазоне изменяемых символов
          const separateChars = mask.slice(changeStart, changeEnd).replace(regExp$1, '');
          // Получаем количество символов для сохранения перед `afterChangeValue`. Возможные значения:
          // `меньше ноля` - обрезаем значение от начала на количество символов;
          // `ноль` - не меняем значение;
          // `больше ноля` - добавляем заменяемые символы к началу значения.
          const countSeparateChars = separateChars.length - addedValue.length;

          if (countSeparateChars < 0) {
            afterChangeValue = afterChangeValue.slice(-countSeparateChars);
          } else if (countSeparateChars > 0) {
            afterChangeValue = separateChars.slice(-countSeparateChars) + afterChangeValue;
          }
        }

        if (afterChangeValue) {
          afterChangeValue = filter(afterChangeValue, { replacementChars, replacement, separate });
        }

        const input = beforeChangeValue + addedValue + afterChangeValue;
        const value = format(input, { mask, replacement, separate, showMask });

        const selection = resolveSelection({
          inputType,
          value,
          addedValue,
          beforeChangeValue,
          mask,
          replacement,
          separate,
        });

        return {
          value,
          selectionStart: selection,
          selectionEnd: selection,
          options: { mask, replacement, separate },
        };
      },
    });

    this.format = (value) => {
      return utils.format(value, normalizeOptions(options));
    };

    this.formatToParts = (value) => {
      return utils.formatToParts(value, normalizeOptions(options));
    };

    this.unformat = (value) => {
      return utils.unformat(value, normalizeOptions(options));
    };

    this.generatePattern = (overlap) => {
      return utils.generatePattern(overlap, normalizeOptions(options));
    };
  }
}

if (process.env.__OUTPUT__ === 'cdn') {
  interface Context {
    ReactInput?: {
      Mask?: typeof Mask & Partial<typeof utils>;
    };
  }

  const _global: typeof globalThis & Context = typeof globalThis !== 'undefined' ? globalThis : global || self;

  _global.ReactInput = _global.ReactInput ?? {};
  _global.ReactInput.Mask = Mask;
  _global.ReactInput.Mask.format = utils.format;
  _global.ReactInput.Mask.formatToParts = utils.formatToParts;
  _global.ReactInput.Mask.unformat = utils.unformat;
  _global.ReactInput.Mask.generatePattern = utils.generatePattern;
}
