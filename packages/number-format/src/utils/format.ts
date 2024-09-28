import resolveMinimumFractionDigits from './resolveMinimumFractionDigits';

import type { LocalizedNumberFormatValues, NumberFormatOptions, ResolvedNumberFormatOptions } from '../types';
import type { InputType } from '@react-input/core';

interface Options {
  inputType: InputType;
  locales: Intl.LocalesArgument;
  options: NumberFormatOptions;
  localizedValues: LocalizedNumberFormatValues;
  resolvedOptions: ResolvedNumberFormatOptions;
}

/**
 *
 * @param value
 * @param options
 * @returns
 */
export default function format(
  value: string,
  { inputType, locales, options, localizedValues, resolvedOptions }: Options,
) {
  if (
    (inputType === 'deleteBackward' || inputType === 'deleteForward') &&
    (value === '' || value === '-' || /^-?\.?0*$/.test(value))
  ) {
    return '';
  }

  // const maximumSignificantDigits = resolvedOptions.maximumSignificantDigits;
  const maximumIntegerDigits = resolvedOptions.maximumIntegerDigits;
  const maximumFractionDigits = resolvedOptions.maximumFractionDigits;

  const isNegative = value.startsWith('-');
  const absValue = isNegative ? value.slice(1) : value;

  // При `fraction` равном `undefined` - разделитель не был введён
  let [integer, fraction = undefined] = absValue.split('.');

  // Поскольку состояние ввода хранит последний введенный символ,
  // при форматировании может произойти округление, поэтому нам важно
  // заранее обрезать символ не соответствующий максимальному количеству символов

  // - `replace` - Учитываем `minimumSignificantDigits` и `minimumIntegerDigits`.
  // Так, при `addedValue` "2": "000 001" -> "000 0012" -> "12" -> "000 012"
  integer = integer.replace(/^0+/g, '').slice(0, maximumIntegerDigits);

  // if (fraction !== undefined && maximumSignificantDigits !== undefined) {
  //   maximumFractionDigits = maximumSignificantDigits - integer.length;

  //   if (/^0*$/.test(integer) && /^0*$/.test(fraction)) {
  //     maximumFractionDigits -= 1;
  //   } else if (/^0*$/.test(integer) && /^0*[1-9]+/.test(fraction)) {
  //     maximumFractionDigits += fraction.match(/^0+/g)?.[0].length ?? 0;
  //   }
  // }

  fraction = fraction?.slice(0, maximumFractionDigits);

  const number = Number((isNegative ? '-' : '') + (integer || '0') + (fraction ? `.${fraction}` : ''));

  // Чтобы иметь возможность прописывать "0" и сохранять его с каждой итерацией,
  // переопределяем `minimumFractionDigits` и `minimumSignificantDigits`

  // let minimumSignificantDigits = resolvedOptions.minimumSignificantDigits;
  let minimumFractionDigits = resolveMinimumFractionDigits({
    // integer,
    // fraction: fraction ?? '',
    resolvedOptions,
  });

  // Если `minimumFractionDigits` равен нулю, дробная часть будет округлена
  if (
    inputType === 'insert' &&
    fraction === '' &&
    minimumFractionDigits === 0 &&
    typeof maximumFractionDigits === 'number' &&
    maximumFractionDigits > 0
  ) {
    minimumFractionDigits = 1;

    // if (minimumSignificantDigits !== undefined) {
    //   minimumSignificantDigits = (integer.length || 1) + 1;
    // }
  }

  if (fraction !== undefined && fraction.length > minimumFractionDigits) {
    minimumFractionDigits = fraction.length;

    // `minimumFractionDigits` игнорируется при указанном `minimumSignificantDigits` или
    // `maximumSignificantDigits`, поэтому указываем правило для `minimumSignificantDigits`
    // if (minimumSignificantDigits !== undefined) {
    //   if (/^0*$/.test(integer) && /^0*$/.test(fraction)) {
    //     minimumSignificantDigits = fraction.length + 1;
    //   } else if (/^0*$/.test(integer) && /^0*[1-9]+/.test(fraction)) {
    //     minimumSignificantDigits = fraction.replace(/^0+/g, '').length;
    //   } else if (/^0*[1-9]+/.test(integer)) {
    //     minimumSignificantDigits = integer.length + fraction.length;
    //   }
    // }
  }

  const normalizedOptions: NumberFormatOptions & Intl.NumberFormatOptions = { ...options };

  normalizedOptions.style = normalizedOptions.format;
  normalizedOptions.useGrouping = normalizedOptions.groupDisplay;
  normalizedOptions.minimumFractionDigits = minimumFractionDigits;
  // normalizedOptions.minimumSignificantDigits = minimumSignificantDigits;

  delete normalizedOptions.format;
  delete normalizedOptions.groupDisplay;
  delete normalizedOptions.maximumIntegerDigits;

  // В значении может встречаться юникод, нам важно заменить
  // такие символы для соответствия стандартному значению
  let nextValue = new Intl.NumberFormat(locales, normalizedOptions).format(number).replace(/\s/g, ' ');
  let sign: string | undefined;

  if (nextValue.includes('+')) {
    sign = '+';
  } else if (nextValue.includes(localizedValues.minusSign)) {
    sign = localizedValues.minusSign;
  }

  // Арабская локаль содержит юникод, что приводит к неожидаемому
  // сдвигу курсора при смещении через клавиатуру, для предотвращения
  // устанавливаем знак в конец числа с удалением нежелательного юникода
  if (sign !== undefined && localizedValues.signBackwards) {
    nextValue = nextValue.replace(RegExp(`[‎؜\\${sign}]`, 'g'), '');

    const lastDigitIndex = nextValue.search(RegExp(`[${localizedValues.digits}](?!.*[${localizedValues.digits}])`));

    if (lastDigitIndex !== -1) {
      nextValue = nextValue.slice(0, lastDigitIndex + 1) + sign + nextValue.slice(lastDigitIndex + 1);

      if (!nextValue.startsWith('‏')) {
        nextValue = `‏${nextValue}`;
      }
    }
  }

  return nextValue;
}
