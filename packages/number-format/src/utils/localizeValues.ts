import type { LocalizedNumberFormatValues } from '../types';

/**
 * Возвращает применяемые значения по заданной локали
 * @param locales
 * @returns
 */
export default function localizeValues(locales: Intl.LocalesArgument): LocalizedNumberFormatValues {
  const value = new Intl.NumberFormat(locales, {
    useGrouping: false,
    signDisplay: 'always',
    minimumIntegerDigits: 10,
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    // minimumSignificantDigits: 10,
    // maximumSignificantDigits: 10,
  }).format(-1234567890.1);

  // При, например, арабской локали, минус устанавливается
  // справа от чисел, поэтому нам важно определить положение
  // минуса. Если минус расположен справа, то на первой
  // позиции будет юникод `U+061C` (char code 1564)
  const signBackwards = value.startsWith('‎') || value.startsWith('؜');
  const minusSign = signBackwards ? value[1] : value[0];
  const decimal = value[value.length - 2];

  // Получаем все цифры в заданной локали (возможны варианты
  // с китайской десятичной системой или арабскими цифрами)
  let digits = value.slice(signBackwards ? 2 : 1, -2);
  digits = digits[9] + digits.slice(0, -1);

  return { signBackwards, minusSign, decimal, digits };
}
