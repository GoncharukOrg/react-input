import { useRef } from 'react';

import { SyntheticChangeError, useInput } from '@react-input/core';

import exec from './utils/exec';
import filter from './utils/filter';
import _format from './utils/format';
import localizeValues from './utils/localizeValues';
import normalize from './utils/normalize';
import resolveOptions from './utils/resolveOptions';
import resolveSelection from './utils/resolveSelection';

import type {
  NumberFormatEventDetail,
  LocalizedNumberFormatValues,
  NumberFormatOptions,
  NumberFormatProps,
} from './types';
import type { Init, Tracking } from '@react-input/core';

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
    if (!controlled && initialValue.length > 0) {
      const localizedValues = localizeValues(locales);
      const resolvedOptions = resolveOptions(locales, options);

      let _value = normalizeAddedValue(initialValue, localizedValues);
      // Для нормализации значения, ставим минус слева.
      // В случае арабской локали он может находиться справа
      _value = _value.replace(/(.+)(-)$/, '$2$1');

      if (_value.length > 0) {
        initialValue = _format(_value, { locales, options, localizedValues, resolvedOptions }).value;
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
