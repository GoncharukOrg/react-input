import type { MaskPart, Replacement } from '../types';

interface Options {
  mask: string;
  replacement: Replacement;
}

/**
 * Форматирует значение по заданной маске возвращая массив объектов,
 * где каждый объект представляет собой информацию о символе:
 * - `replacement` - символ замены;
 * - `mask` - символ маски;
 * - `input` - символ, введенный пользователем.
 * @param formattedValue
 * @param options
 * @returns
 */
export default function formatToParts(formattedValue: string, { mask, replacement }: Options): MaskPart[] {
  return formattedValue.split('').map((char, index) => {
    const isReplacementKey = Object.prototype.hasOwnProperty.call(replacement, char);

    const type = isReplacementKey
      ? ('replacement' as const)
      : char === mask[index]
        ? ('mask' as const)
        : ('input' as const);

    return { type, value: char, index };
  });
}
