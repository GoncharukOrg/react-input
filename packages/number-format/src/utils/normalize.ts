import type { LocalizedNumberFormatValues } from '../types';

export default function normalize(value: string, { minusSign, decimal, digits }: LocalizedNumberFormatValues) {
  return (
    value
      // Нормализуем знак минуса
      .replace(RegExp(minusSign, 'g'), '-')
      // Нормализуем десятичный разделитель
      .replace(RegExp(`[${decimal}]`, 'g'), '.')
      // Нормализуем цифры
      .replace(RegExp(`[${digits}]`, 'g'), (localeDigit) => {
        const digit = digits.indexOf(localeDigit);
        return digit !== -1 ? digit.toString() : localeDigit;
      })
  );
}
