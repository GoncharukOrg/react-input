import type { LocalizedNumberFormatValues, NumberFormatOptions, ResolvedNumberFormatOptions } from '../types';

interface Options {
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
export default function format(value: string, { locales, options, localizedValues, resolvedOptions }: Options) {
  const normalizedOptions: NumberFormatOptions & Intl.NumberFormatOptions = { ...options };

  normalizedOptions.style = normalizedOptions.format;
  normalizedOptions.useGrouping = normalizedOptions.groupDisplay;
  normalizedOptions.minimumFractionDigits = 0;
  normalizedOptions.maximumFractionDigits = 0;

  delete normalizedOptions.format;
  delete normalizedOptions.groupDisplay;
  delete normalizedOptions.maximumIntegerDigits;

  // При `fraction` равном `undefined` - разделитель не был введён
  let [integer, fraction = ''] = value.split('.');

  // Поскольку состояние ввода хранит последний введенный символ,
  // при форматировании может произойти округление, поэтому нам важно
  // заранее обрезать символ не соответствующий максимальному количеству символов

  // - `replace` - Учитываем `minimumIntegerDigits`.
  // Так, при `addedValue` "2": "000 001" -> "000 0012" -> "12" -> "000 012"
  integer = integer.replace(/^(-)?0+/, '$1').slice(0, resolvedOptions.maximumIntegerDigits);
  fraction += '0'.repeat(resolvedOptions.minimumFractionDigits ?? 0);

  // В значении может встречаться юникод, нам важно заменить
  // такие символы для соответствия стандартному значению
  let nextValue = new Intl.NumberFormat(locales, normalizedOptions).format(BigInt(integer)).replace(/\s/g, ' ');

  if (
    (resolvedOptions.maximumFractionDigits === undefined || resolvedOptions.maximumFractionDigits > 0) &&
    (value.includes('.') || fraction.length > 0)
  ) {
    nextValue = nextValue.replace(
      RegExp(`([${localizedValues.digits}])([^${localizedValues.digits}]*)$`),
      `$1${localizedValues.decimal}$2`,
    );

    if (fraction.length > 0) {
      const localizedFraction = fraction
        .slice(0, resolvedOptions.maximumFractionDigits)
        .replace(/\d/g, (digit) => localizedValues.digits[Number(digit)]);

      nextValue = nextValue.replace(
        RegExp(`([${localizedValues.decimal}])([^${localizedValues.digits}]*)$`),
        `$1${localizedFraction}$2`,
      );
    }
  }

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

  return { value: nextValue, number: Number(integer + '.' + fraction) };
}
