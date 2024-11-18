import type { Replacement } from '../types';

interface Options {
  mask: string;
  replacement: Replacement;
  separate: boolean;
  showMask: boolean;
}

/**
 * Форматирует значение по заданной маске
 * @param input
 * @param options
 * @returns
 */
export default function format(input: string, { mask, replacement, separate, showMask }: Options): string {
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

  if (separate && !showMask) {
    let index = mask.length - 1;

    for (; index >= 0; index--) {
      if (formattedValue[index] !== mask[index]) {
        break;
      }
    }

    formattedValue = formattedValue.slice(0, index + 1);
  }

  return formattedValue;
}
