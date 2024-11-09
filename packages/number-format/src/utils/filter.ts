import type { LocalizedNumberFormatValues } from '../types';

/**
 * Оставляем только символы цифр, разделитель дробной части и знак "минус"
 */
export default function filter(value: string, { minusSign, decimal, digits }: LocalizedNumberFormatValues) {
  return value.replace(RegExp(`[^\\${minusSign}${decimal}${digits}]`, 'g'), '');
}
