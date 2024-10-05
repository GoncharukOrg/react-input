import type { LocalizedNumberFormatValues } from '../types';

/**
 * Оставляем только символы цифр, разделитель дробной части и знак "минус"
 */
export default function filter(
  value: string,
  { signBackwards, minusSign, decimal, digits }: LocalizedNumberFormatValues,
) {
  const p$1 = `\\-\\${minusSign}`;
  const p$2 = `.,${decimal}`;
  const p$3 = `\\d${digits}`;
  const p$4 = `[^${p$1}${p$2}${p$3}]|[${p$2}](?=.*[${p$2}])`;

  const _value = value.replace(RegExp(p$4, 'g'), '');

  if (signBackwards) {
    return _value.replace(RegExp(`[${p$1}](?=.*[${p$1}${p$2}${p$3}])`, 'g'), '');
  }

  const firstMinusSignIndex = _value.search(RegExp(`[${p$1}]`));
  const firstDecimalIndex = _value.search(RegExp(`[${p$2}]`));
  const firstDigitIndex = _value.search(RegExp(`[${p$3}]`));

  return _value.replace(RegExp(`[${p$1}]`, 'g'), (match, offset) => {
    const isMoreMinusSignIndex = firstMinusSignIndex !== -1 && offset > firstMinusSignIndex;
    const isMoreDecimalIndex = firstDecimalIndex !== -1 && offset > firstDecimalIndex;
    const isMoreDigitIndex = firstDigitIndex !== -1 && offset > firstDigitIndex;

    return isMoreMinusSignIndex || isMoreDecimalIndex || isMoreDigitIndex ? '' : match;
  });
}
