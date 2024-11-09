import type { LocalizedNumberFormatValues } from '../types';

/**
 * Для правильной фильтрации значения нам важно выбрать число чтобы символ
 * десятичного разделителя не пересекался, например: "123.456 млн."
 * @param value
 * @param param
 * @returns
 */
export default function exec(value: string, { minusSign, decimal, digits }: LocalizedNumberFormatValues) {
  const integerPattern = `[${digits}]+([^${decimal}${digits}][${digits}]+)*`;
  const fractionPattern = `[${decimal}][${digits}]`;

  const p$1 = `${integerPattern}${fractionPattern}*`;
  const p$2 = `${fractionPattern}+`;
  const p$3 = integerPattern;
  const p$4 = `[${decimal}]`;

  return RegExp(`${minusSign}?(${p$1}|${p$2}|${p$3}|${p$4})${minusSign}?`).exec(value)?.[0] ?? '';
}
