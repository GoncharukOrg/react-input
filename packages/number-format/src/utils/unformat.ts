import filter from './filter';

import type { LocalizedNumberFormatValues } from '../types';

export default function unformat(value: string, localizedValues: LocalizedNumberFormatValues) {
  // Фильтруем значение для преобразование в число
  const normalizedValue = filter(value, localizedValues)
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
