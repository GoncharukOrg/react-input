import { Input, SyntheticChangeError } from '@react-input/core';

import * as utils from './utils';
import filter from './utils/filter';
import format from './utils/format';
import localizeValues from './utils/localizeValues';
import normalize from './utils/normalize';
import resolveOptions from './utils/resolveOptions';
import resolveSelection from './utils/resolveSelection';

import type { NumberFormatOptions } from './types';

interface CachedProps {
  locales: Intl.LocalesArgument;
  options: NumberFormatOptions;
}

interface Cache {
  value: string;
  props: CachedProps;
  fallbackProps: CachedProps;
}

export default class NumberFormat extends Input {
  static {
    Object.defineProperty(this.prototype, Symbol.toStringTag, {
      writable: false,
      enumerable: false,
      configurable: true,
      value: 'NumberFormat',
    });
  }

  constructor(_options: NumberFormatOptions & { locales?: Intl.LocalesArgument } = {}) {
    let cache: Cache | null = null;

    super({
      /**
       * Init
       */
      init: ({ initialValue }) => {
        const { locales, ...options } = _options;

        const maximumIntegerDigits = options.maximumIntegerDigits;
        const resolvedMaximumIntegerDigits = resolveOptions(locales, options).maximumIntegerDigits;

        const invalidRange =
          maximumIntegerDigits !== undefined &&
          resolvedMaximumIntegerDigits !== undefined &&
          (typeof maximumIntegerDigits !== 'number' || maximumIntegerDigits < resolvedMaximumIntegerDigits);

        if (invalidRange) {
          throw new RangeError('maximumIntegerDigits value is out of range.');
        }

        const cachedProps = { locales, options };
        cache = { value: initialValue, props: cachedProps, fallbackProps: cachedProps };

        return initialValue;
      },
      /**
       * Tracking
       */
      tracking: ({ inputType, previousValue, addedValue, changeStart, changeEnd }) => {
        const { locales, ...options } = _options;

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

        const previousLocalizedValues = localizeValues(cache.props.locales);
        const localizedValues = localizeValues(locales);
        const resolvedOptions = resolveOptions(locales, options);

        addedValue = filter(addedValue, localizedValues);

        if (inputType === 'insert' && !addedValue) {
          throw new SyntheticChangeError('The added value does not contain allowed characters.');
        }

        const regExp$1 = RegExp(
          `[^\\${previousLocalizedValues.minusSign}${previousLocalizedValues.decimal}${previousLocalizedValues.digits}]`,
          'g',
        );

        // Нам важно удалить ненужные символы перед преобразованием в число, так
        // как символ группы и символ десятичного разделителя могут пересекаться
        const beforeChangeValue = previousValue.slice(0, changeStart).replace(regExp$1, '');
        const afterChangeValue = previousValue.slice(changeEnd).replace(regExp$1, '');

        const filteredValue = filter(beforeChangeValue + addedValue + afterChangeValue, localizedValues);
        let normalizedValue = normalize(filteredValue, localizedValues);

        // В случае ввода знака минуса нам нужно его удалить если
        // оно присутствует, в противном случае добавить, тем самым
        // создав автоматическую вставку при любой позиции каретки
        {
          const isReflectMinusSign =
            RegExp(`^[\\-\\${localizedValues.minusSign}]$`).test(addedValue) && changeStart === changeEnd;

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
          // let previousInteger = '';
          let previousFraction = '';
          let previousFractionIndex = -1;

          for (let i = 0, decimal = false; i < previousValue.length; i++) {
            const isDigit = previousLocalizedValues.digits.includes(previousValue[i]);
            const isDecimal = previousValue[i] === previousLocalizedValues.decimal;

            if (!decimal) {
              if (isDecimal) decimal = true;
              // if (isDigit) previousInteger += previousValue[i];
            } else if (isDigit) {
              previousFraction += previousValue[i];
              if (previousFractionIndex === -1) previousFractionIndex = i;
            }
          }

          if (previousFractionIndex !== -1) {
            const previousResolvedOptions = resolveOptions(cache.props.locales, cache.props.options);
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

        cache.value = value;
        cache.props = { locales, options };

        return {
          value,
          selectionStart: selection.start,
          selectionEnd: selection.end,
        };
      },
    });
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
