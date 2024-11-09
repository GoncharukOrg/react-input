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
  const { maximumIntegerDigits, minimumFractionDigits = 0, maximumFractionDigits } = resolvedOptions;

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
  integer = integer.replace(/^(-)?0+/, '$1').slice(0, maximumIntegerDigits);

  const bigInteger = BigInt(integer);
  let nextValue = '';

  // При `percent` происходит умножение на 100, поэтому нам важно обработать его отдельно под видом `decimal`
  if (resolvedOptions.format === 'percent') {
    const p$1 = `${localizedValues.minusSign}?[${localizedValues.digits}]+([^${localizedValues.digits}][${localizedValues.digits}]+)*${localizedValues.minusSign}?`;

    const decimalValue = new Intl.NumberFormat(locales, { ...normalizedOptions, style: 'decimal' }).format(bigInteger);
    const percentValue = new Intl.NumberFormat(locales, normalizedOptions).format(0);

    nextValue = percentValue.replace(localizedValues.digits[0], RegExp(p$1).exec(decimalValue)?.[0] ?? '');
  } else {
    nextValue = new Intl.NumberFormat(locales, normalizedOptions).format(bigInteger);
  }

  // В значении может встречаться юникод, нам важно заменить
  // такие символы для соответствия стандартному значению
  nextValue = nextValue.replace(/\s/g, ' ');

  if (fraction.length < minimumFractionDigits) {
    fraction += '0'.repeat(minimumFractionDigits - fraction.length);
  }

  if (
    (maximumFractionDigits === undefined || maximumFractionDigits > 0) &&
    (value.includes('.') || fraction.length > 0)
  ) {
    nextValue = nextValue.replace(
      RegExp(`([${localizedValues.digits}])([^${localizedValues.digits}]*)$`),
      `$1${localizedValues.decimal}$2`,
    );

    if (fraction.length > 0) {
      fraction = fraction.slice(0, maximumFractionDigits);
      const localizedFraction = fraction.replace(/\d/g, (digit) => localizedValues.digits[Number(digit)]);

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

      // Если не поставить юникод, поведение курсора будет нарушено
      if (!nextValue.startsWith('‏')) {
        nextValue = `‏${nextValue}`;
      }
    }
  }

  return nextValue;
}
