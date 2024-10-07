import { useRef } from 'react';

import { SyntheticChangeError, useInput } from '@react-input/core';

import filter from './utils/filter';
import _format from './utils/format';
import localizeValues from './utils/localizeValues';
import normalize from './utils/normalize';
import resolveOptions from './utils/resolveOptions';
import resolveSelection from './utils/resolveSelection';

import type { NumberFormatEventDetail, NumberFormatOptions, NumberFormatProps } from './types';
import type { Init, Tracking } from '@react-input/core';

interface CachedNumberFormatProps {
  locales: Intl.LocalesArgument;
  options: NumberFormatOptions;
}

interface Cache {
  value: string;
  props: CachedNumberFormatProps;
  fallbackProps: CachedNumberFormatProps;
}

export default function useNumberFormat({
  locales,
  format,
  currency,
  currencyDisplay,
  unit,
  unitDisplay,
  signDisplay,
  groupDisplay,
  minimumIntegerDigits,
  maximumIntegerDigits,
  minimumFractionDigits,
  maximumFractionDigits,
  onNumberFormat,
}: NumberFormatProps = {}): React.MutableRefObject<HTMLInputElement | null> {
  const options = {
    format,
    currency,
    currencyDisplay,
    unit,
    unitDisplay,
    signDisplay,
    groupDisplay,
    minimumIntegerDigits,
    maximumIntegerDigits,
    minimumFractionDigits,
    maximumFractionDigits,
  };

  const cache = useRef<Cache | null>(null);

  /**
   *
   * Init
   *
   */

  const init: Init = ({ controlled, initialValue }) => {
    const maximumIntegerDigits = options.maximumIntegerDigits;
    const resolvedOptions = resolveOptions(locales, options);

    const invalidRange =
      maximumIntegerDigits !== undefined &&
      resolvedOptions.maximumIntegerDigits !== undefined &&
      (typeof maximumIntegerDigits !== 'number' || maximumIntegerDigits < resolvedOptions.maximumIntegerDigits);

    if (invalidRange) {
      throw new RangeError('maximumIntegerDigits value is out of range.');
    }

    if (!controlled) {
      const localizedValues = localizeValues(locales);

      const filteredValue = filter(initialValue, localizedValues);

      if (filteredValue.length > 0) {
        const normalizedValue = normalize(filteredValue, localizedValues);
        initialValue = _format(normalizedValue, { locales, options, localizedValues, resolvedOptions }).value;
      }
    }

    const cachedProps = { locales, options };
    cache.current = { value: initialValue, props: cachedProps, fallbackProps: cachedProps };

    return { value: initialValue };
  };

  /**
   *
   * Tracking
   *
   */

  const tracking: Tracking<NumberFormatEventDetail> = ({
    inputType,
    previousValue,
    addedValue,
    changeStart,
    changeEnd,
  }) => {
    if (cache.current === null) {
      throw new SyntheticChangeError('The state has not been initialized.');
    }

    // Предыдущее значение всегда должно соответствовать маскированному значению из кэша. Обратная ситуация может
    // возникнуть при контроле значения, если значение не было изменено после ввода. Для предотвращения подобных
    // ситуаций, нам важно синхронизировать предыдущее значение с кэшированным значением, если они различаются
    if (cache.current.value !== previousValue) {
      cache.current.props = cache.current.fallbackProps;
    } else {
      cache.current.fallbackProps = cache.current.props;
    }

    const previousLocalizedValues = localizeValues(cache.current.props.locales);
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
        const previousResolvedOptions = resolveOptions(cache.current.props.locales, cache.current.props.options);

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

    let detail = { value: '', number: 0 };

    // Если `integer` удалён и `fraction` отсутствует или равен нулю, удаляем всё значение
    const isEmptyValue = normalizedValue === '' || normalizedValue === '-' || /^-?(\.0*)?$/.test(normalizedValue);

    if (!isDelete || !isEmptyValue) {
      detail = _format(normalizedValue, {
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
      value: detail.value,
      previousValue,
      addedValue,
      changeStart,
      changeEnd,
    });

    cache.current.value = detail.value;
    cache.current.props = { locales, options };

    return {
      value: detail.value,
      selectionStart: selection.start,
      selectionEnd: selection.end,
      __detail: detail,
    };
  };

  /**
   *
   * Use input
   *
   */

  return useInput<NumberFormatEventDetail>({
    init,
    tracking,
    eventType: 'input-number-format',
    eventHandler: onNumberFormat,
  });
}
