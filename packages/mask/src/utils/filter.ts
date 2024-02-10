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

  for (const char of value) {
    const isReplacementKey = Object.prototype.hasOwnProperty.call(replacement, char);
    const isValidChar = !isReplacementKey && replacement[__replacementChars[0]]?.test(char);

    if ((separate && char === __replacementChars[0]) || isValidChar) {
      __replacementChars = __replacementChars.slice(1);
      filteredValue += char;
    }
  }

  return filteredValue;
}
