import type { Replacement } from '../types';

interface Options {
  mask: string;
  replacement: Replacement;
  showMask: boolean;
}

/**
 * Форматирует значение по заданной маске
 * @param input
 * @param options
 * @returns
 */
export default function format(input: string, { mask, replacement, showMask }: Options): string {
  let position = 0;
  let formattedValue = '';

  for (const char of mask) {
    if (!showMask && input[position] === undefined) {
      break;
    }

    const isReplacementKey = Object.prototype.hasOwnProperty.call(replacement, char);

    if (isReplacementKey && input[position] !== undefined) {
      formattedValue += input[position++];
    } else {
      formattedValue += char;
    }
  }

  return formattedValue;
}
