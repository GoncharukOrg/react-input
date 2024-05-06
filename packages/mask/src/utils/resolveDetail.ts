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
  const formattedValue = format(input, { mask, replacement, showMask });
  const parts = formatToParts(formattedValue, { mask, replacement });

  const pattern = generatePattern({ mask, replacement });
  const patternWithDisableReplacementKey = generatePattern({ mask, replacement }, true);

  const isValid = RegExp(patternWithDisableReplacementKey).test(formattedValue);

  return { value: formattedValue, input, parts, pattern, isValid };
}
