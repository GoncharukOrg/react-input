import type { Replacement } from '../types';

interface FilterParam {
  value: string;
  replacementChars: string;
  replacement: Replacement;
  separate: boolean;
}

/**
 * Фильтруем символы для соответствия значениям `replacement`
 * @param param
 * @returns
 */
export default function filter({ value, replacementChars, replacement, separate }: FilterParam): string {
  let __replacementChars = replacementChars;

  let filteredValue = '';

  for (let i = 0; i < value.length; i++) {
    const isReplacementKey = Object.prototype.hasOwnProperty.call(replacement, value[i]);
    const isValidChar = !isReplacementKey && replacement[__replacementChars[0]]?.test(value[i]);

    if ((separate && value[i] === __replacementChars[0]) || isValidChar) {
      __replacementChars = __replacementChars.slice(1);
      filteredValue += value[i];
    }
  }

  return filteredValue;
}
