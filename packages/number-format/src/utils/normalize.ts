import type { LocalizedNumberFormatValues } from '../types';

export default function normalize(value: string, localizedValues: LocalizedNumberFormatValues) {
  const normalizedValue = value
    // Нормализуем десятичный разделитель
    .replace(RegExp(`[,${localizedValues.decimal}]`, 'g'), '.')
    // Нормализуем знак минуса
    .replace(RegExp(localizedValues.minusSign, 'g'), '-')
    // Нормализуем цифры
    .replace(RegExp(`[${localizedValues.digits}]`, 'g'), (localeDigit) => {
      const digit = localizedValues.digits.indexOf(localeDigit);
      return digit !== -1 ? digit.toString() : localeDigit;
    });

  // Для нормализации значения, ставим минус слева.
  // В случае арабской локали он может находиться справа
  if (normalizedValue.endsWith('-')) {
    return `-${normalizedValue.slice(0, -1)}`;
  }

  return normalizedValue;
}
