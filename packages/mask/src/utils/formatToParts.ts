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
  const result: MaskPart[] = [];

  for (let i = 0; i < mask.length; i++) {
    const value = formattedValue[i] ?? mask[i];

    const isReplacementKey = Object.prototype.hasOwnProperty.call(replacement, value);
    const type: MaskPart['type'] = isReplacementKey
      ? 'replacement'
      : formattedValue[i] !== undefined && formattedValue[i] !== mask[i]
        ? 'input'
        : 'mask';

    result.push({ type, value, index: i });
  }

  return result;
}
