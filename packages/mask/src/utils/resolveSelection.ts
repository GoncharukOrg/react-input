import type { InputType } from '@react-input/core';

import type { MaskPart, Replacement } from '../types';

interface ResolveSelectionParam {
  inputType: InputType;
  value: string;
  addedValue: string;
  beforeChangeValue: string;
  // afterChangeValue: string;
  parts: MaskPart[];
  replacement: Replacement;
  separate: boolean;
}

/**
 * Определяет позицию курсора для последующей установки
 * @param param
 * @returns позиция курсора
 */
export default function resolveSelection({
  inputType,
  value,
  addedValue,
  beforeChangeValue,
  // afterChangeValue,
  parts,
  replacement,
  separate,
}: ResolveSelectionParam): number {
  const unmaskedChars = parts.filter(({ type }) => type === 'input' || (separate && type === 'replacement'));

  const lastAddedValueIndex = unmaskedChars[beforeChangeValue.length + addedValue.length - 1]?.index;
  const lastBeforeChangeValueIndex = unmaskedChars[beforeChangeValue.length - 1]?.index;
  const firstAfterChangeValueIndex = unmaskedChars[beforeChangeValue.length + addedValue.length]?.index;

  if (inputType === 'insert') {
    if (lastAddedValueIndex !== undefined) return lastAddedValueIndex + 1;
    if (firstAfterChangeValueIndex !== undefined) return firstAfterChangeValueIndex;
    if (lastBeforeChangeValueIndex !== undefined) return lastBeforeChangeValueIndex + 1;
  }

  if (inputType === 'deleteForward') {
    if (firstAfterChangeValueIndex !== undefined) return firstAfterChangeValueIndex;
    if (lastBeforeChangeValueIndex !== undefined) return lastBeforeChangeValueIndex + 1;
  }

  if (inputType === 'deleteBackward') {
    if (lastBeforeChangeValueIndex !== undefined) return lastBeforeChangeValueIndex + 1;
    if (firstAfterChangeValueIndex !== undefined) return firstAfterChangeValueIndex;
  }

  // Находим первый индекс символа замены указанного в свойстве `replacement`
  const replacementCharIndex = value
    .split('')
    .findIndex((char) => Object.prototype.hasOwnProperty.call(replacement, char));

  return replacementCharIndex !== -1 ? replacementCharIndex : value.length;
}
