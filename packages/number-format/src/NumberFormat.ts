import Input from '@react-input/core/Input';
import SyntheticChangeError from '@react-input/core/SyntheticChangeError';
import definePrototype from '@react-input/core/definePrototype';

import localizeValues from './utils/localizeValues';
import resolveDetail from './utils/resolveDetail';
import resolveMinimumFractionDigits from './utils/resolveMinimumFractionDigits';
import resolveOptions from './utils/resolveOptions';
import resolveSelection from './utils/resolveSelection';

import type { NumberFormatEventDetail, NumberFormatOptions, NumberFormatProps } from './types';
import type { InitFunction, TrackingFunction } from '@react-input/core';

interface CachedProps {
  locales: NumberFormatProps['locales'];
  options: NumberFormatOptions;
}

interface Cache {
  value: string;
  props: CachedProps;
  fallbackProps: CachedProps;
}

declare class NumberFormat extends Input<NumberFormatEventDetail> {
  constructor(locales?: string | string[], options?: NumberFormatOptions);
}

function NumberFormat(this: NumberFormat, locales: string | string[], options: NumberFormatOptions = {}) {
  if (!(this instanceof NumberFormat)) {
    // eslint-disable-next-line @stylistic/quotes
    throw new TypeError("Failed to construct 'NumberFormat': Please use the 'new' operator.");
  }

  let cache: Cache | null = null;

  /**
   * Init
   */
  const init: InitFunction = ({ initialValue }) => {
    const { current, resolved } = resolveOptions(locales, options);

    const invalidType = current.maximumIntegerDigits !== undefined && typeof current.maximumIntegerDigits !== 'number';
    const invalidRange =
      typeof current.maximumIntegerDigits === 'number' && current.maximumIntegerDigits < resolved.minimumIntegerDigits;

    if (invalidType || invalidRange) {
      throw new RangeError('maximumIntegerDigits value is out of range.');
    }

    const cachedProps = { locales, options };
    cache = { value: initialValue, props: cachedProps, fallbackProps: cachedProps };

    return initialValue;
  };

  /**
   * Tracking
   */
  const tracking: TrackingFunction<NumberFormatEventDetail> = ({
    inputType,
    previousValue,
    addedValue,
    changeStart,
    changeEnd,
  }) => {
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
    const { current, resolved } = resolveOptions(locales, options);

    // Удаляем неразрешённые символы
    const filter = (value: string) => {
      const p$1 = `\\-\\${localizedValues.minusSign}`;
      const p$2 = `.,${localizedValues.decimal}`;
      const p$3 = `\\d${localizedValues.digits}`;

      const p$4 = `[^${p$1}${p$2}${p$3}]|[${p$2}](?=.*[${p$2}])`;

      const _value = value.replace(RegExp(p$4, 'g'), '');

      if (localizedValues.signBackwards) {
        return _value.replace(RegExp(`[${p$1}](?=.*[${p$1}${p$2}${p$3}])`, 'g'), '');
      }

      const firstMinusSignIndex = _value.search(RegExp(`[${p$1}]`));
      const firstDecimalIndex = _value.search(RegExp(`[${p$2}]`));
      const firstDigitIndex = _value.search(RegExp(`[${p$3}]`));

      return _value.replace(RegExp(`[${p$1}]`, 'g'), (match, offset) => {
        const isMoreMinusSignIndex = firstMinusSignIndex !== -1 && offset > firstMinusSignIndex;
        const isMoreDecimalIndex = firstDecimalIndex !== -1 && offset > firstDecimalIndex;
        const isMoreDigitIndex = firstDigitIndex !== -1 && offset > firstDigitIndex;

        return isMoreMinusSignIndex || isMoreDecimalIndex || isMoreDigitIndex ? '' : match;
      });
    };

    addedValue = filter(addedValue);

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

    let normalizedValue = beforeChangeValue + addedValue + afterChangeValue;

    // Фильтруем значение для преобразование в число
    normalizedValue = filter(normalizedValue)
      // Нормализуем десятичный разделитель
      .replace(RegExp(`[,${localizedValues.decimal}]`, 'g'), '.')
      // Нормализуем знак минуса
      .replace(RegExp(localizedValues.minusSign, 'g'), '-')
      // Нормализуем цифры
      .replace(RegExp(`[${localizedValues.digits}]`, 'g'), (localeDigit) => {
        const digit = localizedValues.digits.indexOf(localeDigit);
        return digit !== -1 ? digit.toString() : localeDigit;
      });

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

    // Для нормализации значения, ставим минус слева.
    // В случае арабской локали он может находиться справа
    if (normalizedValue.endsWith('-')) {
      normalizedValue = `-${normalizedValue.slice(0, -1)}`;
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
        const previousMinimumFractionDigits = resolveMinimumFractionDigits({
          // integer: previousInteger,
          // fraction: previousFraction,
          resolvedOptions: resolveOptions(cache.props.locales, cache.props.options).resolved,
        });

        // Если изменения происходят в области `minimumFractionDigits`
        const isRange =
          changeStart >= previousFractionIndex &&
          changeEnd < previousFractionIndex + (previousMinimumFractionDigits || 1);

        if (isRange && previousFraction.length <= (previousMinimumFractionDigits || 1)) {
          normalizedValue = normalizedValue.replace(/0+$/g, '');
        }
      }
    }

    const detail = resolveDetail(normalizedValue, {
      inputType,
      locales,
      localizedValues,
      currentOptions: current,
      resolvedOptions: resolved,
    });

    const selection = resolveSelection({
      localizedValues,
      previousLocalizedValues,
      resolvedOptions: resolved,
      inputType,
      previousValue,
      addedValue,
      nextValue: detail.value,
      changeStart,
      changeEnd,
    });

    cache.value = detail.value;
    cache.props = { locales, options };

    return {
      value: detail.value,
      selectionStart: selection.start,
      selectionEnd: selection.end,
      detail,
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const _this: NumberFormat = Reflect.construct(Input, [{ type: 'number-format', init, tracking }], this.constructor);

  return _this;
}

definePrototype(NumberFormat, {});

Object.setPrototypeOf(NumberFormat.prototype, Input.prototype);
Object.setPrototypeOf(NumberFormat, Input);

export default NumberFormat;
