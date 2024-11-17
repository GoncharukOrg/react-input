import type { LocalizedNumberFormatValues } from '../types';

/**
 * Для правильной фильтрации значения нам важно выбрать число чтобы символ
 * десятичного разделителя не пересекался, например: "123.456 млн."
 * @param value
 * @param param
 * @returns
 */
export default function exec(
  value: string,
  { minusSign, decimal, digits, signBackwards }: LocalizedNumberFormatValues,
) {
  const integerPattern = `[${digits}]+([^${decimal}${digits}][${digits}]+)*`;
  const fractionPattern = `[${decimal}][${digits}]`;

  const p$1 = `${integerPattern}${fractionPattern}*`;
  const p$2 = `${fractionPattern}+`;
  const p$3 = integerPattern;
  const p$4 = `[${decimal}]`;

  const _value = RegExp(`(${p$1}|${p$2}|${p$3}|${p$4})`).exec(value)?.[0] ?? '';

  if (signBackwards && RegExp(`[${digits}]?.*${minusSign}`).test(value)) {
    return _value + minusSign;
  }

  if (RegExp(`${minusSign}.*[${digits}]?`).test(value)) {
    return minusSign + _value;
  }

  return _value;
}
