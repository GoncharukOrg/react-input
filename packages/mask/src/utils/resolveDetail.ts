import { generatePattern } from '../utils';

import format from './format';
import formatToParts from './formatToParts';

import type { MaskEventDetail, Replacement } from '../types';

interface Options {
  mask: string;
  replacement: Replacement;
  showMask: boolean;
}

/**
 * Формирует данные маскированного значения возвращая
 * @param input пользовательские символы без учета символов маски
 * @param options
 * @returns
 */
export default function resolveDetail(input: string, { mask, replacement, showMask }: Options): MaskEventDetail {
  let formattedValue = format(input, { mask, replacement });

  const parts = formatToParts(formattedValue, { mask, replacement });

  // Обрезаем значение по последний пользовательский символ,
  // если символ не найден, получится пустая строка
  if (!showMask) {
    let lastChangedCharIndex = -1;

    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i].type === 'input') {
        lastChangedCharIndex = parts[i].index;
        break;
      }
    }

    formattedValue = formattedValue.slice(0, lastChangedCharIndex + 1);
  }

  const pattern = generatePattern({ mask, replacement });
  const patternWithDisableReplacementKey = generatePattern({ mask, replacement }, true);

  const isValid = RegExp(patternWithDisableReplacementKey).test(formattedValue);

  return { value: formattedValue, input, parts, pattern, isValid };
}
