import { Input, SyntheticChangeError } from '@react-input/core';

import * as utils from './utils';
import exec from './utils/exec';
import filter from './utils/filter';
import format from './utils/format';
import localizeValues from './utils/localizeValues';
import normalize from './utils/normalize';
import resolveOptions from './utils/resolveOptions';
import resolveSelection from './utils/resolveSelection';

import type { LocalizedNumberFormatValues, NumberFormatOptions } from './types';

function normalizeAddedValue(addedValue: string, localizedValues: LocalizedNumberFormatValues) {
  const normalizedLocalizedValues = { minusSign: '-', decimal: '.', digits: '\\d', signBackwards: false };

  const addedValue$1 = exec(addedValue, localizedValues);
  const addedValue$2 = exec(addedValue.replace(',', '.'), normalizedLocalizedValues);

  const $addedValue = addedValue$1 ? addedValue$1 : addedValue$2;
  const $localizedValues = addedValue$1 ? localizedValues : normalizedLocalizedValues;

  addedValue = filter($addedValue, $localizedValues);
  addedValue = normalize(addedValue, localizedValues);

  return addedValue;
}

export default class NumberFormat extends Input<{ locales: Intl.LocalesArgument; options: NumberFormatOptions }> {
  static {
    Object.defineProperty(this.prototype, Symbol.toStringTag, {
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'NumberFormat',
    });
  }

  format: (value: number | bigint | string) => string;
  unformat: (value: string) => string;

