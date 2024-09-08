import Input from '@react-input/core/Input';
import SyntheticChangeError from '@react-input/core/SyntheticChangeError';

import * as utils from './utils';
import filter from './utils/filter';
import format from './utils/format';
import formatToReplacementObject from './utils/formatToReplacementObject';
import resolveSelection from './utils/resolveSelection';
import unformat from './utils/unformat';
import validate from './utils/validate';

import type { MaskOptions, Replacement } from './types';

interface CachedProps {
  mask: string;
  replacement: Replacement;
}

interface Cache {
  value: string;
  props: CachedProps;
  fallbackProps: CachedProps;
}

function normalizeOptions(options: MaskOptions) {
  return {
    mask: options.mask ?? '',
    replacement:
      typeof options.replacement === 'string'
        ? formatToReplacementObject(options.replacement)
        : options.replacement ?? {},
    showMask: options.showMask ?? false,
    separate: options.separate ?? false,
    track: options.track,
    modify: options.modify,
  };
}

export default class Mask extends Input {
  static {
    Object.defineProperty(this.prototype, Symbol.toStringTag, {
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'Mask',
    });
  }

  constructor(options: MaskOptions = {}) {
    let cache: Cache | null = null;

    super({
      /**
       * Init
       */
      init: ({ initialValue, controlled }) => {
        const { mask, replacement, showMask } = normalizeOptions(options);

        if (process.env.NODE_ENV !== 'production') {
          validate({ initialValue, mask, replacement });
        }

        initialValue = controlled || initialValue ? initialValue : showMask ? mask : '';

        const cachedProps = { mask, replacement };
        cache = { value: initialValue, props: cachedProps, fallbackProps: cachedProps };

        return initialValue;
      },
      /**
       * Tracking
       */
      tracking: ({ inputType, previousValue, addedValue, changeStart, changeEnd }) => {
        const { mask, replacement, showMask, separate, track, modify } = normalizeOptions(options);

        const _addedValue = track?.({
          ...(inputType === 'insert' ? { inputType, data: addedValue } : { inputType, data: null }),
          value: previousValue,
          selectionStart: changeStart,
          selectionEnd: changeEnd,
        });

        if (_addedValue === false) {
          throw new SyntheticChangeError('Custom tracking stop.');
        } else if (_addedValue === null) {
          addedValue = '';
        } else if (_addedValue !== true && _addedValue !== undefined) {
          addedValue = _addedValue;
        }

        if (cache === null) {
          throw new SyntheticChangeError('The state has not been initialized.');
        }

        // Предыдущее значение всегда должно соответствовать маскированному значению из кэша. Обратная ситуация может
        // возникнуть при контроле значения, если значение не было изменено после ввода. Для предотвращения подобных
        // ситуаций, нам важно синхронизировать предыдущее значение с кэшированным значением, если они различаются
        if (cache.value !== previousValue) {
          cache.props = cache.fallbackProps;
        } else {
          cache.fallbackProps = cache.props;
        }

        // Дополнительно учитываем, что добавление/удаление символов не затрагивают значения до и после диапазона
        // изменения, поэтому нам важно получить их немаскированные значения на основе предыдущего значения и
        // закэшированных пропсов, то есть тех которые были применены к значению на момент предыдущего маскирования
        let beforeChangeValue = unformat(previousValue, { end: changeStart, separate, ...cache.props });
        let afterChangeValue = unformat(previousValue, { start: changeEnd, separate, ...cache.props });

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

        /* eslint-disable prefer-const */
        let {
          mask: modifiedMask = mask,
          replacement: modifiedReplacement = replacement,
          showMask: modifiedShowMask = showMask,
          separate: modifiedSeparate = separate,
        } = modify?.(input) ?? {};

        if (typeof modifiedReplacement === 'string') {
          modifiedReplacement = formatToReplacementObject(modifiedReplacement);
        }

        const value = format(input, {
          mask: modifiedMask,
          replacement: modifiedReplacement,
          showMask: modifiedShowMask,
        });

        const selection = resolveSelection({
          inputType,
          value,
          addedValue,
          beforeChangeValue,
          mask: modifiedMask,
          replacement: modifiedReplacement,
          separate: modifiedSeparate,
        });

        cache.value = value;
        cache.props = { mask: modifiedMask, replacement: modifiedReplacement };

        return {
          value,
          selectionStart: selection,
          selectionEnd: selection,
        };
      },
    });
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
