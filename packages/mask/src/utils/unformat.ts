import type { Replacement } from '../types';

interface Options {
  start?: number;
  end?: number;
  mask: string;
  replacement: Replacement;
  separate: boolean;
}

/**
 *
 * @param formattedValue
 * @param options
 * @returns
 */
export default function unformat(
  formattedValue: string,
  { start = 0, end, mask, replacement, separate }: Options,
): string {
  const slicedFormattedValue = formattedValue.slice(start, end);
  const slicedMask = mask.slice(start, end);

  let unformattedValue = '';

  for (let i = 0; i < slicedMask.length; i++) {
    const isReplacementKey = Object.prototype.hasOwnProperty.call(replacement, slicedMask[i]);

    if (isReplacementKey && slicedFormattedValue[i] !== undefined && slicedFormattedValue[i] !== slicedMask[i]) {
      unformattedValue += slicedFormattedValue[i];
    } else if (isReplacementKey && separate) {
      unformattedValue += slicedMask[i];
    }
  }

  return unformattedValue;
}