  constructor(_options: NumberFormatOptions & { locales?: Intl.LocalesArgument } = {}) {
    super({
      /**
       * Init
       */
      init: ({ initialValue, controlled }) => {
        const { locales, ...options } = _options;

        if (!controlled && initialValue.length > 0) {
          const localizedValues = localizeValues(locales);
          const resolvedOptions = resolveOptions(locales, options);

          let _value = normalizeAddedValue(initialValue, localizedValues);
          // Для нормализации значения, ставим минус слева.
          // В случае арабской локали он может находиться справа
          _value = _value.replace(/(.+)(-)$/, '$2$1');

          if (_value.length > 0) {
            initialValue = format(_value, { locales, options, localizedValues, resolvedOptions });
          }
        }

        return { value: initialValue, options: { locales, options } };
      },
      /**
       * Tracking
       */
      tracking: ({ inputType, previousValue, previousOptions, addedValue, changeStart, changeEnd }) => {
        const { locales, ...options } = _options;

        const previousLocalizedValues = localizeValues(previousOptions.locales);
        const localizedValues = localizeValues(locales);
        const resolvedOptions = resolveOptions(locales, options);

        const r$1 = RegExp(`^[${localizedValues.minusSign}]$`);
        const r$2 = RegExp(`^[,${localizedValues.decimal}]$`);

        if (r$1.test(addedValue)) {
          addedValue = addedValue.replace(r$1, '-');
        } else if (r$2.test(addedValue)) {
          addedValue = addedValue.replace(r$2, '.');
        } else {
          addedValue = normalizeAddedValue(addedValue, localizedValues);
        }

        if (inputType === 'insert' && !addedValue) {
          throw new SyntheticChangeError('The added value does not contain allowed characters.');
        }

        let beforeChangeValue = previousValue.slice(0, changeStart);
        beforeChangeValue = exec(beforeChangeValue, previousLocalizedValues);
        beforeChangeValue = filter(beforeChangeValue, previousLocalizedValues);
        beforeChangeValue = normalize(beforeChangeValue, previousLocalizedValues);

        let afterChangeValue = previousValue.slice(changeEnd);
        afterChangeValue = exec(afterChangeValue, previousLocalizedValues);
        afterChangeValue = filter(afterChangeValue, previousLocalizedValues);
        afterChangeValue = normalize(afterChangeValue, previousLocalizedValues);

        let normalizedValue = beforeChangeValue + addedValue + afterChangeValue;

        // Удаляем лишние знаки десятичного разделителя
        normalizedValue = normalizedValue.replace(/[.](?=.*[.])/g, '');

        // Если `signBackwards === true`, тогда знак минуса определён локалью как "стоящий справа",
        // в этом случае удаляем знак минуса стоящий перед остальными символами (`lookahead`),
        // в противном случае удаляем знак минуса стоящий после остальных символов (альтернатива `lookbehind`)
        if (localizedValues.signBackwards) {
          normalizedValue = normalizedValue.replace(/[-](?=.*[-.\d])/g, '');
        } else {
          const index = normalizedValue.search(/[-.\d]/);

          normalizedValue = normalizedValue.replace(/[-]/g, (match, offset) => {
            return index !== -1 && offset > index ? '' : match;
          });
        }

        // Для нормализации значения, ставим минус слева.
        // В случае арабской локали он может находиться справа
        normalizedValue = normalizedValue.replace(/(.+)(-)$/, '$2$1');

        // В случае ввода знака минуса нам нужно его удалить если
        // оно присутствует, в противном случае добавить, тем самым
        // создав автоматическую вставку при любой позиции каретки
        {
          const isReflectMinusSign = addedValue === '-' && changeStart === changeEnd;
          const hasPreviousValueMinusSign = previousValue.includes(previousLocalizedValues.minusSign);
          const hasNormalizedValueMinusSign = normalizedValue.includes('-');

          if (isReflectMinusSign && hasPreviousValueMinusSign && hasNormalizedValueMinusSign) {
            normalizedValue = normalizedValue.replace('-', '');
          }
          if (isReflectMinusSign && !hasPreviousValueMinusSign && !hasNormalizedValueMinusSign) {
            normalizedValue = `-${normalizedValue}`;
          }
        }

        // Если изменения происходят в области `minimumFractionDigits`, очищаем дробную часть
        // для замены значения, чтобы заменить "0" на вводимое значение,
        // например, при вводе "1", получим "0.00" -> "0.1" -> "0.10" (не "0.100")
        if (/\..*0$/.test(normalizedValue)) {
          const p$1 = `([${previousLocalizedValues.digits}])([${previousLocalizedValues.decimal}])([${previousLocalizedValues.digits}]+)`;
          const result = RegExp(p$1).exec(previousValue);

          if (result !== null) {
            const previousFraction = result[3];
            const previousFractionIndex = Number(result[5]) + result[1].length + result[2].length;

            const previousResolvedOptions = resolveOptions(previousOptions.locales, previousOptions.options);
            const previousMinimumFractionDigits = previousResolvedOptions.minimumFractionDigits ?? 0;

            // Если изменения происходят в области `minimumFractionDigits`
            const isRange =
              changeStart >= previousFractionIndex &&
              changeEnd < previousFractionIndex + (previousMinimumFractionDigits || 1);

            if (isRange && previousFraction.length <= (previousMinimumFractionDigits || 1)) {
              normalizedValue = normalizedValue.replace(/0+$/g, '');
            }
          }
        }

        const isDelete = inputType === 'deleteBackward' || inputType === 'deleteForward';

        // В случае когда у нас имеется обязательная минимальная длина и мы удаляем `decimal`,
        // нам важно удалить также нули которые перейдут из `fraction` в `integer` при объединении
        if (isDelete && previousValue.includes(previousLocalizedValues.decimal) && !normalizedValue.includes('.')) {
          const p$1 = `[${previousLocalizedValues.digits[0]}]*[^${previousLocalizedValues.decimal}${previousLocalizedValues.digits}]*$`;
          const p$2 = `[^${previousLocalizedValues.digits[0]}]`;

          let countZeros = RegExp(p$1).exec(previousValue)?.[0].replace(RegExp(p$2, 'g'), '').length;

          if (countZeros !== undefined && resolvedOptions.minimumFractionDigits !== undefined) {
            if (countZeros > resolvedOptions.minimumFractionDigits) {
              countZeros = resolvedOptions.minimumFractionDigits;
            }

            normalizedValue = normalizedValue.replace(RegExp(`0{0,${countZeros}}$`), '');
          }
        }

        let value = '';

        // Если `integer` удалён и `fraction` отсутствует или равен нулю, удаляем всё значение
        const isEmptyValue = normalizedValue === '' || normalizedValue === '-' || /^-?(\.0*)?$/.test(normalizedValue);

        if (!isDelete || !isEmptyValue) {
          value = format(normalizedValue, {
            locales,
            options,
            localizedValues,
            resolvedOptions,
          });
        }

        const selection = resolveSelection({
          localizedValues,
          previousLocalizedValues,
          resolvedOptions,
          inputType,
          value,
          previousValue,
          addedValue,
          changeStart,
          changeEnd,
        });

        return {
          value,
          selectionStart: selection.start,
          selectionEnd: selection.end,
          options: { locales, options },
        };
      },
    });

    this.format = (value: number | bigint | string) => {
      return utils.format(value, _options);
    };

    this.unformat = (value: string) => {
      return utils.unformat(value, _options.locales);
    };
  }
}

if (process.env.__OUTPUT__ === 'cdn') {
  interface Context {
    ReactInput?: {
      NumberFormat?: typeof NumberFormat & Partial<typeof utils>;
    };
  }

  const _global: typeof globalThis & Context = typeof globalThis !== 'undefined' ? globalThis : global || self;

  _global.ReactInput = _global.ReactInput ?? {};
  _global.ReactInput.NumberFormat = NumberFormat;
  _global.ReactInput.NumberFormat.format = utils.format;
  _global.ReactInput.NumberFormat.unformat = utils.unformat;
}
